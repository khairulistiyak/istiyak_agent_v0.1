import React from "react";
import { useChatStore } from "../../store/useChatStore.js";
import { SessionItem } from "./SessionItem.js";

export const SessionList: React.FC = () => {
  const { sessions } = useChatStore();

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-[10px] text-gray-500 font-medium">
        No active sessions
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="text-[9px] text-gray-600 font-bold uppercase tracking-wider px-2.5 mb-1.5">
        Chat Sessions
      </div>
      {sessions.map((session) => (
        <SessionItem key={session.id} session={session} />
      ))}
    </div>
  );
};
