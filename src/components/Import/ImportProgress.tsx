'use client';

import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface ImportProgressProps {
  message: string;
  progress?: number;
}

export default function ImportProgress({ message, progress }: ImportProgressProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
      
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900">{message}</p>
        
        {progress !== undefined && (
          <div className="mt-2 w-64">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}% complete</p>
          </div>
        )}
      </div>
    </div>
  );
}
