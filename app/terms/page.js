"use client";

import React from "react";

export default function TermsConditions() {
    return (
        <div className="section-full py-12 md:py-20 bg-white">
            <div className="section-content max-w-3xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Terms & Conditions</h1>
                <p className="text-gray-500 mb-10">Last updated: January 1, 2026</p>

                <div className="prose prose-red max-w-none text-gray-700 space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">1. Agreement to Terms</h2>
                        <p>
                            These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and Brand Empire (“we,” “us” or “our”), concerning your access to and use of the Brand Empire website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the “Site”).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">2. User Representations</h2>
                        <p>By using the Site, you represent and warrant that:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li>All registration information you submit will be true, accurate, current, and complete.</li>
                            <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                            <li>You have the legal capacity and you agree to comply with these Terms of Use.</li>
                            <li>You are not a minor in the jurisdiction in which you reside.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">3. Products</h2>
                        <p>
                            We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Site. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors, and your electronic display may not accurately reflect the actual colors and details of the products.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">4. Purchases and Payment</h2>
                        <p>
                            We accept varying forms of payment as indicated on the website. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site. Sales tax will be added to the price of purchases as deemed required by us. We may change prices at any time. All payments shall be in Bangladeshi Taka (BDT).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">5. Contact Us</h2>
                        <p>
                            In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at: <a href="mailto:support@brandempire.com" className="text-red-600 hover:underline">support@brandempire.com</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
