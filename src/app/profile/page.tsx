import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function ProfilePage() {
    // Note: We'd normally use the session to get the logged-in user's profile,
    // but without full auth configuration here, we'll just mock it to the first user for display purposes
    const session = await getServerSession();

    // Fallback to admin if session is null during isolated testing
    const email = session?.user?.email ?? "admin@admin.com";

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            forumPosts: true,
            resources: true,
        }
    });

    if (!user) {
        return <div className="container">User not found.</div>;
    }

    return (
        <div className="container" style={{ paddingTop: '2rem', maxWidth: '800px' }}>
            <h1 className="card-title" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>My Profile</h1>

            <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'white', fontWeight: 'bold' }}>
                    {user.name?.[0]?.toUpperCase() || 'U'}
                </div>

                <h2 style={{ margin: 0, fontSize: '2rem' }}>{user.name}</h2>
                <div style={{ background: 'var(--border-color)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {user.role}
                </div>

                <p style={{ margin: '1rem 0 0 0', textAlign: 'center', lineHeight: 1.6, maxWidth: '500px' }}>
                    {user.bio || "No bio added yet."}
                </p>

                {user.gradeLevel && (
                    <div style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                        <strong>Grade:</strong> {user.gradeLevel}
                    </div>
                )}

                <div style={{ marginTop: '2rem', width: '100%' }}>
                    <button className="btn btn-outline" style={{ width: '100%' }}>Edit Profile Settings</button>
                </div>
            </div>

            <div className="grid">
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Forum Posts</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {user.forumPosts.length}
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Resources Shared</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {user.resources.length}
                    </div>
                </div>
            </div>
        </div>
    );
}
