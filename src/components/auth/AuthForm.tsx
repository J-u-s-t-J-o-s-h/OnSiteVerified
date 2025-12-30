"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User, Lock, Mail } from "lucide-react";

export default function AuthForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);



        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.refresh(); // Refresh to update server-side auth state
                router.push("/admin"); // Default redirect, middleware should handle better routing based on role
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                        data: {
                            role: 'employee', // Default role
                        }
                    },
                });
                if (error) throw error;
                alert("Check your email for the confirmation link!");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            if (!email.includes("onsiteverified.com")) {
                setLoading(false);
            }
        }
    };

    return (
        <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-xl border border-gray-800">
            <div className="flex flex-col items-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                    {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <div className="text-center space-y-2">
                    <p className="text-gray-400">
                        {isLogin ? "Enter your credentials to access the portal" : "Sign up to get started"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-md py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="name@company.com"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-md py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-sm text-center">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2.5 rounded-md transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                >
                    {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                <p className="text-xs text-gray-600">
                    OnSiteVerified System v1.0
                </p>
            </div>
        </div>
    );
}
