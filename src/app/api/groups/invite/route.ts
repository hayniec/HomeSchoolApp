import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        const email = session?.user?.email ?? "admin@admin.com";

        const { data: user } = await supabase.from("User").select("id").eq("email", email).single();
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const { groupId, invitedEmail } = await req.json();
        if (!groupId || !invitedEmail) {
            return NextResponse.json({ error: "groupId and invitedEmail required" }, { status: 400 });
        }

        // Check membership
        const { data: membership } = await supabase
            .from("CoopGroupMember")
            .select("role")
            .eq("groupId", groupId)
            .eq("userId", user.id)
            .single();

        if (!membership) {
            return NextResponse.json({ error: "You must be a group member to invite" }, { status: 403 });
        }

        // Check if already a member
        const { data: existingUser } = await supabase.from("User").select("id").eq("email", invitedEmail).single();
        if (existingUser) {
            const { data: existingMember } = await supabase
                .from("CoopGroupMember")
                .select("id")
                .eq("groupId", groupId)
                .eq("userId", existingUser.id)
                .single();
            if (existingMember) {
                return NextResponse.json({ error: "User is already a member" }, { status: 400 });
            }
        }

        // Check for existing pending invitation
        const { data: existingInvite } = await supabase
            .from("CoopGroupInvitation")
            .select("id")
            .eq("groupId", groupId)
            .eq("invitedEmail", invitedEmail)
            .eq("status", "PENDING")
            .single();

        if (existingInvite) {
            return NextResponse.json({ error: "Invitation already pending" }, { status: 400 });
        }

        const { data: invite, error } = await supabase
            .from("CoopGroupInvitation")
            .insert([{ groupId, invitedEmail, invitedById: user.id }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, invitation: invite }, { status: 201 });
    } catch (error) {
        console.error("Invite Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Accept or decline an invitation
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession();
        const email = session?.user?.email ?? "admin@admin.com";

        const { data: user } = await supabase.from("User").select("id, email").eq("email", email).single();
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const { invitationId, action } = await req.json();
        if (!invitationId || !["ACCEPTED", "DECLINED"].includes(action)) {
            return NextResponse.json({ error: "invitationId and valid action required" }, { status: 400 });
        }

        const { data: invite } = await supabase
            .from("CoopGroupInvitation")
            .select("*")
            .eq("id", invitationId)
            .eq("invitedEmail", user.email)
            .eq("status", "PENDING")
            .single();

        if (!invite) {
            return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
        }

        // Update invitation status
        await supabase.from("CoopGroupInvitation").update({ status: action }).eq("id", invitationId);

        // If accepted, add to group
        if (action === "ACCEPTED") {
            await supabase.from("CoopGroupMember").insert([{
                groupId: invite.groupId,
                userId: user.id,
                role: "MEMBER"
            }]);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Invite Action Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Get pending invitations for current user
export async function GET() {
    try {
        const session = await getServerSession();
        const email = session?.user?.email ?? "admin@admin.com";

        const { data: invitations } = await supabase
            .from("CoopGroupInvitation")
            .select(`
                id, status, createdAt,
                group:CoopGroup(id, name, description),
                invitedBy:User!invitedById(id, name)
            `)
            .eq("invitedEmail", email)
            .eq("status", "PENDING")
            .order("createdAt", { ascending: false });

        return NextResponse.json({ invitations: invitations || [] });
    } catch (error) {
        console.error("Invitations Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
