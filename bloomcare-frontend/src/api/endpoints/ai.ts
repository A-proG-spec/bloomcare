import apiClient from '../client';

// ✅ Export the ChatMessage interface
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ✅ Export the aiApi object
export const aiApi = {
  /**
   * Chat with AI assistant
   * POST /api/ai/chat
   */
  chat: async (message: string, history: ChatMessage[] = []) => {
    const response = await apiClient.post('/ai/chat', { message, history });
    return response.data.data;
  },

  getMedicineInfo: async (medicineName: string) => {
    const response = await apiClient.post('/ai/medicine-info', { medicineName });
    return response.data.data;
  },


  getHealthTips: async () => {
    const response = await apiClient.get('/ai/health-tips');
    return response.data.data;
  },
};

export default aiApi;