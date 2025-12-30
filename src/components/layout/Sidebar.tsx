"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MapPin, Users, History, LogOut, Clock, UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const adminItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Job Sites", href: "/admin/sites", icon: MapPin },
    { name: "Employees", href: "/admin/employees", icon: Users },
    { name: "Time Logs", href: "/admin/logs", icon: History },
];

const employeeItems = [
    { name: "Time Clock", href: "/employee", icon: Clock },
    { name: "My History", href: "/employee/history", icon: History },
    { name: "Profile", href: "/employee/profile", icon: UserCircle },
];

interface SidebarProps {
    mobileOpen?: boolean;
    setMobileOpen?: (open: boolean) => void;
}

export default function Sidebar({ mobileOpen = false, setMobileOpen }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    // Simple check based on URL structure since we have distinct paths
    const isAdmin = pathname.startsWith("/admin");
    const navItems = isAdmin ? adminItems : employeeItems;
    const sectionTitle = isAdmin ? "Management" : "Employee Portal";

    const handleSignOut = async () => {
        // Clear our mock cookies as well
        document.cookie = "onsiteverified-role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 sm:hidden backdrop-blur-sm"
                    onClick={() => setMobileOpen?.(false)}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-30 w-64 flex flex-col bg-card border-r border-gray-800 transition-transform duration-300 ease-in-out
                ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                sm:translate-x-0
            `}>
                <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-800">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center mr-3">
                            <span className="font-bold text-white">P</span>
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white">OnSiteVerified</span>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setMobileOpen?.(false)}
                        className="sm:hidden text-gray-400 hover:text-white"
                    >
                        <LogOut className="h-5 w-5 rotate-180" />
                    </button>
                </div>

                <div className="flex flex-col flex-1 gap-y-1 px-3 py-4 overflow-y-auto">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                        {sectionTitle}
                    </div>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setMobileOpen?.(false)} // Close sidebar on nav click
                                className={`flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                    }`}
                            >
                                <item.icon className="h-5 w-5 shrink-0" />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-gray-400 hover:bg-red-900/10 hover:text-red-400 transition-colors"
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}
