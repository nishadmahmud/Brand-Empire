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
    <main className="min-h-screen pt-16 md:pt-20 overflow-x-hidden w-full max-w-[100vw]"> {/* Responsive padding for navbar */}
      <Navbar />

      {/* Hero Section - Full Width */}
      <section className="section-full relative">
        <HeroSlider />
      </section>

      {/* Brands Section */}
      <div className="mt-8 md:mt-12">
        <BrandsSection />
      </div>

      {/* Promotional Banners */}
      <div className="mt-8 md:mt-12">
        <PromoBanners />
      </div>

      {/* Trending Section */}
      <div className="mt-8 md:mt-12">
        <TrendingSection />
      </div>

      {/* Featured Collections */}
      <div className="mt-8 md:mt-12">
        <FeaturedCollections />
      </div>

      {/* New Arrivals */}
      <div className="mt-8 md:mt-12">
        <NewArrivals />
      </div>

      {/* App Promotion */}
      <div className="mt-8 md:mt-12">
        <AppPromoSection />
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
