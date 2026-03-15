"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Mail, Check, X, UserPlus } from "lucide-react";

interface Group {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    createdBy: { id: string; name: string };
    memberRole: string;
    memberCount: number;
}

interface Invitation {
    id: string;
    group: { id: string; name: string; description: string };
    invitedBy: { id: string; name: string };
    createdAt: string;
}

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [showInvite, setShowInvite] = useState<string | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const fetchGroups = async () => {
        const res = await fetch("/api/groups");
        const data = await res.json();
        setGroups(data.groups || []);
    };

    const fetchInvitations = async () => {
        const res = await fetch("/api/groups/invite");
        const data = await res.json();
        setInvitations(data.invitations || []);
    };

    const fetchMembers = async (groupId: string) => {
        const res = await fetch(`/api/groups/members?groupId=${groupId}`);
        const data = await res.json();
        setMembers(data.members || []);
    };

    useEffect(() => {
        Promise.all([fetchGroups(), fetchInvitations()]).then(() => setLoading(false));
    }, []);

    const createGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/groups", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description }),
        });
        if (res.ok) {
            setName("");
            setDescription("");
            setShowCreate(false);
            fetchGroups();
        }
    };

    const sendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/groups/invite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ groupId: showInvite, invitedEmail: inviteEmail }),
        });
        const data = await res.json();
        if (res.ok) {
            setInviteEmail("");
            setShowInvite(null);
            setMessage("Invitation sent!");
            setTimeout(() => setMessage(""), 3000);
        } else {
            setMessage(data.error || "Failed to send invite");
            setTimeout(() => setMessage(""), 3000);
        }
    };

    const handleInvitation = async (invitationId: string, action: string) => {
        await fetch("/api/groups/invite", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ invitationId, action }),
        });
        fetchInvitations();
        fetchGroups();
    };

    const selectGroup = (groupId: string) => {
        if (selectedGroup === groupId) {
            setSelectedGroup(null);
            setMembers([]);
        } else {
            setSelectedGroup(groupId);
            fetchMembers(groupId);
        }
    };

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: "2rem", textAlign: "center" }}>
                <p>Loading groups...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
                <h1 className="card-title" style={{ fontSize: "2.5rem", margin: 0 }}>Co-op Groups</h1>
                <button className="btn" onClick={() => setShowCreate(!showCreate)} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Plus size={20} /> Create Group
                </button>
            </div>

            {message && (
                <div className="glass-card" style={{ padding: "1rem", marginBottom: "1rem", textAlign: "center", color: "var(--primary)" }}>
                    {message}
                </div>
            )}

            {/* Pending Invitations */}
            {invitations.length > 0 && (
                <div style={{ marginBottom: "2rem" }}>
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Pending Invitations</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {invitations.map((inv) => (
                            <div key={inv.id} className="glass-card" style={{ padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                                <div>
                                    <h3 style={{ margin: "0 0 0.25rem 0", color: "var(--primary)" }}>{inv.group.name}</h3>
                                    <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>
                                        Invited by {inv.invitedBy.name}
                                    </p>
                                </div>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button className="btn" onClick={() => handleInvitation(inv.id, "ACCEPTED")} style={{ padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                        <Check size={16} /> Accept
                                    </button>
                                    <button className="btn btn-outline" onClick={() => handleInvitation(inv.id, "DECLINED")} style={{ padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                        <X size={16} /> Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Group Form */}
            {showCreate && (
                <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
                    <h2 style={{ margin: "0 0 1rem 0", color: "var(--primary)" }}>Create New Group</h2>
                    <form onSubmit={createGroup}>
                        <input className="input" placeholder="Group name" value={name} onChange={(e) => setName(e.target.value)} required />
                        <textarea className="input" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ resize: "vertical" }} />
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button type="submit" className="btn">Create</button>
                            <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Invite Form */}
            {showInvite && (
                <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
                    <h2 style={{ margin: "0 0 1rem 0", color: "var(--primary)" }}>Invite Member</h2>
                    <form onSubmit={sendInvite} style={{ display: "flex", gap: "0.5rem", alignItems: "start" }}>
                        <input className="input" type="email" placeholder="Email address" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required style={{ marginBottom: 0, flex: 1 }} />
                        <button type="submit" className="btn">Send</button>
                        <button type="button" className="btn btn-outline" onClick={() => setShowInvite(null)}>Cancel</button>
                    </form>
                </div>
            )}

            {/* Groups List */}
            {groups.length === 0 ? (
                <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
                    <Users size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
                    <h2 style={{ color: "var(--text-muted)" }}>No groups yet</h2>
                    <p style={{ color: "var(--text-muted)" }}>Create a group or accept an invitation to get started.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {groups.map((group) => (
                        <div key={group.id} className="glass-card" style={{ padding: "1.5rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "1rem" }}>
                                <div style={{ flex: 1, cursor: "pointer" }} onClick={() => selectGroup(group.id)}>
                                    <h2 style={{ margin: "0 0 0.25rem 0", color: "var(--primary)" }}>{group.name}</h2>
                                    <p style={{ margin: "0 0 0.5rem 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                        Created by {group.createdBy.name} &bull; {group.memberCount} member{group.memberCount !== 1 ? "s" : ""}
                                    </p>
                                    {group.description && <p style={{ margin: 0, lineHeight: 1.6 }}>{group.description}</p>}
                                </div>
                                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                                    <button className="btn btn-outline" onClick={() => setShowInvite(showInvite === group.id ? null : group.id)} style={{ padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.9rem" }}>
                                        <UserPlus size={16} /> Invite
                                    </button>
                                </div>
                            </div>

                            {/* Expanded members view */}
                            {selectedGroup === group.id && (
                                <div style={{ marginTop: "1.5rem", padding: "1rem", background: "var(--input-bg)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                                    <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>Members</h3>
                                    {members.map((member) => (
                                        <div key={member.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid var(--border-color)" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.8rem" }}>
                                                    {member.user.name?.[0]?.toUpperCase() || "U"}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{member.user.name}</span>
                                            </div>
                                            <span style={{ fontSize: "0.8rem", background: member.role === "ADMIN" ? "var(--primary)" : "var(--border-color)", color: member.role === "ADMIN" ? "white" : "var(--text-main)", padding: "2px 10px", borderRadius: "12px", fontWeight: "bold" }}>
                                                {member.role}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
