"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg" style={{ background: 'oklch(0.72 0.2 270 / 0.1)' }} />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
      style={{
        background: 'oklch(0.72 0.2 270 / 0.1)',
        color: 'var(--sidebar-foreground)',
        border: '1px solid oklch(0.72 0.2 270 / 0.2)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'oklch(0.72 0.2 270 / 0.2)';
        e.currentTarget.style.boxShadow = '0 0 12px oklch(0.72 0.2 270 / 0.3)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'oklch(0.72 0.2 270 / 0.1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {isDark
        ? <Sun  className="h-4 w-4 transition-all duration-300 rotate-0 scale-100" />
        : <Moon className="h-4 w-4 transition-all duration-300 rotate-0 scale-100" />
      }
    </button>
  );
}