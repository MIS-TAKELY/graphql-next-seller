import SellerUnifiedAuth from "@/components/auth/SellerUnifiedAuth";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function SignInPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session) {
        if ((session.user as any).hasProfile) {
            redirect("/");
        } else {
            redirect("/profileSetup");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4 w-full">
            <SellerUnifiedAuth />
        </div>
    );
}

