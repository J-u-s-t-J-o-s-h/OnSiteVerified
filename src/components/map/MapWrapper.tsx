"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./Map"), {
    ssr: false,
    loading: () => (
        <div className="h-[400px] w-full rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center animate-pulse">
            <p className="text-gray-500">Loading Map...</p>
        </div>
    ),
});

export default Map;
