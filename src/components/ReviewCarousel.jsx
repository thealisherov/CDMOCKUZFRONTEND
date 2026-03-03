"use client";

import { Star, Quote } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

const mockReviews = [
  {
    id: 1,
    name: "Sardor Rakhimov",
    score: 8.0,
    text: "This platform changed my prep entirely. The Reading interface is exactly like the real computer-delivered test!",
    avatar: "SR",
    color: "oklch(0.55 0.22 270)",
  },
  {
    id: 2,
    name: "Malika Ismoilova",
    score: 7.5,
    text: "Listening practice with different accents really helped me. Highly recommended for serious candidates.",
    avatar: "MI",
    color: "#e22d2d",
  },
  {
    id: 3,
    name: "Javohir Tursunov",
    score: 7.0,
    text: "The Writing feedback was brutally honest but improved my score from 6.0 to 7.0 in just 3 weeks.",
    avatar: "JT",
    color: "oklch(0.52 0.2 170)",
  },
  {
    id: 4,
    name: "Alisher Umarov",
    score: 8.5,
    text: "Perfect simulation. The timer, the layout, everything feels professional and close to the real exam.",
    avatar: "AU",
    color: "oklch(0.6 0.2 60)",
  },
  {
    id: 5,
    name: "Dilnoza Yusupova",
    score: 7.0,
    text: "I tried many platforms but Mega IELTS stands out with its clean UI and realistic test environment.",
    avatar: "DY",
    color: "oklch(0.55 0.22 310)",
  },
  {
    id: 6,
    name: "Bobur Nazarov",
    score: 8.0,
    text: "The highlight and notes feature during reading is a game-changer. It's exactly what you get in the real exam.",
    avatar: "BN",
    color: "oklch(0.52 0.18 230)",
  },
];

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
              color: i < Math.round(review.score) ? "#f59e0b" : "var(--border)",
              fill: i < Math.round(review.score) ? "#f59e0b" : "transparent",
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
            <span className="text-xs font-bold text-amber-500">Band {review.score}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReviewCarousel({ reviews = mockReviews }) {
  const { t } = useTranslation();
  // Duplicate for seamless infinite loop
  const doubled = [...reviews, ...reviews];

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
    </div>
  );
}
