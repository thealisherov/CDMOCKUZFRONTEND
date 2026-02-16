"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Headphones, PenTool, Mic, MessageCircle, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const navigation = [
  { name: "Reading", href: "/dashboard/reading", icon: BookOpen, locked: false },
  { name: "Listening", href: "/dashboard/listening", icon: Headphones, locked: false },
  { name: "Writing", href: "/dashboard/writing", icon: PenTool, locked: false },
  { name: "Speaking", href: "#", icon: Mic, locked: true, badge: "Soon" },
  { name: "Comments", href: "/dashboard/comments", icon: MessageCircle, locked: false },
];

export default function Sidebar({ collapsed, onToggle }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = (e, item) => {
    if (item.locked) {
      e.preventDefault();
    }
  };

  const isActive = (href) => {
    if (href === "#") return false;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-full w-full flex-col bg-background border-r">
      {/* Logo + Collapse Toggle */}
      <div className="flex h-16 items-center border-b px-3 justify-between">
        <Link href="/" className={cn("flex items-center gap-2 font-bold text-xl overflow-hidden", collapsed && "justify-center w-full")}>
          <span className="text-primary text-2xl shrink-0">I</span>
          {!collapsed && (
            <>
              <span className="text-primary text-2xl -ml-1.5">ELTS</span>
              <span className="text-foreground">PREP</span>
            </>
          )}
        </Link>
        {/* Collapse button — only on desktop */}
        {onToggle && (
          <button
            onClick={onToggle}
            className={cn(
              "hidden md:flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all shrink-0",
              collapsed && "absolute -right-3 top-4 bg-background border shadow-sm z-50 h-6 w-6 rounded-full"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 py-4 space-y-1", collapsed ? "px-2" : "px-3")}>
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => handleNavClick(e, item)}
              title={collapsed ? item.name : undefined}
              className={cn(
                "group flex items-center rounded-lg text-sm font-medium transition-all relative",
                collapsed ? "justify-center px-0 py-3" : "justify-between px-4 py-3",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/70 hover:bg-secondary hover:text-foreground",
                item.locked && "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-foreground/70"
              )}
            >
              <div className={cn("flex items-center", collapsed ? "gap-0" : "gap-3")}>
                <item.icon className={cn("h-5 w-5 shrink-0", active ? "text-primary-foreground" : "text-foreground/50")} />
                {!collapsed && <span>{item.name}</span>}
              </div>
              {!collapsed && item.badge && (
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-muted-foreground"
                )}>
                  {item.badge}
                </span>
              )}
              {/* Tooltip for collapsed mode */}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-popover text-popover-foreground text-xs font-medium shadow-md border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.name}
                  {item.badge && <span className="ml-1 text-muted-foreground">({item.badge})</span>}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className={cn("border-t p-3", collapsed ? "space-y-3" : "space-y-2")}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => router.push("/")}
              title="Sign Out"
              className="flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-2">
            <ThemeToggle />
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
