import { NextResponse } from "next/server";

const OTM_BASE = "https://api.opentripmap.com/0.1/en/places";

// OpenTripMap category kinds mapped to our app categories
const KIND_TO_CATEGORY: Record<string, string> = {
    museums: "Museum",
    natural: "Nature",
    historic: "History",
    cultural: "Art",
    amusements: "Park",
    sport: "Park",
    gardens_and_parks: "Park",
    nature_reserves: "Nature",
    urban_environment: "Other",
    religion: "History",
    architecture: "History",
    industrial_facilities: "Science",
    other: "Other",
};

function mapKindsToCategory(kinds: string): string {
    const kindList = kinds.split(",");
    for (const kind of kindList) {
        const trimmed = kind.trim();
        if (KIND_TO_CATEGORY[trimmed]) return KIND_TO_CATEGORY[trimmed];
    }
    // Check partial matches
    for (const kind of kindList) {
        const trimmed = kind.trim();
        for (const [key, value] of Object.entries(KIND_TO_CATEGORY)) {
            if (trimmed.includes(key) || key.includes(trimmed)) return value;
        }
    }
    return "Other";
}

async function geocode(city: string, state: string): Promise<{ lat: number; lon: number } | null> {
    const query = encodeURIComponent(`${city}, ${state}, USA`);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
        headers: { "User-Agent": "HomeschoolHub/1.0" },
    });
    const data = await res.json();
    if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
    return null;
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        let lat = searchParams.get("lat");
        let lng = searchParams.get("lng");
        const city = searchParams.get("city");
        const state = searchParams.get("state");
        const radiusMeters = parseInt(searchParams.get("radius") || "50000"); // default 50km in meters
        const kinds = searchParams.get("kinds") || "interesting_places";

        // If city/state provided, geocode to get coordinates
        if (city && state && (!lat || !lng)) {
            const geo = await geocode(city, state);
            if (!geo) {
                return NextResponse.json({ error: `Could not find location "${city}, ${state}". Check the city name and try again.` }, { status: 400 });
            }
            lat = geo.lat.toString();
            lng = geo.lon.toString();
        }

        if (!lat || !lng) {
            return NextResponse.json({ error: "Please provide a city/state or use your location." }, { status: 400 });
        }

        // OpenTripMap radius endpoint — returns places within a radius of a point
        const apiKey = process.env.OPENTRIPMAP_API_KEY || "";
        const keyParam = apiKey ? `&apikey=${apiKey}` : "";
        const url = `${OTM_BASE}/radius?radius=${radiusMeters}&lon=${lng}&lat=${lat}&kinds=${kinds}&rate=2&limit=50&format=json${keyParam}`;

        const res = await fetch(url, {
            headers: { "User-Agent": "HomeschoolHub/1.0" },
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("OpenTripMap error:", res.status, text);
            if (res.status === 403 || res.status === 401) {
                return NextResponse.json({ error: "OpenTripMap API key is missing or invalid. Add OPENTRIPMAP_API_KEY to your environment variables (get a free key at opentripmap.com)." }, { status: 502 });
            }
            return NextResponse.json({ error: "Failed to fetch places from OpenTripMap. The service may be temporarily unavailable." }, { status: 502 });
        }

        const rawPlaces = await res.json();

        // Fetch details for each place to get full info (name, description, address)
        // Limit to 20 to avoid rate limits
        const top = (rawPlaces as any[]).slice(0, 20);

        const places = await Promise.all(
            top.map(async (place: any) => {
                try {
                    const detailRes = await fetch(`${OTM_BASE}/xid/${place.xid}?format=json${keyParam}`, {
                        headers: { "User-Agent": "HomeschoolHub/1.0" },
                    });
                    if (!detailRes.ok) return null;
                    const detail = await detailRes.json();

                    if (!detail.name) return null; // skip unnamed places

                    return {
                        id: `otm_${place.xid}`,
                        title: detail.name,
                        description: detail.wikipedia_extracts?.text?.slice(0, 300) || detail.info?.descr?.slice(0, 300) || "",
                        address: detail.address?.road || "",
                        city: detail.address?.city || detail.address?.town || detail.address?.county || "",
                        state: detail.address?.state || "",
                        latitude: detail.point?.lat ?? place.point?.lat,
                        longitude: detail.point?.lon ?? place.point?.lon,
                        category: mapKindsToCategory(place.kinds || ""),
                        ageRange: "",
                        cost: "",
                        website: detail.url || detail.otm || "",
                        source: "opentripmap",
                        kinds: place.kinds || "",
                        rating: place.rate || 0,
                    };
                } catch {
                    return null;
                }
            })
        );

        const validPlaces = places.filter(Boolean);

        return NextResponse.json({ places: validPlaces });
    } catch (error) {
        console.error("Explore API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
