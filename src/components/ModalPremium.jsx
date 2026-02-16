"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function ModalPremium({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in-95">
      <div className="relative w-full max-w-md bg-background p-6 rounded-lg shadow-xl border border-primary/20">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <div className="flex flex-col space-y-4 text-center">
           <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
             <span className="text-2xl">👑</span>
           </div>
           <h2 className="text-lg font-semibold text-foreground">Premium Feature</h2>
           <p className="text-sm text-muted-foreground">
             The Speaking module is currently available only for Premium users. Upgrade now to unlock full access including AI grading.
           </p>
           
           <div className="pt-4 flex flex-col gap-2">
             <Button onClick={() => window.location.href = "/#pricing"}>
               Upgrade to Premium
             </Button>
             <Button variant="ghost" onClick={onClose}>
               Maybe Later
             </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
