"use client";

import { useState } from "react";
import { CreateChildModal } from "../components/CreateChildModal";
import { CreateScheduleModal } from "../components/CreateScheduleModal";
import { useRouter } from "next/navigation";

interface ProfileClientActionsProps {
    familyMembers: { id: string, name: string }[];
}

export default function ProfileClientActions({ familyMembers }: ProfileClientActionsProps) {
    const [isChildModalOpen, setIsChildModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCreateChild = async (e: React.FormEvent, data: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/children', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                setIsChildModalOpen(false);
                router.refresh(); // Refresh page to show new child
            } else {
                const err = await res.json();
                alert(err.error || "Failed to create account");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSchedule = async (e: React.FormEvent, data: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                setIsScheduleModalOpen(false);
                router.refresh(); // Refresh page to show new schedule event
            } else {
                const err = await res.json();
                alert(err.error || "Failed to create event");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <button className="btn" style={{ width: '100%' }} onClick={() => setIsChildModalOpen(true)}>
                + Create Student Account
            </button>
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setIsScheduleModalOpen(true)}>
                + Add Class to Schedule
            </button>

            <CreateChildModal
                isOpen={isChildModalOpen}
                onClose={() => setIsChildModalOpen(false)}
                onSubmit={handleCreateChild}
                loading={loading}
            />

            <CreateScheduleModal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                onSubmit={handleCreateSchedule}
                loading={loading}
                familyMembers={familyMembers}
            />
        </div>
    );
}
