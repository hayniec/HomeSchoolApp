import { getServerSession } from "next-auth";
import { supabase } from "@/lib/supabase";
import ProfileClientActions from "./ProfileClientActions";
import StudentList from "./StudentList";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const session = await getServerSession();
    const email = session?.user?.email ?? "admin@admin.com";

    const { data: rawUser } = await supabase
        .from("User")
        .select(`
            *,
            forumPosts:ForumPost(id),
            resources:Resource(id)
        `)
        .eq("email", email)
        .single();

    const user = rawUser as any;
    if (!user) {
        return <div className="container">User not found.</div>;
    }

    // Fetch children profiles
    const { data: rawChildren } = await supabase
        .from("User")
        .select("*")
        .eq("parentId", user.id);
    const children = rawChildren as any[] || [];

    // Fetch schedule events for parent and all children
    const userIds = [user.id, ...children.map(c => c.id)];
    const { data: rawEvents } = await supabase
        .from("ScheduleEvent")
        .select("*")
        .in("userId", userIds)
        .order("startTime", { ascending: true });
    const events = rawEvents as any[] || [];

    // Function to render schedule items
    const renderSchedule = (title: string, ownerId: string) => {
        const ownerEvents = events.filter(e => e.userId === ownerId);
        return (
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary)', fontSize: '1.4rem' }}>{title} Schedule</h3>
                {ownerEvents.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No classes scheduled yet.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {ownerEvents.map(event => {
                            const startDate = new Date(event.startTime);
                            const endDate = new Date(event.endTime);
                            const dayName = startDate.toLocaleDateString(undefined, { weekday: 'long' });
                            const timeRange = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                            return (
                                <div key={event.id} style={{ padding: '1rem', background: 'var(--input-bg)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        <span style={{ fontWeight: 'bold' }}>{dayName}</span>
                                        <span>{timeRange}</span>
                                    </div>
                                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{event.title}</h4>
                                    {event.description && <p style={{ margin: 0, fontSize: '0.9rem' }}>{event.description}</p>}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="container" style={{ paddingTop: '2rem', maxWidth: '900px' }}>
            <h1 className="card-title" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>My Profile</h1>

            <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'white', fontWeight: 'bold' }}>
                    {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <h2 style={{ margin: 0, fontSize: '2rem' }}>{user.name}</h2>
                <div style={{ background: 'var(--border-color)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.9rem', fontWeight: 'bold' }}>{user.role}</div>
                <p style={{ margin: '1rem 0 0 0', textAlign: 'center', lineHeight: 1.6, maxWidth: '500px' }}>{user.bio || "No bio added yet."}</p>
                {user.role === 'PARENT' && (
                    <div style={{ marginTop: '1rem', width: '100%', maxWidth: '300px' }}>
                        <ProfileClientActions familyMembers={[{ id: user.id, name: user.name }, ...children.map(c => ({ id: c.id, name: c.name }))]} />
                    </div>
                )}
            </div>

            <div className="grid">
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Forum Posts</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{user.forumPosts?.length || 0}</div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Resources Shared</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{user.resources?.length || 0}</div>
                </div>
            </div>

            <h2 style={{ fontSize: '2rem', marginTop: '3rem', marginBottom: '1.5rem' }}>Student Profiles</h2>
            <StudentList
                childrenProfiles={children}
                events={events}
                parentId={user.id}
                parentName={user.name || "Parent"}
            />

            <h2 style={{ fontSize: '2rem', marginTop: '2rem', marginBottom: '1.5rem' }}>My Schedule</h2>
            {renderSchedule("My", user.id)}

        </div>
    );
}
