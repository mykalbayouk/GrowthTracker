'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

interface Settings {
  defaultProjectionMonths: number;
  currency: string;
}

interface SettingsState {
  settings: Settings;
  loading: boolean;
  error: string | null;
}

type SettingsAction =
  | { type: 'LOAD_SETTINGS'; payload: Settings }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

interface SettingsContextType {
  state: SettingsState;
  updateSettings: (settings: Partial<Settings>) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  defaultProjectionMonths: 36,
  currency: 'USD'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const settingsReducer = (state: SettingsState, action: SettingsAction): SettingsState => {
  switch (action.type) {
    case 'LOAD_SETTINGS':
      return {
        ...state,
        settings: action.payload,
        loading: false,
        error: null
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
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

const SETTINGS_STORAGE_KEY = 'savings_calculator_settings';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const initialState: SettingsState = {
    settings: defaultSettings,
    loading: true,
    error: null
  };

  const [state, dispatch] = useReducer(settingsReducer, initialState);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (saved) {
          const settings = JSON.parse(saved);
          dispatch({ type: 'LOAD_SETTINGS', payload: { ...defaultSettings, ...settings } });
        } else {
          dispatch({ type: 'LOAD_SETTINGS', payload: defaultSettings });
        }
      } else {
        dispatch({ type: 'LOAD_SETTINGS', payload: defaultSettings });
      }
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load settings' });
    }
  }, []);

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    if (!state.loading && typeof window !== 'undefined') {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state.settings));
      } catch {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to save settings' });
      }
    }
  }, [state.settings, state.loading]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
  };

  const resetSettings = () => {
    dispatch({ type: 'LOAD_SETTINGS', payload: defaultSettings });
  };

  return (
    <SettingsContext.Provider
      value={{
        state,
        updateSettings,
        resetSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
