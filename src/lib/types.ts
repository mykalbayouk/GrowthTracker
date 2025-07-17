export interface Account {
  id: string;
  name: string;
  startingBalance: number;
  currentBalance: number;
  interestRate: number;
  compoundFrequency: 'daily' | 'monthly' | 'yearly';
  goalType: 'amount' | 'date' | 'default';
  targetAmount?: number;
  targetDate?: Date;
  monthlyContribution?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectionData {
  month: number;
  balance: number;
  totalContributions: number;
  interestEarned: number;
  date: Date;
}

export interface GoalProjection {
  timeToGoal?: number; // in months
  finalAmount?: number;
  monthlyNeeded?: number;
  achievable: boolean;
}

export interface ChartData {
  name: string;
  balance: number;
  contributions: number;
  interest: number;
  date: string;
}

// Import-related types
export interface ImportedAccount {
  name: string;
  startingBalance: number;
  interestRate: number;
  compoundFrequency: 'daily' | 'monthly' | 'yearly';
  goalType: 'amount' | 'date' | 'default';
  targetAmount?: number;
  targetDate?: string;
  monthlyContribution?: number;
}
