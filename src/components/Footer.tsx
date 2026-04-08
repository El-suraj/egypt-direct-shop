import { Instagram, Twitter, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="font-display text-xl font-bold text-gradient-gold">Egypt Plugs</span>
            <p className="text-sm text-muted-foreground font-body mt-3 leading-relaxed">
              Shop Egypt from Nigeria — Direct, Authentic, Affordable.
            </p>
            <div className="flex gap-3 mt-4">
              {[Instagram, Twitter, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="https://x.com/EgyptPlugs"
                  className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Shop",
              links: ["Abayas", "Shoes", "Bags", "Accessories", "New Arrivals"],
            },
            {
              title: "Support",
              links: ["How It Works", "FAQ", "Shipping & Returns", "Contact Us", "Track Order"],
            },
            {
              title: "Company",
              links: ["About Us", "Our Vendors", "Trust & Safety", "Privacy Policy", "Terms"],
            },
          ].map((group) => (
            <div key={group.title}>
              <h4 className="font-body text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-body">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground font-body">
            © 2026 Egypt Plugs. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground font-body">🇪🇬 Sourced from Egypt</span>
            <span className="text-xs text-muted-foreground font-body">🇳🇬 Delivered to Nigeria</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
