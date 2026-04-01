import { motion } from "framer-motion";
import { Search, CreditCard, Plane, Package } from "lucide-react";

const steps = [
  { icon: Search, title: "Browse & Shop", desc: "Explore authentic Egyptian fashion at real store prices" },
  { icon: CreditCard, title: "Pay Securely", desc: "Pay in Naira via card or bank transfer — transparent pricing" },
  { icon: Plane, title: "We Source & Ship", desc: "We purchase from Cairo stores and ship directly to you" },
  { icon: Package, title: "Receive & Enjoy", desc: "Track your order and receive at your door in 5–10 days" },
];

const HowItWorks = () => {
  return (
    <section className="py-16 md:py-24 bg-secondary/30" id="how-it-works">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            How It <span className="text-gradient-gold">Works</span>
          </h2>
          <p className="text-muted-foreground font-body max-w-md mx-auto">
            Four simple steps to shop Egypt from Nigeria
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              className="relative flex flex-col items-center text-center p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center mb-5 shadow-gold">
                <step.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <span className="absolute top-4 right-4 font-display text-4xl font-bold text-muted/50">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-body text-base font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
