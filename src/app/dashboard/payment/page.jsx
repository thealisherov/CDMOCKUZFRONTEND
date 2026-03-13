"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, CheckCircle2, ChevronRight, Send, AlertCircle, CreditCard, ShieldCheck, Globe } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

function PaymentContent() {
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get("plan") || "monthly";
  const initialCurrency = searchParams.get("currency") || "uzs";
  const [isUSD, setIsUSD] = useState(initialCurrency === "usd");
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const plans = [
    { id: "monthly", name: t("payment.plan1"), price: isUSD ? "$5" : "69,000 UZS", color: "oklch(0.48 0.22 270)" },
    { id: "quarterly", name: t("payment.plan2"), price: isUSD ? "$12" : "149,000 UZS", color: "#e22d2d" },
    { id: "custom", name: t("payment.plan3"), price: t("payment.customPrice"), color: "oklch(0.55 0.04 270)" }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText("4008470041142372");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full h-full flex flex-col py-6 max-w-6xl mx-auto px-4 md:px-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black mb-2" style={{ color: "var(--foreground)" }}>
            {t("payment.title")}
          </h1>
          <p className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
            {t("payment.subtitle")}
          </p>
        </div>

        {/* Currency Toggle */}
        <div className="inline-flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl items-center shadow-inner shrink-0">
          <button
            onClick={() => setIsUSD(true)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              isUSD ? "bg-white dark:bg-gray-700 shadow-md text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <Globe className="w-4 h-4 opacity-70" />
            USD
          </button>
          <button
            onClick={() => setIsUSD(false)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              !isUSD ? "bg-white dark:bg-gray-700 shadow-md text-emerald-600 dark:text-emerald-400" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <span className="font-serif leading-none opacity-80 mt-0.5">UZ</span>
            UZS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        
        {/* LEFT COLUMN: Instructions & Plans */}
        <div className="flex flex-col space-y-8">
          
          <div className="bg-white/50 dark:bg-black/20 border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4" style={{ color: "var(--foreground)" }}>
              <ShieldCheck className="w-5 h-5 text-green-600" />
              {t("payment.step1Title")}
            </h2>
            <div className="space-y-3">
              {plans.map((plan) => (
                <label 
                  key={plan.id}
                  className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                    selectedPlan === plan.id ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 shadow-sm' : 'border-transparent bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlan === plan.id ? 'border-blue-500' : 'border-gray-300'}`}>
                      {selectedPlan === plan.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                    </div>
                    <span className="font-bold text-[15px]">{plan.name}</span>
                  </div>
                  <span className="font-black text-[15px]" style={{ color: plan.color }}>{plan.price}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white/50 dark:bg-black/20 border rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-3" style={{ color: "var(--foreground)" }}>
              <Send className="w-5 h-5 text-blue-600" />
              {t("payment.step2Title")}
            </h2>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                <p className="text-[14px] leading-relaxed" style={{ color: "var(--foreground)" }}>
                  {t("payment.step2Inst1")}
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                <p className="text-[14px] leading-relaxed" style={{ color: "var(--foreground)" }}>
                  {t("payment.step2Inst2")}
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                <p 
                  className="text-[14px] leading-relaxed" 
                  style={{ color: "var(--foreground)" }}
                  dangerouslySetInnerHTML={{
                    __html: t("payment.step2Inst3").replace(
                      "<AdminLink>", 
                      '<a href="https://t.me/ai_studioru" target="_blank" rel="noopener noreferrer" class="text-blue-600 font-bold hover:underline">'
                    ).replace("</AdminLink>", "</a>")
                  }}
                />
              </li>
            </ul>
            
            <a 
              href="https://t.me/ai_studioru" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #0088cc, #005580)", boxShadow: "0 4px 15px rgba(0, 136, 204, 0.3)" }}
            >
              <Send className="w-4 h-4" />
              {t("payment.contactAdmin")}
            </a>
          </div>

        </div>

        {/* RIGHT COLUMN: The Card */}
        <div className="flex flex-col items-center lg:items-end justify-start pt-2">
           <div className="w-full max-w-[440px] sticky top-8">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-bold text-[17px] text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  {t("payment.cardTitle")}
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                  {isUSD ? "USD / VISA" : "UZS / HUMO"}
                </span>
              </div>

              {/* Realistic Card UI */}
              <div 
                className="relative w-full aspect-[1.586/1] rounded-[20px] overflow-hidden shadow-2xl group select-none transition-transform hover:scale-[1.02] duration-300"
                style={{
                  background: "linear-gradient(135deg, #111111 0%, #2a2a2a 100%)",
                  fontFamily: "'Courier New', Courier, monospace"
                }}
              >
                {/* Decorative Mandala pattern placeholder */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay"
                  style={{
                    backgroundImage: "radial-gradient(circle at 40% 20%, #d4af37 1px, transparent 1px), radial-gradient(circle at 60% 80%, #d4af37 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
                <div 
                  className="absolute -top-[50%] -left-[20%] w-[150%] h-[150%] rounded-full border-[1px] border-[#d4af37]/10 pointer-events-none"
                />
                <div 
                  className="absolute -top-[30%] -left-[10%] w-[110%] h-[110%] rounded-full border-[1px] border-[#d4af37]/20 pointer-events-none"
                />

                {/* Top Right: Hamkorbank Logo */}
                <div className="absolute top-[8%] right-[6%] flex items-center gap-2 z-10">
                  <div className="flex gap-1 transform -skew-x-[20deg]">
                    <div className="w-[6px] h-[18px] bg-white rounded-[1px]" />
                    <div className="w-[6px] h-[18px] bg-white rounded-[1px]" />
                  </div>
                  <span className="text-white font-bold text-lg tracking-wider" style={{ fontFamily: "Inter, sans-serif" }}>HAMKORBANK</span>
                </div>

                {/* Chip & Contactless */}
                <div className="absolute top-[28%] left-[10%] flex items-center gap-4 z-10">
                  <div className="w-[45px] h-[35px] rounded-md bg-gradient-to-br from-[#e5c07b] to-[#d4af37] relative border border-[#b38b22] shadow-sm overflow-hidden">
                     {/* Chip lines */}
                     <div className="absolute top-[30%] left-0 right-0 h-[1px] bg-[#9a7b21]" />
                     <div className="absolute top-[60%] left-0 right-0 h-[1px] bg-[#9a7b21]" />
                     <div className="absolute top-0 bottom-0 left-[30%] w-[1px] bg-[#9a7b21]" />
                     <div className="absolute top-0 bottom-0 left-[70%] w-[1px] bg-[#9a7b21]" />
                     <div className="absolute inset-0 border border-[#9a7b21] rounded-md m-[4px]" />
                  </div>
                  
                  {/* Contactless symbol */}
                  <div className="flex gap-1.5 items-center justify-center rotate-90 ml-2 opacity-90">
                    <div className="w-[2px] h-[8px] bg-white rounded-full" />
                    <div className="w-[2px] h-[14px] bg-white rounded-full" />
                    <div className="w-[2px] h-[20px] bg-white rounded-full" />
                    <div className="w-[2px] h-[26px] bg-white rounded-full" />
                  </div>
                </div>

                {/* Card Number */}
                <div 
                  className="absolute top-[52%] left-[6%] right-[6%] z-20 cursor-pointer group"
                  onClick={handleCopy}
                  title="Click to copy card number"
                >
                  <div className="flex items-center justify-start gap-5 text-[#f5f5f5] text-[26px] tracking-widest font-bold"
                       style={{ 
                         textShadow: "-1px -1px 1px rgba(255,255,255,0.1), 1px 1px 1.5px rgba(0,0,0,0.8)",
                         fontFamily: "'Courier Prime', 'Courier New', monospace"
                       }}>
                    <span>4008</span>
                    <span>4100</span>
                    <span>4114</span>
                    <span>2312</span>
                  </div>
                  
                  {/* Hover Copy Overlay */}
                  <div className="absolute inset-x-0 -inset-y-3 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    {copied ? (
                      <span className="text-white font-bold text-sm tracking-normal flex items-center gap-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                        <CheckCircle2 className="w-5 h-5 text-green-400" /> {t("payment.copied")}
                      </span>
                    ) : (
                      <span className="text-white font-bold text-sm tracking-normal flex items-center gap-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                        <Copy className="w-5 h-5" /> {t("payment.copy")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Valid Thru */}
                <div className="absolute top-[69%] left-[30%] z-10 flex items-center gap-2">
                  <div className="flex flex-col text-[6px] font-bold text-white/80 uppercase leading-[1.1] text-right tracking-widest">
                    <span>Valid</span>
                    <span>Thru</span>
                  </div>
                  <span className="text-[17px] text-[#f5f5f5] font-bold tracking-widest"
                        style={{ 
                          textShadow: "-1px -1px 1px rgba(255,255,255,0.1), 1px 1px 1px rgba(0,0,0,0.8)",
                        }}>
                    03/29
                  </span>
                </div>

                {/* Name */}
                <div className="absolute bottom-[18%] left-[6%] z-10">
                  <span className="text-[15px] text-[#f5f5f5] font-bold tracking-[0.16em] uppercase"
                        style={{ 
                          textShadow: "-1px -1px 1px rgba(255,255,255,0.1), 1px 1px 1px rgba(0,0,0,0.8)",
                        }}>
                    AZIZBEK ALISHEROV
                  </span>
                </div>

                {/* VISA Logo */}
                <div className="absolute bottom-[6%] left-[6%] z-10">
                  <span className="text-white text-[32px] font-black italic tracking-tighter" style={{ fontFamily: "Arial, sans-serif" }}>
                    VISA
                  </span>
                </div>

                {/* HUMO Logo */}
                <div className="absolute bottom-[6%] right-[6%] z-10">
                  <div className="bg-[#18392a] rounded-lg px-3 py-1.5 flex items-center justify-center shadow-lg relative overflow-hidden border border-[#d4af37]/30">
                    <span className="text-[#d4af37] font-bold tracking-widest text-lg relative z-10" style={{ fontFamily: "sans-serif" }}>HUMO</span>
                    {/* HUMO swoosh */}
                    <div className="absolute bottom-0 right-0 w-[80%] h-[30%] bg-gradient-to-l from-[#d4af37] to-transparent rounded-tl-full opacity-60"></div>
                  </div>
                </div>
              </div>

              {/* Security info */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-dashed flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("payment.securityNote")}
                </p>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading payment page...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
