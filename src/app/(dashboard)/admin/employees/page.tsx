"use client";

import { useState, useEffect } from "react";
import { Plus, Search, MoreVertical, Mail, Phone, Shield, Loader2, Edit2, Save, X, Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/database";

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Edit Modal State
    const [editingEmp, setEditingEmp] = useState<Profile | null>(null);
    const [saving, setSaving] = useState(false);

    // Form State (derived from editingEmp)
    const [formData, setFormData] = useState({
        full_name: "",
        phone_number: "",
        job_title: "",
        role: "employee" as "admin" | "employee"
    });

    const supabase = createClient();

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('full_name', { ascending: true });

        if (data) setEmployees(data);
        setLoading(false);
    };

    const handleEditClick = (emp: Profile) => {
        setEditingEmp(emp);
        setFormData({
            full_name: emp.full_name || "",
            phone_number: emp.phone_number || "",
            job_title: emp.job_title || "",
            role: emp.role
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEmp) return;
        setSaving(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    phone_number: formData.phone_number,
                    job_title: formData.job_title,
                    role: formData.role
                })
                .eq('id', editingEmp.id);

            if (error) throw error;

            // Refresh list
            await fetchEmployees();
            setEditingEmp(null); // Close modal
        } catch (error: any) {
            alert("Error updating profile: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        (emp.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (emp.email || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Employees</h2>
                    <p className="text-gray-400 text-sm">Manage your team members and permissions</p>
                </div>
                {/* Note: 'Add Employee' functionality requires Supabase Auth Admin API or Invitation flow, which is complex on client-side. hiding for now to focus on Edit. */}
                {/* <button className="..." ...><Plus ... /> Add Employee</button> */}
            </div>

            <div className="bg-card border border-gray-800 rounded-xl overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-800 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-md py-2 pl-9 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-900/50 text-gray-400 font-medium">
                            <tr>
                                <th className="px-6 py-3">Name & Role</th>
                                <th className="px-6 py-3">Job Title</th>
                                <th className="px-6 py-3">Contact</th>
                                <th className="px-6 py-3">Joined</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Loading employees...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No employees found.
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-white shrink-0">
                                                    {(emp.full_name || emp.email || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{emp.full_name || 'No Name'}</div>
                                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border mt-1 ${emp.role === 'admin'
                                                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                        }`}>
                                                        {emp.role}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            {emp.job_title ? (
                                                <div className="flex items-center gap-2">
                                                    <Briefcase className="h-3 w-3 text-gray-500" />
                                                    {emp.job_title}
                                                </div>
                                            ) : <span className="text-gray-600 italic">--</span>}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3 w-3" /> {emp.email}
                                            </div>
                                            {emp.phone_number && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-3 w-3" /> {emp.phone_number}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs text-nowrap">
                                            {new Date(emp.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleEditClick(emp)}
                                                className="text-gray-500 hover:text-white transition-colors p-2 rounded-md hover:bg-gray-800 grid place-items-center ml-auto"
                                                title="Edit Employee"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Slide-over / Modal */}
            {editingEmp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-card border border-gray-800 w-full max-w-md rounded-xl shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between p-4 border-b border-gray-800">
                            <h3 className="font-semibold text-white">Edit Employee</h3>
                            <button
                                onClick={() => setEditingEmp(null)}
                                className="text-gray-500 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400 uppercase">Full Name</label>
                                <input
                                    className="w-full bg-gray-900 border border-gray-700 rounded-md p-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400 uppercase">Job Title</label>
                                <input
                                    className="w-full bg-gray-900 border border-gray-700 rounded-md p-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    value={formData.job_title}
                                    onChange={e => setFormData({ ...formData, job_title: e.target.value })}
                                    placeholder="e.g. Foreman"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400 uppercase">Phone Number</label>
                                <input
                                    className="w-full bg-gray-900 border border-gray-700 rounded-md p-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    value={formData.phone_number}
                                    onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-400 uppercase">System Role</label>
                                <select
                                    className="w-full bg-gray-900 border border-gray-700 rounded-md p-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                                >
                                    <option value="employee">Employee</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingEmp(null)}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-primary hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
