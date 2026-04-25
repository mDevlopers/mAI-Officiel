"use client";

import { MessageCircle, Send, UserPlus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuizzlyState } from "@/hooks/use-quizzly-state";

export default function QuizzlySocialPage() {
  const { setState, state } = useQuizzlyState();
  const [friendName, setFriendName] = useState("");
  const [message, setMessage] = useState("");

  const onlineFriends = useMemo(
    () => state.friends.filter((friend) => friend.status === "online").length,
    [state.friends]
  );

  const addFriend = () => {
    const clean = friendName.trim();
    if (!clean) return;
    if (state.friends.some((friend) => friend.name.toLowerCase() === clean.toLowerCase())) return;

    setState((previous) => ({
      ...previous,
      friends: [
        {
          id: `${clean.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
          joinedAt: new Date().toISOString(),
          level: Math.max(1, previous.level - 1),
          name: clean,
          status: "online",
        },
        ...previous.friends,
      ],
    }));
    setFriendName("");
  };

  const removeFriend = (friendId: string) => {
    setState((previous) => ({
      ...previous,
      friends: previous.friends.filter((friend) => friend.id !== friendId),
    }));
  };

  const sendMessage = () => {
    const clean = message.trim();
    if (!clean) return;

    setState((previous) => ({
      ...previous,
      chatMessages: [
        ...previous.chatMessages,
        {
          at: new Date().toISOString(),
          from: previous.pseudo,
          id: `msg-${Date.now()}`,
          text: clean,
        },
      ],
    }));
    setMessage("");
  };

  return (
    <section className="quizzly-fun space-y-4">
      <div className="rounded-3xl border border-fuchsia-200 bg-gradient-to-br from-fuchsia-100 to-violet-100 p-5 shadow-lg">
        <h1 className="text-3xl font-black text-violet-700">Amis & Discussions</h1>
        <p className="mt-1 text-violet-600">Crée ta tribu Quizzly, challenge tes amis, et échange des astuces.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-violet-100 bg-white p-4">
          <h2 className="flex items-center gap-2 text-xl font-black text-violet-700"><Users className="size-5" />Mes amis ({state.friends.length})</h2>
          <p className="mb-3 text-xs text-muted-foreground">{onlineFriends} en ligne</p>

          <div className="mb-3 flex gap-2">
            <input className="h-10 flex-1 rounded-lg border border-violet-200 px-2" onChange={(event) => setFriendName(event.target.value)} placeholder="Pseudo de ton ami" value={friendName} />
            <button className="inline-flex items-center rounded-lg bg-violet-600 px-3 text-sm font-semibold text-white" onClick={addFriend} type="button"><UserPlus className="mr-1 size-4" />Ajouter</button>
          </div>

          <div className="space-y-2">
            {state.friends.length > 0 ? (
              state.friends.map((friend) => (
                <article className="flex items-center justify-between rounded-lg border border-violet-100 bg-violet-50/60 px-3 py-2" key={friend.id}>
                  <div>
                    <p className="font-semibold">{friend.name}</p>
                    <p className="text-xs text-muted-foreground">Niv. {friend.level} • {friend.status}</p>
                  </div>
                  <button className="rounded border px-2 py-1 text-xs" onClick={() => removeFriend(friend.id)} type="button">Retirer</button>
                </article>
              ))
            ) : (
              <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">Aucun ami pour l’instant.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-100 bg-white p-4">
          <h2 className="flex items-center gap-2 text-xl font-black text-cyan-700"><MessageCircle className="size-5" />Discussion d'équipe</h2>
          <div className="mt-3 h-64 space-y-2 overflow-y-auto rounded-lg border border-cyan-100 bg-cyan-50/50 p-3">
            {state.chatMessages.map((chatMessage) => (
              <article className="rounded-lg bg-white p-2 shadow-sm" key={chatMessage.id}>
                <p className="text-xs text-cyan-700">{chatMessage.from}</p>
                <p className="text-sm">{chatMessage.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input className="h-10 flex-1 rounded-lg border border-cyan-200 px-2" onChange={(event) => setMessage(event.target.value)} placeholder="Écris un message" value={message} />
            <button className="inline-flex items-center rounded-lg bg-cyan-600 px-3 text-sm font-semibold text-white" onClick={sendMessage} type="button"><Send className="mr-1 size-4" />Envoyer</button>
          </div>
        </div>
      </div>
    </section>
  );
}
