import { useSettings } from '@/lib/context/SettingsContext';

/**
 * Hook to get currency-aware formatting functions
 */
export function useCurrencyFormatter() {
  const { state: settingsState } = useSettings();
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settingsState.settings.currency
    }).format(amount);
  };

  return {
    formatCurrency,
    currency: settingsState.settings.currency
  };
}
