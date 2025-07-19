import { Account } from '../types';
import { AccountPrompt, ParsedAccountData } from './types';

export class AccountGenerator {
  constructor(
    private addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => void
  ) {}

  async generateAccounts(parsedData: ParsedAccountData): Promise<Account[]> {
    console.log('🔍 AccountGenerator: Generating accounts from parsed data:', parsedData);
    const createdAccounts: Account[] = [];
    
    for (const accountData of parsedData.accounts) {
      console.log('🔍 AccountGenerator: Processing account data:', accountData);
      
      if (this.validateAccountData(accountData)) {
        const account = this.createAccountFromPrompt(accountData);
        console.log('🔍 AccountGenerator: Created account object:', account);
        
        // Create the account with temporary ID for return
        const accountWithId: Account = {
          ...account,
          id: this.generateId(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        console.log('🔍 AccountGenerator: Final account with ID:', accountWithId);
        
        this.addAccount(account);
        createdAccounts.push(accountWithId);
        console.log('🔍 AccountGenerator: Account added to context');
      } else {
        console.warn('🔍 AccountGenerator: Invalid account data, skipping:', accountData);
      }
    }
    
    console.log('🔍 AccountGenerator: All created accounts:', createdAccounts);
    return createdAccounts;
  }

  private createAccountFromPrompt(prompt: AccountPrompt): Omit<Account, 'id' | 'createdAt' | 'updatedAt'> {
    const now = new Date();
    
    // Convert interest rate from percentage to decimal (e.g., 4% -> 0.04)
    const interestRateDecimal = prompt.interestRate ? prompt.interestRate / 100 : 0;
    
    const account = {
      name: prompt.name || `Account ${now.getTime()}`,
      startingBalance: prompt.startingBalance || 0,
      currentBalance: prompt.startingBalance || 0,
      interestRate: interestRateDecimal,
      compoundFrequency: prompt.compoundFrequency || 'monthly',
      goalType: prompt.goalType || 'default',
      targetAmount: prompt.targetAmount,
      targetDate: prompt.targetDate,
      monthlyContribution: prompt.monthlyContribution,
    };
    
    console.log('🔍 AccountGenerator: Raw prompt data:', prompt);
    console.log('🔍 AccountGenerator: Interest rate conversion:', {
      promptRate: prompt.interestRate,
      convertedRate: interestRateDecimal,
      note: 'Converted from percentage to decimal for calculations'
    });
    console.log('🔍 AccountGenerator: Final account object:', account);
    
    return account;
  }

  private validateAccountData(prompt: AccountPrompt): boolean {
    // Basic validation
    if (prompt.startingBalance !== undefined && prompt.startingBalance < 0) {
      return false;
    }
    
    if (prompt.interestRate !== undefined && (prompt.interestRate < 0 || prompt.interestRate > 100)) {
      return false;
    }
    
    if (prompt.targetAmount !== undefined && prompt.targetAmount <= 0) {
      return false;
    }
    
    if (prompt.monthlyContribution !== undefined && prompt.monthlyContribution < 0) {
      return false;
    }
    
    return true;
  }

  private generateId(): string {
    return `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
