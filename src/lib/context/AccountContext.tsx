'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Account, ImportedAccount } from '../types';
import { calculateCurrentBalance } from '../calculations';

interface AccountState {
  accounts: Account[];
  loading: boolean;
  error: string | null;
}

type AccountAction =
  | { type: 'LOAD_ACCOUNTS'; payload: Account[] }
  | { type: 'ADD_ACCOUNT'; payload: Account }
  | { type: 'UPDATE_ACCOUNT'; payload: Account }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  | { type: 'BULK_IMPORT_ACCOUNTS'; payload: Account[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

interface AccountContextType {
  state: AccountState;
  addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
  getAccount: (id: string) => Account | undefined;
  refreshAccountBalances: () => void;
  bulkImportAccounts: (importedAccounts: ImportedAccount[]) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

const accountReducer = (state: AccountState, action: AccountAction): AccountState => {
  switch (action.type) {
    case 'LOAD_ACCOUNTS':
      return {
        ...state,
        accounts: action.payload,
        loading: false,
        error: null
      };
    case 'ADD_ACCOUNT':
      const newAccounts = [...state.accounts, action.payload];
      return {
        ...state,
        accounts: newAccounts,
        error: null
      };
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.map(account =>
          account.id === action.payload.id ? action.payload : account
        ),
        error: null
      };
    case 'DELETE_ACCOUNT':
      return {
        ...state,
        accounts: state.accounts.filter(account => account.id !== action.payload),
        error: null
      };
    case 'BULK_IMPORT_ACCOUNTS':
      return {
        ...state,
        accounts: [...state.accounts, ...action.payload],
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

const STORAGE_KEY = 'savings_calculator_accounts';

export function AccountProvider({ children }: { children: ReactNode }) {
  const initialState: AccountState = {
    accounts: [],
    loading: true,
    error: null
  };

  const [state, dispatch] = useReducer(accountReducer, initialState);

  // Load accounts from localStorage on mount
  useEffect(() => {
    try {
      // Only access localStorage on the client side
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const accounts = JSON.parse(saved).map((account: Account) => ({
            ...account,
            createdAt: new Date(account.createdAt),
            updatedAt: new Date(account.updatedAt),
            targetDate: account.targetDate ? new Date(account.targetDate) : undefined
          }));
          dispatch({ type: 'LOAD_ACCOUNTS', payload: accounts });
        } else {
          dispatch({ type: 'LOAD_ACCOUNTS', payload: [] });
        }
      } else {
        dispatch({ type: 'LOAD_ACCOUNTS', payload: [] });
      }
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load accounts' });
    }
  }, []);

  // Save accounts to localStorage whenever accounts change
  useEffect(() => {
    if (!state.loading && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.accounts));
      } catch {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to save accounts' });
      }
    }
  }, [state.accounts, state.loading]);

  // Refresh account balances periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.accounts.length > 0) {
        const updatedAccounts = state.accounts.map(account => {
          const newCurrentBalance = calculateCurrentBalance(account);
          return {
            ...account,
            currentBalance: newCurrentBalance,
            updatedAt: new Date()
          };
        });
        dispatch({ type: 'LOAD_ACCOUNTS', payload: updatedAccounts });
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [state.accounts]);

  const addAccount = (accountData: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAccount: Account = {
      ...accountData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      currentBalance: accountData.currentBalance || accountData.startingBalance
    };
    dispatch({ type: 'ADD_ACCOUNT', payload: newAccount });
  };

  const updateAccount = (account: Account) => {
    // Recalculate current balance based on time elapsed and new parameters
    const calculatedCurrentBalance = calculateCurrentBalance(account);
    
    const updatedAccount = {
      ...account,
      currentBalance: calculatedCurrentBalance,
      updatedAt: new Date()
    };
    dispatch({ type: 'UPDATE_ACCOUNT', payload: updatedAccount });
  };

  const deleteAccount = (id: string) => {
    dispatch({ type: 'DELETE_ACCOUNT', payload: id });
  };

  const getAccount = (id: string) => {
    return state.accounts.find(account => account.id === id);
  };

  const refreshAccountBalances = () => {
    const updatedAccounts = state.accounts.map(account => {
      const newCurrentBalance = calculateCurrentBalance(account);
      return {
        ...account,
        currentBalance: newCurrentBalance,
        updatedAt: new Date()
      };
    });
    dispatch({ type: 'LOAD_ACCOUNTS', payload: updatedAccounts });
  };

  const bulkImportAccounts = (importedAccounts: ImportedAccount[]) => {
    const newAccounts: Account[] = importedAccounts.map(importedAccount => {
      const now = new Date();
      return {
        ...importedAccount,
        id: crypto.randomUUID(),
        currentBalance: importedAccount.startingBalance,
        targetDate: importedAccount.targetDate ? new Date(importedAccount.targetDate) : undefined,
        createdAt: now,
        updatedAt: now
      };
    });
    
    dispatch({ type: 'BULK_IMPORT_ACCOUNTS', payload: newAccounts });
  };

  return (
    <AccountContext.Provider
      value={{
        state,
        addAccount,
        updateAccount,
        deleteAccount,
        getAccount,
        refreshAccountBalances,
        bulkImportAccounts
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  return context;
}
