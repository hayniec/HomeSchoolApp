"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Shield, Clock, MapPin } from "lucide-react";

interface DeletionLog {
    id: string;
    tripTitle: string;
    tripCategory: string;
    tripCity: string;
    tripState: string;
    deletedById: string;
    deletedByName: string;
    deletedByRole: string;
    createdById: string;
    createdByName: string;
    reason: string | null;
    deletedAt: string;
}

export default function AdminPage() {
    const { data: session, status } = useSession();
    const isAdmin = (session?.user as any)?.role === "ADMIN";
    const [logs, setLogs] = useState<DeletionLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") return;
        if (!isAdmin) {
            setLoading(false);
            return;
        }
        fetch("/api/field-trips/deletion-log?scope=admin")
            .then((r) => r.json())
            .then((data) => setLogs(data.logs || []))
            .finally(() => setLoading(false));
    }, [status, isAdmin]);

    if (status === "loading" || loading) {
        return (
            <div className="container" style={{ paddingTop: "2rem", textAlign: "center" }}>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="container" style={{ paddingTop: "2rem", textAlign: "center" }}>
                <Shield size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
                <h2 style={{ color: "var(--text-muted)" }}>Access Denied</h2>
                <p style={{ color: "var(--text-muted)" }}>This page is restricted to administrators.</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
                <Shield size={28} style={{ color: "var(--primary)" }} />
                <h1 className="card-title" style={{ fontSize: "2.5rem", margin: 0 }}>Admin Dashboard</h1>
            </div>

            <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
                <h2 style={{ margin: "0 0 1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1.3rem" }}>
                    <Clock size={20} /> Field Trip Deletion Log
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0 0 1rem" }}>
                    Complete history of all deleted field trips across all users.
                </p>

                {logs.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem" }}>
                        <p style={{ color: "var(--text-muted)" }}>No deletions recorded yet.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                            <thead>
                                <tr style={{ borderBottom: "2px solid var(--border-color, rgba(255,255,255,0.1))" }}>
                                    <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600 }}>Trip</th>
                                    <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600 }}>Location</th>
                                    <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600 }}>Deleted By</th>
                                    <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600 }}>Created By</th>
                                    <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600 }}>Reason</th>
                                    <th style={{ textAlign: "left", padding: "0.75rem 0.5rem", color: "var(--text-muted)", fontWeight: 600 }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id} style={{ borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.05))" }}>
                                        <td style={{ padding: "0.75rem 0.5rem" }}>
                                            <strong>{log.tripTitle}</strong>
                                            <br />
                                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{log.tripCategory}</span>
                                        </td>
                                        <td style={{ padding: "0.75rem 0.5rem" }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                                <MapPin size={12} /> {log.tripCity}, {log.tripState}
                                            </span>
                                        </td>
                                        <td style={{ padding: "0.75rem 0.5rem" }}>
                                            {log.deletedByName || "Unknown"}
                                            {log.deletedByRole === "ADMIN" && (
                                                <span style={{
                                                    background: "rgba(220, 38, 38, 0.15)",
                                                    color: "#dc2626",
                                                    padding: "2px 8px",
                                                    borderRadius: "10px",
                                                    fontSize: "0.7rem",
                                                    fontWeight: 600,
                                                    marginLeft: "0.5rem",
                                                }}>
                                                    ADMIN
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ padding: "0.75rem 0.5rem" }}>
                                            {log.createdByName || "Unknown"}
                                        </td>
                                        <td style={{ padding: "0.75rem 0.5rem", color: log.reason ? "inherit" : "var(--text-muted)" }}>
                                            {log.reason || "—"}
                                        </td>
                                        <td style={{ padding: "0.75rem 0.5rem", whiteSpace: "nowrap", fontSize: "0.85rem" }}>
                                            {new Date(log.deletedAt).toLocaleDateString("en-US", {
                                                month: "short", day: "numeric", year: "numeric",
                                            })}
                                            <br />
                                            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                                                {new Date(log.deletedAt).toLocaleTimeString("en-US", {
                                                    hour: "numeric", minute: "2-digit",
                                                })}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
