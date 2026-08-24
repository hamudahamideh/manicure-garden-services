from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, UploadFile, File, Response, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import re
import ipaddress
import logging
import asyncio
import uuid
import bcrypt
import jwt
import requests
import httpx
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Annotated, Any
from pydantic.functional_validators import BeforeValidator
from bson import ObjectId
from datetime import datetime, timezone, timedelta


mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ---------- Email (Emergent managed Resend) ----------
EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY", "").strip()
EMAIL_FROM_NAME = os.environ["EMAIL_FROM_NAME"]
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")
OWNER_EMAIL = os.environ["OWNER_EMAIL"]

# ---------- Auth ----------
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ["ADMIN_EMAIL"]
ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]

# ---------- Object storage ----------
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "manicure-gardening"
LOCAL_UPLOAD_DIR = Path(os.environ.get("LOCAL_UPLOAD_DIR") or (ROOT_DIR / "uploads"))
_storage_key = None

MIME_TYPES = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
    "gif": "image/gif", "webp": "image/webp", "heic": "image/heic",
}
MAX_FILES = 10
MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB per photo

app = FastAPI(title="Manicure Gardening Services API")
api_router = APIRouter(prefix="/api")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _to_str_id(v: Any) -> str:
    return str(v)


PyObjectId = Annotated[str, BeforeValidator(_to_str_id)]


# ---------- Password + JWT ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email,
               "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------- Storage helpers ----------
def init_storage(force: bool = False):
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    if not EMERGENT_KEY:
        LOCAL_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        _storage_key = "local"
        return _storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def _put_object(path: str, data: bytes, content_type: str) -> dict:
    try:
        key = init_storage()
    except Exception as e:
        logger.warning(f"Remote storage unavailable, using local files: {e}")
        key = "local"
    if key == "local":
        dest = LOCAL_UPLOAD_DIR / path
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
        return {"path": path, "size": len(data)}
    resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key, "Content-Type": content_type},
                        data=data, timeout=120)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                            headers={"X-Storage-Key": key, "Content-Type": content_type},
                            data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()


def _get_object(path: str):
    local = LOCAL_UPLOAD_DIR / path
    if local.is_file():
        return local.read_bytes(), MIME_TYPES.get(local.suffix.lstrip("."), "application/octet-stream")
    key = init_storage()
    if key == "local":
        raise FileNotFoundError(path)
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ---------- Email guardrail gate + sender ----------
_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan(); scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str, reply_to: str | None = None) -> str | None:
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if reply_to or EMAIL_REPLY_TO:
        payload["contact_email"] = reply_to or EMAIL_REPLY_TO
    if not EMAIL_KEY:
        logger.warning("EMERGENT_EMAIL_KEY is not set; skipping outbound email")
        return None
    try:
        async with httpx.AsyncClient(timeout=30) as http_client:
            resp = await http_client.post(f"{EMAIL_BASE_URL}/api/v1/email/send",
                                          headers={"X-Email-Key": EMAIL_KEY}, json=payload)
        resp.raise_for_status()
        return resp.json().get("id")
    except Exception as e:
        logger.error(f"Email send error: {str(e)}")
        return None


# ---------- Models ----------
class Photo(BaseModel):
    path: str
    filename: str = "photo"


class EstimateCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    service: str
    property_type: Optional[str] = "Residential"
    message: Optional[str] = ""
    photos: Optional[List[Photo]] = []


class Estimate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    service: str
    property_type: str = "Residential"
    message: str = ""
    photos: List[Photo] = []
    created_at: str = Field(default_factory=now_iso)


class LoginInput(BaseModel):
    email: EmailStr
    password: str


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Manicure Gardening Services API"}


@api_router.post("/auth/login")
async def login(payload: LoginInput):
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(str(user["_id"]), user["email"])
    return {"access_token": token, "token_type": "bearer",
            "user": {"email": user["email"], "name": user.get("name", "Admin")}}


@api_router.get("/auth/me")
async def me(current=Depends(get_current_user)):
    return {"email": current["email"], "name": current.get("name", "Admin")}


@api_router.post("/uploads")
async def uploads(files: List[UploadFile] = File(...)):
    if len(files) > MAX_FILES:
        raise HTTPException(status_code=400, detail=f"Too many files (max {MAX_FILES})")
    saved = []
    for f in files:
        ext = (f.filename.split(".")[-1].lower() if f.filename and "." in f.filename else "")
        if ext not in MIME_TYPES:
            raise HTTPException(status_code=400, detail="Only image files are allowed")
        content_type = MIME_TYPES[ext]
        data = await f.read()
        if len(data) > MAX_FILE_BYTES:
            raise HTTPException(status_code=400, detail="Each photo must be under 10 MB")
        path = f"{APP_NAME}/estimates/{uuid.uuid4()}.{ext}"
        try:
            result = await asyncio.to_thread(_put_object, path, data, content_type)
        except Exception as e:
            logger.error(f"Upload failed: {e}")
            raise HTTPException(status_code=502, detail="Upload failed")
        await db.files.insert_one({
            "id": str(uuid.uuid4()), "storage_path": result["path"],
            "original_filename": f.filename or "photo", "content_type": content_type,
            "size": result.get("size"), "is_deleted": False, "created_at": now_iso(),
        })
        saved.append({"path": result["path"], "filename": f.filename or "photo"})
    return {"photos": saved}


@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    try:
        data, content_type = await asyncio.to_thread(_get_object, path)
    except Exception as e:
        logger.error(f"File fetch failed: {e}")
        raise HTTPException(status_code=404, detail="File not found")
    return Response(content=data, media_type=record.get("content_type", content_type),
                    headers={"Cache-Control": "public, max-age=86400"})


def _owner_email_html(e: "Estimate") -> str:
    photos_note = f"{len(e.photos)} photo(s) attached — view them in your Estimate Inbox." if e.photos else "No photos attached."
    return (
        '<table role="presentation" width="100%" style="max-width:560px;margin:0 auto;'
        'font-family:Arial,Helvetica,sans-serif;color:#111">'
        '<tr><td style="padding:24px 24px 8px">'
        '<h2 style="margin:0 0 4px;font-size:20px">New Free Estimate Request</h2>'
        '<p style="margin:0;color:#666;font-size:13px">Manicure Gardening Services website</p>'
        '</td></tr><tr><td style="padding:8px 24px 24px">'
        '<table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px">'
        f'<tr><td style="padding:8px 0;color:#666;width:140px">Name</td><td style="padding:8px 0"><strong>{escape(e.name)}</strong></td></tr>'
        f'<tr><td style="padding:8px 0;color:#666">Phone</td><td style="padding:8px 0"><a href="tel:{escape(e.phone)}">{escape(e.phone)}</a></td></tr>'
        f'<tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0"><a href="mailto:{escape(e.email)}">{escape(e.email)}</a></td></tr>'
        f'<tr><td style="padding:8px 0;color:#666">Service</td><td style="padding:8px 0">{escape(e.service)}</td></tr>'
        f'<tr><td style="padding:8px 0;color:#666">Property</td><td style="padding:8px 0">{escape(e.property_type)}</td></tr>'
        f'<tr><td style="padding:8px 0;color:#666;vertical-align:top">Details</td><td style="padding:8px 0">{escape(e.message) or "—"}</td></tr>'
        f'<tr><td style="padding:8px 0;color:#666">Photos</td><td style="padding:8px 0">{escape(photos_note)}</td></tr>'
        '</table>'
        '<p style="margin:20px 0 0;font-size:12px;color:#888">Sent by Manicure Gardening Services. '
        'Reply directly to this email to reach the customer.</p>'
        '</td></tr></table>'
    )


def _customer_email_html(e: "Estimate") -> str:
    return (
        '<table role="presentation" width="100%" style="max-width:560px;margin:0 auto;'
        'font-family:Arial,Helvetica,sans-serif;color:#111">'
        '<tr><td style="padding:24px">'
        f'<h2 style="margin:0 0 12px;font-size:22px">Thanks, {escape(e.name.split(" ")[0])}!</h2>'
        '<p style="margin:0 0 12px;font-size:15px;line-height:1.6">We\'ve received your request for '
        f'a free estimate on <strong>{escape(e.service)}</strong>. One of our specialists will reach '
        'out shortly to schedule your visit.</p>'
        '<p style="margin:0 0 4px;font-size:14px;color:#333">Need us sooner? Reach us directly:</p>'
        '<p style="margin:0 0 16px;font-size:15px">'
        '📞 <a href="tel:+14086036978">(408) 603-6978</a> &nbsp;•&nbsp; '
        '✉️ <a href="mailto:Rivera79ysergio@gmail.com">Rivera79ysergio@gmail.com</a></p>'
        '<p style="margin:16px 0 0;font-size:12px;color:#888">Manicure Gardening Services — San Jose, CA. '
        'Liability &amp; Workers\' Comp Insured. We never ask for your password or payment details by email.</p>'
        '</td></tr></table>'
    )


@api_router.post("/estimates", response_model=Estimate)
async def create_estimate(payload: EstimateCreate, background_tasks: BackgroundTasks):
    obj = Estimate(**payload.model_dump())
    await db.estimates.insert_one(obj.model_dump())
    background_tasks.add_task(
        send_email, to=OWNER_EMAIL,
        subject=f"New Estimate Request — {obj.name} ({obj.service})",
        html=_owner_email_html(obj), reply_to=obj.email)
    background_tasks.add_task(
        send_email, to=obj.email,
        subject="We received your free estimate request — Manicure Gardening Services",
        html=_customer_email_html(obj))
    return obj


@api_router.get("/estimates", response_model=List[Estimate])
async def list_estimates(current=Depends(get_current_user)):
    docs = await db.estimates.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [Estimate(**d) for d in docs]


@app.on_event("startup")
async def startup():
    # seed admin
    existing = await db.users.find_one({"email": ADMIN_EMAIL.lower()})
    if existing is None:
        await db.users.insert_one({"email": ADMIN_EMAIL.lower(), "password_hash": hash_password(ADMIN_PASSWORD),
                                   "name": "Sergio", "role": "admin", "created_at": now_iso()})
        logger.info("Seeded admin user")
    elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
        await db.users.update_one({"email": ADMIN_EMAIL.lower()},
                                  {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}})
        logger.info("Updated admin password")
    await db.users.create_index("email", unique=True)
    # clean legacy/test data
    await db.estimates.delete_many({"$or": [
        {"name": {"$regex": "^TEST_", "$options": "i"}},
        {"email": {"$regex": "@example\\.com$", "$options": "i"}},
    ]})
    try:
        await asyncio.to_thread(init_storage)
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")


app.include_router(api_router)

FRONTEND_BUILD = ROOT_DIR.parent / "frontend" / "build"
if FRONTEND_BUILD.exists():
    static_dir = FRONTEND_BUILD / "static"
    if static_dir.exists():
        app.mount("/static", StaticFiles(directory=static_dir), name="static")

    @app.get("/{full_path:path}")
    async def spa(full_path: str):
        candidate = FRONTEND_BUILD / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(FRONTEND_BUILD / "index.html")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
