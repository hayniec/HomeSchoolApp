"use client";

import { useState } from "react";
import * as Dialog from '@radix-ui/react-dialog';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent, data: any) => void;
    loading: boolean;
}

export function CreateChildModal({ isOpen, onClose, onSubmit, loading }: ModalProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [gradeLevel, setGradeLevel] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        onSubmit(e, { name, email, password, gradeLevel });
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
                        Create Student Account
                    </Dialog.Title>
                    <Dialog.Description style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                        Add a child to your homeschooling hub to manage their classes and track their progress.
                    </Dialog.Description>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Student Name</label>
                            <input
                                type="text"
                                className="input"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Student Email / Login</label>
                            <input
                                type="email"
                                className="input"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Password</label>
                            <input
                                type="password"
                                className="input"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Grade Level</label>
                            <select
                                className="input"
                                value={gradeLevel}
                                onChange={e => setGradeLevel(e.target.value)}
                                style={{ appearance: 'menulist' }}
                            >
                                <option value="" disabled>Select Grade Level</option>
                                <option value="Pre-K">Pre-K</option>
                                <option value="Kindergarten">Kindergarten</option>
                                <option value="1st Grade">1st Grade</option>
                                <option value="2nd Grade">2nd Grade</option>
                                <option value="3rd Grade">3rd Grade</option>
                                <option value="4th Grade">4th Grade</option>
                                <option value="5th Grade">5th Grade</option>
                                <option value="6th Grade">6th Grade</option>
                                <option value="7th Grade">7th Grade</option>
                                <option value="8th Grade">8th Grade</option>
                                <option value="9th Grade">9th Grade</option>
                                <option value="10th Grade">10th Grade</option>
                                <option value="11th Grade">11th Grade</option>
                                <option value="12th Grade">12th Grade</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="button" className="btn btn-outline" onClick={onClose} style={{ flex: 1 }}>
                                Cancel
                            </button>
                            <button type="submit" className="btn" style={{ flex: 1 }} disabled={loading}>
                                {loading ? "Creating..." : "Create Account"}
                            </button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
