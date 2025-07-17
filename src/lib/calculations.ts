import { Account, ProjectionData, GoalProjection } from './types';

/**
 * Calculate compound interest
 * Formula: A = P(1 + r/n)^(nt)
 * @param principal - Initial amount
 * @param rate - Annual interest rate (as decimal)
 * @param compoundFrequency - How often interest compounds per year
 * @param time - Time in years
 * @returns Final amount
 */
export function calculateCompoundInterest(
  principal: number,
  rate: number,
  compoundFrequency: number,
  time: number
): number {
  return principal * Math.pow(1 + rate / compoundFrequency, compoundFrequency * time);
}

/**
 * Get compound frequency as number
 */
export function getCompoundFrequencyNumber(frequency: Account['compoundFrequency']): number {
  switch (frequency) {
    case 'daily':
      return 365;
    case 'monthly':
      return 12;
    case 'yearly':
      return 1;
    default:
      return 12;
  }
}

/**
 * Calculate account projections over time with monthly contributions
 */
export function calculateAccountProjections(
  account: Account,
  months: number = 36
): ProjectionData[] {
  const projections: ProjectionData[] = [];
  const compoundFreq = getCompoundFrequencyNumber(account.compoundFrequency);
  const contribution = account.monthlyContribution || 0;
  
  let totalContributions = 0;
  
  for (let month = 0; month <= months; month++) {
    const date = new Date();
    date.setMonth(date.getMonth() + month);
    
    // Add monthly contribution (except for month 0)
    if (month > 0) {
      totalContributions += contribution;
    }
    
    // Calculate interest for this month
    const timeInYears = month / 12;
    const balanceWithInterest = calculateCompoundInterest(
      account.startingBalance + totalContributions,
      account.interestRate,
      compoundFreq,
      timeInYears
    );
    
    const interestEarned = balanceWithInterest - (account.startingBalance + totalContributions);
    
    projections.push({
      month,
      balance: balanceWithInterest,
      totalContributions,
      interestEarned,
      date
    });
  }
  
  return projections;
}

/**
 * Calculate goal projections
 */
export function calculateGoalProjection(account: Account, defaultMonths: number = 36): GoalProjection {
  const compoundFreq = getCompoundFrequencyNumber(account.compoundFrequency);
  const monthlyContribution = account.monthlyContribution || 0;
  
  if (account.goalType === 'amount' && account.targetAmount) {
    // Calculate time needed to reach target amount
    const timeToGoal = calculateTimeToReachAmount(
      account.startingBalance,
      account.targetAmount,
      account.interestRate,
      compoundFreq,
      monthlyContribution
    );
    
    return {
      timeToGoal,
      achievable: timeToGoal > 0 && timeToGoal < 1000 // Reasonable time limit
    };
  }
  
  if (account.goalType === 'date' && account.targetDate) {
    // Calculate final amount at target date
    const monthsToTarget = Math.ceil(
      (account.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    
    if (monthsToTarget <= 0) {
      return { achievable: false };
    }
    
    const projections = calculateAccountProjections(account, monthsToTarget);
    const finalProjection = projections[projections.length - 1];
    
    return {
      finalAmount: finalProjection.balance,
      achievable: true
    };
  }
  
  // Use custom default months instead of hardcoded 36
  const projections = calculateAccountProjections(account, defaultMonths);
  const finalProjection = projections[projections.length - 1];
  
  return {
    finalAmount: finalProjection.balance,
    achievable: true
  };
}

/**
 * Calculate time needed to reach a target amount
 */
function calculateTimeToReachAmount(
  principal: number,
  targetAmount: number,
  annualRate: number,
  compoundFreq: number,
  monthlyContribution: number
): number {
  if (targetAmount <= principal) {
    return 0;
  }
  
  // Binary search for the time needed
  let low = 0;
  let high = 1000; // Max 1000 months
  const epsilon = 0.01; // Precision
  
  while (high - low > epsilon) {
    const mid = (low + high) / 2;
    const timeInYears = mid / 12;
    
    // Calculate future value with contributions
    const futureValue = calculateFutureValueWithContributions(
      principal,
      annualRate,
      compoundFreq,
      timeInYears,
      monthlyContribution
    );
    
    if (futureValue < targetAmount) {
      low = mid;
    } else {
      high = mid;
    }
  }
  
  return (low + high) / 2;
}

/**
 * Calculate future value with regular contributions
 */
function calculateFutureValueWithContributions(
  principal: number,
  annualRate: number,
  compoundFreq: number,
  timeInYears: number,
  monthlyContribution: number
): number {
  // Future value of principal
  const principalFV = calculateCompoundInterest(principal, annualRate, compoundFreq, timeInYears);
  
  // Future value of annuity (monthly contributions)
  const monthlyRate = annualRate / 12;
  const totalMonths = timeInYears * 12;
  
  if (monthlyContribution === 0 || monthlyRate === 0) {
    return principalFV;
  }
  
  const annuityFV = monthlyContribution * (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;
  
  return principalFV + annuityFV;
}

/**
 * Calculate current balance based on time elapsed since account creation
 */
export function calculateCurrentBalance(account: Account): number {
  const now = new Date();
  const monthsElapsed = Math.floor(
    (now.getTime() - account.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );
  
  if (monthsElapsed <= 0) {
    return account.startingBalance;
  }
  
  const compoundFreq = getCompoundFrequencyNumber(account.compoundFrequency);
  const timeInYears = monthsElapsed / 12;
  const monthlyContribution = account.monthlyContribution || 0;
  
  // Calculate total contributions made
  const totalContributions = monthsElapsed * monthlyContribution;
  
  // Calculate compound interest on principal + contributions
  const currentBalance = calculateCompoundInterest(
    account.startingBalance + totalContributions,
    account.interestRate,
    compoundFreq,
    timeInYears
  );
  
  return currentBalance;
}

/**
 * Format duration in months to human-readable string
 */

/**
 * Calculate monthly payment needed to reach a goal
 */
export function calculateMonthlyPaymentNeeded(
  principal: number,
  targetAmount: number,
  annualRate: number,
  compoundFreq: number,
  months: number
): number {
  const timeInYears = months / 12;
  const principalFV = calculateCompoundInterest(principal, annualRate, compoundFreq, timeInYears);
  const neededFromContributions = targetAmount - principalFV;
  
  if (neededFromContributions <= 0) {
    return 0;
  }
  
  const monthlyRate = annualRate / 12;
  
  if (monthlyRate === 0) {
    return neededFromContributions / months;
  }
  
  return (neededFromContributions * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
}
