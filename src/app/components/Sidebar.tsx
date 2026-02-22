"use client";

import { MessageSquare, Calendar, BookOpen, User, LogOut, Home } from "lucide-react";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";

export function Sidebar() {
    const navItems = [
        { label: "Dashboard", icon: <Home size={20} />, active: true },
        { label: "Community Forum", icon: <MessageSquare size={20} /> },
        { label: "Schedule", icon: <Calendar size={20} /> },
        { label: "Resources", icon: <BookOpen size={20} /> },
        { label: "My Profile", icon: <User size={20} /> },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2 style={{ color: "white", margin: 0, textShadow: "0px 2px 4px rgba(0,0,0,0.3)" }}>HS Hub</h2>
            </div>

            <div className="sidebar-nav">
                {navItems.map((item, idx) => (
                    <div key={idx} className={`sidebar-item ${item.active ? "active" : ""}`}>
                        {item.icon}
                        <span style={{ fontWeight: 600 }}>{item.label}</span>
                    </div>
                ))}
            </div>

            <div className="sidebar-footer">
                <div style={{ marginBottom: "1rem" }}>
                    <ThemeToggle />
                </div>
                <div className="sidebar-item" onClick={() => signOut()}>
                    <LogOut size={20} />
                    <span style={{ fontWeight: 600 }}>Sign Out</span>
                </div>
            </div>
        </div>
    );
}
