import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const tiers = [
  {
    name: "Free",
    price: "0",
    features: [
      "Access to 10 Reading Tests",
      "Access to 5 Listening Tests",
      "Mock Exam Mode",
      "Writing Task Grading (Automated)",
    ],
    notIncluded: [
      "Expert Writing Feedback",
      "Speaking Mock Tests",
      "Personalized Study Plan",
      "Predicted Test Questions",
    ],
    buttonText: "Get Started Free",
    popular: false,
  },
  {
    name: "Premium",
    price: "249,000",
    features: [
      "Unlimited Reading & Listening Tests",
      "Writing Correction by Examiners",
      "Speaking Mock with AI + Human Feedback",
      "Detailed band score analysis",
      "Vocabulary Builder",
      "Predicted Q2 2024 Questions",
    ],
    notIncluded: [],
    buttonText: "Upgrade Now",
    popular: true,
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-secondary/50">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Start for free, upgrade when you're ready to master the exam.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div 
              key={tier.name}
              className={`relative flex flex-col p-8 bg-background border rounded-2xl shadow-sm ${tier.popular ? "border-primary shadow-lg ring-1 ring-primary" : "border-border"}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground shadow-sm">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground">{tier.name}</h3>
                <div className="mt-4 flex items-baseline text-foreground">
                  <span className="text-4xl font-extrabold tracking-tight">{tier.price}</span>
                  <span className="ml-1 text-xl font-semibold opacity-60">UZS / month</span>
                </div>
                <p className="mt-4 text-muted-foreground text-sm">per user, billed monthly</p>
              </div>
              
              <ul role="list" className="mb-8 space-y-4 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                     <Check className="h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
                     <span className="ml-3 text-sm text-foreground">{feature}</span>
                  </li>
                ))}
                 {tier.notIncluded.map((feature) => (
                  <li key={feature} className="flex items-start text-muted-foreground">
                     <X className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                     <span className="ml-3 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full ${tier.popular ? "" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                variant={tier.popular ? "default" : "secondary"}
                size="lg"
              >
                {tier.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
