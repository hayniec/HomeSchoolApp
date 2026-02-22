import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        // Allow fallback for basic testing like before
        const email = session?.user?.email ?? "admin@admin.com";

        if (!email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: parent } = await supabase.from('User').select('id').eq('email', email).single();
        if (!parent) {
            return NextResponse.json({ error: "Parent not found" }, { status: 404 });
        }

        const { name, email: childEmail, password, gradeLevel } = await req.json();

        // 1. Check if the child email already exists
        const { data: exist } = await supabase
            .from("User")
            .select("*")
            .eq("email", childEmail)
            .single();

        if (exist) {
            return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
        }

        // 2. Hash the password securely
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create the child account and link it
        const { data: child, error: createError } = await supabase
            .from("User")
            .insert([{
                name,
                email: childEmail,
                password: hashedPassword,
                role: 'STUDENT',
                gradeLevel,
                parentId: parent.id
            }])
            .select()
            .single();

        if (createError) {
            console.error("Supabase Error:", createError);
            throw createError;
        }

        return NextResponse.json({ success: true, user: { id: child.id, name: child.name, email: child.email } }, { status: 201 });

    } catch (error: any) {
        console.error("Child Registration Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
