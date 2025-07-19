'use client';

import React from 'react';

export const ChatTyping: React.FC = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg">
        <div className="flex items-center space-x-1">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            AI is thinking
          </div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
