// src/pages/dashboard/MessagesPanel.jsx
import { useEffect, useState } from "react";
import { getMyMessages, deleteMessage, markMessageRead } from "../../api";

export default function MessagesPanel({ onUnreadChange }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [markingId, setMarkingId] = useState(null);
  const [filter, setFilter] = useState("all"); // "all" | "unread"

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    getMyMessages()
      .then((res) => {
        const data = res && res.data ? res.data : res;
        if (mounted) {
          const arr = Array.isArray(data) ? data : [];
          setMessages(arr);
        }
      })
      .catch((err) => {
        console.error("load messages error:", err);
        if (mounted) setError("Unable to load messages.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Whenever messages change, update unread count in parent
  useEffect(() => {
    if (typeof onUnreadChange === "function") {
      const count = messages.filter((m) => !m.is_read).length;
      onUnreadChange(count);
    }
  }, [messages, onUnreadChange]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    setDeletingId(id);
    try {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("delete message error:", err);
      alert("Failed to delete message.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkRead = async (id) => {
    setMarkingId(id);
    try {
      await markMessageRead(id);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, is_read: true } : m
        )
      );
    } catch (err) {
      console.error("mark read error:", err);
      alert("Failed to mark as read.");
    } finally {
      setMarkingId(null);
    }
  };

  const handleCardClick = (m) => {
    if (!m.is_read) {
      handleMarkRead(m.id);
    }
  };

  const formatDate = (value) => {
    if (!value) return "";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  const filteredMessages =
    filter === "unread"
      ? messages.filter((m) => !m.is_read)
      : messages;

  if (loading) {
    return (
      <div className="p-4 text-slate-300">
        Loading messages…
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Messages</h2>
          <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {messages.length} {messages.length === 1 ? "message" : "messages"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
            Unread: {unreadCount}
          </span>
          <button
            onClick={() => setFilter("all")}
            className={`px-2 py-1 rounded border text-xs ${
              filter === "all"
                ? "border-blue-500 text-blue-300 bg-blue-500/10"
                : "border-slate-600 text-slate-300 bg-slate-800"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-2 py-1 rounded border text-xs ${
              filter === "unread"
                ? "border-blue-500 text-blue-300 bg-blue-500/10"
                : "border-slate-600 text-slate-300 bg-slate-800"
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 text-red-400 text-sm bg-red-950/40 border border-red-500/40 rounded px-3 py-2">
          {error}
        </div>
      )}

      {filteredMessages.length === 0 ? (
        <div className="text-slate-400 text-sm border border-dashed border-slate-700 rounded-lg p-6 bg-slate-900/40">
          {filter === "unread"
            ? "No unread messages."
            : "No messages yet. When someone submits your contact form, their message will appear here."}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((m) => (
            <div
              key={m.id}
              onClick={() => handleCardClick(m)}
              className={`rounded-xl border p-4 flex justify-between gap-4 cursor-pointer transition-colors ${
                m.is_read
                  ? "border-slate-700 bg-slate-900/70 hover:border-slate-500"
                  : "border-blue-500 bg-slate-900 hover:border-blue-400"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-100 truncate">
                    From: {m.name}
                  </span>

                  {m.email && (
                    <a
                      href={`mailto:${m.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-blue-300 underline break-all"
                    >
                      {m.email}
                    </a>
                  )}

                  {!m.is_read && (
                    <span className="ml-1 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/40">
                      New
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-200 whitespace-pre-wrap break-words">
                  {m.message}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{formatDate(m.created_at)}</span>
                  {m.profile_username && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px]">
                      Portfolio: {m.profile_username}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {!m.is_read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkRead(m.id);
                    }}
                    disabled={markingId === m.id}
                    className="px-3 py-1 text-xs rounded border border-emerald-500 text-emerald-300 hover:bg-emerald-600/10 disabled:opacity-60"
                  >
                    {markingId === m.id ? "Marking…" : "Mark as read"}
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(m.id);
                  }}
                  disabled={deletingId === m.id}
                  className="mt-auto px-3 py-1 text-xs rounded border border-red-500 text-red-300 hover:bg-red-600/10 disabled:opacity-60"
                >
                  {deletingId === m.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

