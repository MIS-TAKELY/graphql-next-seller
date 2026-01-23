import { PolicyLayout } from "@/components/common/PolicyLayout";
import React from "react";

export default function ShippingPolicyPage() {
    return (
        <PolicyLayout title="Shipping & Delivery Policy" lastUpdated="December 22, 2025">
            <div className="space-y-8">
                <section className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="bg-muted/30 p-4 rounded-lg border">
                        <h2 className="text-xl font-bold mb-3">English Version</h2>
                        <div className="whitespace-pre-line text-muted-foreground text-sm">
                            {`Shipping & Delivery Policy - Vanijay.com Nepal Online Shopping
Last Updated: December 22, 2025

1. Order Processing: 1–2 business days.
2. Shipping Partners: Trusted logistics companies in Nepal.
3. Timelines: 
   Kathmandu Valley: 2–4 days.
   Major Cities: 4–7 days.
   Rest of Nepal: 7–14 days.
4. Costs: Calculated at checkout. Free shipping often available.
5. Tracking: Email with tracking number provided.
6. International Shipping: Currently within Nepal only.

Contact: vanijayenterprises@gmail.com`}
                        </div>
                    </div>

                    <div className="mt-8 bg-primary/5 p-4 rounded-lg border border-primary/10">
                        <h2 className="text-xl font-bold mb-3 text-primary">Nepali Translation (ढुवानी र डेलिभरी नीति)</h2>
                        <div className="whitespace-pre-line text-foreground/80 text-sm font-medium">
                            {`ढुवानी र डेलिभरी नीति (Shipping & Delivery Policy) - Vanijay.com नेपाल
अन्तिम परिमार्जन: डिसेम्बर २२, २०२५

१. प्रशोधन समय: १-२ कार्यदिन।
२. डेलिभरी समय:
   काठमाडौँ उपत्यका: २-४ कार्यदिन
   प्रमुख सहरहरू: ४-७ कार्यदिन
   दुर्गम क्षेत्र: ७-१४ कार्यदिन
३. शुल्क: चेकआउटमा गणना गरिन्छ। नि:शुल्क डेलिभरी अफरहरू उपलब्ध हुन सक्छन्।
४. ट्र्याकिङ: ईमेल मार्फत ट्र्याकिङ विवरण पठाइनेछ।

सम्पर्क:
वाणिजय इन्टरप्राइजेज
ईमेल: vanijayenterprises@gmail.com
फोन: 9761012813`}
                        </div>
                    </div>
                </section>
            </div>
        </PolicyLayout>
    );
}
