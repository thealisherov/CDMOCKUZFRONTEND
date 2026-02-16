import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="container px-4 md:px-6"> 
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-24">
          <div className="md:w-1/2 relative bg-accent/30 rounded-2xl p-8 aspect-square flex items-center justify-center">
             <div className="absolute top-4 left-4 font-bold text-6xl text-primary/20 animate-pulse">8.0+</div>
             <div className="text-center space-y-2">
               <h3 className="text-3xl font-bold text-foreground">50,000+</h3>
               <p className="text-muted-foreground">Successful Students</p>
               <div className="h-2 w-24 bg-primary mx-auto rounded-full mt-4"></div>
             </div>
          </div>
          
          <div className="md:w-1/2 space-y-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              About Our Mission
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We started with a simple goal: to make high-quality, authentic IELTS preparation accessible to everyone in Uzbekistan.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Our team consists of certified examiners and band 8.5+ scorers who understand exactly what it takes to succeed. We don't just provide tests; we provide a roadmap to your dream university.
            </p>
            <div className="flex gap-4 pt-4">
              <Link href="/register">
                 <Button className="rounded-full px-8">Join Our Community</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
