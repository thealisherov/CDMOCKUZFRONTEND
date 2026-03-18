"use client";

import Link from "next/link";
import { Instagram, Send } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="w-full bg-secondary py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-1 select-none">
              <span className="font-black text-[18px] tracking-tight" style={{ color: 'var(--foreground)' }}>Mega</span>
              <span className="font-black text-[18px] tracking-tight" style={{ color: '#e22d2d' }}>IELTS</span>
            </Link>
            <p className="text-sm text-secondary-foreground/80">
              {t("footer.desc")}
            </p>
            <div className="flex gap-4">
              <Link href="https://instagram.com" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram size={20} />
              </Link>
              <Link href="https://t.me/megaielts" target="_blank" className="text-muted-foreground hover:text-primary transition-colors">
                <Send size={20} className="rotate-[-10deg]" />
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t("footer.platform")}</h3>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              <li><Link href="/dashboard/reading" className="hover:text-primary transition-colors">Reading Tests</Link></li>
              <li><Link href="/dashboard/listening" className="hover:text-primary transition-colors">Listening Tests</Link></li>
              <li><Link href="/dashboard/writing" className="hover:text-primary transition-colors">Writing Practice</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Speaking Mock (Soon)</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">{t("footer.company")}</h3>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              <li><Link href="#about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#founders" className="hover:text-primary transition-colors">Our Team</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-secondary-foreground/60">
          © {new Date().getFullYear()} {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
