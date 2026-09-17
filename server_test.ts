import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3001;

  app.use(express.json());

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Gemini Chatbot Endpoint (Using low-latency gemini-3.1-flash-lite)
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages, systemInstruction, contextData } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(200).json({
          reply:
            "AI coaching assistant is ready! (Note: GEMINI_API_KEY is not configured yet, so this is a simulated coaching advisor response.)",
        });
      }

      const ai = getGenAI();

      // Transform messages for gemini
      // Use gemini-3.1-flash-lite as requested for low latency
      const defaultSystem = `You are "Gurukul Assistant", an intelligent, helpful AI assistant built specifically for offline coaching center teachers and administrators (like Keshav).
Your goal is to help with:
1. Student attendance insights, identifying patterns in absentees.
2. Drafting respectful, professional, and empathetic WhatsApp messages for parents.
3. Suggesting revision schedules and teaching tips for Physics, Chemistry, and Mathematics batches.
4. Keeping advice clear, concise, actionable, and warm.`;

      const promptParts = [];
      if (contextData) {
        promptParts.push(`Current Coaching Center Context: ${JSON.stringify(contextData)}\n\n`);
      }

      // Add conversation history
      if (Array.isArray(messages) && messages.length > 0) {
        for (const msg of messages) {
          promptParts.push(`${msg.role === "user" ? "Teacher" : "Assistant"}: ${msg.content}\n`);
        }
      } else {
        promptParts.push("Hello!");
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: promptParts.join("\n"),
        config: {
          systemInstruction: systemInstruction || defaultSystem,
          temperature: 0.7,
        },
      });

      const reply = response.text || "I am here to assist your coaching classes!";
      return res.json({ reply });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      return res.status(500).json({
        error: error?.message || "Failed to generate coaching intelligence",
        reply: "I encountered a temporary error connecting to the AI model. Please try again.",
      });
    }
  });

  // Fast AI Quick Attendance / Notification Drafter
  app.post("/api/gemini/draft-message", async (req, res) => {
    try {
      const { studentName, className, date, reason } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          message: `Dear Parent, this is to inform you that ${studentName} was absent from ${className} today (${date}). Please ensure regular attendance. Regards, Keshav Coaching.`,
        });
      }

      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `Draft a concise, polite WhatsApp message from teacher Keshav to the parent of student "${studentName}" who was absent from "${className}" today (${date}). Reason/Note: ${reason || "Unexcused"}. Keep it under 25 words and professional.`,
      });

      return res.json({ message: response.text?.trim() });
    } catch (err: any) {
      console.error("Draft error:", err);
      res.json({
        message: `Hello, ${req.body.studentName} was absent from coaching today.`,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Coaching Center Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
