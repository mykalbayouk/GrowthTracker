/**
 * Validation functions for form inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate account name
 */
export function validateAccountName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Account name is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Account name must be at least 2 characters long' };
  }
  
  if (name.length > 50) {
    return { isValid: false, error: 'Account name must be less than 50 characters' };
  }
  
  return { isValid: true };
}

/**
 * Validate balance amount
 */
export function validateBalance(balance: number): ValidationResult {
  if (isNaN(balance) || balance < 0) {
    return { isValid: false, error: 'Balance must be a positive number' };
  }
  
  if (balance > 10000000) {
    return { isValid: false, error: 'Balance cannot exceed $10,000,000' };
  }
  
  return { isValid: true };
}

/**
 * Validate interest rate
 */
export function validateInterestRate(rate: number): ValidationResult {
  if (isNaN(rate) || rate < 0) {
    return { isValid: false, error: 'Interest rate must be a positive number' };
  }
  
  if (rate > 0.5) {
    return { isValid: false, error: 'Interest rate cannot exceed 50%' };
  }
  
  return { isValid: true };
}

/**
 * Validate target amount
 */
export function validateTargetAmount(amount: number, startingBalance: number): ValidationResult {
  if (isNaN(amount) || amount <= 0) {
    return { isValid: false, error: 'Target amount must be a positive number' };
  }
  
  if (amount <= startingBalance) {
    return { isValid: false, error: 'Target amount must be greater than starting balance' };
  }
  
  if (amount > 50000000) {
    return { isValid: false, error: 'Target amount cannot exceed $50,000,000' };
  }
  
  return { isValid: true };
}

/**
 * Validate target date
 */
export function validateTargetDate(date: Date): ValidationResult {
  const now = new Date();
  const minDate = new Date(now);
  minDate.setMonth(now.getMonth() + 1); // At least one month in the future
  
  const maxDate = new Date(now);
  maxDate.setFullYear(now.getFullYear() + 50); // Max 50 years in the future
  
  if (date < minDate) {
    return { isValid: false, error: 'Target date must be at least one month in the future' };
  }
  
  if (date > maxDate) {
    return { isValid: false, error: 'Target date cannot be more than 50 years in the future' };
  }
  
  return { isValid: true };
}

/**
 * Validate monthly contribution
 */
export function validateMonthlyContribution(contribution: number): ValidationResult {
  if (isNaN(contribution) || contribution < 0) {
    return { isValid: false, error: 'Monthly contribution must be a positive number' };
  }
  
  if (contribution > 100000) {
    return { isValid: false, error: 'Monthly contribution cannot exceed $100,000' };
  }
  
  return { isValid: true };
}

/**
 * Validate entire account object
 */
export function validateAccount(account: {
  name: string;
  startingBalance: number;
  interestRate: number;
  targetAmount?: number;
  targetDate?: Date;
  monthlyContribution?: number;
}): ValidationResult {
  const nameValidation = validateAccountName(account.name);
  if (!nameValidation.isValid) return nameValidation;
  
  const balanceValidation = validateBalance(account.startingBalance);
  if (!balanceValidation.isValid) return balanceValidation;
  
  const rateValidation = validateInterestRate(account.interestRate);
  if (!rateValidation.isValid) return rateValidation;
  
  if (account.targetAmount !== undefined) {
    const targetValidation = validateTargetAmount(account.targetAmount, account.startingBalance);
    if (!targetValidation.isValid) return targetValidation;
  }
  
  if (account.targetDate !== undefined) {
    const dateValidation = validateTargetDate(account.targetDate);
    if (!dateValidation.isValid) return dateValidation;
  }
  
  if (account.monthlyContribution !== undefined) {
    const contributionValidation = validateMonthlyContribution(account.monthlyContribution);
    if (!contributionValidation.isValid) return contributionValidation;
  }
  
  return { isValid: true };
}
