import { motion } from "framer-motion";
import { GALLERY } from "@/data";

const Gallery = () => {
  return (
    <section
      id="gallery"
      data-testid="gallery-section"
      className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32"
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
        <div>
          <span className="font-mono-accent text-xs uppercase tracking-[0.22em] text-[#BAFF29]">
            / Selected work
          </span>
          <h2 className="font-display font-bold tracking-tighter text-4xl sm:text-5xl lg:text-6xl mt-4 leading-[0.95]">
            The gallery.
          </h2>
        </div>
        <p className="max-w-sm text-white/60 leading-relaxed">
          A glimpse of lawns, gardens and irrigation projects delivered for homes
          and businesses across San Jose.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[240px] gap-4">
        {GALLERY.map((g, i) => (
          <motion.figure
            key={i}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: (i % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
            data-testid={`gallery-item-${i}`}
            className={`group relative overflow-hidden rounded-2xl border border-[#242E28] ${g.span}`}
          >
            <img
              src={g.url}
              alt={g.label}
              className="h-full w-full object-cover grayscale-[0.35] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D0B]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <figcaption className="absolute bottom-4 left-4 z-10 font-mono-accent text-xs uppercase tracking-[0.18em] text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
              {g.label}
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
};

export default Gallery;
