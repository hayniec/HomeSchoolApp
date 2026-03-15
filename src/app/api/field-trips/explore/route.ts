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

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const lat = searchParams.get("lat");
        const lng = searchParams.get("lng");
        const radiusMeters = parseInt(searchParams.get("radius") || "50000"); // default 50km in meters
        const kinds = searchParams.get("kinds") || "interesting_places";

        if (!lat || !lng) {
            return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
        }

        // OpenTripMap radius endpoint — returns places within a radius of a point
        // No API key needed for moderate usage
        const url = `${OTM_BASE}/radius?radius=${radiusMeters}&lon=${lng}&lat=${lat}&kinds=${kinds}&rate=2&limit=50&format=json`;

        const res = await fetch(url, {
            headers: { "User-Agent": "HomeschoolHub/1.0" },
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("OpenTripMap error:", res.status, text);
            return NextResponse.json({ error: "Failed to fetch from OpenTripMap" }, { status: 502 });
        }

        const rawPlaces = await res.json();

        // Fetch details for each place to get full info (name, description, address)
        // Limit to 20 to avoid rate limits
        const top = (rawPlaces as any[]).slice(0, 20);

        const places = await Promise.all(
            top.map(async (place: any) => {
                try {
                    const detailRes = await fetch(`${OTM_BASE}/xid/${place.xid}?format=json`, {
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
