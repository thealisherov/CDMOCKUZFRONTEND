"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, BookOpen, Headphones, PenTool, Lock } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle"; // Import ThemeToggle
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "@/components/LanguageContext";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
       <Link href="/" className="flex items-center gap-2 font-bold text-xl select-none">
          <span className="font-black text-[20px] tracking-tight" style={{ color: 'var(--foreground)' }}>Mega</span>
          <span className="font-black text-[20px] tracking-tight" style={{ color: '#e22d2d' }}>IELTS</span>
        </Link>
        <nav className="hidden md:flex gap-6 items-center text-sm font-medium">
          <Link href="#features" className="hover:text-primary transition-colors">
            {t("nav.why")}
          </Link>
          <Link href="#about" className="hover:text-primary transition-colors">
            {t("nav.about")}
          </Link>
          <Link href="#pricing" className="hover:text-primary transition-colors">
            {t("nav.pricing")}
          </Link>
          <div className="relative group py-2 z-[100]">
            <Link href="/dashboard" className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1 font-medium">
              Tests
              <ChevronDown size={14} className="mt-0.5 group-hover:rotate-180 transition-transform duration-200" />
            </Link>
            <div className="absolute top-[80%] left-1/2 -translate-x-1/2 w-[500px] bg-background border rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] p-4">
              <div className="grid grid-cols-2 gap-3">
                
                <Link href="/dashboard/reading" className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group/item">
                  <div className="bg-blue-100/80 text-blue-600 p-2.5 rounded-lg group-hover/item:scale-105 transition-transform dark:bg-blue-900/30 dark:text-blue-400">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-0.5 text-foreground group-hover/item:text-primary transition-colors">Reading Test</h4>
                    <p className="text-[11px] text-muted-foreground leading-snug">Read academic texts and answer question types.</p>
                  </div>
                </Link>

                <Link href="/dashboard/writing" className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group/item">
                  <div className="bg-emerald-100/80 text-emerald-600 p-2.5 rounded-lg group-hover/item:scale-105 transition-transform dark:bg-emerald-900/30 dark:text-emerald-400">
                    <PenTool size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-0.5 text-foreground group-hover/item:text-primary transition-colors">Writing Test</h4>
                    <p className="text-[11px] text-muted-foreground leading-snug">Write essays and get instant AI evaluation.</p>
                  </div>
                </Link>

                <Link href="/dashboard/listening" className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group/item">
                  <div className="bg-purple-100/80 text-purple-600 p-2.5 rounded-lg group-hover/item:scale-105 transition-transform dark:bg-purple-900/30 dark:text-purple-400">
                    <Headphones size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-0.5 text-foreground group-hover/item:text-primary transition-colors">Listening Test</h4>
                    <p className="text-[11px] text-muted-foreground leading-snug">Answer questions from audio clips.</p>
                  </div>
                </Link>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-transparent cursor-not-allowed">
                  <div className="bg-muted/80 text-muted-foreground p-2.5 rounded-lg mt-0.5">
                    <Lock size={20} />
                  </div>
                  <div className="flex-1 mt-0.5">
                    <h4 className="font-semibold text-sm mb-0.5 text-muted-foreground">Speaking Test</h4>
                    <p className="text-[11px] text-muted-foreground leading-snug">Coming Soon - Practice real interview questions with our advanced AI examiner.</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
          <ThemeToggle /> {/* Add ThemeToggle here */}
          <LanguageSelector />
          <Link href="/login">
            <Button variant="ghost" size="sm">
              {t("nav.login")}
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">{t("nav.getStarted")}</Button>
          </Link>
        </nav>
        
        {/* Mobile Menu Toggle & ThemeToggle */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSelector />
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
            {t("nav.why")}
          </Link>
          <Link
            href="#about"
            className="text-sm font-medium hover:text-primary transition-colors"
            onClick={() => setIsOpen(false)}
          >
            {t("nav.about")}
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium hover:text-primary transition-colors"
            onClick={() => setIsOpen(false)}
          >
            {t("nav.pricing")}
          </Link>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Tests</span>
            <div className="flex flex-col pl-4 gap-3">
              <Link href="/dashboard/reading" className="text-sm hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>Reading</Link>
              <Link href="/dashboard/listening" className="text-sm hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>Listening</Link>
              <Link href="/dashboard/writing" className="text-sm hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>Writing</Link>
              <Link href="/dashboard/speaking" className="text-sm hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>Speaking</Link>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-2">
             <Link href="/login" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full justify-start">{t("nav.login")}</Button>
            </Link>
            <Link href="/register" onClick={() => setIsOpen(false)}>
              <Button className="w-full justify-start">{t("nav.getStarted")}</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
