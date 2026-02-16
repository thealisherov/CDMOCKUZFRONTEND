"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Persist collapsed state in localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-card fixed top-0 bottom-0 left-0 z-30 transition-all duration-300 ease-in-out",
          collapsed ? "w-[68px]" : "w-64"
        )}
      >
        <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} />
      </aside>

      {/* Mobile Header & Content */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          collapsed ? "md:pl-[68px]" : "md:pl-64"
        )}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center border-b bg-background/95 backdrop-blur px-6 md:hidden">
          <button
            className="mr-4 text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open sidebar</span>
          </button>
          <div className="font-bold text-lg">Dashboard</div>
        </header>

        <main className="flex-1 p-6 overflow-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-col bg-background shadow-xl transform transition-transform animate-in slide-in-from-left duration-300">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" aria-hidden="true" />
                <span className="sr-only">Close sidebar</span>
              </button>
            </div>
            <Sidebar collapsed={false} />
          </div>
        </div>
      )}
    </div>
  );
}
