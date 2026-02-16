import Image from "next/image";

const founders = [
  {
    name: "Mukhammadali Otaboyev",
    role: "Band 8.5 Instructor | Frontend Architect",
    bio: "Helping students achieve their dream score through rigorous practice and smart strategies.",
    image: "/images/founder1.jpg" // Placeholder path
  },
  {
     name: "Asadbek Zoirov",
     role: "Co-Founder | IELTS Expert",
     bio: "Passionate about making quality education accessible to everyone in Uzbekistan.",
     image: "/images/founder2.jpg" // Placeholder path
  }
];

export default function Founders() {
  return (
    <section id="founders" className="py-20 bg-background">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Meet the Founders
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
            Built by students who succeeded, for students who want to succeed.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {founders.map((founder, index) => (
            <div key={index} className="flex flex-col md:flex-row items-center gap-6 p-6 border rounded-xl shadow-lg hover:shadow-xl transition-shadow bg-secondary/20">
              <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0 overflow-hidden rounded-full border-4 border-primary/20">
                <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                   {/* Placeholder for image */}
                   <span className="text-center p-2">Image Placeholder</span>
                </div>
              </div>
              <div className="text-center md:text-left space-y-2">
                <h3 className="text-xl font-bold text-primary">{founder.name}</h3>
                <p className="text-sm font-semibold text-foreground/80">{founder.role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {founder.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
