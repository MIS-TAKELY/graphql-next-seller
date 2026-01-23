import { PolicyLayout } from "@/components/common/PolicyLayout";
import React from "react";

export default function CookiePolicyPage() {
    return (
        <PolicyLayout title="Cookie Policy" lastUpdated="December 22, 2025">
            <div className="space-y-8">
                <section className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="bg-muted/30 p-4 rounded-lg border">
                        <h2 className="text-xl font-bold mb-3">English Version</h2>
                        <div className="whitespace-pre-line text-muted-foreground text-sm">
                            {`Cookies Policy for VANIJAY.COM
Last Updated: December 22, 2025

1. Introduction
This Cookies Policy explains what cookies are, how we use them on the Vanijay.com website and the Platform, and the choices you have regarding their use.

2. What Are Cookies?
Cookies are small text files placed on your device. They make websites work efficiently and improve the user experience.

3. How and Why We Use Cookies
- Strictly Necessary: Essential for the Platform to function.
- Performance / Analytics: Help us understand visitor interaction.
- Functionality: Remember choices you make.
- Targeting / Advertising: Show relevant advertisements.

4. Third-Party Cookies
We may allow partners to set cookies for analytics and advertising (e.g., Google Analytics, Facebook Pixel).

5. How You Can Manage Cookies
You can manage cookies through browser controls or our consent banner.

6. Changes to This Cookies Policy
We may update this policy periodically.

7. Contact Us
Vanijay Enterprises
Email: vanijayenterprises@gmail.com
Phone: +977 976101281`}
                        </div>
                    </div>

                    <div className="mt-8 bg-primary/5 p-4 rounded-lg border border-primary/10">
                        <h2 className="text-xl font-bold mb-3 text-primary">Nepali Translation (कुकिज नीति)</h2>
                        <div className="whitespace-pre-line text-foreground/80 text-sm font-medium">
                            {`अन्तिम परिमार्जन: डिसेम्बर २२, २०२५

Vanijay.com मा तपाईँलाई स्वागत छ! यो कुकिज नीतिले हाम्रो वेबसाइटमा कुकिज र समान प्रविधिहरू कसरी प्रयोग गर्छौँ भन्ने कुराको व्याख्या गर्छ।

कुकिज (Cookies) भनेको के हो?
कुकिज साना टेक्स्ट फाइलहरू हुन् जसले वेबसाइटहरूलाई सहज रूपमा चल्न मद्दत गर्दछ।

हामी कुकिज किन प्रयोग गर्छौँ?
- अत्यन्त आवश्यक: वेबसाइट चलाउन अपरिहार्य।
- कार्यसम्पादन र विश्लेषण: सुधार गर्न मद्दत गर्छ।
- कार्यक्षमता: तपाईँका रोजाइहरू सम्झन।
- विज्ञापन: सान्दर्भिक अफरहरू देखाउन।

कुकिज व्यवस्थापन:
तपाईँ आफ्नो ब्राउजर सेटिङ्सबाट कुकिज व्यवस्थापन गर्न सक्नुहुन्छ।

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
