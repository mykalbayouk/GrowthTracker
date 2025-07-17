import { ImportError } from './types';
import { ImportedAccount } from '../types';

function parseInterestRate(value: string): number {
  if (!value || value.trim() === '') return 0;
  
  // Remove any whitespace
  const cleanValue = value.trim();
  
  // If it ends with %, remove it and divide by 100
  if (cleanValue.endsWith('%')) {
    const numericValue = parseFloat(cleanValue.slice(0, -1));
    return isNaN(numericValue) ? 0 : numericValue / 100;
  }
  
  // Otherwise, check if it's a percentage value (> 1) and convert to decimal
  const numericValue = parseFloat(cleanValue);
  if (isNaN(numericValue)) return 0;
  
  // If the value is greater than 1, assume it's a percentage and convert to decimal
  // This handles cases where someone enters "4" meaning 4% = 0.04
  if (numericValue > 1) {
    return numericValue / 100;
  }
  
  // Otherwise, assume it's already a decimal
  return numericValue;
}

export function mapCSVToAccounts(data: Record<string, string>[], errors: ImportError[]): ImportedAccount[] {
  const accounts: ImportedAccount[] = [];
  
  if (!data || data.length === 0) {
    return accounts;
  }

  data.forEach((row, index) => {
    const rowNumber = index + 1;
    
    // Skip rows with errors
    const rowErrors = errors.filter(error => error.row === rowNumber && error.severity === 'error');
    if (rowErrors.length > 0) {
      return;
    }

    try {
      const account: ImportedAccount = {
        name: row['Account Name']?.trim() || '',
        startingBalance: parseFloat(row['Starting Balance']) || 0,
        interestRate: parseInterestRate(row['Interest Rate']),
        compoundFrequency: normalizeCompoundFrequency(row['Compound Frequency']),
        goalType: normalizeGoalType(row['Goal Type']),
        targetAmount: row['Target Amount'] ? parseFloat(row['Target Amount']) : undefined,
        targetDate: row['Target Date'] ? row['Target Date'].trim() : undefined,
        monthlyContribution: row['Monthly Contribution'] ? parseFloat(row['Monthly Contribution']) : undefined
      };

      // Only add if essential fields are present
      if (account.name && account.startingBalance >= 0 && account.interestRate >= 0) {
        accounts.push(account);
      }
    } catch (error) {
      // Skip malformed rows
      console.warn(`Skipping malformed row ${rowNumber}:`, error);
    }
  });

  return accounts;
}

function normalizeCompoundFrequency(frequency: string): 'daily' | 'monthly' | 'yearly' {
  if (!frequency) return 'monthly';
  
  const normalized = frequency.toLowerCase().trim();
  if (normalized === 'daily') return 'daily';
  if (normalized === 'yearly' || normalized === 'annual') return 'yearly';
  return 'monthly';
}

function normalizeGoalType(goalType: string): 'amount' | 'date' | 'default' {
  if (!goalType) return 'default';
  
  const normalized = goalType.toLowerCase().trim();
  if (normalized === 'amount') return 'amount';
  if (normalized === 'date') return 'date';
  return 'default';
}

export function detectCSVHeaders(data: Record<string, string>[]): string[] {
  if (!data || data.length === 0) {
    return [];
  }

  const firstRow = data[0];
  if (typeof firstRow === 'object' && firstRow !== null) {
    return Object.keys(firstRow);
  }

  return [];
}

export function validateCSVHeaders(headers: string[]): { valid: boolean; missing: string[] } {
  const requiredHeaders = [
    'Account Name',
    'Starting Balance',
    'Interest Rate',
    'Compound Frequency',
    'Goal Type'
  ];

  const missing = requiredHeaders.filter(header => 
    !headers.some(h => h.toLowerCase().trim() === header.toLowerCase())
  );

  return {
    valid: missing.length === 0,
    missing
  };
}

export function mapAccountToCSV(account: ImportedAccount): Record<string, string> {
  return {
    'Account Name': account.name,
    'Starting Balance': account.startingBalance.toString(),
    'Interest Rate': account.interestRate.toString(),
    'Compound Frequency': account.compoundFrequency,
    'Goal Type': account.goalType,
    'Target Amount': account.targetAmount?.toString() || '',
    'Target Date': account.targetDate || '',
    'Monthly Contribution': account.monthlyContribution?.toString() || ''
  };
}
