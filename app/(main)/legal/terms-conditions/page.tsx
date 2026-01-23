import { PolicyLayout } from "@/components/common/PolicyLayout";
import React from "react";

export default function TermsConditionsPage() {
    return (
        <PolicyLayout title="Terms and Conditions" lastUpdated="January 23, 2026">
            <div className="space-y-8">
                <section className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="bg-muted/30 p-4 rounded-lg border">
                        <h2 className="text-xl font-bold mb-3">English Version</h2>
                        <div className="whitespace-pre-line text-muted-foreground text-sm">
                            {`Terms and Conditions
Last Updated: 23-JAN-2026

1. Acceptance: By using Vanijay.com, you agree to these Terms, Privacy, Return, and Shipping Policies.
2. Eligibility: Must be 16+ or supervised by a legal guardian.
3. Accounts: Provide accurate info; you're responsible for credentials.
4. Products: Prices and info subject to change.
5. Payments: eSewa, Khalti, COD, and cards accepted via secure gateways.
6. Shipping: Estimates only; risk passes at dispatch.
7. User Conduct: No illegal activity or IP infringement.
8. Liability: Provided "as is". Limitation of liability applies.
9. Governing Law: Laws of Nepal. Arbitration for disputes.

Contact: vanijayenterprises@gmail.com`}
                        </div>
                    </div>

                    <div className="mt-8 bg-primary/5 p-4 rounded-lg border border-primary/10">
                        <h2 className="text-xl font-bold mb-3 text-primary">Nepali Translation (नियम तथा शर्तहरू)</h2>
                        <div className="whitespace-pre-line text-foreground/80 text-sm font-medium">
                            {`नियम तथा शर्तहरू - Vanijay.com अनलाइन सपिङ प्लेटफर्म
अन्तिम परिमार्जन: डिसेम्बर २२, २०२५

१. योग्यता: कम्तिमा १६ वर्षको हुनुपर्छ।
२. खाता: सही जानकारी दिनुहोस् र पासवर्ड गोप्य राख्नुहोस्।
३. अर्डर र भुक्तानी: अनलाइन बैंकिङ, वालेट वा COD मार्फत।
४. फिर्ता र रिफन्ड: हाम्रो फिर्ता नीति लागू हुनेछ।
५. निषेधित कार्य: कुनै पनि कानुनको उल्लंघन वा हानिकारक सामग्री।
६. कानुन: नेपालको कानुन बमोजिम समाधान गरिनेछ।

सम्पर्क:
वाणिजय इन्टरप्राइजेज
इमेल: vanijayenterprises@gmail.com
फोन: ९७६१०१२८१३`}
                        </div>
                    </div>
                </section>
            </div>
        </PolicyLayout>
    );
}
