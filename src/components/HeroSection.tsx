import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import heroImage from "@/assets/hero-fashion.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Luxury Egyptian fashion collection"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 border border-primary/30 rounded-full text-xs font-body font-semibold text-primary tracking-wider uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Authentic Guarantee
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
              Shop Egypt
              <br />
              <span className="text-gradient-gold">from Nigeria</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground font-body leading-relaxed mb-8 max-w-lg">
              Direct access to Cairo's finest fashion — original store prices,
              zero middlemen, delivered to your door.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-gold text-primary-foreground font-body font-semibold rounded-lg shadow-gold hover:opacity-90 transition-opacity text-sm tracking-wide uppercase"
              >
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border text-foreground font-body font-medium rounded-lg hover:bg-secondary transition-colors text-sm tracking-wide uppercase"
              >
                How It Works
              </a>
            </div>

            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-border">
              {[
                { value: "2,000+", label: "Products" },
                { value: "50+", label: "Egyptian Stores" },
                { value: "4.9★", label: "Trust Score" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-xl md:text-2xl font-bold text-primary">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground font-body">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
