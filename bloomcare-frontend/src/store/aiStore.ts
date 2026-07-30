import { create } from 'zustand';
import { aiApi,type ChatMessage } from '../api/endpoints/ai';

interface AIState {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  isOpen: false,
  messages: [],
  isLoading: false,

  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),

  sendMessage: async (message: string) => {
    const { messages } = get();
    
    // Add user message
    const userMessage: ChatMessage = { role: 'user', content: message };
    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
    }));

    try {
      // Get AI response
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
      
      const response = await aiApi.chat(message, history);
      
      // Add assistant message
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
      };
      
      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      set((state) => ({
        messages: [...state.messages, errorMessage],
        isLoading: false,
      }));
    }
  },

  clearMessages: () => set({ messages: [] }),
}));