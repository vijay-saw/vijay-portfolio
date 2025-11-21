import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_BASE } from "../api";
import { Send, MessageCircle, X, Volume2, VolumeX } from "lucide-react";

// Speech-to-text support
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true); // For manual speak only

  const chatEndRef = useRef(null);
  const historyLoaded = useRef(false);

  // Load chat history once
  useEffect(() => {
    if (!historyLoaded.current) {
      const saved = JSON.parse(localStorage.getItem("chatHistory") || "[]");
      setMessages(saved);
      historyLoaded.current = true;
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Manual text-to-speech (ONLY when user clicks 🔊)
  const speak = (text) => {
    if (!voiceEnabled) return;

    try {
      const synth = window.speechSynthesis;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      utter.rate = 1;
      utter.pitch = 1;
      synth.speak(utter);
    } catch (err) {
      console.error("TTS error:", err);
    }
  };

  // Send message to backend
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    const updated = [...messages, userMsg];

    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/chat/`, {
        history: updated,
        message: input,
      });

      const botMsg = { sender: "bot", text: res.data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Error: Unable to get response." },
      ]);
    }

    setLoading(false);
  };

  // Start Speech Recognition
  const startRecording = () => {
    if (!SpeechRecognition) {
      alert("Speech recognition not supported on this browser.");
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = "en-US";
    recog.interimResults = false;

    setRecording(true);
    recog.start();

    recog.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setInput(text);

      setRecording(false);
      setTimeout(sendMessage, 300);
    };

    recog.onerror = () => setRecording(false);
    recog.onend = () => setRecording(false);
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-500 transition"
      >
        {open ? <X size={26} /> : <MessageCircle size={26} />}
      </button>

      {/* Chatbox */}
      {open && (
        <div
          className="fixed bottom-20 right-6 w-96 h-128 bg-slate-900 dark:bg-slate-100
          text-white dark:text-slate-900 border border-slate-700 dark:border-slate-300
          rounded-2xl shadow-2xl flex flex-col animate-slideUp"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 dark:border-slate-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                🤖
              </div>
              <h2 className="text-lg font-semibold">Vijay's AI Assistant</h2>
            </div>

            {/* Voice Toggle On/Off */}
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="p-2 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-lg"
            >
              {voiceEnabled ? (
                <Volume2 className="text-indigo-400" size={20} />
              ) : (
                <VolumeX className="text-red-400" size={20} />
              )}
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div
                  className={`max-w-[80%] p-3 text-sm rounded-xl shadow
                    ${
                      msg.sender === "user"
                        ? "ml-auto bg-indigo-600 text-white rounded-br-none"
                        : "bg-slate-700 dark:bg-slate-200 dark:text-slate-900 text-white rounded-bl-none"
                    }
                  `}
                >
                  {msg.text}
                </div>

                {/* Speak button only for bot */}
                {msg.sender === "bot" && (
                  <button
                    onClick={() => speak(msg.text)}
                    className="p-2 text-indigo-400 hover:text-indigo-500"
                    title="Speak this reply"
                  >
                    🔊
                  </button>
                )}
              </div>
            ))}

            {/* Typing animation */}
            {loading && (
              <div className="flex items-center gap-2 text-gray-400 px-2">
                <span className="dot-1">●</span>
                <span className="dot-2">●</span>
                <span className="dot-3">●</span>
              </div>
            )}

            {/* Recording Waves */}
            {recording && (
              <div className="flex items-center justify-center mt-2">
                <div className="wave">
                  <div></div><div></div><div></div><div></div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input box */}
          <div className="flex items-center gap-2 p-3 border-t border-slate-700 dark:border-slate-300">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask something…"
              className="flex-1 p-2 rounded-lg bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 outline-none"
            />

            {/* Mic button */}
            <button
              onClick={startRecording}
              className={`p-3 rounded-full ${
                recording
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-slate-700 dark:bg-slate-300 text-white dark:text-slate-900"
              }`}
            >
              🎤
            </button>

            {/* Send button */}
            <button
              onClick={sendMessage}
              className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-500"
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

