'use client';

import React, { useState } from 'react';
import { useAccounts } from '@/lib/context/AccountContext';
import { useSettings } from '@/lib/context/SettingsContext';
import { calculateAccountProjections } from '@/lib/calculations';
import { formatDate } from '@/lib/utils/formatters';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface ExportButtonProps {
  selectedAccounts?: string[]; // Account IDs to export, or all if undefined
}

export default function ExportButton({ selectedAccounts }: ExportButtonProps) {
  const { state } = useAccounts();
  const { state: settingsState } = useSettings();
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'summary' | 'detailed'>('summary');

  const accountsToExport = selectedAccounts 
    ? state.accounts.filter(account => selectedAccounts.includes(account.id))
    : state.accounts;

  const handleExport = async () => {
    if (accountsToExport.length === 0) {
      alert('No accounts to export');
      return;
    }

    setIsExporting(true);
    
    try {
      const workbook = new ExcelJS.Workbook();
      
      if (exportType === 'summary') {
        createSummarySheet(workbook);
      } else {
        createDetailedSheets(workbook);
      }
      
      const fileName = `savings_calculator_${exportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
      const buffer = await workbook.xlsx.writeBuffer();
      const data = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      saveAs(data, fileName);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const generateSummaryData = () => {
    const defaultProjectionMonths = settingsState.settings.defaultProjectionMonths;
    
    return accountsToExport.map(account => {
      const projections = calculateAccountProjections(account, defaultProjectionMonths);
      const finalProjection = projections[projections.length - 1];
      
      return {
        'Account Name': account.name,
        'Starting Balance': account.startingBalance,
        'Interest Rate': `${(account.interestRate * 100).toFixed(2)}%`,
        'Compound Frequency': account.compoundFrequency,
        'Monthly Contribution': account.monthlyContribution || 0,
        'Goal Type': account.goalType,
        'Target Amount': account.targetAmount || 'N/A',
        'Target Date': account.targetDate ? formatDate(account.targetDate) : 'N/A',
        [`Final Balance (${defaultProjectionMonths} months)`]: finalProjection.balance,
        'Total Contributions': finalProjection.totalContributions,
        'Interest Earned': finalProjection.interestEarned,
        'Created Date': formatDate(account.createdAt),
        'Last Updated': formatDate(account.updatedAt)
      };
    });
  };

  const createSummarySheet = (workbook: ExcelJS.Workbook) => {
    const worksheet = workbook.addWorksheet('Account Summary');
    const summaryData = generateSummaryData();
    
    // Add headers
    const headers = Object.keys(summaryData[0] || {});
    worksheet.addRow(headers);
    
    // Add data rows
    summaryData.forEach(row => {
      const values = headers.map(header => row[header as keyof typeof row]);
      worksheet.addRow(values);
    });
    
    // Auto-size columns
    worksheet.columns.forEach(column => {
      column.width = 20;
    });
    
    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2E8F0' }
    };
  };

  const createDetailedSheets = (workbook: ExcelJS.Workbook) => {
    // Create summary sheet first
    createSummarySheet(workbook);
    
    // Create detailed projection sheets for each account
    const defaultProjectionMonths = settingsState.settings.defaultProjectionMonths;
    
    accountsToExport.forEach(account => {
      const projections = calculateAccountProjections(account, defaultProjectionMonths);
      
      const worksheet = workbook.addWorksheet(account.name.substring(0, 30));
      
      // Add headers
      const headers = ['Month', 'Date', 'Balance', 'Principal', 'Total Contributions', 'Interest Earned', 'Monthly Growth'];
      worksheet.addRow(headers);
      
      // Add data rows
      projections.forEach(p => {
        worksheet.addRow([
          p.month,
          formatDate(p.date),
          p.balance,
          account.startingBalance,
          p.totalContributions,
          p.interestEarned,
          p.month > 0 ? p.balance - projections[p.month - 1].balance : 0
        ]);
      });
      
      // Auto-size columns and style
      worksheet.columns.forEach(column => {
        column.width = 15;
      });
      
      // Style the header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2E8F0' }
      };
    });

    // Create portfolio overview sheet
    createPortfolioSheet(workbook);
  };

  const createPortfolioSheet = (workbook: ExcelJS.Workbook) => {
    const worksheet = workbook.addWorksheet('Portfolio Overview');
    
    // Calculate monthly portfolio totals
    const maxMonths = 60;
    const portfolioData = [];
    
    for (let month = 0; month <= maxMonths; month++) {
      let totalBalance = 0;
      let totalContributions = 0;
      let totalInterest = 0;
      
      accountsToExport.forEach(account => {
        const projections = calculateAccountProjections(account, maxMonths);
        const projection = projections[month];
        
        if (projection) {
          totalBalance += projection.balance;
          totalContributions += projection.totalContributions;
          totalInterest += projection.interestEarned;
        }
      });
      
      portfolioData.push([
        month,
        new Date(Date.now() + month * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        totalBalance,
        totalContributions,
        totalInterest,
        accountsToExport.length
      ]);
    }

    // Add headers
    const headers = ['Month', 'Date', 'Total Portfolio Value', 'Total Contributions', 'Total Interest Earned', 'Number of Accounts'];
    worksheet.addRow(headers);
    
    // Add data rows
    portfolioData.forEach(row => {
      worksheet.addRow(row);
    });
    
    // Auto-size columns and style
    worksheet.columns.forEach(column => {
      column.width = 20;
    });
    
    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2E8F0' }
    };
  };

  if (accountsToExport.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Export Data</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Export Type
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="summary"
                checked={exportType === 'summary'}
                onChange={(e) => setExportType(e.target.value as 'summary' | 'detailed')}
                className="mr-2"
              />
              <span className="text-sm text-gray-900 dark:text-white">Summary Report</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="detailed"
                checked={exportType === 'detailed'}
                onChange={(e) => setExportType(e.target.value as 'summary' | 'detailed')}
                className="mr-2"
              />
              <span className="text-sm text-gray-900 dark:text-white">Detailed Report with Projections</span>
            </label>
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>
            {exportType === 'summary' 
              ? 'Export account summary with key metrics'
              : 'Export detailed projections with monthly breakdowns for each account'
            }
          </p>
          <p className="mt-1">
            Accounts to export: {accountsToExport.length}
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Exporting...
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export to Excel
            </>
          )}
        </button>
      </div>
    </div>
  );
}
