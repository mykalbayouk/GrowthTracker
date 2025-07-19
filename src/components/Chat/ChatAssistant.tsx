'use client';

import React from 'react';
import { useChat } from '../../lib/context/ChatContext';
import { ChatToggle } from './ChatToggle';
import { ChatHeader } from './ChatHeader';
import { ChatHistory } from './ChatHistory';
import { ChatInput } from './ChatInput';
import { ChatTyping } from './ChatTyping';

export const ChatAssistant: React.FC = () => {
  const { state, sendMessage, toggleChat, clearChat } = useChat();

  return (
    <div className="fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out">
      {state.isOpen ? (
        <div className="w-96 h-[32rem] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
          <ChatHeader onClose={toggleChat} onClear={clearChat} />
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            <ChatHistory messages={state.messages} />
            {state.isTyping && <ChatTyping />}
          </div>
          <ChatInput 
            onSendMessage={sendMessage} 
            isLoading={state.isTyping} 
            disabled={state.isTyping}
          />
          {state.error && (
            <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
            </div>
          )}
        </div>
      ) : (
        <ChatToggle onClick={toggleChat} />
      )}
    </div>
  );
};
