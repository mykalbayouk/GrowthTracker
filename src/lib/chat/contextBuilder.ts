import { Account, ProjectionData, GoalProjection } from '../types';
import { calculateAccountProjections, calculateGoalProjection } from '../calculations';

export class ContextBuilder {
  static buildContext(accounts: Account[], chatHistory: any[] = []): any {
    const context = {
      accounts: accounts.map(account => ({
        id: account.id,
        name: account.name,
        startingBalance: account.startingBalance,
        currentBalance: account.currentBalance,
        interestRate: account.interestRate,
        compoundFrequency: account.compoundFrequency,
        goalType: account.goalType,
        targetAmount: account.targetAmount,
        targetDate: account.targetDate,
        monthlyContribution: account.monthlyContribution,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt
      })),
      summary: this.generateSummary(accounts),
      recentHistory: chatHistory.slice(-5), // Last 5 messages for context
      timestamp: new Date().toISOString()
    };

    return context;
  }

  static generateSummary(accounts: Account[]): string {
    if (accounts.length === 0) {
      return 'No accounts created yet.';
    }

    const totalBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0);
    const totalGoalAmount = accounts.reduce((sum, account) => sum + (account.targetAmount || 0), 0);
    const accountsWithGoals = accounts.filter(account => account.targetAmount).length;

    let summary = `User has ${accounts.length} account${accounts.length > 1 ? 's' : ''} with a total balance of $${totalBalance.toLocaleString()}.`;
    
    if (accountsWithGoals > 0) {
      summary += ` ${accountsWithGoals} account${accountsWithGoals > 1 ? 's have' : ' has'} specific goals totaling $${totalGoalAmount.toLocaleString()}.`;
    }

    // Add information about the most recent account
    const mostRecentAccount = accounts.reduce((latest, account) => 
      account.createdAt > latest.createdAt ? account : latest
    );
    
    summary += ` Most recent account: "${mostRecentAccount.name}" with $${mostRecentAccount.currentBalance.toLocaleString()}.`;

    return summary;
  }

  static buildCalculationContext(account: Account): any {
    const projection = calculateAccountProjections(account, 60); // 5 years
    const goalProjection = account.targetAmount ? calculateGoalProjection(account) : null;

    return {
      account,
      projection: projection.slice(0, 12), // First year monthly
      goalProjection,
      projectionSummary: this.generateProjectionSummary(projection, goalProjection)
    };
  }

  private static generateProjectionSummary(projection: ProjectionData[], goalProjection: GoalProjection | null): string {
    if (projection.length === 0) {
      return 'No projection data available.';
    }

    const firstYear = projection.slice(0, 12);
    const finalBalance = firstYear[firstYear.length - 1]?.balance || 0;
    const totalInterest = firstYear[firstYear.length - 1]?.interestEarned || 0;

    let summary = `After 1 year, the balance would be $${finalBalance.toLocaleString()} with $${totalInterest.toLocaleString()} in interest earned.`;

    if (goalProjection) {
      if (goalProjection.achievable) {
        if (goalProjection.timeToGoal !== undefined) {
          const years = Math.floor(goalProjection.timeToGoal / 12);
          const months = goalProjection.timeToGoal % 12;
          summary += ` Goal is achievable in ${years > 0 ? `${years} year${years > 1 ? 's' : ''}` : ''}${years > 0 && months > 0 ? ' and ' : ''}${months > 0 ? `${months} month${months > 1 ? 's' : ''}` : ''}.`;
        }
      } else {
        summary += ' Current plan will not reach the goal.';
        if (goalProjection.monthlyNeeded) {
          summary += ` Would need $${goalProjection.monthlyNeeded.toLocaleString()} monthly to reach the goal.`;
        }
      }
    }

    return summary;
  }
}
