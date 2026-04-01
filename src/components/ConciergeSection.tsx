import { motion } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";

const ConciergeSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <motion.div
          className="relative rounded-2xl overflow-hidden bg-gradient-card border border-border p-8 md:p-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(40_55%_55%/0.08),transparent_60%)]" />
          <div className="relative z-10 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Can't Find It?
              <br />
              <span className="text-gradient-gold">We'll Get It For You</span>
            </h2>
            <p className="text-muted-foreground font-body mb-8 leading-relaxed">
              Send us a product link or image from any Egyptian store, and our team
              will source it for you at the original price. Personal shopping, simplified.
            </p>
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-gold text-primary-foreground font-body font-semibold rounded-lg shadow-gold hover:opacity-90 transition-opacity text-sm tracking-wide uppercase"
            >
              Start Concierge Request
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ConciergeSection;
