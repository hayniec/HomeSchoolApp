"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div style={{ width: 32, height: 32 }} />;

    return (
        <div style={{ display: 'flex', gap: '8px', background: 'var(--card-bg)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <button
                style={{ background: theme === 'light' ? 'var(--primary)' : 'transparent', color: theme === 'light' ? 'white' : 'var(--text-main)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}
                onClick={() => setTheme('light')}
                title="Light Mode"
            >
                <Sun size={18} />
            </button>
            <button
                style={{ background: theme === 'dark' ? 'var(--primary)' : 'transparent', color: theme === 'dark' ? 'white' : 'var(--text-main)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}
                onClick={() => setTheme('dark')}
                title="Dark Mode"
            >
                <Moon size={18} />
            </button>
            <button
                style={{ background: theme === 'system' ? 'var(--primary)' : 'transparent', color: theme === 'system' ? 'white' : 'var(--text-main)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}
                onClick={() => setTheme('system')}
                title="System Preference"
            >
                <Monitor size={18} />
            </button>
        </div>
    );
}
