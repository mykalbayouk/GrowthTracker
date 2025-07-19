'use client';

import React from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface ChatToggleProps {
  onClick: () => void;
}

export const ChatToggle: React.FC<ChatToggleProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label="Open chat assistant"
    >
      <ChatBubbleLeftRightIcon className="w-8 h-8" />
    </button>
  );
};
