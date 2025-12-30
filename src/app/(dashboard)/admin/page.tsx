
import { Users, MapPin, Clock } from "lucide-react";

export default function AdminDashboard() {
    const stats = [
        { name: 'Active Employees', value: '12', icon: Users, change: '+2 this week', active: true },
        { name: 'Active Sites', value: '3', icon: MapPin, change: '1 new added', active: false },
        { name: 'On Site Now', value: '8', icon: Clock, change: '66% of workforce', active: false },
    ];

    return (
        <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="rounded-xl border border-gray-800 bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-x-4">
                            <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                                <div className="flex items-baseline gap-x-2">
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded-xl border border-gray-800 bg-card p-6">
                <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
                <div className="text-gray-400 text-sm">
                    <p>No recent activity logs found.</p>
                </div>
            </div>
        </>
    );
}
