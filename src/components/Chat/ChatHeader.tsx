'use client';

import React from 'react';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ChatHeaderProps {
  onClose: () => void;
  onClear?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose, onClear }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-600 text-white rounded-t-lg">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <span className="text-sm font-bold">AI</span>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold">Financial Assistant</h3>
            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              BETA
            </span>
          </div>
          <p className="text-xs text-blue-100">Ask me about your savings goals</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {onClear && (
          <button
            onClick={onClear}
            className="text-blue-100 hover:text-white transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
            aria-label="Clear chat"
            title="Clear chat history"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onClose}
          className="text-blue-100 hover:text-white transition-colors p-1 rounded-full hover:bg-white hover:bg-opacity-20"
          aria-label="Close chat"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
