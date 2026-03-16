import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getServerSession } from "next-auth";

export async function GET() {
    try {
        const { data: suggestions, error } = await supabase
            .from("CurriculumSuggestion")
            .select(`
                id, name, subject, gradeLevel, description, pros, cons, cost, rating, format, website, createdAt,
                author:User!authorId(id, name),
                comments:CurriculumComment(id, content, rating, createdAt, author:User!authorId(id, name))
            `)
            .order("createdAt", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ suggestions: suggestions || [] });
    } catch (error) {
        console.error("Curriculum Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        const email = session?.user?.email ?? "admin@admin.com";

        const { data: user } = await supabase.from("User").select("id").eq("email", email).single();
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const { name, subject, gradeLevel, description, pros, cons, cost, rating, format, website } = await req.json();
        if (!name || !subject) {
            return NextResponse.json({ error: "name and subject are required" }, { status: 400 });
        }

        const { data: suggestion, error } = await supabase
            .from("CurriculumSuggestion")
            .insert([{
                name,
                subject,
                gradeLevel: gradeLevel || null,
                description: description || null,
                pros: pros || null,
                cons: cons || null,
                cost: cost || null,
                rating: rating ? parseInt(rating) : null,
                format: format || null,
                website: website || null,
                authorId: user.id
            }])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, suggestion }, { status: 201 });
    } catch (error) {
        console.error("Curriculum Post Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
