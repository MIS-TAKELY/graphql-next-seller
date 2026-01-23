import { PolicyLayout } from "@/components/common/PolicyLayout";
import React from "react";

export default function TermsConditionsPage() {
    return (
        <PolicyLayout title="Terms and Conditions (शर्तहरू र नियमहरू)" lastUpdated="December 22, 2025">
            <div className="space-y-6">
                <section>
                    <p>
                        Welcome to Vanijay.com! These Terms and Conditions govern your use of our platform. By accessing or using the platform, you agree to be bound by these terms.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Nepali Translation (शर्तहरू र नियमहरू)</h2>
                    <p>
                        वाणिजय (Vanijay.com) मा तपाईँलाई स्वागत छ! यी शर्तहरू र नियमहरूले तपाईँको यस प्लेटफर्मको प्रयोगलाई नियन्त्रित गर्दछ। प्लेटफर्म प्रयोग गरेर, तपाईँ यी शर्तहरूमा सहमत हुनुहुन्छ।
                    </p>
                </section>

                <section className="bg-muted p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">सम्पर्क गर्नुहोस</h3>
                    <p>वाणिजय इन्टरप्राइजेज, कोशी, सुनसरी, इटहरी</p>
                    <p>इमेल: vanijayenterprises@gmail.com</p>
                    <p>फोन: ९७६१०१२८१३</p>
                </section>
            </div>
        </PolicyLayout>
    );
}
