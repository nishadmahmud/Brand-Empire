"use client";

import React from "react";

export default function PrivacyPolicy() {
    return (
        <div className="section-full py-12 md:py-20 bg-white">
            <div className="section-content max-w-3xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
                <p className="text-gray-500 mb-10">Last updated: January 1, 2026</p>

                <div className="prose prose-red max-w-none text-gray-700 space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
                        <p>
                            Welcome to Brand Empire. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">2. Data We Collect</h2>
                        <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                            <li><strong>Financial Data:</strong> includes payment card details (processed securely by our third-party payment processors).</li>
                            <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Data</h2>
                        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2">
                            <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., delivering your order).</li>
                            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                            <li>Where we need to comply with a legal or regulatory obligation.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Security</h2>
                        <p>
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">5. Contact Details</h2>
                        <p>
                            If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href="mailto:privacy@brandempire.com" className="text-red-600 hover:underline">privacy@brandempire.com</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
