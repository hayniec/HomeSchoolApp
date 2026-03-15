import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        const email = session?.user?.email ?? "admin@admin.com";

        const { data: user } = await supabase.from("User").select("id").eq("email", email).single();
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const { feedItemId, status } = await req.json();
        if (!feedItemId || !["GOING", "MAYBE", "NOT_GOING"].includes(status)) {
            return NextResponse.json({ error: "feedItemId and valid status required" }, { status: 400 });
        }

        // Check if RSVP already exists
        const { data: existing } = await supabase
            .from("EventRsvp")
            .select("id")
            .eq("feedItemId", feedItemId)
            .eq("userId", user.id)
            .single();

        if (existing) {
            // Update existing
            const { error } = await supabase
                .from("EventRsvp")
                .update({ status })
                .eq("id", existing.id);
            if (error) throw error;
        } else {
            // Create new
            const { error } = await supabase
                .from("EventRsvp")
                .insert([{ feedItemId, userId: user.id, status }]);
            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("RSVP Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
