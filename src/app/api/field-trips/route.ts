import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const lat = parseFloat(searchParams.get("lat") || "0");
        const lng = parseFloat(searchParams.get("lng") || "0");
        const radius = parseFloat(searchParams.get("radius") || "50"); // km
        const category = searchParams.get("category");

        let query = supabase
            .from("FieldTrip")
            .select(`
                *,
                createdBy:User!createdById(id, name)
            `)
            .order("createdAt", { ascending: false });

        if (category) {
            query = query.eq("category", category);
        }

        const { data: trips, error } = await query;
        if (error) throw error;

        let results = trips || [];

        // Filter by distance if coordinates provided
        if (lat !== 0 || lng !== 0) {
            results = results
                .map((trip: any) => ({
                    ...trip,
                    distance: getDistanceKm(lat, lng, trip.latitude, trip.longitude)
                }))
                .filter((trip: any) => trip.distance <= radius)
                .sort((a: any, b: any) => a.distance - b.distance);
        }

        return NextResponse.json({ trips: results });
    } catch (error) {
        console.error("Field Trips Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        const email = session?.user?.email ?? "admin@admin.com";

        const { data: user } = await supabase.from("User").select("id").eq("email", email).single();
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const { title, description, location, latitude, longitude, category, ageRange, cost, website } = await req.json();
        if (!title || !location || latitude == null || longitude == null || !category) {
            return NextResponse.json({ error: "title, location, latitude, longitude, and category are required" }, { status: 400 });
        }

        const { data: trip, error } = await supabase
            .from("FieldTrip")
            .insert([{
                title,
                description,
                location,
                latitude,
                longitude,
                category,
                ageRange,
                cost,
                website,
                createdById: user.id
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, trip }, { status: 201 });
    } catch (error) {
        console.error("Field Trip Creation Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
