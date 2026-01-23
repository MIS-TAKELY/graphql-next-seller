import { PolicyLayout } from "@/components/common/PolicyLayout";
import React from "react";

export default function ReturnsPolicyPage() {
    return (
        <PolicyLayout title="Return and Refund Policy (फिर्ता र रिफन्ड नीति)" lastUpdated="December 22, 2025">
            <div className="space-y-6">
                <section>
                    <p>
                        At Vanijay.com, we strive for 100% customer satisfaction. If you are not happy with your purchase, we are here to help you with easy returns and refunds according to Nepal&apos;s Consumer Protection Act.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Nepali Translation (फिर्ता र रिफन्ड नीति)</h2>
                    <p>
                        Vanijay.com मा, हामी १००% ग्राहक सन्तुष्टिको कामना गर्छौँ। यदि तपाईँ आफ्नो खरिदसँग सन्तुष्ट हुनुहुन्न भने, हामी उपभोक्ता संरक्षण ऐन बमोजिम सजिलो फिर्ता र रिफन्ड प्रक्रियामा मद्दत गर्न तयार छौँ।
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
