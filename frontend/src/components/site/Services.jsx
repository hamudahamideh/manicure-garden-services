import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SERVICES } from "@/data";

const Services = () => {
  const scrollToEstimate = () =>
    document.querySelector("#estimate")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="services"
      data-testid="services-section"
      className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32"
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
        <div>
          <span className="font-mono-accent text-xs uppercase tracking-[0.22em] text-[#BAFF29]">
            / What we do
          </span>
          <h2 className="font-display font-bold tracking-tighter text-4xl sm:text-5xl lg:text-6xl mt-4 leading-[0.95]">
            Full-service care <br /> for your landscape.
          </h2>
        </div>
        <p className="max-w-sm text-white/60 leading-relaxed">
          From a single sprinkler head to a complete landscape transformation, we
          handle every job with the same obsessive attention to detail.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 auto-rows-[260px] gap-4 md:gap-5">
        {SERVICES.map((s, i) => (
          <motion.button
            key={s.id}
            onClick={scrollToEstimate}
            data-testid={`service-card-${s.id}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className={`group relative overflow-hidden rounded-2xl border border-[#242E28] text-left ${s.span}`}
          >
            <img
              src={s.image}
              alt={s.title}
              className="absolute inset-0 h-full w-full object-cover opacity-45 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D0B] via-[#0A0D0B]/50 to-transparent" />
            <div className="relative z-10 h-full p-7 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="font-mono-accent text-xs tracking-[0.2em] text-[#BAFF29]">
                  {s.index}
                </span>
                <ArrowUpRight className="h-6 w-6 text-white/50 group-hover:text-[#BAFF29] group-hover:rotate-45 transition-all duration-300" />
              </div>
              <div>
                <h3 className="font-display font-semibold tracking-tight text-2xl md:text-3xl">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-white/60 max-w-md leading-relaxed">
                  {s.blurb}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
};

export default Services;
