"use client";

import { UserCircle, Mail, Phone, BadgeCheck } from "lucide-react";

export default function EmployeeProfilePage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <UserCircle className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-white">My Profile</h2>
            </div>

            <div className="bg-card border border-gray-800 rounded-xl overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-900"></div>
                <div className="px-8 pb-8">
                    <div className="relative -mt-12 mb-6">
                        <div className="w-24 h-24 bg-gray-900 rounded-full border-4 border-gray-900 flex items-center justify-center">
                            <UserCircle className="w-16 h-16 text-gray-400" />
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-1">John Doe</h3>
                    <p className="text-blue-400 flex items-center gap-1.5 text-sm font-medium mb-6">
                        <BadgeCheck className="h-4 w-4" /> Verified Employee
                    </p>

                    <div className="grid gap-4">
                        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800 flex items-center gap-4">
                            <div className="p-2 bg-gray-800 rounded text-gray-400">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Email Address</p>
                                <p className="text-white">employee@onsiteverified.com</p>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800 flex items-center gap-4">
                            <div className="p-2 bg-gray-800 rounded text-gray-400">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Phone Number</p>
                                <p className="text-white">--</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
