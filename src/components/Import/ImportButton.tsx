'use client';

import React, { useState } from 'react';
import { CloudArrowUpIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { ImportedAccount } from '@/lib/types';
import ImportDropzone from './ImportDropzone';

interface ImportButtonProps {
  onImportComplete: (accounts: ImportedAccount[]) => void;
}

export default function ImportButton({ onImportComplete }: ImportButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templates/account-import-template.csv';
    link.download = 'account-import-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        <CloudArrowUpIcon className="h-4 w-4 mr-2" />
        Import Accounts
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />
            
            <div className="relative inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                      Import Accounts
                    </h3>
                    
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">File Format Instructions:</h4>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• Supports CSV and Excel files (.csv, .xlsx, .xls)</li>
                        <li>• First row should contain column headers</li>
                        <li>• Required columns: Account Name, Starting Balance, Interest Rate, Compound Frequency, Goal Type</li>
                        <li>• Optional columns: Target Amount, Target Date, Monthly Contribution</li>
                        <li>• You can import files exported from this app</li>
                      </ul>
                      <button
                        onClick={handleDownloadTemplate}
                        className="mt-3 inline-flex items-center px-3 py-2 border border-blue-300 dark:border-blue-600 text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                        Download CSV Template
                      </button>
                    </div>

                    <ImportDropzone
                      onImportComplete={(accounts: ImportedAccount[]) => {
                        onImportComplete(accounts);
                        setShowModal(false);
                      }}
                      onCancel={() => setShowModal(false)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
