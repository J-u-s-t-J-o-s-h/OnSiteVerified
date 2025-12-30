import Link from "next/link";
import { ArrowRight, MapPin, Clock, ShieldCheck, Play } from "lucide-react";

export default function Home() {
    return (
        <main className="min-h-screen bg-[#0f172a] text-white selection:bg-primary/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] translate-y-1/3" />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="font-bold text-white">O</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight">OnSiteVerified</span>
                </div>
                <div className="flex gap-4">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2"
                    >
                        Log In
                    </Link>
                    <Link
                        href="/login"
                        className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full text-sm font-medium backdrop-blur-sm border border-white/10 transition-all"
                    >
                        Sign Up
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6 animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Live Site Accuracy
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-400">
                        Fair, simple time tracking <br /> for a professional crew.
                    </h1>

                    <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Replace messy paper logs with a tool your team will actually want to use. OnSiteVerified provides simple, location-verified check-ins so everyone gets paid accurately for the work they do.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/login"
                            className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-blue-600 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                            Start Tracking Today
                            <ArrowRight className="w-4 h-4" />
                        </Link>

                    </div>
                </div>

                {/* Feature Grid */}
                <div className="grid md:grid-cols-3 gap-6 pt-8">
                    <FeatureCard
                        icon={MapPin}
                        title="Right Place, Right Time"
                        desc="Help your team get to the right job site every time. Automatic location checks ensure everyone is exactly where they need to be."
                    />
                    <FeatureCard
                        icon={ShieldCheck}
                        title="Accurate Payroll"
                        desc="Digital records mean no more lost timesheets or disputes. Ensure every hour worked is accounted for."
                    />
                    <FeatureCard
                        icon={Clock}
                        title="Team Safety & Status"
                        desc="Know when your team arrives safely on site without needing to micromanage with calls or texts."
                    />
                </div>
            </div>
        </main>
    );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 text-blue-400">
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{desc}</p>
        </div>
    )
}
