import React, { useState, useRef, useEffect } from 'react';
import { useAIStore } from '../../store/aiStore';
import { Button } from '../common/Button';
import { 
  FaRobot, 
  FaTimes, 
  FaPaperPlane, 
  FaUser, 
  FaSpinner,
  FaBrain,
  FaLightbulb,
  FaPills,
  FaHeart
} from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

export const AIChat: React.FC = () => {
  const { isOpen, messages, isLoading, toggleChat, sendMessage, clearMessages } = useAIStore();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const suggestedQuestions = [
    { icon: <FaPills className="w-4 h-4" />, text: "What medicines do you have?" },
    { icon: <FaHeart className="w-4 h-4" />, text: "Tell me about health tips" },
    { icon: <FaLightbulb className="w-4 h-4" />, text: "How do I order medicines?" },
    { icon: <FaRobot className="w-4 h-4" />, text: "What is BloomCare?" },
  ];

  return (
    <>
      {/* Chat Button - Floating - Adjusted position */}
      <button
        onClick={toggleChat}
        className="fixed bottom-24 right-6 z-50 bg-[#22c55e] text-white p-4 rounded-full shadow-lg hover:bg-[#16a34a] transition-all duration-300 hover:scale-110 group"
        aria-label="AI Assistant"
      >
        <div className="relative">
          <FaRobot className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#d1f843] rounded-full animate-pulse" />
        </div>
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={toggleChat} />
          
          {/* Chat Window */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-slideUp border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#22c55e] rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <FaRobot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white font-outfit">BloomCare AI</h3>
                  <p className="text-xs text-white/80 font-outfit">Powered by Groq AI</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearMessages}
                  className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors text-xs font-outfit"
                  title="Clear chat"
                >
                  Clear
                </button>
                <button
                  onClick={toggleChat}
                  className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px] bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-[#22c55e]/10 flex items-center justify-center mb-4">
                    <FaBrain className="w-8 h-8 text-[#22c55e]" />
                  </div>
                  <h4 className="font-semibold text-black font-outfit">Hello! I'm BloomCare AI</h4>
                  <p className="text-sm text-gray-500 mt-1 max-w-xs font-outfit">
                    Ask me anything about medicines, pharmacies, or health tips. I'm here to help!
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2 w-full">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setInputMessage(question.text);
                          setTimeout(() => handleSendMessage(new Event('submit') as any), 100);
                        }}
                        className="text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 hover:border-[#22c55e] hover:bg-[#22c55e]/5 transition-all duration-200 flex items-center gap-1.5 text-gray-700 font-outfit"
                      >
                        {question.icon}
                        <span className="truncate">{question.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-3 font-outfit ${
                        msg.role === 'user'
                          ? 'bg-[#22c55e] text-white'
                          : 'bg-white border border-gray-200 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {msg.role === 'assistant' ? (
                          <FaRobot className="w-3 h-3 text-[#22c55e]" />
                        ) : (
                          <FaUser className="w-3 h-3 text-white" />
                        )}
                        <span className="text-xs font-medium">
                          {msg.role === 'assistant' ? 'BloomCare AI' : 'You'}
                        </span>
                      </div>
                      <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-2">
                    <FaSpinner className="w-4 h-4 text-[#22c55e] animate-spin" />
                    <span className="text-sm text-gray-500 font-outfit">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent transition-all duration-200 font-outfit"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-[#22c55e] hover:bg-[#16a34a] px-4"
                  icon={<FaPaperPlane className="w-4 h-4" />}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center font-outfit">
                AI responses are for informational purposes only. Consult healthcare professionals for medical advice.
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
};