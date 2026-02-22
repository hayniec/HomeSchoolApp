"use client";

import { useSession } from "next-auth/react";
import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();

    if (status === "loading") {
        // Return early to prevent layout shift during session check
        return <main>{children}</main>;
    }

    if (!session) {
        return <main>{children}</main>;
    }

    return (
        <div className="layout-wrapper">
            <Sidebar />
            <main className="layout-main">
                {children}
            </main>
        </div>
    );
}
