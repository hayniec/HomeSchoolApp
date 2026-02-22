"use client";

import { useState } from "react";
import * as Dialog from '@radix-ui/react-dialog';

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent, data: any) => void;
    loading: boolean;
    familyMembers: { id: string, name: string }[];
}

export function CreateScheduleModal({ isOpen, onClose, onSubmit, loading, familyMembers }: ScheduleModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [userId, setUserId] = useState(familyMembers[0]?.id || "");

    const handleSubmit = (e: React.FormEvent) => {
        onSubmit(e, { title, description, date, startTime, endTime, userId });
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
                    maxWidth: '500px',
                    maxHeight: '85vh',
                    padding: '2rem',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
                    zIndex: 51,
                    overflowY: 'auto'
                }}>
                    <Dialog.Title style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        Add New Class
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Who is this for?</label>
                            <select className="input" value={userId} onChange={e => setUserId(e.target.value)} required style={{ appearance: 'menulist' }}>
                                {familyMembers.map(member => (
                                    <option key={member.id} value={member.id}>{member.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Class / Event Title</label>
                            <input
                                type="text"
                                className="input"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Date</label>
                            <input
                                type="date"
                                className="input"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Start Time</label>
                                <input
                                    type="time"
                                    className="input"
                                    value={startTime}
                                    onChange={e => setStartTime(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>End Time</label>
                                <input
                                    type="time"
                                    className="input"
                                    value={endTime}
                                    onChange={e => setEndTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description (Optional)</label>
                            <textarea
                                className="input"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={3}
                                style={{ minHeight: '80px', paddingTop: '10px' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="button" className="btn btn-outline" onClick={onClose} style={{ flex: 1 }}>
                                Cancel
                            </button>
                            <button type="submit" className="btn" style={{ flex: 1 }} disabled={loading}>
                                {loading ? "Adding..." : "Add to Schedule"}
                            </button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
