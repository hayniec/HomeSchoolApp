import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession();
        const email = session?.user?.email ?? "admin@admin.com";

        const { data: user } = await supabase.from("User").select("id").eq("email", email).single();
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const { searchParams } = new URL(req.url);
        const groupId = searchParams.get("groupId");

        let query = supabase
            .from("ActivityFeedItem")
            .select(`
                id, type, title, content, eventDate, createdAt,
                author:User!authorId(id, name),
                group:CoopGroup!groupId(id, name),
                rsvps:EventRsvp(id, status, user:User(id, name))
            `)
            .order("createdAt", { ascending: false })
            .limit(50);

        if (groupId) {
            query = query.eq("groupId", groupId);
        } else {
            // Get feed items from all user's groups
            const { data: memberships } = await supabase
                .from("CoopGroupMember")
                .select("groupId")
                .eq("userId", user.id);
            const groupIds = (memberships || []).map((m: any) => m.groupId);
            if (groupIds.length > 0) {
                query = query.in("groupId", groupIds);
            } else {
                return NextResponse.json({ items: [] });
            }
        }

        const { data: items, error } = await query;
        if (error) throw error;

        return NextResponse.json({ items: items || [] });
    } catch (error) {
        console.error("Feed Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        const email = session?.user?.email ?? "admin@admin.com";

        const { data: user } = await supabase.from("User").select("id").eq("email", email).single();
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const { type, title, content, groupId, eventDate } = await req.json();
        if (!type || !title || !groupId) {
            return NextResponse.json({ error: "type, title, and groupId are required" }, { status: 400 });
        }

        // Verify membership
        const { data: membership } = await supabase
            .from("CoopGroupMember")
            .select("id")
            .eq("groupId", groupId)
            .eq("userId", user.id)
            .single();

        if (!membership) {
            return NextResponse.json({ error: "Must be a group member to post" }, { status: 403 });
        }

        const { data: item, error } = await supabase
            .from("ActivityFeedItem")
            .insert([{
                type,
                title,
                content,
                authorId: user.id,
                groupId,
                eventDate: eventDate || null
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, item }, { status: 201 });
    } catch (error) {
        console.error("Feed Post Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
