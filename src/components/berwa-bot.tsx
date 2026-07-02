"use client";

import { Bot, Send, X } from "lucide-react";
import { useState } from "react";

type Message = { sender: "user" | "bot"; text: string };

export function BerwaBot({ role = "PUBLIC_VISITOR" }: { role?: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Hi, I’m Berwa Assistant. How can I help you today?" }
  ]);

  async function send() {
    if (!text.trim()) return;
    const question = text;
    setText("");
    setMessages((items) => [...items, { sender: "user", text: question }]);
    const res = await fetch("/api/berwa-bot", { method: "POST", body: JSON.stringify({ message: question, role }), headers: { "Content-Type": "application/json" } });
    const data = await res.json();
    setMessages((items) => [...items, { sender: "bot", text: data.answer }]);
  }

  if (!open) {
    return <button className="btn btn-gold fixed bottom-5 right-5 z-40 shadow-xl" onClick={() => setOpen(true)}><Bot size={18} /> Berwa Assistant</button>;
  }

  return (
    <section className="card fixed bottom-5 right-5 z-40 flex h-[520px] w-[min(390px,calc(100vw-24px))] flex-col overflow-hidden">
      <header className="flex items-center justify-between bg-[var(--navy)] px-4 py-3 text-white">
        <strong className="flex items-center gap-2"><Bot size={18} /> Berwa Assistant</strong>
        <button onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
        {messages.map((msg, index) => (
          <p key={index} className={`rounded-md p-3 ${msg.sender === "user" ? "ml-8 bg-[var(--navy)] text-white" : "mr-8 bg-black/5 dark:bg-white/10"}`}>{msg.text}</p>
        ))}
      </div>
      <div className="flex gap-2 border-t border-[var(--border)] p-3">
        <input className="input" value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => event.key === "Enter" && send()} placeholder="Ask a question" />
        <button className="btn btn-primary" onClick={send} aria-label="Send"><Send size={18} /></button>
      </div>
    </section>
  );
}
