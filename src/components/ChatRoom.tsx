"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  role: "human" | "ai";
  text: string;
  error?: boolean;
};

const AGENT_KEY = "lumen.agentId";
const AGENT_URL_KEY = "lumen.agentUrl";

function cleanChatReply(raw: string) {
  let text = raw
    .replace(/<\/?thinking>/gi, "")
    .replace(/<\/?think>/gi, "")
    .replace(/^Branch:.*$/gim, "")
    .replace(/^Agent:.*$/gim, "")
    .replace(/^Repo:.*$/gim, "")
    .replace(/^Refresh website.*$/gim, "")
    .replace(/^Vercel akan.*$/gim, "")
    .trim();

  const closeIdx = text.toLowerCase().lastIndexOf("</thinking>");
  if (closeIdx !== -1) {
    text = text.slice(closeIdx + "</thinking>".length).trim();
  }

  return text || "Selesai.";
}

export function ChatRoom() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "ai",
      text:
        "Hai — saya Lumen.\n\nPerintah di sini mengedit website ini lewat Cursor Cloud Agent (push main → Vercel).\n\nContoh: \"Tambahkan menu Product di homepage\"",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [agentId, setAgentId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAgentId(sessionStorage.getItem(AGENT_KEY));
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  async function pollRun(nextAgentId: string, runId: string) {
    const started = Date.now();
    while (Date.now() - started < 15 * 60 * 1000) {
      const res = await fetch(
        `/api/agent/status?agentId=${encodeURIComponent(nextAgentId)}&runId=${encodeURIComponent(runId)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Status failed");

      setStatus(String(data.status || "RUNNING"));

      if (["FINISHED", "ERROR", "CANCELLED", "EXPIRED"].includes(data.status)) {
        if (data.status !== "FINISHED") {
          throw new Error(data.result || `Run ${data.status}`);
        }
        const raw =
          (data.result as string)?.trim() ||
          "Selesai.";
        return cleanChatReply(raw);
      }

      await new Promise((r) => setTimeout(r, 3000));
    }
    throw new Error("Timeout menunggu Cloud Agent");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const human: ChatMessage = {
      id: `h-${Date.now()}`,
      role: "human",
      text,
    };
    const pendingId = `a-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      human,
      { id: pendingId, role: "ai", text: "" },
    ]);
    setInput("");
    setSending(true);
    setStatus("CREATING");

    try {
      const currentAgentId = sessionStorage.getItem(AGENT_KEY);
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          agentId: currentAgentId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create agent failed");

      if (data.agentId) {
        sessionStorage.setItem(AGENT_KEY, data.agentId);
        setAgentId(data.agentId);
      }
      if (data.agentUrl) {
        sessionStorage.setItem(AGENT_URL_KEY, data.agentUrl);
      }

      const reply = await pollRun(data.agentId, data.runId);
      setMessages((prev) =>
        prev.map((m) => (m.id === pendingId ? { ...m, text: reply } : m)),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId
            ? { ...m, text: `Gagal: ${message}`, error: true }
            : m,
        ),
      );
    } finally {
      setSending(false);
      setStatus("");
    }
  }

  function resetAgent() {
    sessionStorage.removeItem(AGENT_KEY);
    sessionStorage.removeItem(AGENT_URL_KEY);
    setAgentId(null);
  }

  return (
    <section id="chat" className="chat-panel">
      <div className="chat-head">
        <div>
          <div className="brand">LUMEN</div>
          <p>Chatroom · edit website ini</p>
        </div>
        <div className="chat-actions">
          {agentId ? (
            <button type="button" onClick={resetAgent} disabled={sending}>
              Reset
            </button>
          ) : null}
          <span className={`badge ${sending ? "busy" : "live"}`}>
            {sending ? "Proses" : "Live"}
          </span>
        </div>
      </div>

      {sending ? (
        <div className="process">Cloud Agent · {status || "RUNNING"}</div>
      ) : null}

      <div className="messages" ref={listRef}>
        {messages.map((m) => (
          <div
            key={m.id}
            className={`bubble-wrap ${m.role === "human" ? "right" : "left"}`}
          >
            <div className="who">{m.role === "human" ? "You" : "Lumen"}</div>
            <div className={`bubble ${m.error ? "error" : ""} ${m.role}`}>
              {m.text || (sending ? "Sedang memproses…" : "…")}
            </div>
          </div>
        ))}
      </div>

      <form className="composer" onSubmit={onSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Contoh: tambahkan menu Product…'
          disabled={sending}
        />
        <button type="submit" disabled={sending || !input.trim()}>
          ↑
        </button>
      </form>

      <style jsx>{`
        .chat-panel {
          display: flex;
          flex-direction: column;
          height: min(78vh, 760px);
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 22px;
          overflow: hidden;
        }
        .chat-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 16px 18px;
          border-bottom: 1px solid var(--line);
        }
        .brand {
          letter-spacing: 0.14em;
          font-size: 22px;
          font-weight: 700;
        }
        .chat-head p {
          margin: 2px 0 0;
          color: var(--ink-soft);
          font-size: 13px;
        }
        .chat-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .chat-actions button {
          border: 1px solid var(--line);
          background: transparent;
          border-radius: 10px;
          padding: 8px 10px;
          cursor: pointer;
          color: var(--ink);
        }
        .badge {
          border-radius: 12px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid var(--line);
        }
        .badge.live {
          background: var(--teal-soft);
          color: var(--teal);
        }
        .badge.busy {
          background: var(--badge-busy-bg);
          color: var(--coral-deep);
        }
        .process {
          margin: 10px 14px 0;
          padding: 10px 12px;
          border-radius: 12px;
          background: var(--process-bg);
          color: var(--teal);
          font-size: 13px;
          font-weight: 600;
        }
        .messages {
          flex: 1;
          overflow: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .bubble-wrap.right {
          align-self: flex-end;
          text-align: right;
        }
        .bubble-wrap.left {
          align-self: flex-start;
        }
        .who {
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 6px;
          color: var(--teal);
        }
        .bubble-wrap.right .who {
          color: var(--coral-deep);
        }
        .bubble {
          max-width: 42rem;
          white-space: pre-wrap;
          border-radius: 18px;
          padding: 12px 14px;
          line-height: 1.45;
          font-size: 15px;
        }
        .bubble.ai {
          background: var(--white);
          border: 1px solid var(--line);
          border-bottom-left-radius: 6px;
        }
        .bubble.human {
          background: var(--human-bubble-bg);
          color: var(--human-bubble-fg);
          border-bottom-right-radius: 6px;
        }
        .bubble.error {
          background: var(--error-bg);
          color: var(--coral-deep);
          border: 1px solid var(--error-border);
        }
        .composer {
          display: flex;
          gap: 10px;
          padding: 14px;
          border-top: 1px solid var(--line);
        }
        .composer input {
          flex: 1;
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 14px 16px;
          font: inherit;
          background: var(--surface-solid);
          color: var(--ink);
        }
        .composer button {
          width: 52px;
          height: 52px;
          border: 0;
          border-radius: 16px;
          background: var(--coral);
          color: white;
          font-size: 20px;
          cursor: pointer;
        }
        .composer button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
      `}</style>
    </section>
  );
}
