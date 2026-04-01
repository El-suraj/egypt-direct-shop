import { motion } from "framer-motion";
import { ShieldCheck, RotateCcw, Truck, BadgeCheck, Headphones } from "lucide-react";

const trustItems = [
  {
    icon: ShieldCheck,
    title: "100% Authentic",
    desc: "Every product sourced from verified Egyptian stores",
  },
  {
    icon: RotateCcw,
    title: "Money-Back Guarantee",
    desc: "Full refund if the product isn't as described",
  },
  {
    icon: Truck,
    title: "Egypt → Nigeria Delivery",
    desc: "5–10 business days tracked shipping",
  },
  {
    icon: BadgeCheck,
    title: "Verified Vendors",
    desc: "Every store personally vetted in Cairo",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    desc: "WhatsApp & live chat always available",
  },
];

const TrustBanner = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Why <span className="text-gradient-gold">Trust Us</span>
          </h2>
          <p className="text-muted-foreground font-body max-w-lg mx-auto">
            We built Egypt Plugs to eliminate every risk of cross-border shopping
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {trustItems.map((item, i) => (
            <motion.div
              key={item.title}
              className="flex flex-col items-center text-center p-5 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-body text-sm font-semibold text-foreground mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground font-body leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBanner;
