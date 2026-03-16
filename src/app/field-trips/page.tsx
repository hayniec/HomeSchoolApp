"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { MapPin, Search, Plus, Filter, ExternalLink, Compass, Save, Trash2, Clock } from "lucide-react";
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
    source?: string;
    createdById?: string;
    createdBy?: { id: string; name: string };
}

interface DeletionLog {
    id: string;
    tripTitle: string;
    tripCategory: string;
    tripCity: string;
    tripState: string;
    deletedByName: string;
    deletedByRole: string;
    createdByName: string;
    reason: string | null;
    deletedAt: string;
}

const CATEGORIES = ["Museum", "Park", "Science", "Art", "History", "Nature", "Zoo", "Other"];

const US_STATES = [
    "AL","AK","AZ","AR","CA","CO","CT","DC","DE","FL","GA","HI","ID","IL","IN","IA",
    "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
    "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
    "VA","WA","WV","WI","WY"
];

export default function FieldTripsPage() {
    const { data: session } = useSession();
    const currentUserId = (session?.user as any)?.id;
    const currentUserRole = (session?.user as any)?.role;
    const isAdmin = currentUserRole === "ADMIN";

    const [trips, setTrips] = useState<Trip[]>([]);
    const [nearbyPlaces, setNearbyPlaces] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [exploreNearby, setExploreNearby] = useState(false);
    const [exploringLoading, setExploringLoading] = useState(false);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number]>([39.8283, -98.5795]);
    const [hasLocation, setHasLocation] = useState(false);
    const [radius, setRadius] = useState(30); // miles
    const [categoryFilter, setCategoryFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [nearCity, setNearCity] = useState("");
    const [nearState, setNearState] = useState("");
    const [exploreCity, setExploreCity] = useState("");
    const [exploreState, setExploreState] = useState("");
    const [exploreLabel, setExploreLabel] = useState("");
    const [exploreSource, setExploreSource] = useState<"location" | "city" | null>(null);

    // Form state
    const [form, setForm] = useState({
        title: "", description: "", address: "", city: "", state: "",
        category: "Museum", ageRange: "", cost: "", website: ""
    });
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [deleteReason, setDeleteReason] = useState("");
    const [showDeletionLog, setShowDeletionLog] = useState(false);
    const [deletionLogs, setDeletionLogs] = useState<DeletionLog[]>([]);
    const [deletionLogLoading, setDeletionLogLoading] = useState(false);
    const [exploreError, setExploreError] = useState("");
    const [locationError, setLocationError] = useState("");

    const milesToKm = (mi: number) => mi * 1.60934;
    const kmToMiles = (km: number) => km / 1.60934;

    const fetchTrips = useCallback(async () => {
        const params = new URLSearchParams();
        if (hasLocation) {
            params.set("lat", userLocation[0].toString());
            params.set("lng", userLocation[1].toString());
        }
        if (nearCity) params.set("nearCity", nearCity);
        if (nearState) params.set("nearState", nearState);
        params.set("radius", milesToKm(radius).toFixed(1));
        if (categoryFilter) params.set("category", categoryFilter);

        const res = await fetch(`/api/field-trips?${params}`);
        const data = await res.json();
        // Convert distance from km (API) to miles (display)
        const tripsWithMiles = (data.trips || []).map((t: any) => ({
            ...t,
            distance: t.distance != null ? kmToMiles(t.distance) : undefined,
        }));
        setTrips(tripsWithMiles);
    }, [hasLocation, userLocation, radius, categoryFilter, nearCity, nearState]);

    const fetchNearbyPlaces = useCallback(async (options: { lat?: number; lng?: number; city?: string; state?: string }) => {
        setExploringLoading(true);
        setExploreError("");
        try {
            const radiusMeters = Math.round(milesToKm(radius) * 1000);
            const params = new URLSearchParams({ radius: radiusMeters.toString() });
            if (options.lat != null && options.lng != null) {
                params.set("lat", options.lat.toString());
                params.set("lng", options.lng.toString());
            }
            if (options.city) params.set("city", options.city);
            if (options.state) params.set("state", options.state);
            const res = await fetch(`/api/field-trips/explore?${params}`);
            const data = await res.json();
            if (!res.ok) {
                setExploreError(data.error || "Failed to search for places. Please try again.");
                setNearbyPlaces([]);
            } else {
                setNearbyPlaces(data.places || []);
            }
        } catch {
            setExploreError("Network error — could not reach the server. Check your connection and try again.");
            setNearbyPlaces([]);
        }
        setExploringLoading(false);
    }, [radius]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation([pos.coords.latitude, pos.coords.longitude]);
                    setHasLocation(true);
                    setLocationError("");
                },
                (err) => {
                    if (err.code === err.PERMISSION_DENIED) {
                        setLocationError("Location access was denied. Use the city/state search instead, or allow location access in your browser settings.");
                    }
                }
            );
        }
    }, []);

    useEffect(() => {
        fetchTrips().then(() => setLoading(false));
    }, [fetchTrips]);

    // Only auto-fetch when explore is on AND source is "location" (not city search)
    useEffect(() => {
        if (exploreNearby && hasLocation && exploreSource === "location") {
            fetchNearbyPlaces({ lat: userLocation[0], lng: userLocation[1] });
            setExploreLabel("your location");
        } else if (!exploreNearby) {
            setNearbyPlaces([]);
            setExploreLabel("");
            setExploreSource(null);
        }
    }, [exploreNearby, hasLocation, userLocation, exploreSource, fetchNearbyPlaces]);

    const exploreByCity = () => {
        if (!exploreCity || !exploreState) return;
        setExploreSource("city");
        setExploreNearby(true);
        setExploreLabel(`${exploreCity}, ${exploreState}`);
        fetchNearbyPlaces({ city: exploreCity, state: exploreState });
    };

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

    const saveToOurList = async (place: Trip) => {
        setSavingId(place.id);
        const res = await fetch("/api/field-trips", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: place.title,
                description: place.description,
                address: place.address || "See map",
                city: place.city || "Unknown",
                state: place.state || "Unknown",
                category: place.category,
                ageRange: "",
                cost: "",
                website: place.website,
            }),
        });
        setSavingId(null);
        if (res.ok) {
            // Remove from nearby list and refresh our trips
            setNearbyPlaces((prev) => prev.filter((p) => p.id !== place.id));
            fetchTrips();
        }
    };

    const searchNearCity = () => {
        setHasLocation(false);
        fetchTrips();
    };

    const deleteTrip = async (tripId: string) => {
        setDeletingId(tripId);
        const res = await fetch("/api/field-trips", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: tripId, reason: deleteReason || undefined }),
        });
        setDeletingId(null);
        if (res.ok) {
            setDeleteConfirmId(null);
            setDeleteReason("");
            fetchTrips();
        }
    };

    const fetchDeletionLogs = async () => {
        setDeletionLogLoading(true);
        const res = await fetch("/api/field-trips/deletion-log");
        const data = await res.json();
        setDeletionLogs(data.logs || []);
        setDeletionLogLoading(false);
    };

    const toggleDeletionLog = () => {
        if (!showDeletionLog) fetchDeletionLogs();
        setShowDeletionLog(!showDeletionLog);
    };

    const canDelete = (trip: Trip) => {
        return isAdmin || trip.createdById === currentUserId;
    };

    const filteredTrips = searchQuery
        ? trips.filter((t) =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.city.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : trips;

    const filteredNearby = searchQuery
        ? nearbyPlaces.filter((t) =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : nearbyPlaces;

    const mappableTrips = filteredTrips.filter((t) => t.latitude != null && t.longitude != null);
    const mappableNearby = filteredNearby.filter((t) => t.latitude != null && t.longitude != null);

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
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <button
                        className={`btn ${exploreNearby ? "" : "btn-outline"}`}
                        onClick={() => setExploreNearby(!exploreNearby)}
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                    >
                        <Compass size={20} /> {exploreNearby ? "Hide Explorer" : "Explore Places"}
                    </button>
                    <button className="btn" onClick={() => setShowCreate(!showCreate)} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Plus size={20} /> Add Trip
                    </button>
                    <button
                        className={`btn ${showDeletionLog ? "" : "btn-outline"}`}
                        onClick={toggleDeletionLog}
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                    >
                        <Clock size={20} /> Deletion Log
                    </button>
                </div>
            </div>

            {/* Explore Panel */}
            {exploreNearby && (
                <div style={{
                    background: "linear-gradient(135deg, rgba(69, 183, 209, 0.12), rgba(78, 205, 196, 0.12))",
                    border: "1px solid rgba(69, 183, 209, 0.3)",
                    borderRadius: "12px",
                    padding: "1.25rem",
                    marginBottom: "1rem",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                        <Compass size={18} />
                        <strong style={{ fontSize: "1rem" }}>Explore Places</strong>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "auto" }}>
                            Gray markers = suggested | Colored = your list
                        </span>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "end" }}>
                        <div style={{ flex: "1 1 160px" }}>
                            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>City</label>
                            <input
                                className="input"
                                placeholder="e.g. Philadelphia"
                                value={exploreCity}
                                onChange={(e) => setExploreCity(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && exploreByCity()}
                                style={{ marginBottom: 0 }}
                            />
                        </div>
                        <div style={{ flex: "0 1 100px" }}>
                            <label style={{ fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>State</label>
                            <select
                                className="input"
                                value={exploreState}
                                onChange={(e) => setExploreState(e.target.value)}
                                style={{ marginBottom: 0 }}
                            >
                                <option value="">--</option>
                                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <button className="btn" onClick={exploreByCity} disabled={!exploreCity || !exploreState || exploringLoading} style={{ whiteSpace: "nowrap" }}>
                            <Search size={14} /> Search Area
                        </button>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "0.5rem 0" }}>or</span>
                        <button
                            className="btn btn-outline"
                            onClick={() => {
                                if (!navigator.geolocation) {
                                    setExploreError("Your browser does not support location services. Use the city/state search instead.");
                                    return;
                                }
                                navigator.geolocation.getCurrentPosition(
                                    (pos) => {
                                        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
                                        setHasLocation(true);
                                        setExploreSource("location");
                                        setExploreLabel("your location");
                                        setExploreError("");
                                        setLocationError("");
                                        fetchNearbyPlaces({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                                    },
                                    () => {
                                        setExploreError("Could not get your location. Please allow location access in your browser, or use the city/state search instead.");
                                    }
                                );
                            }}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            <MapPin size={14} /> Use My Location
                        </button>
                    </div>
                    {exploringLoading && (
                        <p style={{ margin: "0.75rem 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                            Searching for places...
                        </p>
                    )}
                    {!exploringLoading && exploreError && (
                        <p style={{ margin: "0.75rem 0 0", fontSize: "0.85rem", color: "#dc2626", background: "rgba(220,38,38,0.08)", padding: "0.75rem", borderRadius: "8px" }}>
                            {exploreError}
                        </p>
                    )}
                    {!exploringLoading && !exploreError && exploreLabel && filteredNearby.length > 0 && (
                        <p style={{ margin: "0.75rem 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                            Found <strong>{filteredNearby.length}</strong> places near <strong>{exploreLabel}</strong> within {radius} miles.
                        </p>
                    )}
                    {!exploringLoading && !exploreError && exploreLabel && filteredNearby.length === 0 && (
                        <p style={{ margin: "0.75rem 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                            No places found near {exploreLabel}. Try increasing the radius in Filters.
                        </p>
                    )}
                </div>
            )}

            {/* Search and Filters */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
                    <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input className="input" placeholder="Filter by name or city..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ paddingLeft: "40px", marginBottom: 0 }} />
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
                            <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.25rem" }}>Radius: {radius} mi</label>
                            <input type="range" min="5" max="125" value={radius} onChange={(e) => setRadius(parseInt(e.target.value))} style={{ width: "200px" }} />
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
                                if (!navigator.geolocation) {
                                    setLocationError("Your browser does not support location services.");
                                    return;
                                }
                                navigator.geolocation.getCurrentPosition(
                                    (pos) => {
                                        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
                                        setHasLocation(true);
                                        setLocationError("");
                                        setNearCity("");
                                        setNearState("");
                                    },
                                    () => {
                                        setLocationError("Could not get your location. Allow location access in your browser settings, or search by city instead.");
                                    }
                                );
                            }} style={{ fontSize: "0.85rem" }}>
                                <MapPin size={14} /> Use My Location
                            </button>
                        )}
                    </div>
                    {locationError && (
                        <p style={{ margin: "0.75rem 0 0", fontSize: "0.85rem", color: "#dc2626" }}>
                            {locationError}
                        </p>
                    )}
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
            {(mappableTrips.length > 0 || mappableNearby.length > 0) && (
                <div style={{ marginBottom: "2rem" }}>
                    <MapView trips={mappableTrips} nearbyPlaces={exploreNearby ? mappableNearby : []} center={userLocation} />
                </div>
            )}

            {/* Nearby Places Section */}
            {exploreNearby && filteredNearby.length > 0 && (
                <>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Compass size={22} /> Places to Explore {exploreLabel && <>near <em>{exploreLabel}</em></>}
                    </h2>
                    <div className="grid" style={{ marginBottom: "2.5rem" }}>
                        {filteredNearby.map((place) => (
                            <div key={place.id} className="glass-card" style={{
                                padding: "1.5rem",
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                                borderLeft: "4px solid #aaa",
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                        <span style={{ background: "#888", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "bold" }}>
                                            {place.category}
                                        </span>
                                        <span style={{ background: "rgba(69,183,209,0.2)", color: "var(--primary)", padding: "4px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: 600 }}>
                                            OpenTripMap
                                        </span>
                                    </div>
                                </div>
                                <h3 style={{ margin: "0.25rem 0", fontSize: "1.3rem" }}>{place.title}</h3>
                                {(place.city || place.state) && (
                                    <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                        <MapPin size={14} /> {[place.address, place.city, place.state].filter(Boolean).join(", ")}
                                    </p>
                                )}
                                {place.description && (
                                    <p style={{ margin: 0, lineHeight: 1.5, fontSize: "0.9rem" }}>
                                        {place.description.length > 200 ? place.description.slice(0, 200) + "..." : place.description}
                                    </p>
                                )}
                                <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                                    <button
                                        className="btn"
                                        onClick={() => saveToOurList(place)}
                                        disabled={savingId === place.id}
                                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                                    >
                                        <Save size={14} /> {savingId === place.id ? "Saving..." : "Add to Our List"}
                                    </button>
                                    {place.website && (
                                        <a href={place.website} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Our Trip Listings */}
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
                {exploreNearby ? "Our Saved Trips" : "Field Trips"}
            </h2>
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
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    {trip.distance != null && (
                                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                                            {trip.distance.toFixed(1)} mi
                                        </span>
                                    )}
                                    {canDelete(trip) && (
                                        <button
                                            onClick={() => setDeleteConfirmId(deleteConfirmId === trip.id ? null : trip.id)}
                                            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "var(--text-muted)", borderRadius: "4px" }}
                                            title="Delete trip"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            {deleteConfirmId === trip.id && (
                                <div style={{
                                    background: "rgba(220, 38, 38, 0.08)",
                                    border: "1px solid rgba(220, 38, 38, 0.3)",
                                    borderRadius: "8px",
                                    padding: "0.75rem",
                                }}>
                                    <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", fontWeight: 600, color: "#dc2626" }}>
                                        Delete this trip?
                                    </p>
                                    <input
                                        className="input"
                                        placeholder="Reason (optional)"
                                        value={deleteReason}
                                        onChange={(e) => setDeleteReason(e.target.value)}
                                        style={{ marginBottom: "0.5rem", fontSize: "0.85rem" }}
                                    />
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button
                                            className="btn"
                                            onClick={() => deleteTrip(trip.id)}
                                            disabled={deletingId === trip.id}
                                            style={{ background: "#dc2626", fontSize: "0.8rem", padding: "0.4rem 0.75rem" }}
                                        >
                                            {deletingId === trip.id ? "Deleting..." : "Confirm Delete"}
                                        </button>
                                        <button
                                            className="btn btn-outline"
                                            onClick={() => { setDeleteConfirmId(null); setDeleteReason(""); }}
                                            style={{ fontSize: "0.8rem", padding: "0.4rem 0.75rem" }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
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

            {/* Deletion History */}
            {showDeletionLog && (
                <div style={{ marginTop: "2rem" }}>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Clock size={22} /> My Deletion History
                    </h2>
                    {deletionLogLoading ? (
                        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
                    ) : deletionLogs.length === 0 ? (
                        <div className="glass-card" style={{ padding: "2rem", textAlign: "center" }}>
                            <p style={{ color: "var(--text-muted)" }}>No deletions recorded yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {deletionLogs.map((log) => (
                                <div key={log.id} className="glass-card" style={{
                                    padding: "1rem 1.25rem",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                    gap: "0.5rem",
                                    borderLeft: "4px solid #dc2626",
                                }}>
                                    <div>
                                        <strong>{log.tripTitle}</strong>
                                        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginLeft: "0.5rem" }}>
                                            {log.tripCategory} — {log.tripCity}, {log.tripState}
                                        </span>
                                        {log.reason && (
                                            <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                                Reason: {log.reason}
                                            </p>
                                        )}
                                        <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                            Deleted by {log.deletedByName || "Unknown"}
                                            {log.deletedByRole === "ADMIN" && <span style={{ color: "#dc2626", fontWeight: 600 }}> (Admin)</span>}
                                            {log.createdByName && <> — originally added by {log.createdByName}</>}
                                        </p>
                                    </div>
                                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                                        {new Date(log.deletedAt).toLocaleDateString("en-US", {
                                            month: "short", day: "numeric", year: "numeric",
                                            hour: "numeric", minute: "2-digit"
                                        })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
