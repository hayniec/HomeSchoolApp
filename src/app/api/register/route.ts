import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, name } = body;

        if (!email || !password) {
            return new NextResponse("Missing email or password", { status: 400 });
        }

        const exist = await prisma.user.findUnique({
            where: { email }
        });

        if (exist) {
            return new NextResponse("User already exists", { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
        });

        return NextResponse.json(user);
    } catch (error: any) {
        console.error("Register Error details:", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
