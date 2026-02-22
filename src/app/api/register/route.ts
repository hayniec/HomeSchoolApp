import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, name } = body;

        if (!email || !password) {
            return new NextResponse("Missing email or password", { status: 400 });
        }

        const { data: exist } = await supabase
            .from("User")
            .select("*")
            .eq("email", email)
            .single();

        if (exist) {
            return new NextResponse("User already exists", { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { data: user, error: createError } = await supabase
            .from("User")
            .insert([{ name, email, password: hashedPassword }])
            .select()
            .single();

        if (createError) {
            throw createError;
        }

        return NextResponse.json(user);
    } catch (error: any) {
        console.error("Register Error details:", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
