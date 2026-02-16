"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card fixed top-0 bottom-0 left-0 z-30">
        <Sidebar />
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col md:pl-64">
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
             <Sidebar />
          </div>
        </div>
      )}
    </div>
  );
}
