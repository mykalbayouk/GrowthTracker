'use client';

import { useState } from 'react';
import AccountList from '@/components/AccountList';
import GrowthChart from '@/components/Charts/GrowthChart';
import ComparisonChart from '@/components/Charts/ComparisonChart';
import PortfolioChart from '@/components/Charts/PortfolioChart';
import ExportButton from '@/components/ExportButton';
import { useAccounts } from '@/lib/context/AccountContext';
import { ChartBarIcon, PresentationChartLineIcon, ChartPieIcon } from '@heroicons/react/24/outline';
import { SettingsButton } from '@/components/SettingsModal';

export default function Home() {
  const { state } = useAccounts();
  const [activeTab, setActiveTab] = useState<'accounts' | 'growth' | 'comparison' | 'portfolio' | 'export'>('accounts');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  const tabs = [
    { id: 'accounts', name: 'Accounts', icon: ChartBarIcon },
    { id: 'growth', name: 'Growth Analysis', icon: PresentationChartLineIcon },
    { id: 'comparison', name: 'Comparison', icon: ChartBarIcon },
    { id: 'portfolio', name: 'Portfolio', icon: ChartPieIcon },
    { id: 'export', name: 'Export', icon: ChartBarIcon },
  ];

  const selectedAccount = state.accounts.find(account => account.id === selectedAccountId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Savings Calculator</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Track your savings goals and compound interest</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {state.accounts.length} account{state.accounts.length !== 1 ? 's' : ''}
              </div>
              <SettingsButton />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'accounts' | 'growth' | 'comparison' | 'portfolio' | 'export')}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'accounts' && <AccountList />}
        
        {activeTab === 'growth' && (
          <div className="space-y-6">
            {state.accounts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No accounts to analyze. Create an account first.</p>
              </div>
            ) : (
              <>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Account for Growth Analysis
                  </label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select an account...</option>
                    {state.accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedAccount && (
                  <GrowthChart account={selectedAccount} />
                )}
              </>
            )}
          </div>
        )}
        
        {activeTab === 'comparison' && (
          <ComparisonChart accounts={state.accounts} />
        )}
        
        {activeTab === 'portfolio' && (
          <PortfolioChart accounts={state.accounts} />
        )}
        
        {activeTab === 'export' && (
          <ExportButton />
        )}
      </main>
    </div>
  );
}
