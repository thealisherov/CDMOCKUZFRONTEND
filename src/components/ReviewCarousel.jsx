"use client";

import { Star, Quote, MessageCircle } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";
import { useState, useEffect } from "react";
import AllCommentsModal from "@/components/AllCommentsModal";

function ReviewCard({ review }) {
  return (
    <div
      className="relative flex flex-col gap-4 p-6 rounded-2xl shrink-0 w-[320px] md:w-[380px]"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        boxShadow: "0 4px 20px oklch(0 0 0 / 0.05)",
      }}
    >
      {/* Quote icon */}
      <Quote
        className="absolute top-5 right-5 w-6 h-6 opacity-10"
        style={{ color: review.color }}
      />

      {/* Stars */}
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="w-3.5 h-3.5"
            style={{
              color: i < Math.round(review.rating || 5) ? "#f59e0b" : "var(--border)",
              fill: i < Math.round(review.rating || 5) ? "#f59e0b" : "transparent",
            }}
          />
        ))}
      </div>

      {/* Review text */}
      <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
        &ldquo;{review.text}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 mt-auto pt-2" style={{ borderTop: "1px solid var(--border)" }}>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-xs text-white"
          style={{ background: review.color }}
        >
          {review.avatar}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            {review.name}
          </p>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-amber-500">
              {review.band ? `Band ${review.band}` : `Star ${review.rating}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReviewCarousel() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/comments')
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(err => console.error("Error fetching comments:", err));
  }, []);

  const doubled = [...reviews, ...reviews];

  if (reviews.length === 0) return null;

  return (
    <div className="w-full overflow-hidden py-4">
      {/* Header */}
      <div className="text-center mb-12 space-y-3 px-4">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-2"
          style={{
            background: "oklch(0.6 0.2 60 / 0.08)",
            border: "1px solid oklch(0.6 0.2 60 / 0.25)",
            color: "oklch(0.5 0.18 60)",
          }}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          {t("reviews.badge")}
        </div>
        <h2 className="text-3xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
          {t("reviews.title")}
        </h2>
        <p className="text-base max-w-[500px] mx-auto" style={{ color: "var(--muted-foreground)" }}>
          {t("reviews.desc")}
        </p>
      </div>

      {/* Marquee wrapper */}
      <div className="relative">
        {/* Left fade mask */}
        <div
          className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, var(--background), transparent)" }}
        />
        {/* Right fade mask */}
        <div
          className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, var(--background), transparent)" }}
        />

        {/* Scrolling track */}
        <div className="overflow-hidden">
          <div
            className="flex gap-5 w-max animate-marquee"
            style={{ animation: "marquee 32s linear infinite" }}
            onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = "paused")}
            onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = "running")}
          >
            {doubled.map((review, idx) => (
              <ReviewCard key={`${review.id}-${idx}`} review={review} />
            ))}
          </div>
        </div>
      </div>

      {/* Keyframe injected inline */}
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      
      {/* View All Button */}
      <div className="flex justify-center mt-12 px-4 relative z-20">
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300"
          style={{
            background: "oklch(0.52 0.18 230 / 0.1)",
            border: "1px solid oklch(0.52 0.18 230 / 0.3)",
            color: "oklch(0.48 0.16 230)"
          }}
        >
          <MessageCircle className="w-4 h-4" />
          {t("reviews.viewAll", "Barcha sharhlarni o'qish (Read all reviews)")}
        </button>
      </div>

      <AllCommentsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        comments={reviews}
      />
    </div>
  );
}
