import React from 'react';
import { Account } from '@/lib/types';
import { calculateGoalProjection, calculateAccountProjections } from '@/lib/calculations';
import { formatCurrency, formatDuration } from '@/lib/utils/formatters';
import { useSettings } from '@/lib/context/SettingsContext';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
}

export default function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const { state: settingsState } = useSettings();
  const goalProjection = calculateGoalProjection(account, settingsState.settings.defaultProjectionMonths);
  const projections = calculateAccountProjections(account, 12); // Show 12 months for mini chart
  
  const chartData = projections.map(p => ({
    month: p.month,
    balance: p.balance
  }));

  const getGoalStatusColor = () => {
    if (!goalProjection.achievable) return 'text-red-600';
    return 'text-green-600';
  };

  const getGoalStatusText = () => {
    if (account.goalType === 'amount' && account.targetAmount) {
      if (goalProjection.timeToGoal) {
        return `Goal achievable in ${formatDuration(goalProjection.timeToGoal)}`;
      }
      return 'Goal not achievable with current settings';
    }
    
    if (account.goalType === 'date' && goalProjection.finalAmount) {
      return `Projected: ${formatCurrency(goalProjection.finalAmount)}`;
    }
    
    if (goalProjection.finalAmount) {
      const projectionPeriod = settingsState.settings.defaultProjectionMonths;
      const years = Math.floor(projectionPeriod / 12);
      const months = projectionPeriod % 12;
      let periodText = '';
      
      if (years > 0) {
        periodText = `${years} year${years > 1 ? 's' : ''}`;
        if (months > 0) {
          periodText += ` ${months} month${months > 1 ? 's' : ''}`;
        }
      } else {
        periodText = `${months} month${months > 1 ? 's' : ''}`;
      }
      
      return `${periodText} projection: ${formatCurrency(goalProjection.finalAmount)}`;
    }
    
    return 'No projection available';
  };

  const currentProjection = projections[0];
  const futureProjection = projections[projections.length - 1];
  const totalGrowth = futureProjection.balance - currentProjection.balance;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{account.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
            {account.compoundFrequency} compounding • {account.interestRate * 100}% APY
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(account)}
            className="p-2 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(account.id)}
            className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Current Balance</p>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            {formatCurrency(account.currentBalance)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Contribution</p>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            {formatCurrency(account.monthlyContribution || 0)}
          </p>
        </div>
      </div>

      {/* Goal Status */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Goal Status</p>
        <p className={`text-sm font-medium ${getGoalStatusColor()}`}>
          {getGoalStatusText()}
        </p>
      </div>

      {/* Mini Chart */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Growth Projection</p>
        <div className="h-20">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="month" hide />
              <YAxis hide />
              <Tooltip 
                formatter={(value) => [formatCurrency(value as number), 'Balance']}
                labelFormatter={(label) => `Month ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth Summary */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Projected Growth</p>
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              +{formatCurrency(totalGrowth)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Interest</p>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {formatCurrency(futureProjection.interestEarned)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
