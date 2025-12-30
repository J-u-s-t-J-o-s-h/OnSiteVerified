"use client";

import { useState, useEffect, useRef } from "react";
import MapWrapper from "@/components/map/MapWrapper";
import { Plus, MapPin, Save, Trash2, Loader2, Search, Crosshair, Navigation, Edit2, AlertTriangle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { JobSite } from "@/types/database";

export default function SitesPage() {
    const [sites, setSites] = useState<JobSite[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // New site form state
    const [newSite, setNewSite] = useState<{ name: string; lat: number; lng: number; radius: number }>({
        name: "",
        lat: 51.505,
        lng: -0.09,
        radius: 100,
    });

    // Search & Location State
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const [locating, setLocating] = useState(false);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    const supabase = createClient();

    const fetchSites = async () => {
        const { data, error } = await supabase
            .from('job_sites')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setSites(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchSites();
    }, []);

    const handleLocationSelect = (lat: number, lng: number) => {
        setNewSite(prev => ({ ...prev, lat, lng }));
    };

    // Address Search Logic
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        setSearching(true);
        searchTimeout.current = setTimeout(async () => {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setSuggestions(data);
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setSearching(false);
            }
        }, 500); // Debounce 500ms
    };

    const selectSuggestion = (s: any) => {
        const lat = parseFloat(s.lat);
        const lon = parseFloat(s.lon);
        setNewSite(prev => ({ ...prev, lat, lng: lon }));
        setSearchQuery(s.display_name);
        setSuggestions([]);
    };

    // Find My Location
    const handleFindLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setNewSite(prev => ({ ...prev, lat: latitude, lng: longitude }));
                setLocating(false);
            },
            () => {
                alert("Unable to retrieve your location");
                setLocating(false);
            }
        );
    };

    const handleEdit = (site: JobSite) => {
        setNewSite({
            name: site.name,
            lat: site.latitude,
            lng: site.longitude,
            radius: site.radius_meters
        });
        setEditingId(site.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setNewSite({ name: "", lat: 51.505, lng: -0.09, radius: 100 });
    };

    const handleSave = async () => {
        if (!newSite.name) return;
        setSaving(true);

        let error;

        if (editingId) {
            // Update
            const res = await supabase.from('job_sites').update({
                name: newSite.name,
                latitude: newSite.lat,
                longitude: newSite.lng,
                radius_meters: newSite.radius
            }).eq('id', editingId);
            error = res.error;
        } else {
            // Insert
            const res = await supabase.from('job_sites').insert({
                name: newSite.name,
                latitude: newSite.lat,
                longitude: newSite.lng,
                radius_meters: newSite.radius
            });
            error = res.error;
        }

        if (!error) {
            await fetchSites();
            handleCancel();
        } else {
            alert("Error saving site: " + error.message);
        }
        setSaving(false);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        setIsDeleting(true);

        const { error } = await supabase.from('job_sites').delete().eq('id', deletingId);

        if (!error) {
            setSites(sites.filter(s => s.id !== deletingId));
            setDeletingId(null);
        } else {
            alert("Error deleting site: " + error.message);
        }
        setIsDeleting(false);
    }

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Job Sites</h2>
                <button
                    onClick={() => {
                        if (showForm) handleCancel();
                        else setShowForm(true);
                    }}
                    className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                    {showForm ? "Cancel" : <><Plus className="h-4 w-4" /> Add Site</>}
                </button>
            </div>

            {showForm && (
                <div className="bg-card border border-gray-800 rounded-xl p-6 shadow-xl animate-in fade-in slide-in-from-top-4">
                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white mb-4">
                                {editingId ? "Edit Site Details" : "New Site Details"}
                            </h3>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Site Name</label>
                                <input
                                    type="text"
                                    value={newSite.name}
                                    onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="e.g. Downtown Project"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Latitude</label>
                                    <input
                                        type="number"
                                        value={newSite.lat}
                                        readOnly
                                        className="w-full bg-gray-900/30 border border-gray-800 rounded-md py-2 px-3 text-gray-400 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Longitude</label>
                                    <input
                                        type="number"
                                        value={newSite.lng}
                                        readOnly
                                        className="w-full bg-gray-900/30 border border-gray-800 rounded-md py-2 px-3 text-gray-400 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Geofence Radius (meters)</label>
                                <input
                                    type="range"
                                    min="50"
                                    max="1000"
                                    step="50"
                                    value={newSite.radius}
                                    onChange={(e) => setNewSite({ ...newSite, radius: parseInt(e.target.value) })}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>50m</span>
                                    <span className="text-primary font-bold">{newSite.radius}m</span>
                                    <span>1000m</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {editingId ? "Update Site" : "Save Site"}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-medium text-gray-400 block">
                                Location Tools
                            </label>

                            {/* Address Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search for an address..."
                                    className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 pl-9 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                {searching && (
                                    <div className="absolute right-3 top-2.5">
                                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                                    </div>
                                )}
                                {suggestions.length > 0 && (
                                    <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {suggestions.map((s, i) => (
                                            <button
                                                key={i}
                                                onClick={() => selectSuggestion(s)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors border-b border-gray-800 last:border-0"
                                            >
                                                {s.display_name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Find Me Button */}
                            <button
                                onClick={handleFindLocation}
                                disabled={locating}
                                className="w-full bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 border border-blue-900/50 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-all"
                            >
                                {locating ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Navigation className="h-4 w-4" />
                                )}
                                Find My Current Location
                            </button>

                            <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-700 relative">
                                <MapWrapper
                                    center={[newSite.lat, newSite.lng]}
                                    initialMarker={[newSite.lat, newSite.lng]}
                                    onLocationSelect={handleLocationSelect}
                                />
                                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-xs text-white px-2 py-1 rounded pointer-events-none z-[400]">
                                    Click map to drag pin
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12 text-gray-500">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading sites...
                </div>
            ) : sites.length === 0 ? (
                <div className="text-center py-12 text-gray-500 border border-gray-800 rounded-lg border-dashed">
                    No job sites found. Add one to get started.
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sites.map((site) => (
                        <div key={site.id} className="bg-card border border-gray-800 p-4 rounded-lg flex flex-col justify-between hover:border-gray-700 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2 text-white font-medium">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    {site.name}
                                </div>
                                <button
                                    onClick={() => setDeletingId(site.id)}
                                    className="text-gray-500 hover:text-red-400"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="text-xs text-gray-500 space-y-1 mb-4">
                                <p>Lat: {site.latitude.toFixed(6)}</p>
                                <p>Lng: {site.longitude.toFixed(6)}</p>
                                <p>Radius: {site.radius_meters}m</p>
                            </div>
                            <button
                                onClick={() => handleEdit(site)}
                                className="w-full text-sm bg-gray-800 hover:bg-gray-700 text-white py-1.5 rounded transition-colors flex items-center justify-center gap-2"
                            >
                                <Edit2 className="h-4 w-4" /> Edit Site
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-card border border-gray-800 w-full max-w-sm rounded-xl shadow-2xl p-6 space-y-4">
                        <div className="flex items-center gap-3 text-red-400">
                            <div className="p-2 bg-red-400/10 rounded-full">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Delete Job Site?</h3>
                        </div>

                        <p className="text-gray-400 text-sm">
                            Are you sure you want to delete this job site? This action cannot be undone.
                            Past time logs will be preserved but unlinked.
                        </p>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setDeletingId(null)}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
