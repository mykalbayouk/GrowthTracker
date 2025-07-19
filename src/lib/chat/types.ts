// Chat-specific type definitions

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  accountsCreated?: string[]; // IDs of accounts created from this message
}

export interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isTyping: boolean;
  error: string | null;
}

export interface AccountPrompt {
  name?: string;
  startingBalance?: number;
  interestRate?: number;
  compoundFrequency?: 'daily' | 'monthly' | 'yearly';
  goalType?: 'amount' | 'date' | 'default';
  targetAmount?: number;
  targetDate?: Date;
  monthlyContribution?: number;
}

export interface ParsedAccountData {
  accounts: AccountPrompt[];
  userQuery: string;
  requiresCalculation: boolean;
  calculationResult?: string;
  requiresValidation?: boolean;
  missingInfo?: string[];
}

interface ContextData {
  accounts?: Array<{
    id: string;
    name: string;
    currentBalance: number;
    interestRate: number;
    [key: string]: unknown;
  }>;
  messages?: Array<{
    role: string;
    content: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export interface AIServiceProvider {
  processMessage(userMessage: string, context: ContextData): Promise<string>;
  parseAccountData(userMessage: string, conversationContext?: ContextData): Promise<ParsedAccountData>;
}

export interface ChatConfig {
  provider: 'openai' | 'gemini';
  maxChatHistory: number;
  fallbackEnabled: boolean;
  model: string;
}
