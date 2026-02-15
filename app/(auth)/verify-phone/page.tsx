import SellerUnifiedAuth from "@/components/auth/SellerUnifiedAuth";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function VerifyPhonePage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/sign-in");
    }

    if ((session.user as any).phoneNumberVerified) {
        if ((session.user as any).hasProfile) {
            redirect("/");
        } else {
            redirect("/profileSetup");
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 w-full">
            <SellerUnifiedAuth />
        </div>
    );
}

