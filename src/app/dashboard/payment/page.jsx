"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, CheckCircle2, ChevronRight, Send, AlertCircle, CreditCard, ShieldCheck, Globe } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

function PaymentContent() {
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get("plan") || "monthly";
  const initialCurrency = searchParams.get("currency") || "uzs";
  const [isUSD, setIsUSD] = useState(initialCurrency === "usd" && initialCurrency !== "uzs");
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
            {t("payment.usd") || "USD"}
          </button>
          <button
            onClick={() => setIsUSD(false)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              !isUSD ? "bg-white dark:bg-gray-700 shadow-md text-emerald-600 dark:text-emerald-400" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <span className="font-serif leading-none opacity-80 mt-0.5">UZ</span>
            {t("payment.uzs") || "UZS"}
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
                      '<a href="https://t.me/megaielts_admin" target="_blank" rel="noopener noreferrer" class="text-blue-600 font-bold hover:underline">'
                    ).replace("</AdminLink>", "</a>")
                  }}
                />
              </li>
            </ul>
            
            <a 
              href="https://t.me/megaielts_admin" 
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
                  {isUSD ? "USD / VISA (International)" : "UZS / Local Card"}
                </span>
              </div>

              {/* Realistic Card UI */}
              <div 
                className="relative w-full aspect-[1.586/1] rounded-[20px] overflow-hidden shadow-2xl group select-none transition-transform hover:scale-[1.02] duration-300"
                style={{
                  background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
                  fontFamily: "'Courier New', Courier, monospace"
                }}
              >
                {/* Decorative Pattern */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: "radial-gradient(circle at 10% 20%, rgba(255,255,255,0.1) 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />
                
                {/* Hamkorbank Logo */}
                <div className="absolute top-[8%] left-[6%] flex items-center gap-2 z-10">
                   <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden" style={{ background: "linear-gradient(135deg, #00923f, #006b2e)" }}>
                      <span className="text-white font-black text-[11px]" style={{ fontFamily: "Inter, sans-serif" }}>HB</span>
                   </div>
                   <span className="text-white font-black text-sm tracking-widest" style={{ fontFamily: "Inter, sans-serif" }}>HAMKORBANK</span>
                </div>

                {/* Chip & Contactless */}
                <div className="absolute top-[32%] left-[10%] flex items-center gap-4 z-10">
                  <div className="w-[45px] h-[35px] rounded-md bg-gradient-to-br from-[#e5c07b] to-[#d4af37] relative border border-[#b38b22] shadow-sm">
                     <div className="absolute inset-0 border border-[#9a7b21] rounded-md m-[4px] opacity-40" />
                  </div>
                  
                  {/* Contactless symbol */}
                  <div className="flex gap-1 items-center justify-center rotate-90 ml-2 opacity-60">
                    {[1, 2, 3, 4].map(w => <div key={w} className="w-[1.5px] bg-white rounded-full" style={{ height: `${6+w*5}px` }} />)}
                  </div>
                </div>

                {/* Card Number */}
                <div 
                  className="absolute top-[52%] left-[6%] right-[6%] z-20 cursor-pointer group"
                  onClick={handleCopy}
                >
                  <div className="flex items-center justify-start gap-2 sm:gap-5 text-[#f5f5f5] text-xl sm:text-[26px] tracking-widest font-bold"
                       style={{ 
                         textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                         fontFamily: "'Courier Prime', 'Courier New', monospace"
                       }}>
                    <span>4008</span>
                    <span>4700</span>
                    <span>4114</span>
                    <span>2372</span>
                  </div>
                  
                  {/* Hover Copy Overlay */}
                  <div className="absolute inset-x-0 -inset-y-3 bg-black/50 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    {copied ? (
                      <span className="text-white font-bold text-xs tracking-normal flex items-center gap-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                        <CheckCircle2 className="w-4 h-4 text-green-400" /> {t("payment.copied")}
                      </span>
                    ) : (
                      <span className="text-white font-bold text-xs tracking-normal flex items-center gap-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                        <Copy className="w-4 h-4" /> {t("payment.copy")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Valid Thru */}
                <div className="absolute bottom-[25%] right-[15%] z-10 flex items-center gap-2 uppercase">
                  <span className="text-[7px] text-white/60 font-bold leading-tight text-right">Valid<br/>Thru</span>
                  <span className="text-[17px] text-white font-bold tracking-widest">03/29</span>
                </div>

                {/* Name */}
                <div className="absolute bottom-[10%] left-[8%] z-10">
                  <span className="text-[14px] text-white/90 font-bold tracking-[0.2em] uppercase">
                    ALISHEROV AZIZBEK
                  </span>
                </div>

                {/* VISA Logo */}
                <div className="absolute bottom-[8%] right-[8%] z-10">
                  <span className="text-white text-[34px] font-black italic tracking-tighter" style={{ fontFamily: "Arial, sans-serif" }}>
                    VISA
                  </span>
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
