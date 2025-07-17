'use client';

import React, { useState } from 'react';
import { Account } from '@/lib/types';
import { validateAccount } from '@/lib/utils/validators';
import { useAccounts } from '@/lib/context/AccountContext';
import { useSettings } from '@/lib/context/SettingsContext';

interface AccountFormProps {
  account?: Account;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export default function AccountForm({ account, onSubmit, onCancel }: AccountFormProps) {
  const { addAccount, updateAccount } = useAccounts();
  const { state: settingsState } = useSettings();
  const isEditing = Boolean(account);

  const [formData, setFormData] = useState({
    name: account?.name || '',
    startingBalance: account?.startingBalance || 0,
    currentBalance: account?.currentBalance || 0,
    interestRate: account?.interestRate ? account.interestRate * 100 : 0, // Convert decimal to percentage for display
    compoundFrequency: account?.compoundFrequency || 'monthly' as const,
    goalType: account?.goalType || 'default' as const,
    targetAmount: account?.targetAmount || 0,
    targetDate: account?.targetDate ? account.targetDate.toISOString().split('T')[0] : '',
    monthlyContribution: account?.monthlyContribution || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const accountData = {
      name: formData.name.trim(),
      startingBalance: formData.startingBalance,
      currentBalance: isEditing ? account!.currentBalance : formData.startingBalance,
      interestRate: formData.interestRate / 100, // Convert percentage to decimal
      compoundFrequency: formData.compoundFrequency,
      goalType: formData.goalType,
      targetAmount: formData.goalType === 'amount' ? formData.targetAmount : undefined,
      targetDate: formData.goalType === 'date' ? new Date(formData.targetDate) : undefined,
      monthlyContribution: formData.monthlyContribution || 0,
    };

    const validation = validateAccount(accountData);
    
    if (!validation.isValid) {
      setErrors({ general: validation.error || 'Invalid data' });
      return;
    }

    if (isEditing && account) {
      updateAccount({
        ...account,
        ...accountData,
      });
    } else {
      addAccount(accountData);
    }

    onSubmit?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {isEditing ? 'Edit Account' : 'Create New Account'}
        </h2>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300">
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Account Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Account Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., Emergency Fund, Vacation Savings"
              required
            />
          </div>

          {/* Starting Balance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Starting Balance
            </label>
            <input
              type="number"
              value={formData.startingBalance}
              onChange={(e) => handleInputChange('startingBalance', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Annual Interest Rate (%)
            </label>
            <input
              type="number"
              value={formData.interestRate}
              onChange={(e) => handleInputChange('interestRate', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="5.0"
              step="0.01"
              min="0"
              max="50"
              required
            />
          </div>

          {/* Compound Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Compound Frequency
            </label>
            <select
              value={formData.compoundFrequency}
              onChange={(e) => handleInputChange('compoundFrequency', e.target.value as Account['compoundFrequency'])}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Monthly Contribution */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Monthly Contribution
            </label>
            <input
              type="number"
              value={formData.monthlyContribution}
              onChange={(e) => handleInputChange('monthlyContribution', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          {/* Goal Type */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Goal Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="goalType"
                  value="default"
                  checked={formData.goalType === 'default'}
                  onChange={(e) => handleInputChange('goalType', e.target.value as Account['goalType'])}
                  className="mr-2"
                />
                <span className="text-gray-900 dark:text-white">
                  {settingsState.settings.defaultProjectionMonths} months (default)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="goalType"
                  value="amount"
                  checked={formData.goalType === 'amount'}
                  onChange={(e) => handleInputChange('goalType', e.target.value as Account['goalType'])}
                  className="mr-2"
                />
                <span className="text-gray-900 dark:text-white">Target Amount</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="goalType"
                  value="date"
                  checked={formData.goalType === 'date'}
                  onChange={(e) => handleInputChange('goalType', e.target.value as Account['goalType'])}
                  className="mr-2"
                />
                <span className="text-gray-900 dark:text-white">Target Date</span>
              </label>
            </div>
          </div>

          {/* Target Amount (conditional) */}
          {formData.goalType === 'amount' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Amount
              </label>
              <input
                type="number"
                value={formData.targetAmount}
                onChange={(e) => handleInputChange('targetAmount', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="10000.00"
                step="0.01"
                min="0"
                required={formData.goalType === 'amount'}
              />
            </div>
          )}

          {/* Target Date (conditional) */}
          {formData.goalType === 'date' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => handleInputChange('targetDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required={formData.goalType === 'date'}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            {isEditing ? 'Update Account' : 'Create Account'}
          </button>
        </div>
      </div>
    </form>
  );
}
