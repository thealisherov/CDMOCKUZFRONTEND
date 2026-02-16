"use client";

import { use } from "react";
import Timer from "@/components/Timer";
import WritingEditor from "@/components/WritingEditor";
import { Button } from "@/components/ui/button";

export default function WritingTestPage({ params }) {
  const { id } = use(params);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4 border-b pb-4">
        <h1 className="text-xl font-bold">Writing Task #{id}</h1>
         <div className="flex items-center gap-4">
           <Timer initialMinutes={40} />
           <Button variant="destructive">Exit</Button>
         </div>
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-hidden">
        {/* Task Prompt */}
        <div className="h-full overflow-y-auto pr-4 border-r">
          <div className="bg-secondary/50 p-6 rounded-lg mb-6">
            <h3 className="font-bold text-lg mb-2">Instructions</h3>
            <p className="text-muted-foreground mb-4">You should spend about 40 minutes on this task.</p>
            <p className="text-muted-foreground mb-4">Write about the following topic:</p>
            
            <div className="bg-background border p-4 rounded mb-4 font-medium italic">
              "Some people think that children should begin their formal education at a very early age and should spend most of their time on school studies. Others believe that young children should spend most of their time playing."
            </div>
            
            <p className="text-muted-foreground mb-4">Discuss both these views and give your own opinion.</p>
            <p className="text-muted-foreground">Give reasons for your answer and include any relevant examples from your own knowledge or experience.</p>
            <p className="text-muted-foreground mt-2">Write at least 250 words.</p>
          </div>
        </div>
        
        {/* Editor */}
        <div className="h-full overflow-y-auto pl-2">
          <div className="h-full pb-4">
            <WritingEditor onSubmit={(text) => alert(`Submitted ${text.length} characters!`)} />
          </div>
        </div>
      </div>
    </div>
  );
}
