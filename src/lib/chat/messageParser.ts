import { parse, isValid } from 'date-fns';
import { AccountPrompt, ParsedAccountData } from './types';

export class MessageParser {
  static parseAccountData(message: string): ParsedAccountData {
    const accounts: AccountPrompt[] = [];
    const lowerMessage = message.toLowerCase();
    
    // Check if this is an account creation request
    const isAccountCreation = this.isAccountCreationRequest(lowerMessage);
    
    if (isAccountCreation) {
      const account = this.extractAccountInfo(message);
      if (account) {
        accounts.push(account);
      }
    }
    
    return {
      accounts,
      userQuery: message,
      requiresCalculation: this.requiresCalculation(lowerMessage)
    };
  }

  private static isAccountCreationRequest(message: string): boolean {
    const creationKeywords = [
      'create account',
      'new account',
      'start saving',
      'open account',
      'add account',
      'save for',
      'saving for',
      'want to save',
      'need to save',
      'goal is',
      'my goal',
      'retirement',
      'emergency fund',
      'vacation fund'
    ];
    
    return creationKeywords.some(keyword => message.includes(keyword));
  }

  private static requiresCalculation(message: string): boolean {
    const calculationKeywords = [
      'how much',
      'how long',
      'when will',
      'calculate',
      'projection',
      'forecast',
      'compound',
      'interest',
      'grow to',
      'reach my goal'
    ];
    
    return calculationKeywords.some(keyword => message.includes(keyword));
  }

  private static extractAccountInfo(message: string): AccountPrompt | null {
    const account: AccountPrompt = {};
    
    // Extract account name
    account.name = this.extractAccountName(message);
    
    // Extract starting balance
    account.startingBalance = this.extractAmount(message, ['starting', 'initial', 'have', 'current']);
    
    // Extract interest rate
    account.interestRate = this.extractInterestRate(message);
    
    // Extract compound frequency
    account.compoundFrequency = this.extractCompoundFrequency(message);
    
    // Extract goal information
    const goalInfo = this.extractGoalInfo(message);
    account.goalType = goalInfo.type;
    account.targetAmount = goalInfo.targetAmount;
    account.targetDate = goalInfo.targetDate;
    
    // Extract monthly contribution
    account.monthlyContribution = this.extractAmount(message, ['monthly', 'month', 'contribute', 'add', 'deposit']);
    
    return account;
  }

  private static extractAccountName(message: string): string | undefined {
    // Look for patterns like "for my vacation", "retirement account", etc.
    const namePatterns = [
      /(?:for (?:my )?)?(\w+(?:\s+\w+)*?)(?:\s+(?:account|fund|savings))/i,
      /(?:saving for|save for)\s+(?:my\s+)?(\w+(?:\s+\w+)*)/i,
      /(\w+(?:\s+\w+)*?)\s+(?:account|fund|savings)/i
    ];
    
    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return undefined;
  }

  private static extractAmount(message: string, keywords: string[]): number | undefined {
    for (const keyword of keywords) {
      const keywordPattern = new RegExp(`${keyword}[^\\d]*\\$?([\\d,]+(?:\\.\\d{2})?)`, 'gi');
      const match = message.match(keywordPattern);
      if (match) {
        const amountStr = match[0].replace(/[^\d.,]/g, '');
        const amount = parseFloat(amountStr.replace(/,/g, ''));
        if (!isNaN(amount)) {
          return amount;
        }
      }
    }
    
    return undefined;
  }

  private static extractInterestRate(message: string): number | undefined {
    const ratePatterns = [
      /(\d+(?:\.\d+)?)\s*%/g,
      /(\d+(?:\.\d+)?)\s*percent/gi,
      /rate\s+of\s+(\d+(?:\.\d+)?)/gi,
      /(\d+(?:\.\d+)?)\s*apy/gi
    ];
    
    for (const pattern of ratePatterns) {
      const match = message.match(pattern);
      if (match) {
        const rate = parseFloat(match[1]);
        if (!isNaN(rate)) {
          return rate;
        }
      }
    }
    
    return undefined;
  }

  private static extractCompoundFrequency(message: string): 'daily' | 'monthly' | 'yearly' | undefined {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('daily') || lowerMessage.includes('day')) {
      return 'daily';
    }
    if (lowerMessage.includes('monthly') || lowerMessage.includes('month')) {
      return 'monthly';
    }
    if (lowerMessage.includes('yearly') || lowerMessage.includes('annual') || lowerMessage.includes('year')) {
      return 'yearly';
    }
    
    return 'monthly'; // Default to monthly
  }

  private static extractGoalInfo(message: string): {
    type: 'amount' | 'date' | 'default';
    targetAmount?: number;
    targetDate?: Date;
  } {
    // Look for target amount
    const targetAmount = this.extractAmount(message, ['goal', 'target', 'want', 'need', 'reach']);
    
    // Look for target date
    const targetDate = this.extractDate(message);
    
    if (targetAmount && targetDate) {
      return { type: 'amount', targetAmount, targetDate };
    } else if (targetAmount) {
      return { type: 'amount', targetAmount };
    } else if (targetDate) {
      return { type: 'date', targetDate };
    }
    
    return { type: 'default' };
  }

  private static extractDate(message: string): Date | undefined {
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{4})/g,
      /(\d{4}-\d{1,2}-\d{1,2})/g,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/gi,
      /in\s+(\d+)\s+years?/gi,
      /by\s+(\d{4})/gi
    ];
    
    for (const pattern of datePatterns) {
      const match = message.match(pattern);
      if (match) {
        const dateStr = match[1];
        
        // Handle "in X years" format
        if (match[0].toLowerCase().includes('in') && match[0].toLowerCase().includes('years')) {
          const years = parseInt(match[1]);
          const futureDate = new Date();
          futureDate.setFullYear(futureDate.getFullYear() + years);
          return futureDate;
        }
        
        // Handle "by YYYY" format
        if (match[0].toLowerCase().includes('by')) {
          const year = parseInt(match[1]);
          return new Date(year, 11, 31); // December 31st of that year
        }
        
        // Try to parse standard date formats
        const parsedDate = parse(dateStr, 'MM/dd/yyyy', new Date());
        if (isValid(parsedDate)) {
          return parsedDate;
        }
        
        const parsedDate2 = parse(dateStr, 'yyyy-MM-dd', new Date());
        if (isValid(parsedDate2)) {
          return parsedDate2;
        }
        
        // Try natural language date parsing
        const naturalDate = new Date(dateStr);
        if (isValid(naturalDate)) {
          return naturalDate;
        }
      }
    }
    
    return undefined;
  }

  static validateAccountData(data: AccountPrompt): boolean {
    // Basic validation
    if (data.startingBalance !== undefined && data.startingBalance < 0) {
      return false;
    }
    
    if (data.interestRate !== undefined && (data.interestRate < 0 || data.interestRate > 100)) {
      return false;
    }
    
    if (data.targetAmount !== undefined && data.targetAmount <= 0) {
      return false;
    }
    
    if (data.monthlyContribution !== undefined && data.monthlyContribution < 0) {
      return false;
    }
    
    return true;
  }
}
