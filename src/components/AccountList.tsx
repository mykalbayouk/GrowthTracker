'use client';

import React, { useState } from 'react';
import { useAccounts } from '@/lib/context/AccountContext';
import AccountCard from './AccountCard';
import AccountForm from './AccountForm';
import ImportButton from './Import/ImportButton';
import { Account, ImportedAccount } from '@/lib/types';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function AccountList() {
  const { state, deleteAccount, refreshAccountBalances, bulkImportAccounts } = useAccounts();
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      deleteAccount(id);
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  const handleImportComplete = (importedAccounts: ImportedAccount[]) => {
    bulkImportAccounts(importedAccounts);
  };

  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

    if (state.error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="text-red-700 dark:text-red-300">
            Error: {state.error}
          </div>
        </div>
      );
    }  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Savings Accounts</h2>
        <div className="flex space-x-2">
          <button
            onClick={refreshAccountBalances}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            title="Refresh account balances"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
          <ImportButton onImportComplete={handleImportComplete} />
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Account
          </button>
        </div>
      </div>

      {/* Account Form */}
      {showForm && (
        <AccountForm
          account={editingAccount || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {/* Account Grid */}
      {state.accounts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">No savings accounts yet</div>
          <p className="text-gray-400 dark:text-gray-500 mb-6">
            Create your first account to start tracking your savings goals
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Your First Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
