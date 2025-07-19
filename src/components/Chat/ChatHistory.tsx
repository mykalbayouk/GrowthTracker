'use client';

import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../../lib/chat/types';
import { ChatBubble } from './ChatBubble';
import { ChatTyping } from './ChatTyping';

interface ChatHistoryProps {
  messages: ChatMessage[];
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 space-y-4">
      {messages.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-400 font-bold">AI</span>
          </div>
          <p className="text-sm">
            Hi! I'm your financial assistant. I can help you create savings accounts, calculate goals, and answer questions about your finances.
          </p>
          <p className="text-xs mt-2 text-gray-400">
            Try asking: "I want to save $10,000 for a vacation in 2 years with 5% interest"
          </p>
        </div>
      )}
      
      {messages.map((message) => (
        <ChatBubble key={message.id} message={message} />
      ))}
      
      <div ref={messagesEndRef} />
    </div>
  );
};
