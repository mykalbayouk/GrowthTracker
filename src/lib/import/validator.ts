import { ImportError } from './types';

function parseInterestRateForValidation(value: string): number {
  if (!value || value.trim() === '') return NaN;
  
  const cleanValue = value.trim();
  
  // If it ends with %, remove it and parse the number
  if (cleanValue.endsWith('%')) {
    return parseFloat(cleanValue.slice(0, -1));
  }
  
  // Otherwise, parse as normal number
  const numericValue = parseFloat(cleanValue);
  
  // If the value is less than 1, assume it's already a decimal and convert to percentage for validation
  if (!isNaN(numericValue) && numericValue < 1) {
    return numericValue * 100;
  }
  
  return numericValue;
}

export function validateImportData(data: Record<string, string>[]): ImportError[] {
  const errors: ImportError[] = [];

  if (!data || data.length === 0) {
    errors.push({
      row: 0,
      column: 'all',
      message: 'No data found in the CSV file',
      severity: 'error'
    });
    return errors;
  }

  data.forEach((row, index) => {
    const rowNumber = index + 1;

    // Check required fields
    if (!row['Account Name'] || row['Account Name'].trim() === '') {
      errors.push({
        row: rowNumber,
        column: 'Account Name',
        message: 'Account name is required',
        severity: 'error'
      });
    }

    if (!row['Starting Balance'] || isNaN(parseFloat(row['Starting Balance']))) {
      errors.push({
        row: rowNumber,
        column: 'Starting Balance',
        message: 'Starting balance must be a valid number',
        severity: 'error'
      });
    } else if (parseFloat(row['Starting Balance']) < 0) {
      errors.push({
        row: rowNumber,
        column: 'Starting Balance',
        message: 'Starting balance must be positive',
        severity: 'error'
      });
    }

    if (!row['Interest Rate'] || isNaN(parseInterestRateForValidation(row['Interest Rate']))) {
      errors.push({
        row: rowNumber,
        column: 'Interest Rate',
        message: 'Interest rate must be a valid number',
        severity: 'error'
      });
    } else {
      const rate = parseInterestRateForValidation(row['Interest Rate']);
      if (rate < 0 || rate > 100) {
        errors.push({
          row: rowNumber,
          column: 'Interest Rate',
          message: 'Interest rate must be between 0 and 100 percent',
          severity: 'error'
        });
      }
    }

    // Validate compound frequency
    const validFrequencies = ['daily', 'monthly', 'yearly'];
    if (!row['Compound Frequency'] || !validFrequencies.includes(row['Compound Frequency'].toLowerCase())) {
      errors.push({
        row: rowNumber,
        column: 'Compound Frequency',
        message: 'Compound frequency must be "daily", "monthly", or "yearly"',
        severity: 'error'
      });
    }

    // Validate goal type
    const validGoalTypes = ['amount', 'date', 'default'];
    if (!row['Goal Type'] || !validGoalTypes.includes(row['Goal Type'].toLowerCase())) {
      errors.push({
        row: rowNumber,
        column: 'Goal Type',
        message: 'Goal type must be "amount", "date", or "default"',
        severity: 'error'
      });
    }

    // Validate target amount if goal type is amount
    if (row['Goal Type'] && row['Goal Type'].toLowerCase() === 'amount') {
      if (!row['Target Amount'] || isNaN(parseFloat(row['Target Amount']))) {
        errors.push({
          row: rowNumber,
          column: 'Target Amount',
          message: 'Target amount is required when goal type is "amount"',
          severity: 'error'
        });
      } else if (parseFloat(row['Target Amount']) <= 0) {
        errors.push({
          row: rowNumber,
          column: 'Target Amount',
          message: 'Target amount must be positive',
          severity: 'error'
        });
      }
    }

    // Validate target date if goal type is date
    if (row['Goal Type'] && row['Goal Type'].toLowerCase() === 'date') {
      if (!row['Target Date'] || row['Target Date'].trim() === '') {
        errors.push({
          row: rowNumber,
          column: 'Target Date',
          message: 'Target date is required when goal type is "date"',
          severity: 'error'
        });
      } else {
        const targetDate = new Date(row['Target Date']);
        if (isNaN(targetDate.getTime())) {
          errors.push({
            row: rowNumber,
            column: 'Target Date',
            message: 'Target date must be a valid date (YYYY-MM-DD format)',
            severity: 'error'
          });
        } else if (targetDate <= new Date()) {
          errors.push({
            row: rowNumber,
            column: 'Target Date',
            message: 'Target date must be in the future',
            severity: 'warning'
          });
        }
      }
    }

    // Validate monthly contribution if provided
    if (row['Monthly Contribution'] && row['Monthly Contribution'].trim() !== '') {
      if (isNaN(parseFloat(row['Monthly Contribution']))) {
        errors.push({
          row: rowNumber,
          column: 'Monthly Contribution',
          message: 'Monthly contribution must be a valid number',
          severity: 'error'
        });
      } else if (parseFloat(row['Monthly Contribution']) < 0) {
        errors.push({
          row: rowNumber,
          column: 'Monthly Contribution',
          message: 'Monthly contribution must be positive',
          severity: 'error'
        });
      }
    }

    // Validate account name length
    if (row['Account Name'] && row['Account Name'].length > 50) {
      errors.push({
        row: rowNumber,
        column: 'Account Name',
        message: 'Account name must be 50 characters or less',
        severity: 'warning'
      });
    }
  });

  return errors;
}

export function hasErrors(errors: ImportError[]): boolean {
  return errors.some(error => error.severity === 'error');
}

export function getErrorsByRow(errors: ImportError[], row: number): ImportError[] {
  return errors.filter(error => error.row === row);
}
