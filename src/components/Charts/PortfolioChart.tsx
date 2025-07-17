'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Account } from '@/lib/types';
import { calculateAccountProjections } from '@/lib/calculations';
import { formatCurrency, generateColor } from '@/lib/utils/formatters';
import { useSettings } from '@/lib/context/SettingsContext';

interface PortfolioChartProps {
  accounts: Account[];
  timeframe?: number; // months
}

export default function PortfolioChart({ accounts, timeframe }: PortfolioChartProps) {
  const { state: settingsState } = useSettings();
  const actualTimeframe = timeframe || settingsState.settings.defaultProjectionMonths;
  
  if (accounts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Portfolio Distribution</h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No accounts to display
        </div>
      </div>
    );
  }

  const portfolioData = accounts.map((account, index) => {
    const projections = calculateAccountProjections(account, actualTimeframe);
    const finalProjection = projections[projections.length - 1];
    
    return {
      name: account.name,
      value: finalProjection.balance,
      color: generateColor(index),
      interestEarned: finalProjection.interestEarned,
      contributions: finalProjection.totalContributions + account.startingBalance
    };
  });

  const totalPortfolioValue = portfolioData.reduce((sum, account) => sum + account.value, 0);

  const CustomTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{ payload: { name: string; value: number; contributions: number; interestEarned: number } }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalPortfolioValue) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-blue-600">{`Balance: ${formatCurrency(data.value)}`}</p>
          <p className="text-gray-600">{`Percentage: ${percentage}%`}</p>
          <p className="text-green-600">{`Contributions: ${formatCurrency(data.contributions)}`}</p>
          <p className="text-orange-600">{`Interest: ${formatCurrency(data.interestEarned)}`}</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    percent?: number;
  }) => {
    if (!cx || !cy || midAngle === undefined || !innerRadius || !outerRadius || !percent) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Hide labels for slices smaller than 5%

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Portfolio Distribution ({actualTimeframe} months)</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={portfolioData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {portfolioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend and Details */}
        <div className="space-y-4">
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Total Portfolio Value</h4>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(totalPortfolioValue)}
            </p>
          </div>

          <div className="space-y-2">
            {portfolioData.map((account, index) => {
              const percentage = ((account.value / totalPortfolioValue) * 100).toFixed(1);
              
              return (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: account.color }}
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{account.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(account.value)}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Portfolio Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Total Contributions:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(portfolioData.reduce((sum, a) => sum + a.contributions, 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">Total Interest:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(portfolioData.reduce((sum, a) => sum + a.interestEarned, 0))}
                </span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-gray-700 dark:text-gray-300">Total Value:</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {formatCurrency(totalPortfolioValue)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
