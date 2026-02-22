import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding Database...");

    // Administrator Account
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
        where: { email: "admin@admin.com" },
        update: {
            role: "ADMIN",
            bio: "Site Administrator for Homeschool Hub",
            name: "Admin User",
        },
        create: {
            email: "admin@admin.com",
            name: "Admin User",
            password: hashedPassword,
            role: "ADMIN",
            bio: "Site Administrator for Homeschool Hub",
        },
    });

    console.log("Created/Updated Admin User:", admin.email);

    // Parent/Teacher Account
    const teacherPassword = await bcrypt.hash("teacher123", 10);
    const teacher = await prisma.user.upsert({
        where: { email: "teacher@test.com" },
        update: {},
        create: {
            email: "teacher@test.com",
            name: "Sarah Jenkins",
            password: teacherPassword,
            role: "PARENT",
            bio: "Homeschooling mom of 3. Love teaching math and science!",
        },
    });

    // Student Account
    const studentPassword = await bcrypt.hash("student123", 10);
    const student = await prisma.user.upsert({
        where: { email: "student@test.com" },
        update: {},
        create: {
            email: "student@test.com",
            name: "Tommy J.",
            password: studentPassword,
            role: "STUDENT",
            gradeLevel: "5th Grade",
            bio: "I like recess and learning about bugs.",
        },
    });

    // Clear existing items to avoid duplicates on multiple seed runs
    await prisma.forumPost.deleteMany({});
    await prisma.scheduleEvent.deleteMany({});
    await prisma.resource.deleteMany({});

    // Seed Forum Posts
    const post1 = await prisma.forumPost.create({
        data: {
            title: "Welcome to Homeschool Hub!",
            content: "Feel free to introduce yourself and start discussing!",
            authorId: admin.id,
            comments: {
                create: [
                    { content: "Thanks for setting this up!", authorId: teacher.id },
                    { content: "Hello everyone!", authorId: student.id },
                ],
            },
        },
    });

    const post2 = await prisma.forumPost.create({
        data: {
            title: "Best resources for 5th grade Math?",
            content: "Does anyone have good worksheets or curriculum recommendations?",
            authorId: teacher.id,
            comments: {
                create: [
                    { content: "I recommend checking out Khan Academy!", authorId: admin.id },
                ],
            },
        },
    });

    // Seed Schedule Events
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(10, 30, 0, 0);

    await prisma.scheduleEvent.create({
        data: {
            title: "Science Lab: Biology",
            description: "Microscope lesson",
            startTime: tomorrow,
            endTime: tomorrowEnd,
            userId: teacher.id,
        },
    });

    await prisma.scheduleEvent.create({
        data: {
            title: "Math Tutoring",
            description: "Fractions review",
            startTime: tomorrowEnd,
            endTime: new Date(tomorrowEnd.getTime() + 60 * 60 * 1000), // 1 hour later
            userId: student.id,
        },
    });

    // Seed Resources
    await prisma.resource.create({
        data: {
            title: "Printable Multiplication Tables",
            description: "PDF of times tables 1-12",
            url: "https://example.com/multiplication.pdf",
            category: "Math",
            uploadedById: teacher.id,
        },
    });

    await prisma.resource.create({
        data: {
            title: "Virtual Field Trip to the Smithsonian",
            description: "Interactive online tour",
            url: "https://naturalhistory.si.edu/visit/virtual-tour",
            category: "History",
            uploadedById: admin.id,
        },
    });

    console.log("Database Seeded with dummy data successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
