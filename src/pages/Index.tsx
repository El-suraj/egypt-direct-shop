import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import TrustBanner from "@/components/TrustBanner";
import HowItWorks from "@/components/HowItWorks";
import ConciergeSection from "@/components/ConciergeSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <CategoryGrid />
      <FeaturedProducts />
      <HowItWorks />
      <TrustBanner />
      <ConciergeSection />
      <Footer />
    </div>
  );
};

export default Index;
