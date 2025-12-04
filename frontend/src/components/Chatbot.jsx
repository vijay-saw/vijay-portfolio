import { useState, useEffect, useRef } from "react";
import axios from "../api"; // use shared axios instance
import { Send, MessageCircle, X } from "lucide-react";

/**
 * Props:
 * - ownerUsername: whose portfolio this chatbot is attached to
 * - assistantName: title shown in the header
 *
 * For your default site, you can just use <Chatbot />.
 * For other users: <Chatbot ownerUsername={username} assistantName={`${name}'s AI Assistant`} />
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

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { sender: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("/chat/", {
        history: [...messages, userMsg],
        message: userMsg.text,
        owner_username: ownerUsername, // 👈 tells backend whose assistant this is
      });

      const replyText = res?.data?.reply || "I couldn't generate a reply.";
      const botMsg = { sender: "bot", text: replyText };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error("Chat error:", e);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "❌ Error: Unable to get response. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-500 transition"
      >
        {open ? <X size={26} /> : <MessageCircle size={26} />}
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="
            fixed bottom-20 right-4 left-4 sm:left-auto sm:right-6
            w-[92vw] sm:w-96
            h-[60vh] sm:h-[500px]
            bg-slate-900
            text-white
            border border-slate-700
            rounded-2xl shadow-2xl flex flex-col z-40
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                🤖
              </div>
              <h2 className="text-lg font-semibold">{assistantName}</h2>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div
                  className={`max-w-[75%] p-3 text-sm rounded-xl shadow
                    ${
                      msg.sender === "user"
                        ? "ml-auto bg-indigo-600 text-white rounded-br-none"
                        : "bg-slate-700 rounded-bl-none"
                    }
                  `}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-gray-400 text-sm px-2">Typing…</div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 p-3 border-t border-slate-700">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask something…"
              className="
                flex-1 p-2 rounded-lg
                bg-slate-800
                text-white
                outline-none text-sm
              "
            />

            <button
              onClick={sendMessage}
              className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 disabled:opacity-60"
              disabled={loading}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;

