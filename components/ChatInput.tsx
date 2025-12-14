import React, { useState, useRef, useEffect } from 'react';
import { Attachment } from '../types';
import { fileToBase64 } from '../utils/fileUtils';

interface ChatInputProps {
  onSendMessage: (text: string, attachment?: Attachment) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [text]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) return;

      try {
        const base64 = await fileToBase64(file);
        setAttachment({
          mimeType: file.type,
          data: base64,
          previewUrl: URL.createObjectURL(file)
        });
      } catch (err) {
        console.error("Error processing file", err);
      }
    }
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault(); // Prevent pasting image filename as text
        const file = item.getAsFile();
        if (file) {
          try {
            const base64 = await fileToBase64(file);
            setAttachment({
              mimeType: file.type,
              data: base64,
              previewUrl: URL.createObjectURL(file)
            });
          } catch (err) {
            console.error("Paste error", err);
          }
        }
        return; // Handle only the first image found
      }
    }
  };

  const handleSubmit = () => {
    if ((!text.trim() && !attachment) || isLoading) return;
    
    onSendMessage(text, attachment || undefined);
    setText('');
    setAttachment(null);
    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4 shadow-lg sticky bottom-0 z-10">
      <div className="max-w-4xl mx-auto">
        
        {/* Attachment Preview */}
        {attachment && (
          <div className="mb-3 flex items-start">
            <div className="relative group">
              <img 
                src={attachment.previewUrl} 
                alt="Preview" 
                className="h-24 w-auto rounded-lg border border-teal-200 shadow-sm"
              />
              <button 
                onClick={removeAttachment}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>
        )}

        <div className="flex items-end gap-3">
          {/* File Upload Button */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-teal-600 hover:bg-teal-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            title="Tải ảnh lên"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileSelect}
            />
          </button>

          {/* Text Input */}
          <div className="relative flex-grow">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Nhập câu hỏi toán học của bạn hoặc dán ảnh (Ctrl+V)..."
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-2xl focus:ring-teal-500 focus:border-teal-500 block p-3 pr-10 resize-none min-h-[50px] max-h-[150px] overflow-y-auto outline-none transition-shadow"
              rows={1}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSubmit}
            disabled={(!text.trim() && !attachment) || isLoading}
            className={`
              p-3 rounded-full shadow-md flex items-center justify-center transition-all
              ${(!text.trim() && !attachment) || isLoading 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-lg transform active:scale-95'}
            `}
          >
            {isLoading ? (
               <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            )}
          </button>
        </div>
        <div className="text-center mt-2">
            <span className="text-xs text-gray-400">Hỗ trợ OCR từ ảnh và định dạng MathJax/LaTeX</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;