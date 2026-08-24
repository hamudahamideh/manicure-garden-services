import { motion } from "framer-motion";
import { MANIFESTO } from "@/data";

const Manifesto = () => {
  return (
    <section
      id="manifesto"
      data-testid="manifesto-section"
      className="bg-[#121714] border-y border-[#242E28]"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-20">
          <div className="lg:sticky lg:top-28 self-start">
            <span className="font-mono-accent text-xs uppercase tracking-[0.22em] text-[#BAFF29]">
              / Why choose us
            </span>
            <h2 className="font-display font-bold tracking-tighter text-4xl sm:text-5xl lg:text-6xl mt-4 leading-[0.95]">
              Quality that <br />
              <span className="text-[#BAFF29]">grows</span> with you.
            </h2>
            <p className="mt-6 text-white/60 leading-relaxed max-w-md">
              Certified, bonded, insured and working at competitive rates —
              Manicure Gardening Services has served the local community since
              2003, delivering results that epitomize modern standards.
            </p>
          </div>

          <div>
            {MANIFESTO.map((m, i) => (
              <motion.div
                key={m.no}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
                data-testid={`manifesto-item-${m.no}`}
                className="group grid grid-cols-[auto_1fr] gap-6 py-8 border-b border-white/10 first:border-t"
              >
                <span className="font-display font-light text-3xl md:text-4xl text-white/25 group-hover:text-[#BAFF29] transition-colors">
                  {m.no}
                </span>
                <div>
                  <h3 className="font-display font-semibold tracking-tight text-2xl md:text-3xl">
                    {m.title}
                  </h3>
                  <p className="mt-2 text-white/55 leading-relaxed max-w-xl">
                    {m.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Manifesto;
