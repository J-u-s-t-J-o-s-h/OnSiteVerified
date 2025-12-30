"use client";

import { useEffect, useState } from "react";
import { MapPin, Clock, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { JobSite, Timesheet } from "@/types/database";
import { calculateDistance } from "@/lib/geo";

export default function EmployeeDashboard() {
    const [status, setStatus] = useState<'clocked-in' | 'clocked-out'>('clocked-out');
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState<GeolocationPosition | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    const [nearestSite, setNearestSite] = useState<{ site: JobSite, distance: number } | null>(null);
    const [activeTimesheet, setActiveTimesheet] = useState<Timesheet | null>(null);
    const [sites, setSites] = useState<JobSite[]>([]);

    // Auth User ID
    const [userId, setUserId] = useState<string | null>(null);

    const supabase = createClient();

    // 1. Initial Data Load
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        const loadInitialData = async () => {
            // Get Current User
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);

            // Fetch Job Sites
            const { data: sitesData } = await supabase.from('job_sites').select('*');
            if (sitesData) setSites(sitesData);

            // Fetch Active Timesheet (if any)
            const { data: timesheetData } = await supabase
                .from('timesheets')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'clocked_in')
                .single(); // Should only be one active at a time

            if (timesheetData) {
                setStatus('clocked-in');
                setActiveTimesheet(timesheetData);
            } else {
                setStatus('clocked-out');
            }
            setLoading(false);
        };

        loadInitialData();
        refreshLocation();

        return () => clearInterval(timer);
    }, []);

    // 2. Geolocation Logic
    const refreshLocation = () => {
        setLocationError(null);
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation(position);
                findNearestSite(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
                    setLocationError("GPS requires HTTPS. Use 'Mock Location' to test.");
                } else {
                    setLocationError(error.message);
                }
                setNearestSite(null);
            }
        );
    };

    const handleMockLocation = () => {
        // Mock to London center if no sites, or first site if exists
        const lat = sites.length > 0 ? sites[0].latitude : 51.505;
        const lng = sites.length > 0 ? sites[0].longitude : -0.09;

        const mockPosition = {
            coords: {
                latitude: lat,
                longitude: lng,
                accuracy: 10,
                altitude: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null,
            },
            timestamp: Date.now()
        } as GeolocationPosition;

        setLocation(mockPosition);
        setLocationError(null);
        findNearestSite(lat, lng);
    };

    const findNearestSite = (lat: number, lng: number) => {
        if (sites.length === 0) return;

        let closest: { site: JobSite, distance: number } | null = null;
        let minDist = Infinity;

        sites.forEach(site => {
            const dist = calculateDistance(lat, lng, site.latitude, site.longitude);
            if (dist < minDist) {
                minDist = dist;
                closest = { site, distance: dist };
            }
        });

        // Only set if within reasonable range (e.g. 50km) just to show something relevant
        // The verification logic happens on Clock In
        if (closest) {
            setNearestSite(closest);
        }
    };

    const handleClockAction = async () => {
        if (!userId) return;
        if (!location) {
            alert("We need your location to proceed!");
            return;
        }

        setLoading(true);

        if (status === 'clocked-out') {
            // CLOCK IN LOGIC
            // 1. Check if near a site
            if (!nearestSite || nearestSite.distance > nearestSite.site.radius_meters) {
                alert("You are too far from any job site to clock in.");
                setLoading(false);
                return;
            }

            const { data, error } = await supabase.from('timesheets').insert({
                user_id: userId,
                site_id: nearestSite.site.id,
                clock_in_lat: location.coords.latitude,
                clock_in_lon: location.coords.longitude,
                status: 'clocked_in'
            }).select().single();

            if (error) {
                alert("Error clocking in: " + error.message);
            } else {
                setStatus('clocked-in');
                setActiveTimesheet(data);
            }

        } else {
            // CLOCK OUT LOGIC
            if (!activeTimesheet) {
                // Should not happen if state is correct
                setStatus('clocked-out');
                setLoading(false);
                return;
            }

            const { error } = await supabase.from('timesheets').update({
                clock_out_time: new Date().toISOString(),
                status: 'completed'
            }).eq('id', activeTimesheet.id);

            if (error) {
                alert("Error clocking out: " + error.message);
            } else {
                setStatus('clocked-out');
                setActiveTimesheet(null);
            }
        }
        setLoading(false);
    };

    const isSiteInRange = nearestSite && nearestSite.distance <= nearestSite.site.radius_meters;

    if (loading && !userId) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-white">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Time Display */}
            <div className="text-center space-y-2">
                <h2 className="text-gray-400 font-medium uppercase tracking-widest text-sm">Current Time</h2>
                <div className="text-5xl sm:text-6xl font-bold text-white tabular-nums tracking-tight">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className="text-gray-500 font-medium">
                    {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Clock In/Out Card */}
            <div className="bg-card border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                {/* Background Gradient */}
                <div className={`absolute inset-0 opacity-10 blur-3xl ${status === 'clocked-in' ? 'bg-green-500' : 'bg-blue-500'}`} />

                <div className="relative z-10 flex flex-col items-center gap-6">
                    <button
                        className={`
                            w-48 h-48 rounded-full flex items-center justify-center border-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed
                            ${status === 'clocked-in'
                                ? 'bg-red-500/10 border-red-500/50 hover:bg-red-500/20'
                                : 'bg-green-500/10 border-green-500/50 hover:bg-green-500/20'}
                        `}
                        onClick={handleClockAction}
                        disabled={loading || (status === 'clocked-out' && !isSiteInRange)}
                    >
                        {loading ? (
                            <Loader2 className="h-12 w-12 text-white animate-spin" />
                        ) : (
                            <div className="text-center">
                                <Clock className={`w-12 h-12 mx-auto mb-2 ${status === 'clocked-in' ? 'text-red-500' : 'text-green-500'}`} />
                                <span className={`text-xl font-bold uppercase tracking-wider ${status === 'clocked-in' ? 'text-red-400' : 'text-green-400'}`}>
                                    {status === 'clocked-in' ? 'Clock Out' : 'Clock In'}
                                </span>
                            </div>
                        )}
                    </button>

                    <div className="w-full bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Location Status</span>
                            <button onClick={refreshLocation} className="text-xs text-primary hover:underline">Refresh</button>
                        </div>

                        {locationError ? (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-start gap-2 text-red-400 text-xs bg-red-900/10 p-2 rounded">
                                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                                    <span>{locationError}</span>
                                </div>
                                <button
                                    onClick={handleMockLocation}
                                    className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded-lg border border-gray-700 font-medium transition-colors"
                                >
                                    Use Mock Location (For Testing)
                                </button>
                            </div>
                        ) : location ? (
                            <div className="space-y-1">
                                {nearestSite ? (
                                    <>
                                        <div className={`flex items-center gap-2 text-sm font-medium ${isSiteInRange ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {isSiteInRange ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                                            {isSiteInRange ? "Verified: On Site" : `Too Far (${Math.round(nearestSite.distance)}m away)`}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400 text-xs">
                                            <MapPin className="h-3 w-3" />
                                            {nearestSite.site.name} (Radius: {nearestSite.site.radius_meters}m)
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-yellow-400 text-sm">No job sites found nearby.</div>
                                )}
                                <div className="text-[10px] text-gray-600 font-mono pt-1">
                                    {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
                                    (±{Math.round(location.coords.accuracy)}m)
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-500 text-sm animate-pulse">
                                Triangulating position...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Activity (Active Session) */}
            {status === 'clocked-in' && activeTimesheet && (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white px-2">Current Session</h3>
                    <div className="bg-card border border-gray-800 rounded-xl p-4 flex justify-between items-center animate-pulse">
                        <div>
                            <p className="text-white font-medium">Clocked In</p>
                            <p className="text-xs text-gray-500">
                                {sites.find(s => s.id === activeTimesheet.site_id)?.name || 'Unknown Site'}
                            </p>
                        </div>
                        <span className="text-primary font-mono text-sm">
                            {new Date(activeTimesheet.clock_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
