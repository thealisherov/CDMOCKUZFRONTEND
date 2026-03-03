"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/LanguageContext";

export default function Hero() {
  const { t } = useTranslation();
  return (
    <section className="relative w-full py-20 md:py-32 overflow-hidden bg-background">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div 
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/30 to-background sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"}}
        ></div>
      </div>
      
      <div className="container px-4 md:px-6 flex flex-col items-center justify-center text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
          {t("hero.title1")} <span className="text-primary">{t("hero.titleHighlight")}</span>
          <br className="hidden sm:inline" /> {t("hero.title2")}
        </h1>
        <p className="max-w-[700px] text-lg sm:text-xl text-muted-foreground md:text-2xl">
          {t("hero.desc")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all">
              {t("hero.btnPrimary")}
            </Button>
          </Link>
          <Link href="#features">
             <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full">
              {t("hero.btnSecondary")}
            </Button>
          </Link>
        </div>
      </div>
      
       <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div 
           className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary/30 to-background sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
           style={{clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"}}
        ></div>
      </div>
    </section>
  );
}
