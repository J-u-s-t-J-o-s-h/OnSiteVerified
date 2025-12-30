"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";

// Fix for default marker icon in Next.js
const iconUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
    center?: [number, number];
    zoom?: number;
    initialMarker?: [number, number];
    onLocationSelect?: (lat: number, lng: number) => void;
    interactive?: boolean;
}

function LocationMarker({
    position,
    setPosition,
    onLocationSelect
}: {
    position: [number, number] | null,
    setPosition: (pos: [number, number]) => void,
    onLocationSelect?: (lat: number, lng: number) => void
}) {
    const map = useMapEvents({
        click(e) {
            if (onLocationSelect) {
                setPosition([e.latlng.lat, e.latlng.lng]);
                onLocationSelect(e.latlng.lat, e.latlng.lng);
                map.flyTo(e.latlng, map.getZoom());
            }
        },
        // If we wanted to drag the marker, we'd use useMemo for event handlers on the Marker
    });

    return position === null ? null : (
        <Marker position={position} draggable={!!onLocationSelect} eventHandlers={{
            dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                setPosition([position.lat, position.lng]);
                if (onLocationSelect) onLocationSelect(position.lat, position.lng);
            }
        }}>
            <Popup>Job Site Location</Popup>
        </Marker>
    );
}

function RecenterMap({ center }: { center: [number, number] }) {
    const map = useMapEvents({});
    useEffect(() => {
        map.flyTo(center, map.getZoom());
    }, [center, map]);
    return null;
}
export default function Map({ center = [51.505, -0.09], zoom = 13, initialMarker, onLocationSelect, interactive = true }: MapProps) {
    const [markerPos, setMarkerPos] = useState<[number, number] | null>(initialMarker || null);

    useEffect(() => {
        if (initialMarker) setMarkerPos(initialMarker);
    }, [initialMarker]);

    return (
        <div className="h-[400px] w-full rounded-lg overflow-hidden border border-gray-700 relative z-0">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={interactive}
                className="h-full w-full"
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap center={center} />
                <LocationMarker position={markerPos} setPosition={setMarkerPos} onLocationSelect={interactive ? onLocationSelect : undefined} />
            </MapContainer>
        </div>
    );
}
