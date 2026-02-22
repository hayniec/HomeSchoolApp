import { NextResponse } from "next/dist/server/web/spec-extension/response";
import { supabase } from "@/lib/supabase";
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

        const { title, description, date, startTime, endTime, userId } = await req.json();

        // Add the date component to the times to create valid ISO timestamps
        const fullStartTime = new Date(`${date}T${startTime}:00`).toISOString();
        const fullEndTime = new Date(`${date}T${endTime}:00`).toISOString();

        // 3. Create the schedule event 
        const { data: event, error: createError } = await supabase
            .from("ScheduleEvent")
            .insert([{
                title,
                description,
                startTime: fullStartTime,
                endTime: fullEndTime,
                userId: userId || parent.id // defaults to parent if no user specified
            }])
            .select()
            .single();

        if (createError) {
            console.error("Supabase Error:", createError);
            throw createError;
        }

        return NextResponse.json({ success: true, event }, { status: 201 });

    } catch (error: any) {
        console.error("Schedule Creation Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
