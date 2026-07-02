import { StateCreator } from "zustand";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  agentMode: "chat" | "plan" | "assist" | "agent";
  createdAt: string;
}

// Re-export full slice type so Zustand `set` callback infers correct types
export interface ChatSlice {
  conversations: Conversation[];
  activeId: string | null;
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Omit<Message, "createdAt">) => void;
  updateLastMessageContent: (conversationId: string, content: string) => void;
  updateConversationTitle: (conversationId: string, title: string) => void;
  updateConversationMode: (conversationId: string, mode: Conversation["agentMode"]) => void;
  clearAllConversations: () => void;
}

export const createChatSlice: StateCreator<ChatSlice> = (set) => ({
  conversations: [],
  activeId: null,

  createConversation: () => {
    const id = crypto.randomUUID();
    const newConversation: Conversation = {
      id,
      title: "New Chat",
      messages: [],
      agentMode: "chat",
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      conversations: [newConversation, ...state.conversations],
      activeId: id,
    }));
    return id;
  },

  deleteConversation: (id) => {
    set((state) => {
      const filtered = state.conversations.filter((c) => c.id !== id);
      let newActiveId = state.activeId;
      if (state.activeId === id) {
        newActiveId = filtered.length > 0 ? filtered[0].id : null;
      }
      return {
        conversations: filtered,
        activeId: newActiveId,
      };
    });
  },

  setActiveConversation: (id) => {
    set({ activeId: id });
  },

  addMessage: (conversationId, message) => {
    set((state) => {
      const updatedConversations = state.conversations.map((c) => {
        if (c.id === conversationId) {
          const updatedMessages = [
            ...c.messages,
            {
              ...message,
              createdAt: new Date().toISOString(),
            },
          ];
          let title = c.title;
          if (c.title === "New Chat" && message.role === "user") {
            title =
              message.content.length > 25
                ? message.content.substring(0, 25).trim() + "..."
                : message.content;
          }
          return {
            ...c,
            title,
            messages: updatedMessages,
          };
        }
        return c;
      });
      return { conversations: updatedConversations };
    });
  },

  updateLastMessageContent: (conversationId, content) => {
    set((state) => {
      const updatedConversations = state.conversations.map((c) => {
        if (c.id === conversationId) {
          const messages = [...c.messages];
          if (messages.length > 0) {
            const lastMsg = { ...messages[messages.length - 1] };
            if (lastMsg.role === "assistant") {
              lastMsg.content = content;
              messages[messages.length - 1] = lastMsg;
            }
          }
          return { ...c, messages };
        }
        return c;
      });
      return { conversations: updatedConversations };
    });
  },

  updateConversationTitle: (conversationId, title) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, title } : c
      ),
    }));
  },

  updateConversationMode: (conversationId, mode) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, agentMode: mode } : c
      ),
    }));
  },

  clearAllConversations: () => {
    set({ conversations: [], activeId: null });
  },
});
