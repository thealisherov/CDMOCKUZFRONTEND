import { Zap, BookOpen, BarChart3, Users } from "lucide-react";

const features = [
  {
    icon: <BookOpen className="h-10 w-10 text-primary" />,
    title: "Official Format Tests",
    description: "Practice with tests that exactly mimic the real IELTS exam structure and timing."
  },
  {
    icon: <Zap className="h-10 w-10 text-primary" />,
    title: "Instant Results",
    description: "Get immediate scores for Listerning and Reading modules to track your progress."
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-primary" />,
    title: "Detailed Analytics",
    description: "Visualize your improvement over time with our comprehensive dashboard."
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: "Expert Community",
    description: "Join thousands of students and get tips from top IELTS instructors."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-secondary/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Why Choose Our Platform?
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Everything you need to score Band 7.0+ in one place.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6 border rounded-lg bg-background shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 p-3 bg-primary/10 rounded-full">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
