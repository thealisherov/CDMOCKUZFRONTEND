"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockReviews = [
  {
    id: 1,
    name: "Sardor Rakhimov",
    score: 8.0,
    text: "This platform changed my prep entirely. The Reading interface is exactly like the real computer-delivered test!",
    role: "student"
  },
  {
    id: 2,
    name: "Malika Ismoilova",
    score: 7.5,
    text: "Listening practice with different accents really helped me. Highly recommended for Serious candidates.",
    role: "student"
  },
  {
    id: 3,
    name: "Javohir Tursunov",
    score: 7.0,
    text: "The Writing feedback was brutally honest but improved my score from 6.0 to 7.0 in just 3 weeks.",
    role: "student"
  },
  {
    id: 4,
    name: "Alisher Umarov",
    score: 8.5,
    text: "Perfect simulation. The timer, the layout, everything feels professional.",
    role: "student"
  }
];

export default function ReviewCarousel({ reviews = mockReviews }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 350; // approximate card width + gap
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="relative w-full overflow-hidden py-4">
      <div className="flex items-center justify-between mb-8 px-4">
        <h2 className="text-2xl md:text-3xl font-bold">Student Success Stories</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => scroll("left")} aria-label="Previous review">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => scroll("right")} aria-label="Next review">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-hidden pb-8 snap-x snap-mandatory no-scrollbar px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {reviews.map((review) => (
          <div 
            key={review.id} 
            className="min-w-[300px] md:min-w-[400px] snap-center p-6 border rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-lg">{review.name}</div>
              <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded text-primary font-bold text-sm">
                <Star className="h-4 w-4 fill-current" />
                {review.score}
              </div>
            </div>
            <p className="text-muted-foreground italic">&quot;{review.text}&quot;</p>
          </div>
        ))}
      </div>
    </div>
  );
}
