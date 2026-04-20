import { motion } from "framer-motion";
import catAbayas from "@/assets/cat-abayas.jpg";
import catShoes from "@/assets/cat-shoes.jpg";
import catBags from "@/assets/cat-bags.jpg";
import catAccessories from "@/assets/cat-accessories.jpg";
import catUnderwear from "@/assets/cat-underwear.jpg";

const categories = [
  { name: "Abayas", image: catAbayas, count: "450+ items" },
  { name: "Shoes", image: catShoes, count: "380+ items" },
  { name: "Bags", image: catBags, count: "290+ items" },
  { name: "Accessories", image: catAccessories, count: "520+ items" },
  { name: "Underwear", image: catUnderwear, count: "200+ items" },
];

const CategoryGrid = () => {
  return (
    <section className="py-16 md:py-24" id="shop">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Shop by <span className="text-gradient-gold">Category</span>
          </h2>
          <p className="text-muted-foreground font-body max-w-md mx-auto">
            Curated collections sourced directly from Egypt's top fashion stores
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {categories.map((cat, i) => (
            <motion.a
              key={cat.name}
              href="/products"
              className="group relative aspect-[3/4] rounded-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
                width={640}
                height={800}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {cat.name}
                </h3>
                <p className="text-xs text-primary font-body">{cat.count}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
