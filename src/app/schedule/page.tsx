import { PrismaClient } from "@prisma/client";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function SchedulePage() {
    const events = await prisma.scheduleEvent.findMany({
        include: { user: true },
        orderBy: { startTime: 'asc' }
    });

    return (
        <div className="container" style={{ paddingTop: '2rem' }}>
            <h1 className="card-title" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Class Schedule</h1>

            <div className="grid">
                {events.map((event, idx) => {
                    const startDate = new Date(event.startTime);
                    const endDate = new Date(event.endTime);
                    const dayName = startDate.toLocaleDateString(undefined, { weekday: 'long' });
                    const timeRange = `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                    return (
                        <div key={idx} className="glass-card" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 'bold' }}>{dayName}</span>
                                <span style={{ color: 'var(--text-muted)' }}>{timeRange}</span>
                            </div>

                            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)', fontSize: '1.4rem' }}>{event.title}</h3>
                            <p style={{ margin: '0 0 1rem 0', lineHeight: 1.5 }}>{event.description}</p>

                            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Planned by: {event.user.name}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <button className="btn">Add New Class Schedule</button>
            </div>
        </div>
    );
}
