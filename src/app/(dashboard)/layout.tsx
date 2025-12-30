"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Menu } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />
            <div className="sm:pl-64 flex flex-col min-h-screen">
                <header className="sticky top-0 z-10 flex h-16 items-center gap-x-4 border-b border-gray-800 bg-background/80 px-6 backdrop-blur-sm sm:px-8 lg:px-10">
                    <button
                        type="button"
                        className="text-gray-400 hover:text-white sm:hidden -ml-2 p-2"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Open sidebar</span>
                    </button>
                    <h1 className="text-xl font-semibold text-white">Dashboard</h1>
                    {/* Add user profile / breadcrumbs here logic later */}
                </header>
                <main className="flex-1 py-8 px-6 sm:px-8 lg:px-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
