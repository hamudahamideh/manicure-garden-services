import Marquee from "react-fast-marquee";

const items = [
  "Landscaping",
  "Sprinkler Systems",
  "Gardening",
  "Lawn Care",
  "Planting",
  "Lawn Cleanup",
];

const MarqueeSection = () => {
  return (
    <section
      data-testid="marquee-section"
      className="border-y border-white/10 bg-[#0A0D0B] py-6 md:py-8"
    >
      <Marquee speed={40} gradient={false} autoFill>
        {items.map((it, i) => (
          <div key={i} className="flex items-center">
            <span className="font-display font-semibold tracking-tighter text-4xl md:text-6xl text-white/[0.12] px-8">
              {it}
            </span>
            <span className="h-2.5 w-2.5 rounded-full bg-[#BAFF29]/50" />
          </div>
        ))}
      </Marquee>
    </section>
  );
};

export default MarqueeSection;
