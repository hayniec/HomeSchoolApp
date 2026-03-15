import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const groupId = searchParams.get("groupId");
        if (!groupId) return NextResponse.json({ error: "groupId required" }, { status: 400 });

        const { data: members } = await supabase
            .from("CoopGroupMember")
            .select(`
                id, role, joinedAt,
                user:User(id, name, email)
            `)
            .eq("groupId", groupId)
            .order("joinedAt", { ascending: true });

        return NextResponse.json({ members: members || [] });
    } catch (error) {
        console.error("Members Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession();
        const email = session?.user?.email ?? "admin@admin.com";

        const { data: user } = await supabase.from("User").select("id").eq("email", email).single();
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const { groupId, memberId } = await req.json();

        // Check if requester is an admin of the group
        const { data: requesterMembership } = await supabase
            .from("CoopGroupMember")
            .select("role")
            .eq("groupId", groupId)
            .eq("userId", user.id)
            .single();

        if (!requesterMembership || requesterMembership.role !== "ADMIN") {
            return NextResponse.json({ error: "Only admins can remove members" }, { status: 403 });
        }

        await supabase.from("CoopGroupMember").delete().eq("id", memberId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Member Remove Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
