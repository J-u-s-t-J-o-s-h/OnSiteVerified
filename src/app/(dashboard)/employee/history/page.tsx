"use client";

import { useState, useEffect } from "react";
import { History, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Timesheet } from "@/types/database";

export default function EmployeeHistoryPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <History className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-white">My Attendance History</h2>
            </div>

            <div className="bg-card border border-gray-800 rounded-xl overflow-hidden min-h-[300px]">
                <HistoryList />
            </div>
        </div>
    );
}

function HistoryList() {
    const [history, setHistory] = useState<Timesheet[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchHistory = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('timesheets')
                .select('*, job_sites(*)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setHistory(data);
            setLoading(false);
        };

        fetchHistory();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-2" />
                <p className="text-gray-500">Loading history...</p>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-500">
                    <History className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No History Yet</h3>
                <p className="text-gray-400 max-w-sm">
                    Your clock-in and clock-out records will appear here once you start using the system.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-900/50 text-gray-400 font-medium border-b border-gray-800">
                    <tr>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">In / Out Time</th>
                        <th className="px-6 py-4">Location</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {history.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'clocked_in'
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    }`}>
                                    {item.status === 'clocked_in' ? "On Site" : "Completed"}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-white font-mono">
                                <div className="flex flex-col">
                                    <span className="text-green-400">IN: {new Date(item.clock_in_time).toLocaleString()}</span>
                                    {item.clock_out_time && (
                                        <span className="text-blue-400">OUT: {new Date(item.clock_out_time).toLocaleString()}</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-400">
                                {item.job_sites?.name || "Unknown Site"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
