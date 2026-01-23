import { PolicyLayout } from "@/components/common/PolicyLayout";
import React from "react";

export default function PrivacyPolicyPage() {
    return (
        <PolicyLayout title="Privacy Policy (गोपनीयता नीति)" lastUpdated="December 22, 2025">
            <div className="space-y-6">
                <section>
                    <p>
                        At Vanijay.com, we value your privacy and are committed to protecting your personal information. As Nepal&apos;s trusted online shopping platform, we handle your data responsibly and in full compliance with Nepal&apos;s Privacy Act, 2075 (2018).
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Nepali Translation (गोपनीयता नीति)</h2>
                    <p>
                        Vanijay.com मा, हामी तपाईँको गोपनीयताको कदर गर्छौँ र तपाईँको व्यक्तिगत जानकारी सुरक्षित राख्न प्रतिबद्ध छौँ। नेपालको भरपर्दो अनलाइन सपिङ प्लेटफर्मको रूपमा, हामी तपाईँको डाटालाई जिम्मेवारीपूर्वक र नेपालको वैयक्तिक गोपनीयता सम्बन्धी ऐन, २०७५ को पूर्ण पालना गर्दै व्यवस्थापन गर्छौँ।
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
