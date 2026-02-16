"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Headphones, PenTool, Mic, MessageCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

const navigation = [
  { name: "Reading", href: "/dashboard/reading", icon: BookOpen, locked: false },
  { name: "Listening", href: "/dashboard/listening", icon: Headphones, locked: false },
  { name: "Writing", href: "/dashboard/writing", icon: PenTool, locked: false },
  { name: "Speaking", href: "#", icon: Mic, locked: true, badge: "Soon" },
  { name: "Comments", href: "/dashboard/comments", icon: MessageCircle, locked: false },
];

export default function Sidebar() {
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
    <>
      <div className="flex h-full w-full flex-col bg-background border-r">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-5">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary text-2xl">IELTS</span>
            <span className="text-foreground">PREP</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground/70 hover:bg-secondary hover:text-foreground",
                  item.locked && "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-foreground/70"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("h-5 w-5", active ? "text-primary-foreground" : "text-foreground/50")} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-muted-foreground"
                  )}>
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t p-3 space-y-2">
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
        </div>
      </div>
    </>
  );
}
