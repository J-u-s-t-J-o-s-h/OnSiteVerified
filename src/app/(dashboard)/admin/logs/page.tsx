"use client";

import { useEffect, useState } from "react";
import { Calendar, Filter, Download, ArrowUpRight, ArrowDownLeft, Loader2, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Extended interface for the joined query
interface TimeLog {
    id: string;
    clock_in_time: string;
    clock_out_time: string | null;
    status: string;
    clock_in_lat: number;
    clock_in_lon: number;
    profiles: {
        full_name: string;
        email: string;
    };
    job_sites: {
        name: string;
    } | null;
}

export default function TimeLogsPage() {
    const [logs, setLogs] = useState<TimeLog[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchLogs = async () => {
            const { data, error } = await supabase
                .from('timesheets')
                .select(`
                    id,
                    clock_in_time,
                    clock_out_time,
                    status,
                    clock_in_lat,
                    clock_in_lon,
                    profiles (full_name, email),
                    job_sites (name)
                `)
                .order('clock_in_time', { ascending: false });

            if (error) {
                console.error("Error fetching logs:", error);
            } else if (data) {
                // @ts-ignore - Supabase types join inference can be tricky, casting for now
                setLogs(data as any);
            }
            setLoading(false);
        };

        fetchLogs();
    }, []);

    const formatTime = (isoString: string) => {
        if (!isoString) return '--';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (isoString: string) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const calculateDuration = (start: string, end: string | null) => {
        if (!end) return null;
        const diff = new Date(end).getTime() - new Date(start).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Time Logs</h2>
                    <p className="text-gray-400 text-sm">View attendance history and verification status</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-md transition-colors text-sm">
                        <Calendar className="h-4 w-4" /> Date Range
                    </button>
                    <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-md transition-colors text-sm">
                        <Filter className="h-4 w-4" /> Filter
                    </button>
                    <button className="flex items-center gap-2 bg-card border border-gray-700 hover:bg-gray-800 text-white px-3 py-2 rounded-md transition-colors text-sm ml-2">
                        <Download className="h-4 w-4" /> Export
                    </button>
                </div>
            </div>

            <div className="bg-card border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-900/50 text-gray-400 font-medium">
                            <tr>
                                <th className="px-6 py-3">Employee</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Job Site</th>
                                <th className="px-6 py-3">Clock In</th>
                                <th className="px-6 py-3">Clock Out</th>
                                <th className="px-6 py-3">Duration</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Loading logs...
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No time logs found.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">
                                            <div className="flex flex-col">
                                                <span>{log.profiles?.full_name || 'Unknown'}</span>
                                                <span className="text-xs text-gray-500 font-normal">{log.profiles?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {formatDate(log.clock_in_time)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-3 w-3 text-gray-500" />
                                                {log.job_sites?.name || 'Unassigned'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            <div className="flex items-center gap-1.5">
                                                <ArrowUpRight className="h-3 w-3 text-green-500" />
                                                {formatTime(log.clock_in_time)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            {log.clock_out_time ? (
                                                <div className="flex items-center gap-1.5">
                                                    <ArrowDownLeft className="h-3 w-3 text-red-500" />
                                                    {formatTime(log.clock_out_time)}
                                                </div>
                                            ) : (
                                                <span className="text-gray-600 italic">--</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-400">
                                            {calculateDuration(log.clock_in_time, log.clock_out_time) || <span className="text-green-500 animate-pulse text-xs uppercase font-bold tracking-wider">Active</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${log.status === 'clocked_in'
                                                ? 'bg-blue-500/10 text-blue-400'
                                                : 'bg-green-500/10 text-green-400'
                                                }`}>
                                                {log.status === 'clocked_in' ? 'On Site' : 'Completed'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
