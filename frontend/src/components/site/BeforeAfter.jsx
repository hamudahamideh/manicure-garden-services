import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { MoveHorizontal } from "lucide-react";
import { BEFORE_AFTER } from "@/data";

const Slider = ({ item, index }) => {
  const containerRef = useRef(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  useEffect(() => {
    const move = (e) => {
      if (!dragging.current) return;
      setFromClientX(e.touches ? e.touches[0].clientX : e.clientX);
    };
    const up = () => (dragging.current = false);
    window.addEventListener("mousemove", move);
    window.addEventListener("touchmove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
  }, [setFromClientX]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.08 }}
      data-testid={`before-after-${index}`}
    >
      <div
        ref={containerRef}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#242E28] cursor-ew-resize select-none"
        onMouseDown={(e) => {
          dragging.current = true;
          setFromClientX(e.clientX);
        }}
        onTouchStart={(e) => {
          dragging.current = true;
          setFromClientX(e.touches[0].clientX);
        }}
      >
        {/* After (base) */}
        <img
          src={item.after}
          alt={`${item.title} after`}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="absolute top-3 right-3 z-20 font-mono-accent text-[10px] uppercase tracking-[0.18em] bg-[#BAFF29] text-black px-2.5 py-1 rounded-full">
          After
        </span>

        {/* Before (clipped with clip-path so it stays full-size) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <img
            src={item.before}
            alt={`${item.title} before`}
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover grayscale-[0.15]"
          />
          <span className="absolute top-3 left-3 z-20 font-mono-accent text-[10px] uppercase tracking-[0.18em] bg-black/70 text-white px-2.5 py-1 rounded-full">
            Before
          </span>
        </div>

        {/* Handle */}
        <div
          className="absolute top-0 bottom-0 z-30 w-0.5 bg-[#BAFF29]"
          style={{ left: `${pos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-[#BAFF29] text-black grid place-items-center shadow-lg">
            <MoveHorizontal className="h-5 w-5" strokeWidth={2.5} />
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg tracking-tight">{item.title}</h3>
        <span className="font-mono-accent text-xs uppercase tracking-[0.15em] text-[#BAFF29]/80">
          {item.location}
        </span>
      </div>
    </motion.div>
  );
};

const BeforeAfter = () => {
  return (
    <section
      id="transformations"
      data-testid="before-after-section"
      className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32"
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
        <div>
          <span className="font-mono-accent text-xs uppercase tracking-[0.22em] text-[#BAFF29]">
            / Before &amp; After
          </span>
          <h2 className="font-display font-bold tracking-tighter text-4xl sm:text-5xl lg:text-6xl mt-4 leading-[0.95]">
            Drag to reveal <br /> the transformation.
          </h2>
        </div>
        <p className="max-w-sm text-white/60 leading-relaxed">
          Slide the handle on each project to see how we turn tired, overgrown
          yards into manicured showpieces.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {BEFORE_AFTER.map((item, i) => (
          <Slider key={i} item={item} index={i} />
        ))}
      </div>
    </section>
  );
};

export default BeforeAfter;
