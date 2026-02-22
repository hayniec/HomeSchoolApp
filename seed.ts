import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dcenycnsjegpplffpqgk.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZW55Y25zamVncHBsZmZwcWdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NjEzNjgsImV4cCI6MjA4NzMzNzM2OH0.2WPtNPXiBhnWq4TVswH_pFvOre0zcdOintEpk-x1H8s';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
    console.log('Seeding Supabase Database...');

    // Create admin parent
    const hashedAdminPassword = await bcrypt.hash('password123', 10);
    let adminRes = await supabase.from('User').select('id').eq('email', 'admin@admin.com').single();
    let adminId = adminRes.data?.id;

    if (!adminId) {
        const { data, error } = await supabase.from('User').insert({
            name: 'Admin User',
            email: 'admin@admin.com',
            password: hashedAdminPassword,
            role: 'PARENT',
            bio: 'Homeschooling parent of 2.',
        }).select().single();
        if (error) throw error;
        adminId = data.id;
        console.log('Created Admin Parent.');
    }

    // Create child user
    const hashedChildPassword = await bcrypt.hash('password123', 10);
    let childRes = await supabase.from('User').select('id').eq('email', 'child@admin.com').single();
    let childId = childRes.data?.id;

    if (!childId) {
        const { data, error } = await supabase.from('User').insert({
            name: 'Student Child',
            email: 'child@admin.com',
            password: hashedChildPassword,
            role: 'STUDENT',
            gradeLevel: '5th Grade',
            bio: 'Learning math and science!',
            parentId: adminId
        }).select().single();
        if (error) throw error;
        childId = data.id;
        console.log('Created Child Student.');
    }

    // Create another student
    let peerRes = await supabase.from('User').select('id').eq('email', 'friend@school.com').single();
    let peerId = peerRes.data?.id;

    if (!peerId) {
        const { data, error } = await supabase.from('User').insert({
            name: 'Johnny Appleseed',
            email: 'friend@school.com',
            password: hashedChildPassword,
            role: 'STUDENT',
            gradeLevel: '5th Grade'
        }).select().single();
        if (error) throw error;
        peerId = data.id;
    }

    // Create a forum post
    let postRes = await supabase.from('ForumPost').select('id').eq('title', 'Welcome to Co-op Science!').single();
    let postId = postRes.data?.id;
    if (!postId) {
        const { data, error } = await supabase.from('ForumPost').insert({
            title: 'Welcome to Co-op Science!',
            content: 'We will be learning about the solar system this week. Does anyone have a good telescope?',
            authorId: adminId
        }).select().single();
        if (error) throw error;
        postId = data.id;

        // Create a reply
        await supabase.from('ForumComment').insert({
            content: 'I have one we can borrow!',
            postId: postId,
            authorId: peerId
        });
        console.log('Created Forum Post and Comment.');
    }

    // Create resources
    let resourceRes = await supabase.from('Resource').select('id').eq('category', 'Science').single();
    if (!resourceRes.data) {
        await supabase.from('Resource').insert([
            { title: 'NASA Solar System Explorer', url: 'https://solarsystem.nasa.gov', category: 'Science', description: 'Interactive maps of the planets.', uploadedById: adminId },
            { title: 'Khan Academy Math', url: 'https://khanacademy.org', category: 'Math', description: 'Great 5th grade curriculum prep.', uploadedById: adminId }
        ]);
        console.log('Created Resources.');
    }

    // Create schedules (some for parent, some for child)
    let scheduleRes = await supabase.from('ScheduleEvent').select('id').eq('userId', childId).limit(1);
    if (scheduleRes.data?.length === 0) {
        const tomorrowMorning = new Date();
        tomorrowMorning.setDate(tomorrowMorning.getDate() + 1);
        tomorrowMorning.setHours(9, 0, 0, 0);

        const tomorrowNoon = new Date(tomorrowMorning);
        tomorrowNoon.setHours(10, 30, 0, 0);

        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(13, 0, 0, 0);

        const nextWeekEnd = new Date(nextWeek);
        nextWeekEnd.setHours(14, 0, 0, 0);

        await supabase.from('ScheduleEvent').insert([
            { title: 'Science Lab - Solar System', description: 'Building the diorama.', startTime: tomorrowMorning.toISOString(), endTime: tomorrowNoon.toISOString(), userId: childId },
            { title: 'History Lesson', description: 'Reading Chapter 4.', startTime: nextWeek.toISOString(), endTime: nextWeekEnd.toISOString(), userId: childId },
            { title: 'Parent Grading Time', description: 'Review math worksheet.', startTime: nextWeek.toISOString(), endTime: nextWeekEnd.toISOString(), userId: adminId }
        ]);
        console.log('Created Schedule Events.');
    }

    console.log('Done seeding Supabase database!');
}

main().catch(console.error);
