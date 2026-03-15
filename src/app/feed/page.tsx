"use client";

import { useEffect, useState } from "react";
import { Megaphone, Calendar, MessageSquare, ThumbsUp, Plus, Send } from "lucide-react";

interface FeedItem {
    id: string;
    type: string;
    title: string;
    content: string;
    eventDate: string | null;
    createdAt: string;
    author: { id: string; name: string };
    group: { id: string; name: string };
    rsvps: { id: string; status: string; user: { id: string; name: string } }[];
}

interface Group {
    id: string;
    name: string;
}

const TYPE_CONFIG: Record<string, { icon: any; label: string; color: string }> = {
    ANNOUNCEMENT: { icon: Megaphone, label: "Announcement", color: "#FF6B6B" },
    EVENT: { icon: Calendar, label: "Event", color: "#4ecdc4" },
    UPDATE: { icon: MessageSquare, label: "Update", color: "#45b7d1" },
};

export default function FeedPage() {
    const [items, setItems] = useState<FeedItem[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string>("");
    const [showCreate, setShowCreate] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form state
    const [type, setType] = useState("UPDATE");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [groupId, setGroupId] = useState("");
    const [eventDate, setEventDate] = useState("");

    const fetchFeed = async (gId?: string) => {
        const url = gId ? `/api/feed?groupId=${gId}` : "/api/feed";
        const res = await fetch(url);
        const data = await res.json();
        setItems(data.items || []);
    };

    const fetchGroups = async () => {
        const res = await fetch("/api/groups");
        const data = await res.json();
        setGroups(data.groups || []);
        if (data.groups?.length > 0) {
            setGroupId(data.groups[0].id);
        }
    };

    useEffect(() => {
        Promise.all([fetchFeed(), fetchGroups()]).then(() => setLoading(false));
    }, []);

    const handleFilterChange = (gId: string) => {
        setSelectedGroup(gId);
        fetchFeed(gId || undefined);
    };

    const createPost = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/feed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, title, content, groupId, eventDate: eventDate || null }),
        });
        if (res.ok) {
            setTitle("");
            setContent("");
            setEventDate("");
            setShowCreate(false);
            fetchFeed(selectedGroup || undefined);
        }
    };

    const handleRsvp = async (feedItemId: string, status: string) => {
        await fetch("/api/feed/rsvp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ feedItemId, status }),
        });
        fetchFeed(selectedGroup || undefined);
    };

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: "2rem", textAlign: "center" }}>
                <p>Loading feed...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
                <h1 className="card-title" style={{ fontSize: "2.5rem", margin: 0 }}>Activity Feed</h1>
                {groups.length > 0 && (
                    <button className="btn" onClick={() => setShowCreate(!showCreate)} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Plus size={20} /> New Post
                    </button>
                )}
            </div>

            {/* Group filter */}
            {groups.length > 0 && (
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                    <button className={`btn ${!selectedGroup ? "" : "btn-outline"}`} onClick={() => handleFilterChange("")} style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
                        All Groups
                    </button>
                    {groups.map((g) => (
                        <button key={g.id} className={`btn ${selectedGroup === g.id ? "" : "btn-outline"}`} onClick={() => handleFilterChange(g.id)} style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
                            {g.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Create Post Form */}
            {showCreate && (
                <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
                    <h2 style={{ margin: "0 0 1rem 0", color: "var(--primary)" }}>Create Post</h2>
                    <form onSubmit={createPost}>
                        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                            {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                                <button key={key} type="button" className={`btn ${type === key ? "" : "btn-outline"}`} onClick={() => setType(key)} style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                                    {config.label}
                                </button>
                            ))}
                        </div>
                        <select className="input" value={groupId} onChange={(e) => setGroupId(e.target.value)} required>
                            <option value="">Select group...</option>
                            {groups.map((g) => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                        <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        <textarea className="input" placeholder="Content (optional)" value={content} onChange={(e) => setContent(e.target.value)} rows={3} style={{ resize: "vertical" }} />
                        {type === "EVENT" && (
                            <input className="input" type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                        )}
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button type="submit" className="btn" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <Send size={16} /> Post
                            </button>
                            <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Feed Items */}
            {groups.length === 0 ? (
                <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
                    <MessageSquare size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
                    <h2 style={{ color: "var(--text-muted)" }}>Join a group to see the feed</h2>
                    <p style={{ color: "var(--text-muted)" }}>Activity from your co-op groups will appear here.</p>
                </div>
            ) : items.length === 0 ? (
                <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
                    <Megaphone size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
                    <h2 style={{ color: "var(--text-muted)" }}>No activity yet</h2>
                    <p style={{ color: "var(--text-muted)" }}>Be the first to post an update or announcement!</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {items.map((item) => {
                        const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.UPDATE;
                        const Icon = config.icon;
                        const goingCount = item.rsvps?.filter((r) => r.status === "GOING").length || 0;
                        const maybeCount = item.rsvps?.filter((r) => r.status === "MAYBE").length || 0;

                        return (
                            <div key={item.id} className="glass-card" style={{ padding: "1.5rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: config.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Icon size={18} color="white" />
                                    </div>
                                    <div>
                                        <span style={{ fontWeight: "bold", fontSize: "0.85rem", color: config.color }}>{config.label}</span>
                                        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}> in {item.group.name}</span>
                                    </div>
                                </div>

                                <h2 style={{ margin: "0 0 0.5rem 0" }}>{item.title}</h2>
                                <p style={{ margin: "0 0 0.5rem 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                    Posted by {item.author.name} &bull; {new Date(item.createdAt).toLocaleDateString()}
                                </p>
                                {item.content && <p style={{ margin: "0 0 1rem 0", lineHeight: 1.6 }}>{item.content}</p>}

                                {item.type === "EVENT" && item.eventDate && (
                                    <div style={{ background: "var(--input-bg)", padding: "0.75rem 1rem", borderRadius: "12px", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <Calendar size={16} color="var(--primary)" />
                                        <span style={{ fontWeight: 600 }}>{new Date(item.eventDate).toLocaleString()}</span>
                                    </div>
                                )}

                                {item.type === "EVENT" && (
                                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                                        <button className="btn" onClick={() => handleRsvp(item.id, "GOING")} style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
                                            Going ({goingCount})
                                        </button>
                                        <button className="btn btn-outline" onClick={() => handleRsvp(item.id, "MAYBE")} style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
                                            Maybe ({maybeCount})
                                        </button>
                                        <button className="btn btn-outline" onClick={() => handleRsvp(item.id, "NOT_GOING")} style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}>
                                            Can&apos;t Go
                                        </button>
                                    </div>
                                )}

                                {item.type !== "EVENT" && item.rsvps?.length > 0 && (
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                        <ThumbsUp size={14} />
                                        <span>{item.rsvps.length} response{item.rsvps.length !== 1 ? "s" : ""}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
