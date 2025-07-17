'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Account } from '@/lib/types';
import { calculateAccountProjections } from '@/lib/calculations';
import { formatCurrency } from '@/lib/utils/formatters';
import { useSettings } from '@/lib/context/SettingsContext';

interface GrowthChartProps {
  account: Account;
  timeframe?: number; // months
}

export default function GrowthChart({ account, timeframe }: GrowthChartProps) {
  const { state: settingsState } = useSettings();
  const actualTimeframe = timeframe || settingsState.settings.defaultProjectionMonths;
  const projections = calculateAccountProjections(account, actualTimeframe);
  
  const chartData = projections.map(p => ({
    month: p.month,
    balance: p.balance,
    principal: account.startingBalance + p.totalContributions,
    interest: p.interestEarned,
    date: p.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }));

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-medium">{`Month ${label}`}</p>
          <p className="text-blue-600">
            {`Total Balance: ${formatCurrency(payload[0].value)}`}
          </p>
          <p className="text-green-600">
            {`Principal + Contributions: ${formatCurrency(payload[1].value)}`}
          </p>
          <p className="text-orange-600">
            {`Interest Earned: ${formatCurrency(payload[2].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Growth Over Time: {account.name}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tickFormatter={(value) => `${value}m`}
            />
            <YAxis 
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="#3B82F6" 
              strokeWidth={3}
              name="Total Balance"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="principal" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Principal + Contributions"
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="interest" 
              stroke="#F59E0B" 
              strokeWidth={2}
              name="Interest Earned"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Final Balance</p>
          <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            {formatCurrency(chartData[chartData.length - 1]?.balance || 0)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Contributions</p>
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
            {formatCurrency(chartData[chartData.length - 1]?.principal || 0)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Interest Earned</p>
          <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
            {formatCurrency(chartData[chartData.length - 1]?.interest || 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
