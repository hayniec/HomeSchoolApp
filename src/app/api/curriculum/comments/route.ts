import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        const email = session?.user?.email ?? "admin@admin.com";

        const { data: user } = await supabase.from("User").select("id").eq("email", email).single();
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const { content, suggestionId, rating } = await req.json();
        if (!suggestionId || (!content && !rating)) {
            return NextResponse.json({ error: "suggestionId and at least content or rating are required" }, { status: 400 });
        }

        const { data: comment, error } = await supabase
            .from("CurriculumComment")
            .insert([{
                content: content || null,
                suggestionId,
                authorId: user.id,
                rating: rating ? parseInt(rating) : null
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, comment }, { status: 201 });
    } catch (error) {
        console.error("Curriculum Comment Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
