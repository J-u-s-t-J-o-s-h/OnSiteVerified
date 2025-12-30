"use client";

import { useState } from "react";
import { Calendar, Filter, Download, ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface TimeLog {
    id: string;
    userName: string;
    userId: string;
    siteName: string;
    clockIn: string;
    clockOut: string | null;
    duration: string | null;
    status: 'On Site' | 'Completed';
    locationStatus: 'Verified' | 'Unverified';
}

const MOCK_LOGS: TimeLog[] = [
    {
        id: '1', userName: 'John Doe', userId: '1', siteName: 'Downtown Project',
        clockIn: '08:00 AM', clockOut: null, duration: '2h 15m',
        status: 'On Site', locationStatus: 'Verified'
    },
    {
        id: '2', userName: 'Jane Smith', userId: '2', siteName: 'HQ Maintenance',
        clockIn: '07:30 AM', clockOut: '04:30 PM', duration: '9h 00m',
        status: 'Completed', locationStatus: 'Verified'
    },
    {
        id: '3', userName: 'Mike Johnson', userId: '3', siteName: 'Uptown Reno',
        clockIn: '08:15 AM', clockOut: null, duration: '2h 00m',
        status: 'On Site', locationStatus: 'Unverified'
    },
];

export default function TimeLogsPage() {
    const [logs] = useState(MOCK_LOGS);

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
                                <th className="px-6 py-3">Job Site</th>
                                <th className="px-6 py-3">Clock In</th>
                                <th className="px-6 py-3">Clock Out</th>
                                <th className="px-6 py-3">Duration</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Location</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">
                                        {log.userName}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">
                                        {log.siteName}
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">
                                        <div className="flex items-center gap-1.5">
                                            <ArrowUpRight className="h-3 w-3 text-green-500" />
                                            {log.clockIn}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">
                                        {log.clockOut ? (
                                            <div className="flex items-center gap-1.5">
                                                <ArrowDownLeft className="h-3 w-3 text-red-500" />
                                                {log.clockOut}
                                            </div>
                                        ) : (
                                            <span className="text-gray-600 italic">--</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-gray-400">
                                        {log.duration || <span className="animate-pulse">Active</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${log.status === 'On Site'
                                                ? 'bg-blue-500/10 text-blue-400'
                                                : 'bg-green-500/10 text-green-400'
                                            }`}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${log.locationStatus === 'Verified'
                                                ? 'bg-green-500/10 text-green-500'
                                                : 'bg-yellow-500/10 text-yellow-500'
                                            }`}>
                                            {log.locationStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
