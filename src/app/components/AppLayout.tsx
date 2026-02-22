"use client";

import { useSession } from "next-auth/react";
import { Sidebar } from "./Sidebar";
import { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { Menu } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Prevent hydration mismatch by only rendering after mount
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const isMobile = useMediaQuery({ maxWidth: 768 });

    if (status === "loading" || !mounted) {
        return <main>{children}</main>;
    }

    if (!session) {
        return <main>{children}</main>;
    }

    return (
        <div className="layout-wrapper">
            {isMobile && (
                <>
                    <div className="mobile-top-bar">
                        <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)' }}>Homeschool Hub</h2>
                        <button className="mobile-nav-toggle" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                    </div>
                    <div
                        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
                        onClick={() => setIsSidebarOpen(false)}
                    />
                </>
            )}

            <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} isMobile={isMobile} />

            <main className="layout-main">
                {children}
            </main>
        </div>
    );
}
