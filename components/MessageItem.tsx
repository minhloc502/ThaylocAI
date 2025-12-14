import React from 'react';
import { Message, Role } from '../types';
import MathRenderer from './MathRenderer';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`
          relative max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm
          ${isUser 
            ? 'bg-teal-600 text-white rounded-br-none' 
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}
        `}
      >
        {/* User Avatar / Bot Icon Label - Optional, keeping it simple for aesthetics */}
        <div className={`text-xs font-bold mb-1 opacity-70 ${isUser ? 'text-teal-100' : 'text-teal-600'}`}>
          {isUser ? 'Bạn' : 'Gia Sư AI'}
        </div>

        {/* Attachment Display */}
        {message.attachment && (
          <div className="mb-3">
            <img 
              src={message.attachment.previewUrl} 
              alt="User upload" 
              className="max-h-60 rounded-lg border border-white/20 object-contain bg-black/10"
            />
          </div>
        )}

        {/* Text Content */}
        {message.isLoading ? (
          <div className="flex space-x-2 items-center h-6">
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        ) : (
          <div className={isUser ? 'text-white' : ''}>
             {/* If it's a user message, we usually just show text. 
                 If it's AI, we use the MathRenderer. 
                 However, user might paste LaTeX too, so let's use Renderer for bot only to be safe with colors, 
                 or handle User styling specifically. 
                 To keep styling simple: User text is plain string (whitespace pre-wrap), Bot is MathRenderer.
             */}
             {isUser ? (
               <div className="whitespace-pre-wrap">{message.text}</div>
             ) : (
               <MathRenderer content={message.text} />
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;