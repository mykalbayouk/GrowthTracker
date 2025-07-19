'use client';

import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

interface CreateAccountButtonProps {
  onCreateAccount: () => void;
  accountName?: string;
  disabled?: boolean;
}

export const CreateAccountButton: React.FC<CreateAccountButtonProps> = ({ 
  onCreateAccount, 
  accountName = 'account',
  disabled = false 
}) => {
  return (
    <button
      onClick={onCreateAccount}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        disabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
      }`}
    >
      <PlusIcon className="w-4 h-4" />
      Create {accountName}
    </button>
  );
};
