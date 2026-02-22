"use client";

import { MessageSquare, Calendar, BookOpen, User, LogOut, Home } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface SidebarProps {
    isOpen?: boolean;
    closeSidebar?: () => void;
    isMobile?: boolean;
}

export function Sidebar({ isOpen, closeSidebar, isMobile }: SidebarProps) {
    const pathname = usePathname();

    const navItems = [
        { label: "Dashboard", href: "/", icon: <Home size={20} /> },
        { label: "Community Forum", href: "/forum", icon: <MessageSquare size={20} /> },
        { label: "Schedule", href: "/schedule", icon: <Calendar size={20} /> },
        { label: "Resources", href: "/resources", icon: <BookOpen size={20} /> },
        { label: "My Profile", href: "/profile", icon: <User size={20} /> },
    ];

    return (
        <div className={`sidebar ${isOpen && isMobile ? 'open' : ''}`}>
            {isMobile && closeSidebar && (
                <button
                    onClick={closeSidebar}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}
                    aria-label="Close Sidebar"
                >
                    <LogOut size={24} style={{ transform: 'rotate(180deg)' }} />
                </button>
            )}
            <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 10px' }}>
                <Link href="/">
                    <Image
                        src="/HomeschoolHubLogo.svg"
                        alt="Homeschool Hub Logo"
                        width={180}
                        height={90}
                        style={{ borderRadius: '12px', objectFit: 'contain' }}
                        priority
                    />
                </Link>
            </div>

            <div className="sidebar-nav">
                {navItems.map((item, idx) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={idx} href={item.href} style={{ textDecoration: 'none' }} onClick={() => { if (isMobile && closeSidebar) closeSidebar(); }}>
                            <div className={`sidebar-item ${isActive ? "active" : ""}`}>
                                {item.icon}
                                <span style={{ fontWeight: 600 }}>{item.label}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className="sidebar-footer">
                <div className="sidebar-item" onClick={() => signOut()}>
                    <LogOut size={20} />
                    <span style={{ fontWeight: 600 }}>Sign Out</span>
                </div>
            </div>
        </div>
    );
}
