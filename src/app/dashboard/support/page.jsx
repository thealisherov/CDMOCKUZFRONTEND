"use client";

import { useTranslation } from "@/components/LanguageContext";
import { LifeBuoy, AlertTriangle, MessageCircle, Send, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function SupportPage() {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState(null);

  // Fallback to English if translations not loaded yet
  const fallback = {
    title: "Help Center",
    subtitle: "Got questions or faced an issue? We're here to help!",
    contactTitle: "Contact & Bug Report",
    contactDesc: "If you encounter any bugs, errors, or mistakes in tests, please take a screenshot and send it to our Telegram support. Our team will fix it promptly.",
    telegramBtn: "Contact via Telegram",
    faqTitle: "Frequently Asked Questions (FAQ)",
    faqs: [
      { q: "How to use the platform?", a: "Choose any listening or reading test from the Dashboard and start." }
    ]
  };

  const supportObj = t("support");
  const support = (supportObj && typeof supportObj === 'object') ? supportObj : fallback;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
          <LifeBuoy className="w-8 h-8 flex-shrink-0" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-slate-900 dark:text-white">
          {support.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          {support.subtitle}
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Contact / Telegram Card */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm shadow-blue-900/5 dark:shadow-none h-full relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen opacity-70"></div>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-100 relative z-10">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {support.contactTitle}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed relative z-10">
              {support.contactDesc}
            </p>
            <a 
              href="https://t.me/megaielts_admin" 
              target="_blank" rel="noopener noreferrer"
              className="mt-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white w-full rounded-xl py-3 font-semibold hover:bg-blue-700 transition relative z-10"
            >
              <Send className="w-4 h-4" />
              {support.telegramBtn}
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm shadow-blue-900/5 dark:shadow-none">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-100">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            {support.faqTitle}
          </h2>
          <div className="space-y-4">
            {(support.faqs || []).map((faq, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "border transition-colors rounded-xl overflow-hidden",
                  openFaq === idx 
                    ? "border-blue-200 dark:border-blue-500/50 shadow-sm bg-white dark:bg-slate-900" 
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                )}
              >
                <button
                  className="w-full text-left px-5 py-4 flex items-start justify-between font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span className="pr-4 leading-relaxed">{faq.q}</span>
                  <ChevronDown className={cn(
                    "w-5 h-5 transition-transform duration-300 shrink-0 mt-0.5", 
                    openFaq === idx ? "rotate-180 text-blue-500" : "rotate-0 text-slate-400 dark:text-slate-500"
                  )} />
                </button>
                <div 
                  className={cn(
                    "overflow-hidden transition-all duration-300 px-5",
                    openFaq === idx ? "max-h-96 pb-5 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="h-px w-full bg-slate-100 dark:bg-slate-800 mb-4"></div>
                  <p className="text-slate-600 dark:text-slate-400 text-[15px] leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
