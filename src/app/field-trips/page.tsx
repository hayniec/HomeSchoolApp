"use client";

import { useEffect, useState, useCallback } from "react";
import { MapPin, Search, Plus, Filter, ExternalLink } from "lucide-react";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

interface Trip {
    id: string;
    title: string;
    description: string;
    address: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    category: string;
    ageRange: string;
    cost: string;
    website: string;
    distance?: number;
    createdBy?: { id: string; name: string };
}

const CATEGORIES = ["Museum", "Park", "Science", "Art", "History", "Nature", "Zoo", "Other"];

const US_STATES = [
    "AL","AK","AZ","AR","CA","CO","CT","DC","DE","FL","GA","HI","ID","IL","IN","IA",
    "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
    "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
    "VA","WA","WV","WI","WY"
];

export default function FieldTripsPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [userLocation, setUserLocation] = useState<[number, number]>([39.8283, -98.5795]);
    const [hasLocation, setHasLocation] = useState(false);
    const [radius, setRadius] = useState(50);
    const [categoryFilter, setCategoryFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [nearCity, setNearCity] = useState("");
    const [nearState, setNearState] = useState("");

    // Form state
    const [form, setForm] = useState({
        title: "", description: "", address: "", city: "", state: "",
        category: "Museum", ageRange: "", cost: "", website: ""
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchTrips = useCallback(async () => {
        const params = new URLSearchParams();
        if (hasLocation) {
            params.set("lat", userLocation[0].toString());
            params.set("lng", userLocation[1].toString());
        }
        if (nearCity) params.set("nearCity", nearCity);
        if (nearState) params.set("nearState", nearState);
        params.set("radius", radius.toString());
        if (categoryFilter) params.set("category", categoryFilter);

        const res = await fetch(`/api/field-trips?${params}`);
        const data = await res.json();
        setTrips(data.trips || []);
    }, [hasLocation, userLocation, radius, categoryFilter, nearCity, nearState]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation([pos.coords.latitude, pos.coords.longitude]);
                    setHasLocation(true);
                },
                () => {}
            );
        }
    }, []);

    useEffect(() => {
        fetchTrips().then(() => setLoading(false));
    }, [fetchTrips]);

    const createTrip = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const res = await fetch("/api/field-trips", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        setSubmitting(false);
        if (res.ok) {
            setForm({ title: "", description: "", address: "", city: "", state: "", category: "Museum", ageRange: "", cost: "", website: "" });
            setShowCreate(false);
            fetchTrips();
        }
    };

    const searchNearCity = () => {
        setHasLocation(false);
        fetchTrips();
    };

    const filteredTrips = searchQuery
        ? trips.filter((t) =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.city.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : trips;

    const mappableTrips = filteredTrips.filter((t) => t.latitude != null && t.longitude != null);

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: "2rem", textAlign: "center" }}>
                <p>Loading field trips...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
                <h1 className="card-title" style={{ fontSize: "2.5rem", margin: 0 }}>Field Trip Finder</h1>
                <button className="btn" onClick={() => setShowCreate(!showCreate)} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Plus size={20} /> Add Trip
                </button>
            </div>

            {/* Search and Filters */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
                    <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input className="input" placeholder="Search trips..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ paddingLeft: "40px", marginBottom: 0 }} />
                </div>
                <button className={`btn ${showFilters ? "" : "btn-outline"}`} onClick={() => setShowFilters(!showFilters)} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Filter size={16} /> Filters
                </button>
            </div>

            {showFilters && (
                <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "end" }}>
                        <div>
                            <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Category</label>
                            <select className="input" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ marginBottom: 0, minWidth: "150px" }}>
                                <option value="">All Categories</option>
                                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Radius: {radius} km</label>
                            <input type="range" min="5" max="200" value={radius} onChange={(e) => setRadius(parseInt(e.target.value))} style={{ width: "200px" }} />
                        </div>
                        <div>
                            <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Search near city</label>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <input className="input" placeholder="City" value={nearCity} onChange={(e) => setNearCity(e.target.value)} style={{ marginBottom: 0, width: "140px" }} />
                                <select className="input" value={nearState} onChange={(e) => setNearState(e.target.value)} style={{ marginBottom: 0, width: "80px" }}>
                                    <option value="">State</option>
                                    {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <button className="btn" onClick={searchNearCity} style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>Go</button>
                            </div>
                        </div>
                        {!hasLocation && (
                            <button className="btn btn-outline" onClick={() => {
                                navigator.geolocation?.getCurrentPosition((pos) => {
                                    setUserLocation([pos.coords.latitude, pos.coords.longitude]);
                                    setHasLocation(true);
                                    setNearCity("");
                                    setNearState("");
                                });
                            }} style={{ fontSize: "0.85rem" }}>
                                <MapPin size={14} /> Use My Location
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Create Trip Form */}
            {showCreate && (
                <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
                    <h2 style={{ margin: "0 0 1rem 0", color: "var(--primary)" }}>Add Field Trip</h2>
                    <form onSubmit={createTrip}>
                        <input className="input" placeholder="Trip name" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                        <textarea className="input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} style={{ resize: "vertical" }} />
                        <input className="input" placeholder="Street address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <input className="input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required style={{ flex: 2 }} />
                            <select className="input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required style={{ flex: 1 }}>
                                <option value="">State</option>
                                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required style={{ flex: 1 }}>
                                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input className="input" placeholder="Age range (e.g. 5-12)" value={form.ageRange} onChange={(e) => setForm({ ...form, ageRange: e.target.value })} style={{ flex: 1 }} />
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <input className="input" placeholder="Cost (e.g. Free, $10/person)" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} style={{ flex: 1 }} />
                            <input className="input" placeholder="Website URL" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} style={{ flex: 1 }} />
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button type="submit" className="btn" disabled={submitting}>
                                {submitting ? "Adding..." : "Add Trip"}
                            </button>
                            <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
                        </div>
                        <p style={{ margin: "0.75rem 0 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            The address will be automatically converted to map coordinates.
                        </p>
                    </form>
                </div>
            )}

            {/* Map */}
            {mappableTrips.length > 0 && (
                <div style={{ marginBottom: "2rem" }}>
                    <MapView trips={mappableTrips} center={userLocation} />
                </div>
            )}

            {/* Trip Listings */}
            {filteredTrips.length === 0 ? (
                <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
                    <MapPin size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
                    <h2 style={{ color: "var(--text-muted)" }}>No field trips found</h2>
                    <p style={{ color: "var(--text-muted)" }}>Add a field trip or adjust your filters.</p>
                </div>
            ) : (
                <div className="grid">
                    {filteredTrips.map((trip) => (
                        <div key={trip.id} className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                                <span style={{ background: "var(--primary)", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "bold" }}>
                                    {trip.category}
                                </span>
                                {trip.distance != null && (
                                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                                        {trip.distance.toFixed(1)} km
                                    </span>
                                )}
                            </div>
                            <h3 style={{ margin: "0.25rem 0", fontSize: "1.3rem" }}>{trip.title}</h3>
                            <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                <MapPin size={14} /> {trip.address}, {trip.city}, {trip.state}
                            </p>
                            {trip.description && <p style={{ margin: 0, lineHeight: 1.5 }}>{trip.description}</p>}
                            <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                                {trip.ageRange && <span>Ages: {trip.ageRange}</span>}
                                {trip.cost && <span>Cost: {trip.cost}</span>}
                            </div>
                            {trip.website && (
                                <a href={trip.website} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ marginTop: "auto", textAlign: "center", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                                    <ExternalLink size={14} /> Visit Website
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
