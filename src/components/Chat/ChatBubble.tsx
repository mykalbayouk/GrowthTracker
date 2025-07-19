'use client';

import React from 'react';
import { ChatMessage } from '../../lib/chat/types';
import { format } from 'date-fns';
import { CreateAccountButton } from './CreateAccountButton';
import { useChat } from '../../lib/context/ChatContext';

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const { sendMessage } = useChat();
  
  // Ensure timestamp is a valid Date object
  const timestamp = message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp);
  const isValidDate = !isNaN(timestamp.getTime());
  
  // Check if the message suggests creating an account
  const suggestsAccount = !isUser && message.content.toLowerCase().includes('would you like me to create');
  
  const handleCreateAccount = () => {
    sendMessage('Yes, create the account');
  };
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
      }`}>
        <div className="text-sm whitespace-pre-wrap">
          {message.content}
        </div>
        
        {suggestsAccount && (
          <div className="mt-3 flex gap-2">
            <CreateAccountButton 
              onCreateAccount={handleCreateAccount}
              accountName="account"
            />
            <button
              onClick={() => sendMessage('No, not right now')}
              className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            >
              Not now
            </button>
          </div>
        )}
        
        {message.accountsCreated && message.accountsCreated.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="text-xs text-green-600 dark:text-green-400 font-medium">
              ✓ Created {message.accountsCreated.length} account{message.accountsCreated.length > 1 ? 's' : ''}
            </div>
          </div>
        )}
        
        <div className={`text-xs mt-2 ${
          isUser 
            ? 'text-blue-100' 
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          {isValidDate ? format(timestamp, 'HH:mm') : 'Invalid time'}
        </div>
      </div>
    </div>
  );
};
