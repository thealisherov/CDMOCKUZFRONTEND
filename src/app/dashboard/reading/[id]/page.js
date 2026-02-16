"use client";

import { use } from "react";
import Timer from "@/components/Timer";
import { Button } from "@/components/ui/button";

export default function ReadingTestPage({ params }) {
  const { id } = use(params);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4 border-b pb-4">
        <h1 className="text-xl font-bold">Reading Test #{id}</h1>
        <div className="flex items-center gap-4">
          <Timer initialMinutes={60} />
          <Button variant="destructive">Exit Test</Button>
          <Button>Submit Answers</Button>
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-hidden">
        {/* Left: Passage */}
        <div className="h-full overflow-y-auto pr-4 border-r">
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold mb-4">Passage Title</h2>
            <p className="mb-4 text-justify leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p className="mb-4 text-justify leading-relaxed">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <p className="mb-4 text-justify leading-relaxed">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
            {/* More content to demonstrate scrolling */}
            <p className="mb-4 text-justify leading-relaxed">
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
            </p>
          </div>
        </div>
        
        {/* Right: Questions */}
        <div className="h-full overflow-y-auto pl-2">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg bg-secondary/50 p-2 rounded">Questions 1-5</h3>
              <p className="text-sm text-muted-foreground">Choose the correct heading for each paragraph from the list of headings below.</p>
              
              {[1, 2, 3, 4, 5].map((q) => (
                <div key={q} className="flex flex-col gap-2 p-4 border rounded-lg bg-card hover:bg-accent/10 transition-colors">
                  <div className="flex justify-between">
                     <span className="font-bold">Question {q}</span>
                     <span className="text-xs text-muted-foreground">1 mark</span>
                  </div>
                  <label className="text-sm">Paragraph {String.fromCharCode(64 + q)}</label>
                  <select className="w-full p-2 border rounded bg-background">
                    <option>Select heading...</option>
                    <option>Heading I</option>
                    <option>Heading II</option>
                    <option>Heading III</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
