import React, { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react"; // si tu passes les props via Inertia
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
// import apiService from "@/services/ApiService";
import ApiService from "@/services/api";
import { DiscussionFeed } from "@/Components/clubs/DiscussionFeed";
import { ReadingChallenge } from "@/Components/clubs/ReadingChallenge";

type ClubDetailPageProps = {
  clubId: number;
};

export default function ClubDetailPage({ clubId }: ClubDetailPageProps) {
  const [club, setClub] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Charger les infos du club + statut + messages
  useEffect(() => {
    if (!clubId) return;
    loadClub();
    loadMessages();
  }, [clubId]);

  const loadClub = async () => {
    // tu as une route GET /clubs/{id}/show dans ton ClubController
    const res = await ApiService.axios.get(`/clubs/${clubId}`);
    setClub(res.data.club);
    setIsJoined(res.data.is_joined);
  };

  const loadMessages = async () => {
    const msgs = await ApiService .getClubMessages(clubId);
    setMessages(msgs);
  };

  const handleJoin = async () => {
    if (isJoined) {
      // tu peux appeler une route /clubs/{id}/leave si tu en crées une, pour l'instant juste front
      return;
    }
    const res = await ApiService .joinClub(clubId);
    if (res.success) {
      setIsJoined(true);
      await loadClub();
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const res = await ApiService .sendClubMessage(clubId, newMessage);
    if (res.success) {
      setNewMessage("");
      await loadMessages();
    }
  };

  if (!club) {
    return <div className="text-white p-6">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-[#1C1C1C] text-[#F6F6F6] p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <button
          onClick={() => history.back()}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">Retour</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-[#262626] rounded-[32px] p-6 border border-white/5">
              <img
                src={club.cover ?? "https://via.placeholder.com/800x400"}
                className="rounded-2xl w-full aspect-video object-cover mb-6"
                alt=""
              />
              <h2 className="text-2xl font-black mb-2">{club.name}</h2>
              <p className="text-zinc-400 text-sm mb-6">
                {club.description ?? "Club de lecture"}
              </p>

              <button
                onClick={handleJoin}
                className={`w-full py-3 rounded-2xl font-black text-sm transition-all ${
                  isJoined
                    ? "bg-white/5 text-zinc-400 border border-white/5"
                    : "bg-[#EC5939] text-white shadow-xl shadow-[#EC5939]/20"
                }`}
              >
                {isJoined ? "Membre du club" : "Rejoindre le club"}
              </button>
            </div>

            <ReadingChallenge
              challenge={{
                title: "Challenge",
                books: [{ id: 1, title: "Livre exemple", progress: 50 }],
              }}
            />
          </aside>

          {/* Discussion */}
          <div className="lg:col-span-8 flex flex-col h-[700px] bg-[#262626] rounded-[32px] border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/2 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <MessageSquare className="text-[#EC5939]" size={20} />
                Discussion Générale
              </h3>
            </div>

            {isJoined ? (
              <div className="flex flex-col h-full">
                <DiscussionFeed messages={messages} />
                <div className="p-4 mt-auto">
                  <div className="bg-[#1C1C1C] rounded-[20px] p-2 flex items-center gap-2 border border-white/5">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Écrivez un message..."
                      className="bg-transparent flex-grow px-4 text-sm focus:outline-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-[#EC5939] p-2.5 rounded-xl text-white"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                <p className="text-zinc-500 mb-6">
                  Rejoignez ce club pour participer aux discussions.
                </p>
                <button
                  onClick={handleJoin}
                  className="px-8 py-3 bg-white text-black font-black rounded-2xl"
                >
                  Rejoindre
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
