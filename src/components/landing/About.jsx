"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/LanguageContext";
import { PenLine, BookOpen, Mic, Trophy } from "lucide-react";

export default function About() {
  const { t } = useTranslation();
  return (
    <section id="about" className="py-24 bg-background">
      <div className="container px-4 md:px-6"> 
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-24">
          <div className="md:w-1/2 relative p-8 aspect-square flex items-center justify-center overflow-hidden">
             {/* Background glow effects */}
             <div className="absolute inset-0 bg-primary/5 rounded-[40px] blur-3xl opacity-30 animate-pulse" />
             <div className="absolute w-48 h-48 bg-blue-500/10 rounded-full blur-2xl top-0 right-0 animate-bounce duration-[4s]" />
             
             {/* Success Visualization */}
             <div className="relative z-10 w-full h-full flex items-center justify-center">
               
               {/* Animated Progress Ring */}
               <div className="absolute w-[240px] h-[240px] border-2 border-primary/20 rounded-full animate-[spin_20s_linear_infinite]" 
                    style={{ borderStyle: 'dashed' }} />
               <div className="absolute w-[200px] h-[200px] border border-blue-500/30 rounded-full animate-[spin_12s_linear_infinite_reverse]" 
                    style={{ borderStyle: 'dotted' }} />
               
               {/* Center Badge */}
               <div className="relative bg-card/60 backdrop-blur-xl border border-border shadow-2xl rounded-[32px] p-8 w-[180px] aspect-square flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-500">
                  <div className="absolute -top-3 -right-3 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-bounce">
                    TARGET
                  </div>
                  <span className="text-5xl font-black tracking-tighter bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent italic">
                    8.5+
                  </span>
                  <div className="h-1 w-12 bg-primary rounded-full my-3" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center leading-tight">
                    IELTS Mastery<br/>Achieved
                  </span>
               </div>

               {/* Floating Elements (Antiqa but subtle) */}
               <div className="absolute top-12 left-16 animate-pulse delay-150">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                    <PenLine className="w-5 h-5 text-primary opacity-60" />
                  </div>
               </div>
               <div className="absolute top-20 right-10 animate-pulse delay-300">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shadow-inner">
                    <BookOpen className="w-5 h-5 text-orange-500 opacity-50" />
                  </div>
               </div>
               <div className="absolute bottom-16 left-12 animate-pulse delay-700">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-inner">
                    <Mic className="w-5 h-5 text-indigo-500 opacity-50" />
                  </div>
               </div>
               <div className="absolute bottom-10 right-20 animate-pulse delay-500">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
                    <Trophy className="w-5 h-5 text-emerald-500 opacity-50" />
                  </div>
               </div>
             </div>
             
             {/* Background Watermark */}
             <div className="absolute -bottom-8 -left-8 font-black text-[120px] text-primary/[0.03] select-none pointer-events-none">
                PASS
             </div>
          </div>
          
          <div className="md:w-1/2 space-y-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              {t("about.title")}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {t("about.desc1")}
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {t("about.desc2")}
            </p>
            <div className="flex gap-4 pt-4">
              <Link href="/register">
                 <Button className="rounded-full px-8">{t("about.btn")}</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
