"use client";

import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

import AllCommentsModal from "@/components/AllCommentsModal";

function CommentCard({ comment }) {
  return (
    <div className="min-w-[280px] max-w-[320px] shrink-0 rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        <div 
          className="flex items-center justify-center w-9 h-9 rounded-full font-bold text-xs text-white"
          style={{ background: comment.color || 'var(--primary)' }}
        >
          {comment.avatar || (comment.name && comment.name[0]) || 'U'}
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
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(5);
  const [band, setBand] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/comments')
      .then(r => r.json())
      .then(data => {
        setComments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching comments:", err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !commentText.trim()) return;

    const payload = {
      name: `${firstName.trim()} ${lastName.trim()}`,
      text: commentText.trim(),
      rating,
      band: band ? parseFloat(band) : null,
    };

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const returnedComment = await res.json();
      if (res.ok) {
        setComments(prev => [returnedComment, ...prev]);
      } else {
        console.error("Error submitting:", returnedComment.error);
      }
    } catch(err) {
      console.error(err);
    }
    setFirstName("");
    setLastName("");
    setCommentText("");
    setRating(5);
    setBand("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-[calc(100vh-3rem)] h-auto md:h-[calc(100vh-3rem)] max-w-[1300px] mx-auto flex flex-col md:overflow-hidden overflow-visible pb-24 md:pb-6 px-1 md:px-0">
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
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">O'quvchilar fikrlari</h2>
          {comments.length > 0 && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-sm text-primary hover:underline font-medium"
            >
              Barcha fikrlarni ko'rish
            </button>
          )}
        </div>
        {!loading && <AutoScrollCarousel comments={comments} />}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
            <select
              value={band}
              onChange={(e) => setBand(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
              style={!band ? { color: 'var(--muted-foreground)' } : {}}
            >
              <option value="" disabled hidden>Band score (ixtiyoriy)</option>
              {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map(b => (
                <option key={b} value={b} style={{ color: 'var(--foreground)' }}>
                  {b.toFixed(1)}
                </option>
              ))}
            </select>
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

      <AllCommentsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        comments={comments} 
      />
    </div>
  );
}
