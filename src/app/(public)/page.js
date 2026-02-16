import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import About from "@/components/landing/About";
import Founders from "@/components/landing/Founders";
import Pricing from "@/components/landing/Pricing";
import ReviewCarousel from "@/components/ReviewCarousel";

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
