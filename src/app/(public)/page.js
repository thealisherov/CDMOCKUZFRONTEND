import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import dynamic from "next/dynamic";

// Lazy-load below-the-fold components for faster initial page load
const About = dynamic(() => import("@/components/landing/About"), {
  loading: () => <section className="py-24" />,
});
const Founders = dynamic(() => import("@/components/landing/Founders"), {
  loading: () => <section className="py-24" />,
});
const ReviewCarousel = dynamic(() => import("@/components/ReviewCarousel"), {
  loading: () => <section className="py-20" />,
});
const Pricing = dynamic(() => import("@/components/landing/Pricing"), {
  loading: () => <section className="py-24" />,
});

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <About />
      <Founders />
      <section id="reviews" className="py-20 bg-center bg-no-repeat bg-cover">
        <ReviewCarousel />
      </section>
      <Pricing />
    </>
  );
}
