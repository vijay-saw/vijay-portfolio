// frontend/src/components/Chatbot.jsx
import { useState, useEffect, useRef } from "react";
import axios from "../api"; // shared axios instance
import { Send, MessageCircle, X } from "lucide-react";

/**
 * Props:
 * - ownerUsername: whose portfolio this chatbot is attached to
 * - assistantName: title shown in the header
 *
 * Default site:
 *   <Chatbot />
 *
 * Other users:
 *   <Chatbot
 *     ownerUsername={username}
 *     assistantName={`${name}'s AI Assistant`}
 *   />
 */
const Chatbot = ({
  ownerUsername = "vijay",
  assistantName = "Vijay's AI Assistant",
}) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  // Auto-scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { sender: "user", text };
    const history = [...messages, userMsg];

    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("/chat/", {
        history,
        message: text,
        owner_username: ownerUsername,
      });

      const replyText =
        res?.data?.reply ||
        "I couldn't generate a reply. Please try again in a moment.";

      const botMsg = { sender: "bot", text: replyText };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error("Chat error:", e);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            "❌ Error: Unable to talk to the AI service. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/50 hover:bg-indigo-500 active:scale-95 sm:bottom-6 sm:right-6"
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          className="
            fixed inset-x-0 bottom-0 z-50
            sm:inset-auto sm:bottom-6 sm:right-6 sm:w-96
          "
        >
          <div
            className="
              mx-2 mb-3 flex h-[65vh] flex-col
              rounded-2xl border border-slate-700 bg-slate-950/95
              text-slate-100 shadow-2xl shadow-slate-900/80
              sm:mx-0 sm:mb-0 sm:h-[500px]
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-lg">
                  🤖
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-wide text-slate-400">
                    Chat with
                  </span>
                  <span className="text-sm font-semibold text-slate-50">
                    {assistantName}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 hover:bg-slate-800"
                aria-label="Close chat"
              >
                <X className="h-4 w-4 text-slate-300" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3 text-sm">
              {messages.length === 0 && !loading && (
                <div className="rounded-xl bg-slate-900/80 px-3 py-2 text-xs text-slate-400">
                  Ask me about the portfolio: skills, experience, projects,
                  certifications, and more.
                </div>
              )}

              {messages.map((msg, idx) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={idx}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow ${
                        isUser
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-slate-900 text-slate-100 border border-slate-800 rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl bg-slate-900 px-3 py-2 text-xs text-slate-400">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 delay-150" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 delay-300" />
                    <span className="ml-1">Thinking…</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-800 bg-slate-950 px-3 py-2">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Type your question…"
                  className="
                    max-h-24 flex-1 resize-none rounded-xl bg-slate-900
                    px-3 py-2 text-sm text-slate-100 outline-none
                    placeholder:text-slate-500
                  "
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="
                    flex h-9 w-9 items-center justify-center rounded-full
                    bg-indigo-600 text-white shadow-sm
                    hover:bg-indigo-500 disabled:cursor-not-allowed
                    disabled:bg-slate-700
                  "
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;

