import Link from "next/link";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-secondary py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
               <span className="text-2xl">IELTS</span> PREP
            </Link>
            <p className="text-sm text-secondary-foreground/80">
              Master the IELTS exam with our comprehensive preparation platform. 
              Designed by experts, built for your success.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram size={20} />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin size={20} />
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Platform</h3>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              <li><Link href="/dashboard/reading" className="hover:text-primary transition-colors">Reading Tests</Link></li>
              <li><Link href="/dashboard/listening" className="hover:text-primary transition-colors">Listening Tests</Link></li>
              <li><Link href="/dashboard/writing" className="hover:text-primary transition-colors">Writing Practice</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Speaking Mock (Soon)</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Company</h3>
            <ul className="space-y-2 text-sm text-secondary-foreground/80">
              <li><Link href="#about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#founders" className="hover:text-primary transition-colors">Our Team</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Subscribe</h3>
            <p className="text-sm text-secondary-foreground/80">
              Get the latest tips and updates.
            </p>
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button 
                type="submit" 
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                Join
              </button>
            </form>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-secondary-foreground/60">
          © {new Date().getFullYear()} IELTS Prep Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
