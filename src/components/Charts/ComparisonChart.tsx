'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Account } from '@/lib/types';
import { calculateAccountProjections } from '@/lib/calculations';
import { formatCurrency, generateColor } from '@/lib/utils/formatters';
import { useSettings } from '@/lib/context/SettingsContext';

interface ComparisonChartProps {
  accounts: Account[];
  timeframe?: number; // months
}

export default function ComparisonChart({ accounts, timeframe }: ComparisonChartProps) {
  const { state: settingsState } = useSettings();
  const actualTimeframe = timeframe || settingsState.settings.defaultProjectionMonths;
  
  if (accounts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Account Comparison</h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No accounts to compare
        </div>
      </div>
    );
  }

  const comparisonData = accounts.map((account, index) => {
    const projections = calculateAccountProjections(account, actualTimeframe);
    const finalProjection = projections[projections.length - 1];
    
    return {
      name: account.name,
      startingBalance: account.startingBalance,
      finalBalance: finalProjection.balance,
      totalContributions: finalProjection.totalContributions,
      interestEarned: finalProjection.interestEarned,
      color: generateColor(index)
    };
  });

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Account Comparison ({actualTimeframe} months)</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="startingBalance" 
              fill="#10B981" 
              name="Starting Balance"
            />
            <Bar 
              dataKey="totalContributions" 
              fill="#3B82F6" 
              name="Total Contributions"
            />
            <Bar 
              dataKey="interestEarned" 
              fill="#F59E0B" 
              name="Interest Earned"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-600">
              <th className="text-left py-2 text-gray-900 dark:text-white">Account</th>
              <th className="text-right py-2 text-gray-900 dark:text-white">Starting</th>
              <th className="text-right py-2 text-gray-900 dark:text-white">Contributions</th>
              <th className="text-right py-2 text-gray-900 dark:text-white">Interest</th>
              <th className="text-right py-2 text-gray-900 dark:text-white">Final Balance</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((account, index) => (
              <tr key={index} className="border-b border-gray-200 dark:border-gray-600">
                <td className="py-2 font-medium text-gray-900 dark:text-white">{account.name}</td>
                <td className="py-2 text-right text-gray-700 dark:text-gray-300">{formatCurrency(account.startingBalance)}</td>
                <td className="py-2 text-right text-gray-700 dark:text-gray-300">{formatCurrency(account.totalContributions)}</td>
                <td className="py-2 text-right text-gray-700 dark:text-gray-300">{formatCurrency(account.interestEarned)}</td>
                <td className="py-2 text-right font-semibold text-gray-900 dark:text-white">{formatCurrency(account.finalBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
