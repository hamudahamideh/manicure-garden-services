import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ShieldCheck, Star } from "lucide-react";
import { COMPANY, HERO_IMAGE } from "@/data";

const line = {
  hidden: { y: "110%" },
  show: (i) => ({
    y: "0%",
    transition: { duration: 1, delay: 0.35 + i * 0.12, ease: [0.16, 1, 0.3, 1] },
  }),
};

const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const overlayY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  const HeadLine = ({ children, i }) => (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span
        variants={line}
        custom={i}
        initial="hidden"
        animate="show"
        className="block"
      >
        {children}
      </motion.span>
    </span>
  );

  return (
    <section
      ref={ref}
      data-testid="hero-section"
      className="relative min-h-screen w-full overflow-hidden flex items-end"
    >
      <motion.div style={{ y, scale }} className="absolute inset-0 z-0">
        <img
          src={HERO_IMAGE}
          alt="Luxury landscaped garden"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D0B] via-[#0A0D0B]/40 to-[#0A0D0B]/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D0B]/80 to-transparent" />
      </motion.div>

      <motion.div
        style={{ y: overlayY }}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pb-16 md:pb-24"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-6 flex items-center gap-3"
        >
          <ShieldCheck className="h-4 w-4 text-[#BAFF29]" />
          <span className="font-mono-accent text-xs uppercase tracking-[0.22em] text-white/70">
            Liability & Workers' Comp Insured • Bonded • Since {COMPANY.since}
          </span>
        </motion.div>

        <h1 className="font-display font-extrabold tracking-tighter leading-[0.92] text-[15vw] md:text-[9.5vw] lg:text-[8.5rem]">
          <HeadLine i={0}>Precision.</HeadLine>
          <HeadLine i={1}>
            <span className="text-[#BAFF29]">Nature.</span>
          </HeadLine>
          <HeadLine i={2}>Mastery.</HeadLine>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 flex flex-col md:flex-row md:items-end gap-8 md:justify-between"
        >
          <p className="max-w-md text-base md:text-lg text-white/70 leading-relaxed">
            Landscaping, gardening, lawn care and precision sprinkler systems for
            homes and businesses across {COMPANY.city.split(",")[0]}. Outstanding
            results, guaranteed.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#estimate"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#estimate")?.scrollIntoView({ behavior: "smooth" });
              }}
              data-testid="hero-estimate-button"
              className="inline-flex items-center gap-2 bg-[#BAFF29] text-black font-semibold rounded-full px-7 py-4 hover:bg-[#A3E622] transition-colors"
            >
              Get a Free Estimate
              <ArrowDown className="h-4 w-4" strokeWidth={2.5} />
            </a>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#BAFF29] text-[#BAFF29]" />
                ))}
              </div>
              <span className="font-mono-accent text-xs tracking-widest">
                LOVED BY LOCALS
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
