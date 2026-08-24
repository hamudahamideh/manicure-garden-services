import io
import os
import pytest
import requests
from pathlib import Path

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL')
if not BASE_URL:
    for line in Path('/app/frontend/.env').read_text().splitlines():
        if line.startswith('REACT_APP_BACKEND_URL='):
            BASE_URL = line.split('=', 1)[1].strip()
BASE_URL = BASE_URL.rstrip('/')
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "Rivera79ysergio@gmail.com"
ADMIN_PASSWORD = "Riveraestimates!"


# 1x1 PNG bytes
PNG_BYTES = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf\xc0"
    b"\x00\x00\x00\x03\x00\x01\x5c\xcd\xff\x69\x00\x00\x00\x00IEND\xaeB`\x82"
)


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                      timeout=15)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data and data["token_type"] == "bearer"
    assert data["user"]["email"].lower() == ADMIN_EMAIL.lower()
    return data["access_token"]


# ---------- AUTH ----------
class TestAuth:
    def test_login_wrong_password(self):
        r = requests.post(f"{API}/auth/login",
                          json={"email": ADMIN_EMAIL, "password": "wrong-pass"},
                          timeout=15)
        assert r.status_code == 401

    def test_login_success(self, admin_token):
        assert isinstance(admin_token, str) and len(admin_token) > 20

    def test_auth_me_with_token(self, admin_token):
        r = requests.get(f"{API}/auth/me",
                         headers={"Authorization": f"Bearer {admin_token}"}, timeout=15)
        assert r.status_code == 200, r.text
        j = r.json()
        assert j["email"].lower() == ADMIN_EMAIL.lower()
        assert j.get("name")

    def test_auth_me_without_token(self):
        r = requests.get(f"{API}/auth/me", timeout=15)
        assert r.status_code == 401

    def test_estimates_list_requires_auth(self):
        r = requests.get(f"{API}/estimates", timeout=15)
        assert r.status_code == 401

    def test_estimates_list_with_token(self, admin_token):
        r = requests.get(f"{API}/estimates",
                         headers={"Authorization": f"Bearer {admin_token}"}, timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------- UPLOADS ----------
class TestUploads:
    def test_upload_single_and_serve(self):
        files = [("files", ("TEST_photo.png", io.BytesIO(PNG_BYTES), "image/png"))]
        r = requests.post(f"{API}/uploads", files=files, timeout=60)
        assert r.status_code == 200, r.text
        j = r.json()
        assert "photos" in j and len(j["photos"]) == 1
        p = j["photos"][0]
        assert p["path"] and p["filename"] == "TEST_photo.png"

        # Serve
        r2 = requests.get(f"{API}/files/{p['path']}", timeout=30)
        assert r2.status_code == 200
        assert r2.headers.get("content-type", "").startswith("image/")
        assert len(r2.content) > 0

    def test_upload_multiple(self):
        files = [
            ("files", ("TEST_a.png", io.BytesIO(PNG_BYTES), "image/png")),
            ("files", ("TEST_b.png", io.BytesIO(PNG_BYTES), "image/png")),
        ]
        r = requests.post(f"{API}/uploads", files=files, timeout=60)
        assert r.status_code == 200, r.text
        assert len(r.json()["photos"]) == 2

    def test_serve_missing_returns_404(self):
        r = requests.get(f"{API}/files/does/not/exist.png", timeout=15)
        assert r.status_code == 404


# ---------- ESTIMATES ----------
class TestEstimates:
    def test_estimate_with_photos_persists(self, admin_token):
        # upload a photo first
        files = [("files", ("TEST_est.png", io.BytesIO(PNG_BYTES), "image/png"))]
        u = requests.post(f"{API}/uploads", files=files, timeout=60)
        assert u.status_code == 200
        photo = u.json()["photos"][0]

        payload = {
            "name": "TEST_PhotoEstimate",
            "email": "test_photo@example.com",
            "phone": "6693030000",
            "service": "Sprinkler Systems",
            "property_type": "Residential",
            "message": "TEST_ with photo",
            "photos": [{"path": photo["path"], "filename": photo["filename"]}],
        }
        r = requests.post(f"{API}/estimates", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        created = r.json()
        assert created["id"]
        assert len(created["photos"]) == 1
        assert created["photos"][0]["path"] == photo["path"]

        # Verify persistence via authenticated list
        r2 = requests.get(f"{API}/estimates",
                          headers={"Authorization": f"Bearer {admin_token}"}, timeout=15)
        assert r2.status_code == 200
        found = next((x for x in r2.json() if x["id"] == created["id"]), None)
        assert found is not None
        assert len(found["photos"]) == 1

    def test_estimate_invalid_email(self):
        r = requests.post(f"{API}/estimates", json={
            "name": "X", "email": "not-an-email",
            "phone": "123", "service": "Lawn"
        }, timeout=15)
        assert r.status_code == 422
