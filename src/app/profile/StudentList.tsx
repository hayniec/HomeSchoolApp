"use client";

import { useState } from "react";
import * as Dialog from '@radix-ui/react-dialog';
import { useRouter } from "next/navigation";

interface StudentListProps {
    childrenProfiles: any[];
    events: any[];
    parentId: string;
    parentName: string;
}

export default function StudentList({ childrenProfiles, events, parentId, parentName }: StudentListProps) {
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async (childId: string) => {
        if (!confirm("Are you sure you want to remove this student profile? This action cannot be undone.")) return;

        setIsDeleting(true);
        try {
            const res = await fetch("/api/children", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ childId }),
            });
            if (res.ok) {
                setSelectedStudent(null);
                router.refresh();
            } else {
                alert("Failed to remove student.");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while trying to remove the student.");
        } finally {
            setIsDeleting(false);
        }
    };

    const renderSchedule = (title: string, ownerId: string) => {
        const ownerEvents = events.filter(e => e.userId === ownerId);
        return (
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: 'var(--primary)', fontSize: '1.2rem' }}>{title} Schedule</h3>
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

    if (childrenProfiles.length === 0) {
        return (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                No student profiles linked to this account.
            </div>
        );
    }

    return (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {childrenProfiles.map(child => (
                    <div
                        key={child.id}
                        className="glass-card"
                        style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s', ...({ ':hover': { transform: 'scale(1.02)' } } as any) }}
                        onClick={() => setSelectedStudent(child)}
                    >
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ffffff', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '1rem' }}>
                            {child.name?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <h3 style={{ margin: '0 0 0.5rem 0' }}>{child.name}</h3>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{child.gradeLevel || 'Student'}</span>
                    </div>
                ))}
            </div>

            <Dialog.Root open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 50
                    }} />
                    <Dialog.Content style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90vw',
                        maxWidth: '600px',
                        maxHeight: '85vh',
                        padding: '2rem',
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
                        zIndex: 51,
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <Dialog.Title style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {selectedStudent?.name}'s View
                            </Dialog.Title>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    className="btn btn-outline"
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                                    onClick={() => handleDelete(selectedStudent.id)}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? "Removing..." : "Remove Student"}
                                </button>
                                <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setSelectedStudent(null)}>Close</button>
                            </div>
                        </div>

                        {selectedStudent && renderSchedule(`${selectedStudent.name}'s`, selectedStudent.id)}
                        {renderSchedule(`${parentName}'s (Parent)`, parentId)}

                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
}
