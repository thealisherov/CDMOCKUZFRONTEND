'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { X, Crown, Zap, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

const FEATURES = [
  'Har oyda CHEKSIZ Writing tekshirish',
  'AI tomonidan batafsil baholash va tuzatishlar',
  'Barcha IELTS modullariga to\'liq kirish',
  'Band scoreni oshirish bo\'yicha shaxsiy tavsiyalar',
  'Reklamasiz premium tajriba',
];

export default function WritingLimitModal({ isOpen, onClose, usedCount = 3 }) {
  const router = useRouter();
  const overlayRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
          animation: 'wlm-pop 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        <style>{`
          @keyframes wlm-pop {
            from { opacity: 0; transform: scale(0.88) translateY(20px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes wlm-shine {
            0%   { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
        `}</style>

        {/* ── Gradient Header ── */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 40%, #1a0a2e 100%)',
            padding: '36px 32px 28px',
            position: 'relative',
            textAlign: 'center',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(255,255,255,0.1)', border: 'none',
              borderRadius: '50%', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff', transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <X size={15} />
          </button>

          {/* Crown icon with glow */}
          <div style={{
            width: 72, height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
            boxShadow: '0 0 0 12px rgba(251,191,36,0.15), 0 8px 32px rgba(251,191,36,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Crown size={34} color="#fff" />
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(251,191,36,0.15)',
            border: '1px solid rgba(251,191,36,0.35)',
            borderRadius: 20, padding: '4px 14px',
            marginBottom: 14,
          }}>
            <Sparkles size={13} color="#fbbf24" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Limit to'ldi
            </span>
          </div>

          <h2 style={{
            color: '#fff', fontSize: 24, fontWeight: 800,
            lineHeight: 1.2, margin: '0 0 10px',
          }}>
            Oylik bepul limitingiz<br />tugadi 🎯
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
            Siz bu oy <strong style={{ color: '#fbbf24' }}>{usedCount} ta</strong> bepul Writing
            tekshirishdan foydalandingiz.<br />Davom etish uchun Premium oling.
          </p>
        </div>

        {/* ── White body ── */}
        <div style={{ background: '#fff', padding: '28px 32px 32px' }}>

          {/* Feature list */}
          <p style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
            Premium bilan nima olasiz:
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FEATURES.map((f, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <CheckCircle2 size={18} color="#7c3aed" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.5 }}>{f}</span>
              </li>
            ))}
          </ul>

          {/* CTA Button */}
          <button
            onClick={() => router.push('/dashboard/premium')}
            style={{
              width: '100%', padding: '15px 24px',
              borderRadius: 14, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: '#fff', fontSize: 16, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 8px 24px rgba(124,58,237,0.35)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(124,58,237,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.35)'; }}
          >
            <Zap size={18} fill="#fff" />
            Premium olish
            <ArrowRight size={16} />
          </button>

          {/* Secondary */}
          <button
            onClick={onClose}
            style={{
              width: '100%', marginTop: 10, padding: '12px 24px',
              borderRadius: 14, border: '1.5px solid #e5e7eb',
              background: 'transparent', color: '#6b7280',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#374151'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
          >
            Keyinroq
          </button>
        </div>
      </div>
    </div>
  );
}
