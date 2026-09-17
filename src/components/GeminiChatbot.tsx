import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, ClassItem, Student, Batch } from "../types";
import {
  Sparkles,
  Send,
  Loader2,
  Trash2,
  Bot,
  User as UserIcon,
  Copy,
  Check,
  Lightbulb,
} from "lucide-react";

interface GeminiChatbotProps {
  classes: ClassItem[];
  students: Student[];
  batches: Batch[];
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  classes,
  students,
  batches,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-welcome",
      role: "model",
      content:
        "Namaste Keshav! I am your AI Coaching Assistant powered by Gemini 3.1 Flash-Lite for low-latency coaching intelligence. How can I assist your batches, student attendance follow-ups, or lesson schedules today?",
      timestamp: "Just now",
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-fill prompt if passed from other views
  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const coachingContext = {
        classes: classes.map((c) => ({
          name: c.name,
          enrolledCount: c.students.length,
          room: c.room,
        })),
        batches: batches.map((b) => ({
          startTime: b.startTime,
          endTime: b.endTime,
          days: b.days,
        })),
        totalStudents: students.length,
      };

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role === "model" ? "model" : "user",
            content: m.content,
          })),
          contextData: coachingContext,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const modelMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "model",
        content:
          data.reply ||
          "I am ready to help with your coaching batches and attendance.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      console.error("AI Assistant request failed:", err);
      const fallbackMessage: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: "model",
        content:
          "I had trouble connecting to the Gemini server. Please check your connection and retry in a moment.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearHistory = () => {
    setMessages([
      {
        id: `reset-${Date.now()}`,
        role: "model",
        content:
          "Conversation cleared. How can I assist you with your coaching classes today?",
        timestamp: "Just now",
      },
    ]);
  };

  const samplePrompts = [
    "Draft polite WhatsApp absentee notice for Class 12 Physics",
    "How to re-engage students with frequent absences?",
    "Plan a 1-week revision schedule for Grade 12 CBSE Physics",
    "Draft announcement for upcoming Sunday surprise test",
  ];

  return (
    <div className="space-y-4 pb-24 flex flex-col h-[calc(100vh-140px)] max-h-[800px]">
      {/* Header */}
      <header className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Saraswat AI Advisor
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                gemini-3.1-flash-lite
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Low-latency coaching intelligence for batches, parents & schedules
            </p>
          </div>
        </div>

        <button
          onClick={clearHistory}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center cursor-pointer"
          title="Clear Chat History"
          aria-label="Clear chat history"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </header>

      {/* Messages Thread (Scrollable) */}
      <div
        id="gemini-chat-thread"
        className="flex-1 overflow-y-auto space-y-3 p-4 bg-slate-100/60 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800"
      >
        {messages.map((m) => {
          const isModel = m.role === "model";
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${
                isModel ? "" : "flex-row-reverse"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  isModel
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                }`}
              >
                {isModel ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  <UserIcon className="w-4 h-4" />
                )}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-1 shadow-xs ${
                  isModel
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
                    : "bg-slate-900 dark:bg-indigo-600 text-white"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                <div
                  className={`flex items-center justify-between gap-2 pt-1 border-t text-[10px] ${
                    isModel
                      ? "border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-400"
                      : "border-slate-800 dark:border-indigo-500 text-slate-300 dark:text-indigo-200"
                  }`}
                >
                  <span>{m.timestamp}</span>
                  {isModel && (
                    <button
                      onClick={() => handleCopy(m.content, m.id)}
                      className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer min-h-[30px]"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            Copied
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 shadow-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
              <span>Thinking with Gemini 3.1 Flash-Lite...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 shrink-0">
        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-1" />
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="min-h-[44px] px-3 py-1 text-[11px] font-medium bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs shrink-0"
      >
        <input
          id="gemini-chat-input"
          type="text"
          placeholder="Ask AI Advisor about attendance, parent notices, or batch tips..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="flex-1 px-3 py-2 text-xs focus:outline-hidden text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-transparent min-h-[44px]"
        />
        <button
          id="send-gemini-chat-btn"
          type="submit"
          disabled={!input.trim() || isLoading}
          className="min-h-[44px] px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white disabled:opacity-40 text-white dark:text-slate-900 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
