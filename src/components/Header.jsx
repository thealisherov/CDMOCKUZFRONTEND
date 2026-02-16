"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle"; // Import ThemeToggle

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
       <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <span className="text-2xl">IELTS</span> PREP
        </Link>
        <nav className="hidden md:flex gap-6 items-center text-sm font-medium">
          <Link href="#features" className="hover:text-primary transition-colors">
            Why Choose Us
          </Link>
          <Link href="#about" className="hover:text-primary transition-colors">
            About
          </Link>
          <Link href="#pricing" className="hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="/dashboard/reading" className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <ThemeToggle /> {/* Add ThemeToggle here */}
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </nav>
        
        {/* Mobile Menu Toggle & ThemeToggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle /> {/* Add ThemeToggle for mobile view outside menu */}
          <button
            className="p-2 text-muted-foreground hover:text-primary"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t bg-background p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-2">
          <Link
            href="#features"
            className="text-sm font-medium hover:text-primary transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Why Choose Us
          </Link>
          <Link
            href="#about"
            className="text-sm font-medium hover:text-primary transition-colors"
            onClick={() => setIsOpen(false)}
          >
            About
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium hover:text-primary transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href="/dashboard/reading"
            className="text-sm font-medium hover:text-primary transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          <div className="flex flex-col gap-2 mt-2">
             <Link href="/login" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full justify-start">Log in</Button>
            </Link>
            <Link href="/register" onClick={() => setIsOpen(false)}>
              <Button className="w-full justify-start">Get Started</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
