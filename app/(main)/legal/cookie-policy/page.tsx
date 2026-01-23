import { PolicyLayout } from "@/components/common/PolicyLayout";
import React from "react";

export default function CookiePolicyPage() {
    return (
        <PolicyLayout title="Cookie Policy (कुकिज नीति)" lastUpdated="December 22, 2025">
            <div className="space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-2">English Version</h2>
                    <p>
                        Welcome to Vanijay.com! This Cookies Policy explains how we use cookies and similar technologies on our website to improve your online shopping experience in Nepal.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Nepali Translation (कुकिज नीति)</h2>
                    <p>
                        Vanijay.com मा तपाईँलाई स्वागत छ! यो कुकिज नीतिले नेपालमा तपाईँको अनलाइन सपिङ अनुभवलाई अझ राम्रो बनाउन हामीले हाम्रो वेबसाइटमा कुकिज र समान प्रविधिहरू कसरी प्रयोग गर्छौँ भन्ने कुराको व्याख्या गर्छ।
                    </p>
                </section>

                <section>
                    <h3 className="text-lg font-medium mb-2">कुकिज (Cookies) भनेको के हो?</h3>
                    <p>
                        कुकिज साना टेक्स्ट फाइलहरू हुन् जुन तपाईँले कुनै वेबसाइट भ्रमण गर्दा तपाईँको उपकरणमा भण्डारण हुन्छन्। यसले वेबसाइटहरूलाई राम्रोसँग चल्न, छिटो लोड हुन र सहज अनुभव प्रदान गर्न मद्दत गर्दछ।
                    </p>
                </section>

                <section className="bg-muted p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">सम्पर्क गर्नुहोस</h3>
                    <p>Vanijay Enterprises, कोशी, सुनसरी, इटहरी</p>
                    <p>ईमेल: vanijayenterprises@gmail.com</p>
                    <p>फोन: 9761012813</p>
                </section>
            </div>
        </PolicyLayout>
    );
}
