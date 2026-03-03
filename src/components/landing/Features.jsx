"use client";
import { Zap, BookOpen, BarChart3, Users } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

export default function Features() {
  const { t } = useTranslation();

  const featuresList = [
    {
      icon: <BookOpen className="h-10 w-10 text-primary" />,
      title: t("features.items.0.title"),
      description: t("features.items.0.desc")
    },
    {
      icon: <Zap className="h-10 w-10 text-primary" />,
      title: t("features.items.1.title"),
      description: t("features.items.1.desc")
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-primary" />,
      title: t("features.items.2.title"),
      description: t("features.items.2.desc")
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: t("features.items.3.title"),
      description: t("features.items.3.desc")
    }
  ];

  return (
    <section id="features" className="py-20 bg-secondary/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            {t("features.title")}
          </h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            {t("features.desc")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuresList.map((feature, index) => (
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
