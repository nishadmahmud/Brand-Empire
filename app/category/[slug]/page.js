import Navbar from "@/components/Navbar";
import TopMarquee from "@/components/TopMarquee";
import Footer from "@/components/Footer";
import CategoryPage from "@/components/CategoryPage";

export default function Category({ params }) {
    const { slug } = params;

    return (
        <>
            <TopMarquee />
            <Navbar marqueeVisible={true} />
            <main className="pt-[88px] md:pt-[116px]">
                <CategoryPage category={slug} />
            </main>
            <Footer />
        </>
    );
}

// Generate static params for known categories
export function generateStaticParams() {
    return [
        { slug: 'men' },
        { slug: 'women' },
        { slug: 'kids' },
    ];
}
