"use client";

import { useState } from "react";
import { Users, MessageSquare, Handshake } from "lucide-react";
import { useSocket } from "@/hooks/use-socket";

// Note: This is a simplified interface as requested, connected to socket for basic functionality
// In a full implementation, this would fetch the actual friends list from Drizzle DB

export default function QuizzlySocialPage() {
  const [activeTab, setActiveTab] = useState<"friends" | "chat">("friends");
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || !socket) return;

    // basic broadcast to a global "quizzly-global" room
    socket.emit("send-message", { roomId: "quizzly-global", text: input });
    setMessages((prev) => [...prev, `Moi: ${input}`]);
    setInput("");
  };

  // Setup basic listener
  useState(() => {
    if (socket) {
      socket.emit("join-room", "quizzly-global");
      socket.on("receive-message", (msg: any) => {
        setMessages((prev) => [...prev, `Ami: ${msg.text}`]);
      });
    }
    return undefined;
  });

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-800">Social</h1>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("friends")}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition ${activeTab === "friends" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Mes amis
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition ${activeTab === "chat" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Discussions
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        {activeTab === "friends" ? (
          <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
            <Handshake className="w-16 h-16 text-yellow-400 mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Ajouter des amis
            </h2>
            <p className="text-slate-500 mb-6 max-w-md">
              Tu peux ajouter seulement un pseudo qui correspond à un joueur
              connu.
            </p>

            <div className="flex max-w-md w-full gap-2">
              <input
                placeholder="Pseudo du joueur..."
                className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl outline-none focus:border-violet-500"
              />
              <button className="bg-violet-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-violet-700 transition">
                Ajouter
              </button>
            </div>

            <div className="mt-16 text-slate-400 font-medium italic">
              Tu n'as pas encore d'amis...
            </div>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            <div className="w-1/3 border-r border-slate-100 p-4">
              <div className="bg-violet-50 text-violet-700 font-bold p-4 rounded-xl cursor-pointer">
                Tribu Globale (Chat public)
                {isConnected ? (
                  <span className="block text-xs text-green-600 mt-1">
                    Connecté via WebSocket
                  </span>
                ) : (
                  <span className="block text-xs text-red-500 mt-1">
                    Déconnecté
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-400 mt-20 flex flex-col items-center">
                    <MessageSquare className="w-12 h-12 mb-3 text-slate-300" />
                    SÉLECTIONNE UNE DISCUSSION
                  </div>
                ) : (
                  messages.map((m, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl max-w-[70%] ${m.startsWith("Moi") ? "bg-violet-600 text-white ml-auto" : "bg-white border border-slate-200 text-slate-700"}`}
                    >
                      {m}
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Écrire un message..."
                  className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl outline-none"
                />
                <button
                  onClick={handleSend}
                  className="bg-violet-600 text-white font-bold px-6 py-3 rounded-xl"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
