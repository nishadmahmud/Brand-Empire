"use client";

import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import BrandsSection from "@/components/BrandsSection";
import PromoBanners from "@/components/PromoBanners";
import TrendingSection from "@/components/TrendingSection";
import FeaturedCollections from "@/components/FeaturedCollections";
import NewArrivals from "@/components/NewArrivals";
import AppPromoSection from "@/components/AppPromoSection";
import Footer from "@/components/Footer";
import TopMarquee from "@/components/TopMarquee";
import { useState } from "react";

export default function Home() {
  const [marqueeVisible, setMarqueeVisible] = useState(true);

  return (
    <main className={`min-h-screen ${marqueeVisible ? 'pt-[88px] md:pt-[116px]' : 'pt-16 md:pt-20'} overflow-x-hidden w-full max-w-[100vw] transition-all duration-300`}> {/* Responsive padding for marquee + navbar */}
      <TopMarquee onClose={() => setMarqueeVisible(false)} />
      <Navbar marqueeVisible={marqueeVisible} />

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
