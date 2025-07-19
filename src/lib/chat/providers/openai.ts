import OpenAI from 'openai';
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

export class OpenAIService implements AIServiceProvider {
  private openai: OpenAI;
  private systemPrompt: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
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
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: this.systemPrompt
        },
        {
          role: 'user',
          content: `Current accounts: ${JSON.stringify(context.accounts || [])}
          
          User message: ${userMessage}`
        }
      ];

      const response = await this.openai.chat.completions.create({
        model: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || 'I apologize, but I could not process your request.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to process message with OpenAI');
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
      }`;

      const response = await this.openai.chat.completions.create({
        model: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a data extraction assistant. Extract account information from the conversation context and return ONLY valid JSON with no markdown formatting. Validate that all crucial information is available before creating accounts.'
          },
          {
            role: 'user',
            content: parsePrompt
          }
        ],
        max_tokens: 500,
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content || '{}';
      
      try {
        // Clean up the response to remove markdown code blocks
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
        } else if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/```\s*/, '').replace(/```\s*$/, '');
        }
        
        const parsed = JSON.parse(cleanContent);
        return {
          accounts: parsed.accounts || [],
          userQuery: userMessage,
          requiresCalculation: parsed.requiresCalculation || false,
          calculationResult: parsed.calculationResult,
          requiresValidation: parsed.requiresValidation || false,
          missingInfo: parsed.missingInfo || []
        };
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError);
        return {
          accounts: [],
          userQuery: userMessage,
          requiresCalculation: false
        };
      }
    } catch (error) {
      console.error('OpenAI parsing error:', error);
      throw new Error('Failed to parse account data with OpenAI');
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
