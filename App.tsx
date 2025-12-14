import React, { useState, useRef, useEffect } from 'react';
import { Message, Role, Attachment } from './types';
import ChatInput from './components/ChatInput';
import MessageItem from './components/MessageItem';
import { sendMessageToGemini } from './services/geminiService';

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: Role.MODEL,
      text: "Chào bạn! Mình là gia sư toán AI. \nHãy gửi cho mình một bài toán (dạng chữ hoặc ảnh), mình sẽ giúp bạn giải từng bước và hiển thị công thức đẹp mắt với MathJax.\n\nVí dụ: *Giải phương trình $x^2 - 4x + 3 = 0$*",
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string, attachment?: Attachment) => {
    // 1. Add User Message
    const userMessage: Message = {
      id: generateId(),
      role: Role.USER,
      text: text,
      attachment: attachment,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // 2. Add Placeholder for Bot Message
    const botMessageId = generateId();
    setMessages(prev => [...prev, {
      id: botMessageId,
      role: Role.MODEL,
      text: '',
      isLoading: true,
      timestamp: Date.now()
    }]);

    try {
      // 3. Call API
      const responseText = await sendMessageToGemini(text, attachment);

      // 4. Update Bot Message
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
          ? { ...msg, text: responseText, isLoading: false }
          : msg
      ));
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
          ? { ...msg, text: "Xin lỗi, đã có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại.", isLoading: false }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-teal-50">
      {/* Header */}
      <header className="bg-teal-700 text-white p-4 shadow-md z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <div className="bg-white p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
             </div>
             <div>
                <h1 className="text-xl font-bold">MathGemini</h1>
                <p className="text-xs text-teal-100 opacity-80">Gia sư toán học 24/7</p>
             </div>
          </div>
          <a 
            href="https://ai.google.dev/" 
            target="_blank" 
            rel="noreferrer"
            className="text-xs bg-teal-800 py-1 px-3 rounded hover:bg-teal-900 transition"
          >
            Powered by Gemini
          </a>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-grow overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto flex flex-col">
          {messages.map(msg => (
            <MessageItem key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}

export default App;