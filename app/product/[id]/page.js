"use client";

import { use, useState } from "react";
import Navbar from "@/components/Navbar";
import TopMarquee from "@/components/TopMarquee";
import Footer from "@/components/Footer";
import ProductDetailsPage from "@/components/ProductDetailsPage";

export default function ProductDetails({ params }) {
    const { id } = use(params);
    const [marqueeVisible, setMarqueeVisible] = useState(true);

    return (
        <>
            <TopMarquee onClose={() => setMarqueeVisible(false)} />
            <Navbar marqueeVisible={marqueeVisible} />
            <main className={`${marqueeVisible ? 'pt-[88px] md:pt-[116px]' : 'pt-16 md:pt-20'} transition-all duration-300`}>
                <ProductDetailsPage productId={id} />
            </main>
            <Footer />
        </>
    );
}
