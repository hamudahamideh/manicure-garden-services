import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, MessageSquare } from "lucide-react";
import { COMPANY, NAV_LINKS } from "@/data";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (href) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      data-testid="site-header"
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-500 ${
        scrolled
          ? "backdrop-blur-xl bg-[#0A0D0B]/80 border-b border-white/10"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          data-testid="logo-button"
          className="flex items-center gap-2.5 group"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[#BAFF29] group-hover:scale-125 transition-transform shrink-0" />
          <span className="font-display font-bold tracking-tight text-base sm:text-lg leading-none text-left">
            Manicure Gardening{" "}
            <span className="text-[#BAFF29]">Services</span>
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => go(l.href)}
              data-testid={`nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              className="font-mono-accent text-xs uppercase tracking-[0.18em] text-white/70 hover:text-[#BAFF29] transition-colors"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href={COMPANY.smsHref}
            data-testid="header-text-button"
            className="hidden sm:inline-flex items-center gap-2 border border-white/20 text-white rounded-full px-4 py-2.5 text-sm hover:bg-white hover:text-black transition-colors"
          >
            <MessageSquare className="h-4 w-4" strokeWidth={2.5} />
            Text Us
          </a>
          <a
            href={COMPANY.phoneHref}
            data-testid="header-call-button"
            className="hidden sm:inline-flex items-center gap-2 bg-[#BAFF29] text-black font-semibold rounded-full px-5 py-2.5 text-sm hover:bg-[#A3E622] transition-colors"
          >
            <Phone className="h-4 w-4" strokeWidth={2.5} />
            {COMPANY.phone}
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            data-testid="mobile-menu-toggle"
            className="md:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-[#0A0D0B]/95 backdrop-blur-xl border-b border-white/10"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {NAV_LINKS.map((l) => (
                <button
                  key={l.href}
                  onClick={() => go(l.href)}
                  data-testid={`mobile-nav-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-left font-display text-2xl font-medium text-white/90"
                >
                  {l.label}
                </button>
              ))}
              <a
                href={COMPANY.phoneHref}
                className="mt-2 inline-flex items-center gap-2 bg-[#BAFF29] text-black font-semibold rounded-full px-5 py-3 w-fit"
              >
                <Phone className="h-4 w-4" /> {COMPANY.phone}
              </a>
              <a
                href={COMPANY.smsHref}
                data-testid="mobile-text-button"
                className="inline-flex items-center gap-2 border border-white/20 text-white rounded-full px-5 py-3 w-fit"
              >
                <MessageSquare className="h-4 w-4" /> Text Us
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
