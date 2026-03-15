"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Trip {
    id: string;
    title: string;
    address: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    category: string;
    distance?: number;
}

interface MapViewProps {
    trips: Trip[];
    center: [number, number];
    onTripClick?: (trip: Trip) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
    Museum: "#FF6B6B",
    Park: "#4ecdc4",
    Science: "#45b7d1",
    Art: "#f9ca24",
    History: "#6c5ce7",
    Nature: "#00b894",
    Zoo: "#fd79a8",
    Other: "#636e72",
};

export default function MapView({ trips, center, onTripClick }: MapViewProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        const map = L.map(mapRef.current).setView(center, 10);
        mapInstanceRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const bounds = L.latLngBounds([]);

        trips.forEach((trip) => {
            if (trip.latitude == null || trip.longitude == null) return;

            const color = CATEGORY_COLORS[trip.category] || CATEGORY_COLORS.Other;
            const icon = L.divIcon({
                className: "",
                html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;">${trip.title[0]}</div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14],
            });

            const marker = L.marker([trip.latitude, trip.longitude], { icon }).addTo(map);
            const distText = trip.distance != null ? `<br><b>${trip.distance.toFixed(1)} km away</b>` : "";
            marker.bindPopup(`<b>${trip.title}</b><br>${trip.address}, ${trip.city}, ${trip.state}<br><em>${trip.category}</em>${distText}`);
            bounds.extend([trip.latitude, trip.longitude]);

            if (onTripClick) {
                marker.on("click", () => onTripClick(trip));
            }
        });

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [40, 40] });
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [trips, center, onTripClick]);

    return <div ref={mapRef} style={{ height: "400px", width: "100%", borderRadius: "16px", overflow: "hidden", border: "2px solid var(--border-color)" }} />;
}
