import { AIServiceProvider, ParsedAccountData } from './types';
import { OpenAIService } from './providers/openai';
import { GeminiService } from './providers/gemini';

export class AIServiceFactory {
  static createService(provider: 'openai' | 'gemini' = 'openai'): AIServiceProvider {
    switch (provider) {
      case 'openai':
        return new OpenAIService();
      case 'gemini':
        return new GeminiService();
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }
}

export type { AIServiceProvider, ParsedAccountData };
