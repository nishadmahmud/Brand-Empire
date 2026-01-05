"use client";

import { use } from "react";
import ProductDetailsPage from "@/components/ProductDetailsPage";

export default function ProductDetails({ params }) {
    const { id } = use(params);

    return (
        <main className="pt-[104px] md:pt-[116px] transition-all duration-300">
            <ProductDetailsPage productId={id} />
        </main>
    );
}
