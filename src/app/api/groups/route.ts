import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";

export async function GET() {
    try {
        const session = await getServerSession();
        const email = session?.user?.email ?? "admin@admin.com";

        const { data: user } = await supabase.from("User").select("id").eq("email", email).single();
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Get groups the user is a member of
        const { data: memberships } = await supabase
            .from("CoopGroupMember")
            .select(`
                role,
                group:CoopGroup(
                    id, name, description, createdAt,
                    createdBy:User!createdById(id, name)
                )
            `)
            .eq("userId", user.id);

        // Get member counts for each group
        const groups = await Promise.all(
            (memberships || []).map(async (m: any) => {
                const { count } = await supabase
                    .from("CoopGroupMember")
                    .select("*", { count: "exact", head: true })
                    .eq("groupId", m.group.id);
                return { ...m.group, memberRole: m.role, memberCount: count || 0 };
            })
        );

        return NextResponse.json({ groups });
    } catch (error) {
        console.error("Groups Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        const email = session?.user?.email ?? "admin@admin.com";

        const { data: user } = await supabase.from("User").select("id").eq("email", email).single();
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const { name, description } = await req.json();
        if (!name) return NextResponse.json({ error: "Group name is required" }, { status: 400 });

        // Create the group
        const { data: group, error: groupError } = await supabase
            .from("CoopGroup")
            .insert([{ name, description, createdById: user.id }])
            .select()
            .single();

        if (groupError) throw groupError;

        // Add creator as ADMIN member
        await supabase.from("CoopGroupMember").insert([{
            groupId: group.id,
            userId: user.id,
            role: "ADMIN"
        }]);

        return NextResponse.json({ success: true, group }, { status: 201 });
    } catch (error) {
        console.error("Group Creation Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
