'use client';

import React, { useState } from 'react';
import { XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { ImportResult } from '@/lib/import/types';
import { ImportedAccount } from '@/lib/types';

interface ImportPreviewProps {
  importResult: ImportResult;
  onConfirm: (accounts: ImportedAccount[]) => void;
  onCancel: () => void;
}

export default function ImportPreview({ importResult, onConfirm, onCancel }: ImportPreviewProps) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(
    new Set(importResult.accounts.map((_, index) => index))
  );

  const { accounts, errors, warnings } = importResult;
  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;
  const selectedAccounts = accounts.filter((_, index) => selectedRows.has(index));

  const toggleRow = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const toggleAll = () => {
    if (selectedRows.size === accounts.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(accounts.map((_, index) => index)));
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedAccounts);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Import Preview</h4>
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {accounts.length} account{accounts.length !== 1 ? 's' : ''} found
          </span>
          {hasErrors && (
            <span className="flex items-center text-red-600 dark:text-red-400">
              <XCircleIcon className="h-4 w-4 mr-1" />
              {errors.length} error{errors.length !== 1 ? 's' : ''}
            </span>
          )}
          {hasWarnings && (
            <span className="flex items-center text-yellow-600 dark:text-yellow-400">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Errors and Warnings */}
      {(hasErrors || hasWarnings) && (
        <div className="mb-6 space-y-3">
          {errors.map((error, index) => (
            <div key={`error-${index}`} className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <XCircleIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    <span className="font-medium">Row {error.row}, {error.column}:</span> {error.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {warnings.map((warning, index) => (
            <div key={`warning-${index}`} className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <span className="font-medium">Row {warning.row}, {warning.column}:</span> {warning.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Data Preview Table */}
      {accounts.length > 0 && (
        <div className="mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === accounts.length}
                      onChange={toggleAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Starting Balance
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interest Rate
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Goal Type
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target Amount
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Contribution
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.map((account, index) => (
                  <tr key={index} className={selectedRows.has(index) ? 'bg-blue-50' : ''}>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={() => toggleRow(index)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {account.name}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${account.startingBalance.toLocaleString()}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(account.interestRate * 100).toFixed(2)}%
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="capitalize">{account.goalType}</span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {account.targetAmount ? `$${account.targetAmount.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {account.monthlyContribution ? `$${account.monthlyContribution.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {selectedAccounts.length} of {accounts.length} account{accounts.length !== 1 ? 's' : ''} selected
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedAccounts.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import {selectedAccounts.length} Account{selectedAccounts.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
