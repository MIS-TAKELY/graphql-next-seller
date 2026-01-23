import { PolicyLayout } from "@/components/common/PolicyLayout";
import React from "react";

export default function ReturnsPolicyPage() {
    return (
        <PolicyLayout title="Return and Refund Policy" lastUpdated="January 23, 2026">
            <div className="space-y-8">
                <section className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="bg-muted/30 p-4 rounded-lg border">
                        <h2 className="text-xl font-bold mb-3">English Version</h2>
                        <div className="whitespace-pre-line text-muted-foreground text-sm">
                            {`Return and Refund Policy - Vanijay.com Nepal Online Shopping
Last Updated: 23 jan, 2026

At Vanijay.com, your satisfaction is our top priority.

1. When Can You Return: Within 5 days from the date you receive your order.
2. Valid Reasons: Defective/Damaged, Wrong Item, Missing Parts, Change of Mind (for returnable categories).
3. Non-Returnable: Used, washed, altered, or missing original packaging/tags.
4. How to Return: Log in → My Orders → Contact us within 5 days → Get Approval (RAN) → Pack & Ship.
5. Inspection: Takes 5–7 business days after receive.
6. Refunds: Processed within 5–10 business days if approved.
7. Exchanges: For defective or size issues (if stock available).
8. Cancellation: Free before shipping.

Contact: vanijayenterprises@gmail.com`}
                        </div>
                    </div>

                    <div className="mt-8 bg-primary/5 p-4 rounded-lg border border-primary/10">
                        <h2 className="text-xl font-bold mb-3 text-primary">Nepali Translation (फिर्ता र रिफन्ड नीति)</h2>
                        <div className="whitespace-pre-line text-foreground/80 text-sm font-medium">
                            {`फिर्ता र रिफन्ड नीति (Return and Refund Policy) - Vanijay.com नेपाल अनलाइन सपिङ
अन्तिम परिमार्जन: २३ जनवरी, २०२६

Vanijay.com मा, तपाईँको सन्तुष्टि नै हाम्रो मुख्य प्राथमिकता हो।

१. फिर्ता गर्ने समय: सामान प्राप्त गरेको ५ दिनभित्र।
२. मान्य कारणहरू: बिग्रिएको, गलत सामान, अपुरो सामान, मन परिवर्तन।
३. फिर्ता नहुने: प्रयोग गरिएको, धोएको, वा प्याकेजिङ नभएको।
४. प्रक्रिया: My Orders मा जानुहोस् वा फोन/ईमेल गर्नुहोस्।
५. रिफन्ड: स्वीकृति पछि ५-१० कार्यदिन भित्र।
६. साटफेर: त्रुटिपूर्ण वा साइजको समस्या भएमा।

सम्पर्क:
वाणिजय इन्टरप्राइजेज
ईमेल: vanijayenterprises@gmail.com
phone: 9761012813`}
                        </div>
                    </div>
                </section>
            </div>
        </PolicyLayout>
    );
}
