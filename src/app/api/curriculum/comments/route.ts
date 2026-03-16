import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        const email = session?.user?.email ?? "admin@admin.com";

        const { data: user } = await supabase.from("User").select("id").eq("email", email).single();
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const { content, suggestionId } = await req.json();
        if (!content || !suggestionId) {
            return NextResponse.json({ error: "content and suggestionId are required" }, { status: 400 });
        }

        const { data: comment, error } = await supabase
            .from("CurriculumComment")
            .insert([{ content, suggestionId, authorId: user.id }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, comment }, { status: 201 });
    } catch (error) {
        console.error("Curriculum Comment Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
