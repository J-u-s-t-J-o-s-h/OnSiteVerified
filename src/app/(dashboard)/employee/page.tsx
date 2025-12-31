"use client";

import { useEffect, useState, useRef } from "react";
import { MapPin, Clock, AlertTriangle, CheckCircle, Loader2, Navigation } from "lucide-react";
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

    // Watch ID for geolocation
    const watchIdRef = useRef<number | null>(null);

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

            // Fetch Job Sites and filter client-side to ensure consistency
            const { data: sitesData, error } = await supabase.from('job_sites').select('*');

            if (error) {
                console.error("Supabase Error:", error);
            }

            if (sitesData) {
                console.log("Raw Sites Data:", sitesData);
                // Filter for active sites only - Relaxed check for 'true' to catch truthy values
                const active = sitesData.filter(s => s.is_active);
                console.log("Filtered Active Sites:", active);
                setSites(active);
            }

            // Fetch Active Timesheet (if any)
            const { data: timesheetData } = await supabase
                .from('timesheets')
                .select('*')
                .eq('user_id', user.id)
                .eq('status', 'clocked_in')
                .single();

            if (timesheetData) {
                setStatus('clocked-in');
                setActiveTimesheet(timesheetData);
            } else {
                setStatus('clocked-out');
            }
            setLoading(false);
        };

        loadInitialData();
        startLocationWatch();

        return () => {
            clearInterval(timer);
            if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, []);

    // 2. Geolocation Logic (Auto-Watch)
    const startLocationWatch = () => {
        setLocationError(null);
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser");
            return;
        }

        // Clear existing watch if any
        if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);

        watchIdRef.current = navigator.geolocation.watchPosition(
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
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000
            }
        );
    };

    const handleMockLocation = () => {
        // Mock to first active site if exists, else London
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
        // sites is already filtered to only Active sites
        if (sites.length === 0) {
            setNearestSite(null);
            return;
        }

        let closest: { site: JobSite, distance: number } | null = null;
        let minDist = Infinity;

        sites.forEach(site => {
            const dist = calculateDistance(lat, lng, site.latitude, site.longitude);
            if (dist < minDist) {
                minDist = dist;
                closest = { site, distance: dist };
            }
        });

        if (closest) {
            setNearestSite(closest);
        }
    };

    const handleClockAction = async () => {
        if (!userId) return;
        if (!location) {
            alert("Waiting for location signal...");
            return;
        }

        setLoading(true);

        if (status === 'clocked-out') {
            // CLOCK IN LOGIC
            if (!nearestSite || nearestSite.distance > nearestSite.site.radius_meters) {
                alert("You are too far from the active job site to clock in.\nPlease move closer to the site.");
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

    const getDirectionsUrl = () => {
        if (!nearestSite) return '#';
        if (navigator.platform.indexOf("iPhone") !== -1 || navigator.platform.indexOf("iPad") !== -1 || navigator.platform.indexOf("iPod") !== -1) {
            // Apple Maps
            return `maps://maps.google.com/maps?daddr=${nearestSite.site.latitude},${nearestSite.site.longitude}&ll=`;
        }
        // Google Maps (Universal)
        return `https://www.google.com/maps/dir/?api=1&destination=${nearestSite.site.latitude},${nearestSite.site.longitude}`;
    };

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
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">Location Status</span>
                                {!locationError && (
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                )}
                            </div>
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
                            <div className="space-y-3">
                                {nearestSite ? (
                                    <>
                                        <div className={`flex items-center gap-2 text-sm font-medium ${isSiteInRange ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {isSiteInRange ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                                            {isSiteInRange ? "Verified: On Site" : `Too Far (${Math.round(nearestSite.distance)}m away)`}
                                        </div>

                                        <div className="flex items-center justify-between bg-black/20 p-2 rounded">
                                            <div className="flex items-center gap-2 text-gray-300 text-xs">
                                                <MapPin className="h-4 w-4 text-primary" />
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-white">{nearestSite.site.name}</span>
                                                    <span>Range: {nearestSite.site.radius_meters}m</span>
                                                </div>
                                            </div>

                                            <a
                                                href={getDirectionsUrl()}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-2 py-1.5 rounded transition-colors"
                                            >
                                                <Navigation className="h-3 w-3" /> Directions
                                            </a>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-md">
                                        <div className="text-yellow-400 text-sm font-medium mb-1">No Active Job Sites</div>
                                        <p className="text-gray-400 text-xs">There are no active job sites for today. Please contact your manager.</p>
                                    </div>
                                )}
                                <div className="text-[10px] text-gray-600 font-mono pt-1 flex justify-between">
                                    <span>{location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}</span>
                                    <span>(±{Math.round(location.coords.accuracy)}m)</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-500 text-sm animate-pulse flex items-center gap-2">
                                <Loader2 className="h-3 w-3 animate-spin" /> Triangulating position...
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

            {/* Debug Info (Temporary) */}
            <div className="bg-black/50 p-4 rounded text-xs font-mono text-gray-500 mt-8 break-all">
                <p>User ID: {userId}</p>
                <p>Sites Loaded: {sites.length}</p>
                <p>Location: {location ? `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}` : 'Waiting'}</p>
                <p>Nearest: {nearestSite?.site?.name || 'None'}</p>
            </div>
        </div>
    );
}
