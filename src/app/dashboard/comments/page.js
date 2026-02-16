"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const initialComments = [
  {
    id: 1,
    name: "Sardor Rakhimov",
    text: "Bu platforma menga juda ko'p yordam berdi! Reading bo'limidagi testlar haqiqiy imtihonga juda o'xshash.",
    date: "2025-12-14",
    rating: 5,
  },
  {
    id: 2,
    name: "Malika Ismoilova",
    text: "Listening testlari turli aksentlar bilan — bu juda foydali. 7.5 oldim shu platforma tufayli!",
    date: "2025-12-10",
    rating: 5,
  },
  {
    id: 3,
    name: "Javohir Tursunov",
    text: "Writing bo'limidagi word counter va instant feedback juda zo'r. 6.0 dan 7.0 ga ko'tardim.",
    date: "2025-11-28",
    rating: 4,
  },
  {
    id: 4,
    name: "Nodira Karimova",
    text: "Timer funksiyasi haqiqiy imtihondagi bosimni his qilishga yordam beradi. Ajoyib platforma!",
    date: "2025-11-15",
    rating: 5,
  },
  {
    id: 5,
    name: "Alisher Umarov",
    text: "Barcha testlar sifatli va professional. Do'stlarimga ham tavsiya qildim.",
    date: "2025-11-02",
    rating: 4,
  },
  {
    id: 6,
    name: "Dilnoza Tosheva",
    text: "Eng yaxshi IELTS tayyorgarlik sayti! Interface juda toza va qulay.",
    date: "2025-10-20",
    rating: 5,
  },
];

function CommentCard({ comment }) {
  return (
    <div className="min-w-[280px] max-w-[320px] shrink-0 rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs">
          {comment.name.split(" ").map(n => n[0]).join("")}
        </div>
        <div>
          <h4 className="font-semibold text-sm leading-tight">{comment.name}</h4>
          <p className="text-xs text-muted-foreground">{comment.date}</p>
        </div>
      </div>
      <div className="flex gap-0.5 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < comment.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`}
          />
        ))}
      </div>
      <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3">{comment.text}</p>
    </div>
  );
}

function AutoScrollCarousel({ comments }) {
  const scrollRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let scrollPos = 0;
    const speed = 0.5;

    const animate = () => {
      scrollPos += speed;
      if (scrollPos >= container.scrollWidth / 2) {
        scrollPos = 0;
      }
      container.scrollLeft = scrollPos;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    const handleMouseEnter = () => cancelAnimationFrame(animationRef.current);
    const handleMouseLeave = () => {
      scrollPos = container.scrollLeft;
      animationRef.current = requestAnimationFrame(animate);
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationRef.current);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [comments]);

  const duplicated = [...comments, ...comments];

  return (
    <div
      ref={scrollRef}
      className="flex gap-3 overflow-hidden"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
      {duplicated.map((comment, i) => (
        <CommentCard key={`${comment.id}-${i}`} comment={comment} />
      ))}
    </div>
  );
}

export default function CommentsPage() {
  const [comments, setComments] = useState(initialComments);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      name: `${firstName.trim()} ${lastName.trim()}`,
      text: commentText.trim(),
      date: new Date().toISOString().split("T")[0],
      rating,
    };

    setComments((prev) => [newComment, ...prev]);
    setFirstName("");
    setLastName("");
    setCommentText("");
    setRating(5);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="h-[calc(100vh-3rem)] max-w-[1300px] mx-auto flex flex-col overflow-hidden">
      {/* Header — compact */}
      <div className="shrink-0 mb-4">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Comments
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          O'quvchilarning fikrlari. O'z fikringizni ham qoldiring!
        </p>
      </div>

      {/* Carousel — auto scroll, no page scroll */}
      <div className="shrink-0 mb-4">
        <h2 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">O'quvchilar fikrlari</h2>
        <AutoScrollCarousel comments={comments} />
      </div>

      {/* Divider */}
      <div className="shrink-0 border-t mb-4" />

      {/* Form — fills remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Fikr qoldiring</h2>

        {submitted && (
          <div className="mb-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm font-medium">
            ✓ Fikringiz muvaffaqiyatli qo'shildi!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 max-w-2xl">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Ism"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
            />
            <input
              type="text"
              placeholder="Familiya"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
            />
          </div>

          {/* Rating + Textarea row */}
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium mr-2">Baho:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-0.5 hover:scale-110 transition-transform"
              >
                <Star
                  className={`h-5 w-5 transition-colors ${
                    star <= rating
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-muted-foreground/30 hover:text-yellow-400"
                  }`}
                />
              </button>
            ))}
          </div>

          <textarea
            placeholder="Platforma haqida fikringizni yozing..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            required
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 resize-none transition-all"
          />

          <Button type="submit" size="sm" className="gap-2">
            <Send className="h-4 w-4" />
            Yuborish
          </Button>
        </form>
      </div>
    </div>
  );
}
