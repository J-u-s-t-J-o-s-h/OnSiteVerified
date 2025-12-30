import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
    return (
        <main className="min-h-screen flex items-center justify-center p-4 bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-slate-950">
            <AuthForm />
        </main>
    );
}
