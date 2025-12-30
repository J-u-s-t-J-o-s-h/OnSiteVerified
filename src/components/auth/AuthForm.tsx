"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Lock, Mail } from "lucide-react";

export default function AuthForm() {
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // Default to login unless mode is explicitly 'signup'
    const [isLogin, setIsLogin] = useState(mode !== 'signup');
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
                <button
                    type="button"
                    onClick={() => {
                        setLoading(true);
                        supabase.auth.signInWithOAuth({
                            provider: 'google',
                            options: {
                                redirectTo: `${location.origin}/auth/callback`
                            }
                        });
                    }}
                    disabled={loading}
                    className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 font-bold py-2.5 rounded-md transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="#EA4335"
                            d="M24 12.276C24 11.43 23.929 10.617 23.794 9.83H12.24V14.545H18.835C18.548 16.088 17.653 17.399 16.297 18.307V21.437H20.255C22.571 19.305 23.905 16.166 23.905 12.502"
                        />
                        <path
                            fill="#34A853"
                            d="M12.24 24.004C15.52 24.004 18.272 22.923 20.258 21.088L16.299 17.958C15.211 18.69 13.821 19.124 12.243 19.124C9.079 19.124 6.402 16.987 5.445 14.113H1.353V17.284C3.364 21.278 7.502 24.004 12.24 24.004"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.442 14.113C5.197 13.382 5.06 12.602 5.06 11.802C5.06 11.002 5.197 10.222 5.442 9.491V6.32H1.351C0.522 7.971 0.054 9.832 0.054 11.802C0.054 13.772 0.522 15.633 1.351 17.284L5.442 14.113Z"
                        />
                        <path
                            fill="#4285F4"
                            d="M12.24 4.477C14.024 4.477 15.617 5.091 16.877 6.294L20.359 2.812C18.269 0.864 15.517 -0.2 12.24 -0.2C7.502 -0.2 3.364 2.526 1.353 6.52L5.445 9.691C6.402 6.817 9.079 4.677 12.24 4.677"
                        />
                    </svg>
                    Continue with Google
                </button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-gray-400">Or continue with email</span>
                    </div>
                </div>

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
