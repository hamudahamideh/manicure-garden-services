import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Lock, LogOut, Inbox, Phone, Mail, MapPin, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";

const API = `${process.env.REACT_APP_BACKEND_URL || ""}/api`;
const TOKEN_KEY = "mgs_admin_token";

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const LoginView = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem(TOKEN_KEY, data.access_token);
      onLogin();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-6 bg-[#0A0D0B]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-[#242E28] bg-[#121714] p-8 md:p-10"
      >
        <div className="h-12 w-12 rounded-full bg-[#BAFF29] text-black grid place-items-center mb-6">
          <Lock className="h-5 w-5" strokeWidth={2.5} />
        </div>
        <h1 className="font-display font-bold text-3xl tracking-tight">Estimate Inbox</h1>
        <p className="text-white/50 mt-2 text-sm">Sign in to view incoming requests.</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <Label className="text-white/70 text-xs">Email</Label>
            <Input
              data-testid="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 bg-[#0A0D0B] border-[#242E28] text-white h-12"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <Label className="text-white/70 text-xs">Password</Label>
            <Input
              data-testid="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 bg-[#0A0D0B] border-[#242E28] text-white h-12"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            data-testid="admin-login-submit"
            className="w-full bg-[#BAFF29] text-black font-semibold rounded-full py-3.5 hover:bg-[#A3E622] transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <a href="/" className="mt-6 inline-flex items-center gap-2 text-white/50 text-sm hover:text-[#BAFF29]">
          <ArrowLeft className="h-4 w-4" /> Back to website
        </a>
      </motion.div>
    </div>
  );
};

const InboxView = ({ onLogout }) => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    try {
      const { data } = await axios.get(`${API}/estimates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEstimates(data);
    } catch (err) {
      if (err.response?.status === 401) {
        onLogout();
      } else {
        toast.error("Could not load estimates");
      }
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-[#0A0D0B] text-white">
      <header className="border-b border-[#242E28] sticky top-0 bg-[#0A0D0B]/90 backdrop-blur-xl z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Inbox className="h-5 w-5 text-[#BAFF29]" />
            <span className="font-display font-semibold">Estimate Inbox</span>
            <span data-testid="estimate-count" className="ml-2 text-xs font-mono-accent text-white/50">
              {estimates.length} total
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-white/60 hover:text-[#BAFF29] hidden sm:inline">
              View site
            </a>
            <button
              onClick={onLogout}
              data-testid="admin-logout"
              className="inline-flex items-center gap-2 border border-white/20 rounded-full px-4 py-2 text-sm hover:bg-white hover:text-black transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {loading ? (
          <p className="text-white/50">Loading…</p>
        ) : estimates.length === 0 ? (
          <div className="rounded-2xl border border-[#242E28] bg-[#121714] p-12 text-center">
            <Inbox className="h-10 w-10 text-white/30 mx-auto mb-4" />
            <p className="text-white/60">No estimate requests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {estimates.map((e, i) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                data-testid={`inbox-item-${i}`}
                className="rounded-2xl border border-[#242E28] bg-[#121714] p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-display font-semibold text-xl">{e.name}</h3>
                      <span className="font-mono-accent text-[10px] uppercase tracking-[0.15em] bg-[#BAFF29]/15 text-[#BAFF29] px-2.5 py-1 rounded-full">
                        {e.service}
                      </span>
                      <span className="text-xs text-white/40">{e.property_type}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
                      <a href={`tel:${e.phone}`} className="inline-flex items-center gap-2 hover:text-[#BAFF29]">
                        <Phone className="h-4 w-4" /> {e.phone}
                      </a>
                      <a href={`mailto:${e.email}`} className="inline-flex items-center gap-2 hover:text-[#BAFF29] break-all">
                        <Mail className="h-4 w-4" /> {e.email}
                      </a>
                    </div>
                    {e.message && (
                      <p className="mt-3 text-white/60 text-sm leading-relaxed max-w-2xl">{e.message}</p>
                    )}
                  </div>
                  <span className="text-xs text-white/40 whitespace-nowrap">{formatDate(e.created_at)}</span>
                </div>

                {e.photos && e.photos.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-white/10">
                    <p className="flex items-center gap-2 text-xs text-white/50 mb-3">
                      <ImageIcon className="h-4 w-4" /> {e.photos.length} photo(s)
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {e.photos.map((p, idx) => (
                        <a
                          key={idx}
                          href={`${API}/files/${p.path}`}
                          target="_blank"
                          rel="noreferrer"
                          data-testid={`inbox-photo-${i}-${idx}`}
                          className="block h-24 w-24 rounded-lg overflow-hidden border border-[#242E28] hover:border-[#BAFF29] transition-colors"
                        >
                          <img src={`${API}/files/${p.path}`} alt={p.filename} className="h-full w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const AdminInbox = () => {
  const [authed, setAuthed] = useState(!!localStorage.getItem(TOKEN_KEY));

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthed(false);
  };

  return (
    <>
      {authed ? (
        <InboxView onLogout={logout} />
      ) : (
        <LoginView onLogin={() => setAuthed(true)} />
      )}
      <Toaster position="top-center" theme="dark" richColors />
    </>
  );
};

export default AdminInbox;
