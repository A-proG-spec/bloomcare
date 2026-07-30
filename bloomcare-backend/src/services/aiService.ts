import Groq from 'groq-sdk';
import { environment } from '../config/enviroment';
import { logger } from '../config/logger';

// Initialize Groq client
const groq = new Groq({
  apiKey: environment.GROQ_API_KEY,
});

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are BloomCare AI Assistant, a helpful healthcare assistant for a pharmacy platform called BloomCare.

Your role is to help users with:
1. Medicine information (uses, side effects, dosage)
2. Pharmacy services and features
3. Ordering medicines online
4. Health tips and general wellness advice
5. Information about BloomCare platform features

Important guidelines:
- Always recommend consulting a doctor for serious medical concerns
- Be friendly, professional, and empathetic
- Keep responses concise but informative
- Do not provide specific medical diagnoses
- If you don't know something, admit it and suggest consulting a healthcare professional
- You can help with pharmacy-related questions, platform navigation, and general health inquiries

Current date: ${new Date().toLocaleDateString()}`;

// ========================================
// FIX 1: Define proper message type with specific role literals
// ========================================
type IMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

class AIService {
  /**
   * Generate AI response using Groq
   */
  async generateResponse(messages: IMessage[]): Promise<string> {
    try {
      if (!environment.GROQ_API_KEY) {
        logger.warn('GROQ_API_KEY not set. Using fallback response.');
        return this.getFallbackResponse(messages[messages.length - 1]?.content || '');
      }

      // Ensure system message is included
      const hasSystemMessage = messages.some(msg => msg.role === 'system');
      const fullMessages = hasSystemMessage 
        ? messages 
        : [{ role: 'system' as const, content: SYSTEM_PROMPT }, ...messages];

      // Limit messages to prevent token overflow (keep last 10 messages)
      const trimmedMessages = fullMessages.slice(-10);

      // ========================================
      // FIX 2: Use type assertion for Groq compatibility
      // ========================================
      const completion = await groq.chat.completions.create({
        model: environment.GROQ_MODEL || 'llama3-8b-8192',
        messages: trimmedMessages as any, // Type assertion to fix compatibility
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.9,
      });

      const response = completion.choices[0]?.message?.content || 
        "I'm sorry, I couldn't process that request. Please try again.";
      
      logger.info('AI response generated successfully');
      return response;
    } catch (error: any) {
      logger.error('Error generating AI response:', error);
      return this.getFallbackResponse(messages[messages.length - 1]?.content || '');
    }
  }

  /**
   * Generate a response for medicine-related queries
   */
  async getMedicineInfo(medicineName: string): Promise<string> {
    try {
      // ========================================
      // FIX 3: Use proper type with const assertions
      // ========================================
      const messages: IMessage[] = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        { role: 'user' as const, content: `Tell me about the medicine "${medicineName}". Include uses, common dosage, and precautions.` }
      ];

      return await this.generateResponse(messages);
    } catch (error) {
      return `I couldn't find specific information about "${medicineName}". Please consult a pharmacist or healthcare professional for accurate information.`;
    }
  }

  /**
   * Get health tips
   */
  async getHealthTips(): Promise<string> {
    try {
      // ========================================
      // FIX 4: Properly typed messages
      // ========================================
      const messages: IMessage[] = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        { role: 'user' as const, content: 'Give me some general health and wellness tips for maintaining a healthy lifestyle.' }
      ];

      return await this.generateResponse(messages);
    } catch (error) {
      return "Here are some general health tips: Stay hydrated, eat balanced meals, exercise regularly, get enough sleep, and manage stress. For personalized advice, please consult a healthcare professional.";
    }
  }

  /**
   * Get fallback response when AI is unavailable
   */
  private getFallbackResponse(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('medicine') || lowerQuery.includes('drug') || lowerQuery.includes('medication')) {
      return "I'd be happy to help with medicine information. However, I'm currently in offline mode. Please contact your pharmacist or healthcare provider for accurate medicine information.";
    }
    
    if (lowerQuery.includes('order') || lowerQuery.includes('buy') || lowerQuery.includes('purchase')) {
      return "You can order medicines through BloomCare by searching for your medicine, selecting a pharmacy, and proceeding to checkout. If you need help, please visit our support page.";
    }
    
    if (lowerQuery.includes('pharmacy') || lowerQuery.includes('store')) {
      return "BloomCare connects you with verified pharmacies. You can browse pharmacies, check their availability, and place orders online. Is there a specific pharmacy you're looking for?";
    }
    
    if (lowerQuery.includes('health') || lowerQuery.includes('wellness') || lowerQuery.includes('tip')) {
      return "Here are some general health tips: Stay hydrated, eat balanced meals, exercise regularly, get enough sleep, and manage stress. For personalized advice, please consult a healthcare professional.";
    }
    
    return "Thank you for reaching out to BloomCare AI Assistant. I'm here to help you with pharmacy services, medicine information, and general health inquiries. What can I assist you with today?";
  }
}

export default new AIService();