import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Phone, ArrowRight, CheckCircle2, MessageSquare, Mail, ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COMPANY, SERVICE_OPTIONS } from "@/data";

const API = `${process.env.REACT_APP_BACKEND_URL || ""}/api`;

const EstimateForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: SERVICE_OPTIONS[0],
    property_type: "Residential",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e) => {
    let files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const valid = files.filter((f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024);
    if (valid.length < files.length) {
      toast.error("Skipped files that aren't images or are over 10 MB.");
    }
    if (valid.length === 0) {
      e.target.value = "";
      return;
    }
    files = valid;
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      const { data } = await axios.post(`${API}/uploads`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPhotos((prev) => [...prev, ...data.photos]);
      toast.success(`${data.photos.length} photo(s) added`);
    } catch (err) {
      toast.error("Photo upload failed. You can still submit without photos.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removePhoto = (idx) => setPhotos((prev) => prev.filter((_, i) => i !== idx));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error("Please fill in your name, email and phone.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/estimates`, { ...form, photos });
      setDone(true);
      setPhotos([]);
      toast.success("Request received! We'll call you shortly.");
    } catch (err) {
      toast.error("Could not send your request. Please call us instead.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="estimate"
      data-testid="estimate-section"
      className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32"
    >
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        <div>
          <span className="font-mono-accent text-xs uppercase tracking-[0.22em] text-[#BAFF29]">
            / Get started
          </span>
          <h2 className="font-display font-bold tracking-tighter text-4xl sm:text-5xl lg:text-7xl mt-4 leading-[0.92]">
            Get a free <br />
            <span className="text-[#BAFF29]">estimate.</span>
          </h2>
          <p className="mt-6 text-white/60 leading-relaxed max-w-md">
            Tell us about your project and your request lands straight in our
            inbox — we'll get back to you with an honest, no-pressure quote.
            Prefer to talk or text? We're one tap away.
          </p>

          <div className="mt-10 space-y-4">
            <a
              href={COMPANY.phoneHref}
              data-testid="estimate-call-primary"
              className="flex items-center gap-4 group"
            >
              <span className="h-12 w-12 rounded-full bg-[#BAFF29] text-black grid place-items-center group-hover:scale-105 transition-transform">
                <Phone className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <div>
                <p className="font-mono-accent text-[10px] uppercase tracking-widest text-white/50">
                  Call us
                </p>
                <p className="font-display text-xl font-semibold">{COMPANY.phone}</p>
              </div>
            </a>
            <a
              href={COMPANY.smsHref}
              data-testid="estimate-text-button"
              className="flex items-center gap-4 group"
            >
              <span className="h-12 w-12 rounded-full border border-white/20 grid place-items-center text-white/80 group-hover:border-[#BAFF29] group-hover:text-[#BAFF29] transition-colors">
                <MessageSquare className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <div>
                <p className="font-mono-accent text-[10px] uppercase tracking-widest text-white/50">
                  Text us
                </p>
                <p className="font-display text-xl font-semibold">{COMPANY.phone}</p>
              </div>
            </a>
            <a
              href={COMPANY.emailHref}
              data-testid="estimate-email-link"
              className="flex items-center gap-4 group"
            >
              <span className="h-12 w-12 rounded-full border border-white/20 grid place-items-center text-white/80 group-hover:border-[#BAFF29] group-hover:text-[#BAFF29] transition-colors">
                <Mail className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <div>
                <p className="font-mono-accent text-[10px] uppercase tracking-widest text-white/50">
                  Email us
                </p>
                <p className="font-display text-base md:text-lg font-semibold break-all">
                  {COMPANY.email}
                </p>
              </div>
            </a>
          </div>
        </div>

        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            data-testid="estimate-success"
            className="rounded-3xl border border-[#242E28] bg-[#121714] p-10 md:p-14 flex flex-col items-start"
          >
            <CheckCircle2 className="h-14 w-14 text-[#BAFF29]" />
            <h3 className="font-display font-bold text-3xl mt-6 tracking-tight">
              Request received.
            </h3>
            <p className="mt-3 text-white/60 leading-relaxed">
              Thanks, {form.name.split(" ")[0]}! One of our specialists will reach
              out shortly to schedule your free estimate.
            </p>
            <button
              onClick={() => setDone(false)}
              data-testid="estimate-reset"
              className="mt-8 border border-white/20 rounded-full px-6 py-3 hover:bg-white hover:text-black transition-colors"
            >
              Send another request
            </button>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            data-testid="estimate-form"
            className="rounded-3xl border border-[#242E28] bg-[#121714] p-7 md:p-10 space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70 text-xs">Full Name</Label>
                <Input
                  data-testid="estimate-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1.5 bg-[#0A0D0B] border-[#242E28] text-white h-12"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <Label className="text-white/70 text-xs">Phone</Label>
                <Input
                  data-testid="estimate-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-1.5 bg-[#0A0D0B] border-[#242E28] text-white h-12"
                  placeholder="(669) 000-0000"
                />
              </div>
            </div>
            <div>
              <Label className="text-white/70 text-xs">Email</Label>
              <Input
                data-testid="estimate-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5 bg-[#0A0D0B] border-[#242E28] text-white h-12"
                placeholder="you@email.com"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-white/70 text-xs">Service Needed</Label>
                <Select
                  value={form.service}
                  onValueChange={(v) => setForm({ ...form, service: v })}
                >
                  <SelectTrigger
                    data-testid="estimate-service"
                    className="mt-1.5 bg-[#0A0D0B] border-[#242E28] text-white h-12"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121714] border-[#242E28] text-white">
                    {SERVICE_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s} data-testid={`service-opt-${s}`}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/70 text-xs">Property Type</Label>
                <Select
                  value={form.property_type}
                  onValueChange={(v) => setForm({ ...form, property_type: v })}
                >
                  <SelectTrigger
                    data-testid="estimate-property"
                    className="mt-1.5 bg-[#0A0D0B] border-[#242E28] text-white h-12"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121714] border-[#242E28] text-white">
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-white/70 text-xs">Project Details</Label>
              <Textarea
                data-testid="estimate-message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-1.5 bg-[#0A0D0B] border-[#242E28] text-white min-h-[110px]"
                placeholder="Tell us what you need..."
              />
            </div>
            <div>
              <Label className="text-white/70 text-xs">
                Photos of your yard <span className="text-white/40">(optional)</span>
              </Label>
              <label
                htmlFor="estimate-photos"
                data-testid="estimate-photo-dropzone"
                className="mt-1.5 flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#242E28] bg-[#0A0D0B] py-5 cursor-pointer hover:border-[#BAFF29]/50 transition-colors text-white/60 text-sm"
              >
                {uploading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                ) : (
                  <><ImagePlus className="h-4 w-4 text-[#BAFF29]" /> Add photos for a more accurate quote</>
                )}
              </label>
              <input
                id="estimate-photos"
                data-testid="estimate-photo-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles}
                className="hidden"
              />
              {photos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2" data-testid="estimate-photo-list">
                  {photos.map((p, idx) => (
                    <div key={idx} className="relative h-16 w-16 rounded-lg overflow-hidden border border-[#242E28] group">
                      <img src={`${API}/files/${p.path}`} alt={p.filename} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        data-testid={`remove-photo-${idx}`}
                        className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/70 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting}
              data-testid="estimate-submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#BAFF29] text-black font-semibold rounded-full py-4 hover:bg-[#A3E622] transition-colors disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Request Free Estimate"}
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </motion.form>
        )}
      </div>
    </section>
  );
};

export default EstimateForm;
