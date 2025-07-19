import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { AIServiceProvider, ParsedAccountData } from '../types';

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

export class GeminiService implements AIServiceProvider {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private systemPrompt: string;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.model = this.genAI.getGenerativeModel({ 
      model: process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-1.5-pro' 
    });
    
    this.systemPrompt = `You are a concise financial planning assistant for GrowthTracker, a savings calculator app. 
    
    IMPORTANT RULES:
    1. Keep responses SHORT and to the point - no lengthy explanations unless specifically asked
    2. NEVER create accounts automatically - always ask for permission first
    3. When users ask calculation questions, provide the answer directly without showing formulas
    4. If account creation is appropriate, end with: "Would you like me to create this account for you?"
    
    You can:
    - Answer financial questions concisely
    - Perform quick calculations
    - Suggest account setups
    - Provide brief financial advice
    
    Always be helpful but brief. Save the detailed explanations for when users specifically ask "how" or "why".`;
  }

  async processMessage(userMessage: string, context: ContextData): Promise<string> {
    try {
      const prompt = `${this.systemPrompt}
      
      Current accounts: ${JSON.stringify(context.accounts || [])}
      
      User message: ${userMessage}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text() || 'I apologize, but I could not process your request.';
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to process message with Gemini');
    }
  }

  async parseAccountData(userMessage: string, conversationContext?: ContextData): Promise<ParsedAccountData> {
    try {
      // Only extract account data if user explicitly confirms they want to create an account
      const confirmationKeywords = [
        'yes, create',
        'yes create',
        'create the account',
        'make the account',
        'yes please',
        'go ahead',
        'create it',
        'make it'
      ];
      
      const hasConfirmation = confirmationKeywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword)
      );
      
      if (!hasConfirmation) {
        return {
          accounts: [],
          userQuery: userMessage,
          requiresCalculation: this.requiresCalculation(userMessage)
        };
      }

      // Include recent conversation context to understand what account to create
      const contextMessages = conversationContext?.messages || [];
      const recentContext = contextMessages.slice(-5).map((msg) => 
        `${msg.role}: ${msg.content}`
      ).join('\n');

      const parsePrompt = `Based on the recent conversation context, extract account creation information. 
      
      CRITICAL VALIDATION:
      - Only create an account if ALL crucial information is available or can be reasonably inferred
      - Crucial information: starting balance, interest rate, and either a target amount or target date
      - If ANY crucial information is missing, return empty accounts array and set requiresValidation: true
      
      IMPORTANT: Interest rates should be expressed as percentages (e.g., 4 for 4%, not 0.04).
      
      Recent conversation:
      ${recentContext}
      
      Current message: ${userMessage}
      
      Return ONLY a JSON object (no markdown, no code blocks) with this structure:
      {
        "accounts": [
          {
            "name": "Travel Account",
            "startingBalance": 1000,
            "interestRate": 4,
            "compoundFrequency": "yearly",
            "goalType": "amount",
            "targetAmount": 10000,
            "monthlyContribution": 750
          }
        ],
        "userQuery": "${userMessage}",
        "requiresCalculation": false,
        "requiresValidation": false,
        "missingInfo": []
      }
      
      If crucial information is missing, return:
      {
        "accounts": [],
        "userQuery": "${userMessage}",
        "requiresCalculation": false,
        "requiresValidation": true,
        "missingInfo": ["startingBalance", "interestRate", "targetAmount"]
      }
      
      Return only valid JSON, no additional text.`;

      const result = await this.model.generateContent(parsePrompt);
      const response = await result.response;
      const content = response.text() || '{}';
      
      try {
        const parsed = JSON.parse(content);
        return {
          accounts: parsed.accounts || [],
          userQuery: userMessage,
          requiresCalculation: parsed.requiresCalculation || false,
          calculationResult: parsed.calculationResult,
          requiresValidation: parsed.requiresValidation || false,
          missingInfo: parsed.missingInfo || []
        };
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError);
        return {
          accounts: [],
          userQuery: userMessage,
          requiresCalculation: false
        };
      }
    } catch (error) {
      console.error('Gemini parsing error:', error);
      throw new Error('Failed to parse account data with Gemini');
    }
  }

  private requiresCalculation(message: string): boolean {
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
      'reach my goal',
      'need to save',
      'need to put'
    ];
    
    return calculationKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }
}
