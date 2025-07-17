'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { csvParser } from '@/lib/import/csvParser';
import { excelParser } from '@/lib/import/excelParser';
import { ImportResult } from '@/lib/import/types';
import { ImportedAccount } from '@/lib/types';
import ImportPreview from './ImportPreview';
import ImportProgress from './ImportProgress';

interface ImportDropzoneProps {
  onImportComplete: (accounts: ImportedAccount[]) => void;
  onCancel: () => void;
}

export default function ImportDropzone({ onImportComplete, onCancel }: ImportDropzoneProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsProcessing(true);
    setError(null);

    try {
      let result: ImportResult;
      
      // Determine file type and use appropriate parser
      if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls') || 
          file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.type === 'application/vnd.ms-excel') {
        result = await excelParser.parseFile(file);
      } else {
        result = await csvParser.parseFile(file);
      }
      
      setImportResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setIsProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB limit (increased for Excel files)
    onDropRejected: (rejectedFiles) => {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some(e => e.code === 'file-too-large')) {
        setError('File size must be less than 10MB');
      } else if (rejection.errors.some(e => e.code === 'file-invalid-type')) {
        setError('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
      } else {
        setError('Invalid file. Please upload a CSV or Excel file.');
      }
    }
  });

  const handleConfirmImport = (accounts: ImportedAccount[]) => {
    onImportComplete(accounts);
  };

  const handleCancel = () => {
    setImportResult(null);
    setError(null);
    onCancel();
  };

  if (importResult) {
    return (
      <ImportPreview
        importResult={importResult}
        onConfirm={handleConfirmImport}
        onCancel={() => setImportResult(null)}
      />
    );
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isProcessing ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <ImportProgress message="Processing CSV file..." />
        ) : (
          <div className="space-y-4">
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop the file here' : 'Drag and drop CSV or Excel file'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or click to select file
              </p>
            </div>
            <div className="text-xs text-gray-400">
              Supported formats: CSV, Excel (.xlsx, .xls) • Max size: 10MB
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
