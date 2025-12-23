import UnifiedAuth from "@/components/auth/UnifiedAuth";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
            <UnifiedAuth />
        </div>
    );
}
