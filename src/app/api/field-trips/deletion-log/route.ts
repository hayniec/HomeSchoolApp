import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession();
        const email = session?.user?.email ?? "admin@admin.com";

        const { data: user } = await supabase.from("User").select("id, role").eq("email", email).single();
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const { searchParams } = new URL(req.url);
        const scope = searchParams.get("scope"); // "admin" for all logs, default for user's own

        let query = supabase
            .from("FieldTripDeletionLog")
            .select("*")
            .order("deletedAt", { ascending: false });

        if (scope === "admin") {
            // Only admins can see all deletion logs
            if (user.role !== "ADMIN") {
                return NextResponse.json({ error: "Not authorized" }, { status: 403 });
            }
            // Return all logs for admin
        } else {
            // Regular users see logs where they deleted or their trip was deleted
            query = query.or(`deletedById.eq.${user.id},createdById.eq.${user.id}`);
        }

        const { data: logs, error } = await query;
        if (error) throw error;

        return NextResponse.json({ logs: logs || [] });
    } catch (error) {
        console.error("Deletion Log Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
