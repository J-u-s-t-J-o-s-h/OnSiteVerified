"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Phone, Briefcase, Save, Loader2 } from "lucide-react";

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        full_name: "",
        phone_number: "",
        job_title: "",
        email: "" // Read only
    });

    const supabase = createClient();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setFormData({
                        full_name: profile.full_name || "",
                        phone_number: profile.phone_number || "",
                        job_title: profile.job_title || "",
                        email: profile.email || ""
                    });
                }
            }
            setLoading(false);
        };

        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    phone_number: formData.phone_number,
                    job_title: formData.job_title
                })
                .eq('id', user.id);

            if (error) throw error;
            alert("Profile updated successfully!");
        } catch (error: any) {
            alert("Error updating profile: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
                <p className="text-gray-400">Manage your personal information and contact details.</p>
            </header>

            <div className="bg-card border border-gray-800 rounded-xl p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">

                    {/* Email (Read Only) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Email Address</label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500">Email cannot be changed. Contact admin for assistance.</p>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                placeholder="Your full name"
                            />
                        </div>
                    </div>

                    {/* Job Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Job Title / Role</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                            <input
                                type="text"
                                value={formData.job_title}
                                onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                placeholder="e.g. Site Foreman"
                            />
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                            <input
                                type="tel"
                                value={formData.phone_number}
                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                placeholder="(555) 123-4567"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-primary hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
