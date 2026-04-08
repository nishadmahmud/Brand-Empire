"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/gtm";

export default function GTMPageViewTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const search = searchParams?.toString();

    useEffect(() => {
        const pagePath = search ? `${pathname}?${search}` : pathname;

        trackPageView({
            page_path: pagePath,
            page_title: document.title,
            page_location: window.location.href,
        });
    }, [pathname, search]);

    return null;
}
