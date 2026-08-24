import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { REVIEWS, COMPANY } from "@/data";

const Stars = ({ n = 5, size = "h-4 w-4" }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={`${size} ${i <= n ? "fill-[#BAFF29] text-[#BAFF29]" : "text-white/25"}`}
      />
    ))}
  </div>
);

const Testimonials = () => {
  return (
    <section
      id="reviews"
      data-testid="reviews-section"
      className="bg-[#121714] border-y border-[#242E28]"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
        {/* Prominent rating banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl border border-[#242E28] bg-[#0A0D0B] p-8 md:p-12 mb-12 md:mb-16 flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-16"
        >
          <div className="flex items-center gap-6">
            <div className="font-display font-extrabold text-6xl md:text-8xl leading-none text-[#BAFF29]">
              5.0
            </div>
            <div>
              <Stars n={5} size="h-5 w-5" />
              <p className="mt-2 text-white/60 text-sm">
                Based on <span className="text-white font-semibold">{REVIEWS.length}+</span> local reviews
              </p>
            </div>
          </div>
          <div className="lg:border-l lg:border-white/10 lg:pl-16">
            <span className="font-mono-accent text-xs uppercase tracking-[0.22em] text-[#BAFF29]">
              / Client testimonials
            </span>
            <h2 className="font-display font-bold tracking-tighter text-4xl sm:text-5xl lg:text-6xl mt-3 leading-[0.95]">
              Loved by San Jose <br className="hidden md:block" /> homeowners.
            </h2>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {REVIEWS.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.07 }}
              data-testid={`review-card-${i}`}
              className="rounded-2xl border border-[#242E28] bg-[#0A0D0B] p-7 flex flex-col hover:border-[#BAFF29]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <Quote className="h-7 w-7 text-[#BAFF29]" />
                <Stars n={r.rating} />
              </div>
              <p className="mt-4 text-white/80 leading-relaxed flex-1">"{r.text}"</p>
              <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="font-display font-semibold">{r.name}</p>
                  <p className="text-xs text-white/50">{r.location}</p>
                </div>
                <span className="font-mono-accent text-[10px] uppercase tracking-[0.15em] text-[#BAFF29]/80">
                  {r.service}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <p className="text-white/60">
            Ready to join our happy customers across {COMPANY.city.split(",")[0]}?
          </p>
          <a
            href="#estimate"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#estimate")?.scrollIntoView({ behavior: "smooth" });
            }}
            data-testid="reviews-estimate-button"
            className="inline-flex items-center gap-2 bg-[#BAFF29] text-black font-semibold rounded-full px-6 py-3.5 hover:bg-[#A3E622] transition-colors"
          >
            Get Your Free Estimate
          </a>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
