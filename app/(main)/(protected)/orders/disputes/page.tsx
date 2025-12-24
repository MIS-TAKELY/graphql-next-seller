import DisputesClient from "@/components/orders/DisputesClient";

export default async function DisputesPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <DisputesClient />
        </div>
    );
}
