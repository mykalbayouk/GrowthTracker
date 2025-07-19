'use client';

import React, { createContext, useContext, useReducer, useCallback, useMemo, ReactNode } from 'react';
import { ChatMessage, ChatState } from '../chat/types';
import { AIServiceFactory } from '../chat/aiService';
import { AccountGenerator } from '../chat/accountGenerator';
import { ContextBuilder } from '../chat/contextBuilder';
import { useAccounts } from './AccountContext';

interface ChatContextType {
  state: ChatState;
  sendMessage: (message: string) => Promise<void>;
  toggleChat: () => void;
  clearChat: () => void;
  clearError: () => void;
}

type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'TOGGLE_CHAT' }
  | { type: 'CLEAR_CHAT' }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: ChatState = {
  messages: [],
  isOpen: false,
  isTyping: false,
  error: null,
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null,
      };
    case 'SET_TYPING':
      return {
        ...state,
        isTyping: action.payload,
      };
    case 'TOGGLE_CHAT':
      return {
        ...state,
        isOpen: !state.isOpen,
      };
    case 'CLEAR_CHAT':
      return {
        ...state,
        messages: [],
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isTyping: false,
      };
    default:
      return state;
  }
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { state: accountState, addAccount } = useAccounts();
  
  // Initialize AI service
  const aiService = AIServiceFactory.createService(
    (process.env.NEXT_PUBLIC_AI_PROVIDER as 'openai' | 'gemini') || 'openai'
  );
  
  // Initialize account generator with useMemo to prevent recreation on every render
  const accountGenerator = useMemo(() => new AccountGenerator(addAccount), [addAccount]);

  const sendMessage = useCallback(async (message: string) => {
    try {
      // Add user message
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        content: message,
        role: 'user',
        timestamp: new Date(),
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
      dispatch({ type: 'SET_TYPING', payload: true });

      // Build context for AI
      const context = ContextBuilder.buildContext(accountState.accounts, state.messages);
      
      try {
        // Check if this is an account creation request
        console.log('🔍 ChatContext: Processing message:', message);
        const parsedData = await aiService.parseAccountData(message, { 
          messages: state.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            id: msg.id,
            timestamp: msg.timestamp
          }))
        });
        console.log('🔍 ChatContext: Parsed data:', parsedData);
        
        let createdAccountIds: string[] = [];
        let aiResponse: string;
        
        // Check if validation is required
        if (parsedData.requiresValidation && parsedData.missingInfo && parsedData.missingInfo.length > 0) {
          // Missing crucial information, ask for it
          const missingFields = parsedData.missingInfo.map(field => {
            switch (field) {
              case 'startingBalance': return 'starting balance';
              case 'interestRate': return 'interest rate (APY)';
              case 'targetAmount': return 'target amount';
              case 'targetDate': return 'target date';
              default: return field;
            }
          }).join(', ');
          
          aiResponse = `I need more information to create your account. Please provide: ${missingFields}.`;
        } else if (parsedData.accounts.length > 0) {
          // All information is available, create the account
          console.log('🔍 ChatContext: Creating accounts...');
          const createdAccounts = await accountGenerator.generateAccounts(parsedData);
          console.log('🔍 ChatContext: Created accounts:', createdAccounts);
          createdAccountIds = createdAccounts.map(account => account.id);
          console.log('🔍 ChatContext: Account IDs:', createdAccountIds);
          
          // Simple confirmation message
          aiResponse = `✅ Account created successfully! Your ${createdAccounts[0]?.name || 'account'} is now ready.`;
        } else {
          // Get AI response for non-account creation messages
          const compatibleContext = {
            accounts: context.accounts.map(account => ({
              id: account.id,
              name: account.name,
              currentBalance: account.currentBalance,
              interestRate: account.interestRate,
              startingBalance: account.startingBalance,
              compoundFrequency: account.compoundFrequency,
              goalType: account.goalType,
              targetAmount: account.targetAmount,
              targetDate: account.targetDate,
              monthlyContribution: account.monthlyContribution,
              createdAt: account.createdAt,
              updatedAt: account.updatedAt
            })),
            summary: context.summary,
            recentHistory: context.recentHistory,
            timestamp: context.timestamp
          };
          aiResponse = await aiService.processMessage(message, compatibleContext);
        }
        
        // Add AI response
        const assistantMessage: ChatMessage = {
          id: `assistant_${Date.now()}`,
          content: aiResponse,
          role: 'assistant',
          timestamp: new Date(),
          accountsCreated: createdAccountIds.length > 0 ? createdAccountIds : undefined,
        };
        
        dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
        
      } catch (error) {
        console.error('AI service error:', error);
        
        // Fallback response
        const fallbackMessage: ChatMessage = {
          id: `assistant_${Date.now()}`,
          content: 'I apologize, but I encountered an error processing your request. Please try again or rephrase your message.',
          role: 'assistant',
          timestamp: new Date(),
        };
        
        dispatch({ type: 'ADD_MESSAGE', payload: fallbackMessage });
        dispatch({ type: 'SET_ERROR', payload: 'Failed to process message' });
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'An unexpected error occurred' });
    } finally {
      dispatch({ type: 'SET_TYPING', payload: false });
    }
  }, [aiService, accountGenerator, accountState.accounts, state.messages]);

  const toggleChat = useCallback(() => {
    dispatch({ type: 'TOGGLE_CHAT' });
  }, []);

  const clearChat = useCallback(() => {
    console.log('🔍 ChatContext: Clearing chat history');
    dispatch({ type: 'CLEAR_CHAT' });
    // Also clear from localStorage
    localStorage.removeItem('growthtracker_chat_history');
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Save chat history to localStorage
  React.useEffect(() => {
    if (state.messages.length > 0) {
      localStorage.setItem('growthtracker_chat_history', JSON.stringify(state.messages));
    }
  }, [state.messages]);

  // Load chat history from localStorage on mount
  React.useEffect(() => {
    const savedHistory = localStorage.getItem('growthtracker_chat_history');
    if (savedHistory) {
      try {
        const messages = JSON.parse(savedHistory) as Array<{
          id: string;
          content: string;
          role: 'user' | 'assistant';
          timestamp: string;
          accountsCreated?: string[];
        }>;
        messages.forEach((message) => {
          // Convert timestamp back to Date object
          const restoredMessage: ChatMessage = {
            ...message,
            timestamp: new Date(message.timestamp)
          };
          dispatch({ type: 'ADD_MESSAGE', payload: restoredMessage });
        });
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }
  }, []);

  return (
    <ChatContext.Provider
      value={{
        state,
        sendMessage,
        toggleChat,
        clearChat,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
