import { PolicyLayout } from "@/components/common/PolicyLayout";
import React from "react";

export default function ShippingPolicyPage() {
    return (
        <PolicyLayout title="Shipping Policy (ढुवानी नीति)" lastUpdated="December 22, 2025">
            <div className="space-y-6">
                <section>
                    <p>
                        Vanijay.com provides fast and reliable shipping across Nepal. We work with the best logistics partners to ensure your orders reach you on time.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Nepali Translation (ढुवानी नीति)</h2>
                    <p>
                        Vanijay.com नेपालभर छिटो र भरपर्दो ढुवानी सेवा प्रदान गर्दछ। हामी तपाईँको अर्डर समयमै पुर्‍याउनका लागि उत्कृष्ट लजिस्टिक साझेदारहरूसँग काम गर्छौँ।
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
