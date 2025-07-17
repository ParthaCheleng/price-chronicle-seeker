import { create } from 'zustand';

export interface FormInput {
  tokenAddress: string;
  network: 'ethereum' | 'polygon';
  timestamp: string;
}

export interface PriceResult {
  price: number | null;
  timestamp: string;
  source: 'cache' | 'alchemy' | 'interpolated';
  loading: boolean;
  error: string | null;
}

export interface HistoryJobProgress {
  isRunning: boolean;
  progress: number;
  totalFetched: number;
  totalExpected: number;
  error: string | null;
}

interface OracleStore {
  // Form state
  formInput: FormInput;
  setFormInput: (input: Partial<FormInput>) => void;
  resetForm: () => void;

  // Price result state
  priceResult: PriceResult;
  setPriceResult: (result: Partial<PriceResult>) => void;
  resetPriceResult: () => void;

  // History job state
  historyJobProgress: HistoryJobProgress;
  setHistoryJobProgress: (progress: Partial<HistoryJobProgress>) => void;
  resetHistoryJobProgress: () => void;

  // Actions
  fetchPrice: () => Promise<void>;
  scheduleFullHistory: () => Promise<void>;
}

const initialFormInput: FormInput = {
  tokenAddress: '',
  network: 'ethereum',
  timestamp: '',
};

const initialPriceResult: PriceResult = {
  price: null,
  timestamp: '',
  source: 'cache',
  loading: false,
  error: null,
};

const initialHistoryJobProgress: HistoryJobProgress = {
  isRunning: false,
  progress: 0,
  totalFetched: 0,
  totalExpected: 0,
  error: null,
};

export const useOracleStore = create<OracleStore>((set, get) => ({
  // Initial state
  formInput: initialFormInput,
  priceResult: initialPriceResult,
  historyJobProgress: initialHistoryJobProgress,

  // Form actions
  setFormInput: (input) =>
    set((state) => ({
      formInput: { ...state.formInput, ...input },
    })),

  resetForm: () => set({ formInput: initialFormInput }),

  // Price result actions
  setPriceResult: (result) =>
    set((state) => ({
      priceResult: { ...state.priceResult, ...result },
    })),

  resetPriceResult: () => set({ priceResult: initialPriceResult }),

  // History job actions
  setHistoryJobProgress: (progress) =>
    set((state) => ({
      historyJobProgress: { ...state.historyJobProgress, ...progress },
    })),

  resetHistoryJobProgress: () => set({ historyJobProgress: initialHistoryJobProgress }),

  // API actions
  fetchPrice: async () => {
    const { formInput, setPriceResult } = get();
    
    if (!formInput.tokenAddress || !formInput.timestamp) {
      setPriceResult({ error: 'Please fill in all required fields' });
      return;
    }

    setPriceResult({ loading: true, error: null });

    try {
      // Mock API call - replace with actual backend endpoint
      const response = await fetch(`/api/price?token=${formInput.tokenAddress}&network=${formInput.network}&timestamp=${formInput.timestamp}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch price');
      }

      const data = await response.json();
      
      setPriceResult({
        price: data.price,
        timestamp: data.timestamp,
        source: data.source,
        loading: false,
        error: null,
      });
    } catch (error) {
      setPriceResult({
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  },

  scheduleFullHistory: async () => {
    const { formInput, setHistoryJobProgress } = get();
    
    if (!formInput.tokenAddress) {
      setHistoryJobProgress({ error: 'Please provide a token address' });
      return;
    }

    setHistoryJobProgress({ isRunning: true, progress: 0, error: null });

    try {
      // Mock API call - replace with actual backend endpoint
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: formInput.tokenAddress,
          network: formInput.network,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule full history job');
      }

      // Simulate progress updates
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
          progress = 100;
          setHistoryJobProgress({
            progress: 100,
            isRunning: false,
            totalFetched: 1000,
            totalExpected: 1000,
          });
          clearInterval(interval);
        } else {
          setHistoryJobProgress({
            progress: Math.round(progress),
            totalFetched: Math.round((progress / 100) * 1000),
            totalExpected: 1000,
          });
        }
      }, 500);

    } catch (error) {
      setHistoryJobProgress({
        isRunning: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  },
}));