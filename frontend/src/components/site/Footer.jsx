import { MapPin, Phone, Clock, Star, Mail, MessageSquare } from "lucide-react";
import { COMPANY, HOURS, SERVICE_OPTIONS } from "@/data";

const Footer = () => {
  return (
    <footer
      data-testid="site-footer"
      className="bg-[#121714] border-t border-[#242E28]"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-2.5 w-2.5 rounded-full bg-[#BAFF29]" />
              <span className="font-display font-semibold tracking-tight text-lg">
                Manicure<span className="text-[#BAFF29]">.</span>
              </span>
            </div>
            <p className="text-white/55 text-sm leading-relaxed max-w-xs">
              Professional lawn, landscape and sprinkler services for homeowners
              and businesses across San Jose since {COMPANY.since}.
            </p>
            <div className="mt-5 flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-[#BAFF29] text-[#BAFF29]" />
              ))}
              <span className="ml-2 text-xs text-white/50">Liability & Workers' Comp Insured • Bonded</span>
            </div>
          </div>

          <div>
            <h4 className="font-mono-accent text-xs uppercase tracking-[0.2em] text-[#BAFF29] mb-5">
              Services
            </h4>
            <ul className="space-y-2.5">
              {SERVICE_OPTIONS.map((s) => (
                <li key={s}>
                  <a
                    href="#services"
                    data-testid={`footer-service-${s.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-white/60 text-sm hover:text-[#BAFF29] transition-colors"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono-accent text-xs uppercase tracking-[0.2em] text-[#BAFF29] mb-5">
              Working Hours
            </h4>
            <ul className="space-y-2">
              {HOURS.map((h) => (
                <li key={h.day} className="flex justify-between text-sm gap-4">
                  <span className="text-white/60">{h.day}</span>
                  <span
                    className={h.time === "Closed" ? "text-white/35" : "text-white/80"}
                  >
                    {h.time}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono-accent text-xs uppercase tracking-[0.2em] text-[#BAFF29] mb-5">
              Contact
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-[#BAFF29] mt-0.5 shrink-0" />
                <span className="text-white/70">{COMPANY.city}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-[#BAFF29] shrink-0" />
                <a href={COMPANY.phoneHref} data-testid="footer-phone" className="text-white/70 hover:text-[#BAFF29]">
                  {COMPANY.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 text-[#BAFF29] shrink-0" />
                <a href={COMPANY.smsHref} data-testid="footer-text" className="text-white/70 hover:text-[#BAFF29]">
                  Text Us — {COMPANY.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-[#BAFF29] mt-0.5 shrink-0" />
                <a href={COMPANY.emailHref} data-testid="footer-email" className="text-white/70 hover:text-[#BAFF29] break-all">
                  {COMPANY.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-[#BAFF29] mt-0.5 shrink-0" />
                <span className="text-white/70">Mon–Sat, 7am–7pm</span>
              </li>
            </ul>
            <a
              href="#estimate"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#estimate")?.scrollIntoView({ behavior: "smooth" });
              }}
              data-testid="footer-estimate-button"
              className="mt-6 inline-flex bg-[#BAFF29] text-black font-semibold rounded-full px-6 py-3 text-sm hover:bg-[#A3E622] transition-colors"
            >
              Get a Free Estimate
            </a>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} {COMPANY.name} — {COMPANY.domain}
          </p>
          <p className="text-white/40 text-xs">
            {COMPANY.city} • Payments accepted: Cash • Card • Check
          </p>
          <a
            href="/admin"
            data-testid="footer-admin-link"
            className="text-white/30 text-xs hover:text-[#BAFF29] transition-colors"
          >
            Owner Login
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
