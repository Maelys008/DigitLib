import React from "react";

export const DiscussionFeed: React.FC<{ messages: any[] }> = ({ messages }) => (
  <div className="flex flex-col gap-4 p-4 h-[400px] overflow-y-auto scrollbar-hide">
    {messages.map((msg) => (
      <div key={msg.id} className="flex flex-col items-start">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-zinc-400">
            {msg.club_member?.user?.name || "Utilisateur"}
          </span>
          <span className="text-[10px] text-zinc-500">
            {msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : ""}
          </span>
        </div>
        <div className="px-4 py-2 rounded-2xl max-w-[85%] text-sm bg-[#333333] text-zinc-100">
          {msg.message}
        </div>
      </div>
    ))}
  </div>
);
