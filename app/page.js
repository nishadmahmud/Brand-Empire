import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import BrandsSection from "@/components/BrandsSection";
import PromoBanners from "@/components/PromoBanners";
import TrendingSection from "@/components/TrendingSection";
import FeaturedCollections from "@/components/FeaturedCollections";
import NewArrivals from "@/components/NewArrivals";
import AppPromoSection from "@/components/AppPromoSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen pt-20"> {/* pt-20 to account for fixed navbar */}
      <Navbar />

      {/* Hero Section - Full Width */}
      <section className="section-full relative">
        <HeroSlider />
      </section>

      {/* Brands Section */}
      <BrandsSection />

      {/* Promotional Banners */}
      <PromoBanners />

      {/* Trending Section */}
      <TrendingSection />

      {/* Featured Collections */}
      <FeaturedCollections />

      {/* New Arrivals */}
      <NewArrivals />

      {/* App Promotion */}
      <AppPromoSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
