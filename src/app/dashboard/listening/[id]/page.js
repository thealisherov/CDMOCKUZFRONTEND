"use client";

import { use, useEffect } from "react";
import Timer from "@/components/Timer";
import AudioPlayer from "@/components/AudioPlayer";
import { Button } from "@/components/ui/button";

export default function ListeningTestPage({ params }) {
  const { id } = use(params);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4 border-b pb-4">
         <h1 className="text-xl font-bold">Listening Test #{id}</h1>
         <div className="flex items-center gap-4">
           <Timer initialMinutes={40} />
           <Button variant="destructive">Exit</Button>
           <Button>Submit</Button>
         </div>
      </div>

      <div className="mb-6 sticky top-0 z-10">
        <AudioPlayer src="/audio/sample.mp3" />
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="max-w-4xl mx-auto space-y-8">
           <div className="bg-card p-6 rounded-lg border shadow-sm">
             <h3 className="text-xl font-semibold mb-4">Part 1: Questions 1-10</h3>
             <p className="text-muted-foreground mb-6">Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.</p>
             
             <div className="space-y-4 grid gap-4 p-4 border rounded bg-secondary/10">
               <div className="flex items-center gap-4 justify-between">
                 <span className="font-medium">1. Customer Name:</span>
                 <input type="text" className="border-b bg-transparent outline-none focus:border-primary w-1/2" placeholder="Answer..." />
               </div>
               <div className="flex items-center gap-4 justify-between">
                 <span className="font-medium">2. Date of Birth:</span>
                 <input type="text" className="border-b bg-transparent outline-none focus:border-primary w-1/2" placeholder="Answer..." />
               </div>
               <div className="flex items-center gap-4 justify-between">
                 <span className="font-medium">3. Reason for visit:</span>
                 <input type="text" className="border-b bg-transparent outline-none focus:border-primary w-1/2" placeholder="Answer..." />
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
