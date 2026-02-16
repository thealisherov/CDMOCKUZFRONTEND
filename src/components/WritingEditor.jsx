"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function WritingEditor({ onSubmit = () => {} }) {
  const [text, setText] = useState("");
  
  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  
  return (
    <div className="flex flex-col h-full bg-background border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b bg-secondary/30">
        <div className="font-semibold text-sm">Task Response</div>
        <div className="text-sm text-muted-foreground font-mono">
           Words: <span className={wordCount < 150 ? "text-red-500" : "text-green-600"}>{wordCount}</span> / 150+
        </div>
      </div>
      
      <textarea
        className="flex-1 p-4 resize-none outline-none bg-background text-foreground font-serif leading-relaxed text-lg"
        placeholder="Start typing your essay here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck="true"
      />
      
      <div className="p-4 border-t bg-secondary/10 flex justify-end gap-2">
         <Button variant="outline" onClick={() => setText("")}>Clear</Button>
         <Button onClick={() => onSubmit(text)}>Submit Essay</Button>
      </div>
    </div>
  );
}
