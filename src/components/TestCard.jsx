import { Clock, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TestCard({ test }) {
  return (
    <div className="flex flex-col justify-between rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="space-y-2">
        <h3 className="font-semibold text-lg leading-none tracking-tight">{test.title}</h3>
        <p className="text-sm text-muted-foreground">{test.description}</p>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{test.duration} min</span>
        </div>
        <div className="flex items-center gap-1">
          <BarChart className="h-4 w-4" />
          <span>{test.difficulty}</span>
        </div>
      </div>
      <div className="mt-6">
        <Link href={`./reading/${test.id}`}>
          <Button className="w-full">Start Test</Button>
        </Link>
      </div>
    </div>
  );
}
