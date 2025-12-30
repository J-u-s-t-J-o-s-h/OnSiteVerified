"use client";

import { useEffect, useState } from "react";
import { Users, MapPin, Clock, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface DashboardStats {
    totalEmployees: number;
    activeSites: number;
    onSiteNow: number;
}

interface RecentActivity {
    id: string;
    profile_name: string;
    site_name: string;
    action: 'clock_in' | 'clock_out';
    timestamp: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalEmployees: 0,
        activeSites: 0,
        onSiteNow: 0
    });
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch Total Employees
                const { count: empCount } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true });

                // 2. Fetch Active Job Sites
                const { count: siteCount } = await supabase
                    .from('job_sites')
                    .select('*', { count: 'exact', head: true });

                // 3. Fetch "On Site Now" (active timesheets)
                const { count: clockInCount } = await supabase
                    .from('timesheets')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'clocked_in');

                setStats({
                    totalEmployees: empCount || 0,
                    activeSites: siteCount || 0,
                    onSiteNow: clockInCount || 0
                });

                // 4. Fetch Recent Activity (Simulated by latest timesheet entries)
                const { data: logs } = await supabase
                    .from('timesheets')
                    .select(`
                        id,
                        clock_in_time,
                        clock_out_time,
                        profiles (full_name),
                        job_sites (name)
                    `)
                    .order('clock_in_time', { ascending: false })
                    .limit(5);

                if (logs) {
                    const activity: RecentActivity[] = logs.map((log: any) => ({
                        id: log.id,
                        profile_name: log.profiles?.full_name || 'Unknown',
                        site_name: log.job_sites?.name || 'Unknown Site',
                        action: log.status === 'clocked_in' ? 'clock_in' : 'clock_out', // Simplified deduction
                        timestamp: log.clock_in_time, // Showing clock in time for simplicity of "recent action"
                    }));
                    setRecentActivity(activity);
                }

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statCards = [
        {
            name: 'Total Employees',
            value: loading ? '...' : stats.totalEmployees.toString(),
            icon: Users,
            change: 'Manage Team',
            link: '/admin/employees',
            active: true
        },
        {
            name: 'Active Sites',
            value: loading ? '...' : stats.activeSites.toString(),
            icon: MapPin,
            change: 'Manage Sites',
            link: '/admin/sites',
            active: false
        },
        {
            name: 'On Site Now',
            value: loading ? '...' : stats.onSiteNow.toString(),
            icon: Clock,
            change: 'View Logs',
            link: '/admin/logs',
            active: false
        },
    ];

    return (
        <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {statCards.map((stat) => (
                    <Link
                        key={stat.name}
                        href={stat.link}
                        className="rounded-xl border border-gray-800 bg-card p-6 shadow-sm hover:shadow-md transition-all hover:border-gray-700 group cursor-pointer"
                    >
                        <div className="flex items-center gap-x-4">
                            <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                                <div className="flex items-baseline gap-x-2">
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                </div>
                                <div className="flex items-center text-xs text-primary mt-1 gap-1">
                                    {stat.change} <ArrowRight className="h-3 w-3" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="rounded-xl border border-gray-800 bg-card p-6">
                <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
                <div className="text-gray-400 text-sm">
                    {loading ? (
                        <p>Loading activity...</p>
                    ) : recentActivity.length === 0 ? (
                        <p>No recent activity logs found.</p>
                    ) : (
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center justify-between border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
                                            {activity.profile_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{activity.profile_name}</p>
                                            <p className="text-xs text-gray-500">Clocked In at <span className="text-gray-400">{activity.site_name}</span></p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
