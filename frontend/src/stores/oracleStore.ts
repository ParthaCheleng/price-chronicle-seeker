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
  resetHistoryJobProgress: () =>
    set({ historyJobProgress: initialHistoryJobProgress }),

  // API actions
  fetchPrice: async () => {
    const { formInput, setPriceResult } = get();
    const { tokenAddress, network, timestamp } = formInput;

    if (!tokenAddress || !network || !timestamp) {
      console.warn("Missing input");
      return;
    }

    setPriceResult({ loading: true, price: null, source: null, error: null });

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/price?token=${tokenAddress}&network=${network}&timestamp=${timestamp}`
      );

      if (!res.ok) throw new Error("Failed to fetch price");

      const data = await res.json();

      setPriceResult({
        price: data.price,
        source: data.source,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error("Error:", err.message);
      setPriceResult({
        price: null,
        source: null,
        loading: false,
        error: "Failed to fetch price",
      });
    }
  },

  scheduleFullHistory: async () => {
  const { formInput, setHistoryJobProgress } = get();

  if (!formInput.tokenAddress) {
    setHistoryJobProgress({ error: 'Please provide a token address' });
    return;
  }

  setHistoryJobProgress({
    isRunning: true,
    progress: 0,
    error: null,
    totalFetched: 0,
    totalExpected: 0,
  });

  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const startDate = oneYearAgo.toISOString().split('T')[0]; // YYYY-MM-DD
  const endDate = today.toISOString().split('T')[0];

  try {
    const response = await fetch('/api/schedule-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokenAddress: formInput.tokenAddress,
        network: formInput.network,
        startDate,
        endDate,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to schedule full history job');
    }

    const { jobId } = await response.json();

    // Begin polling progress
    const pollInterval = setInterval(async () => {
      try {
        const progressRes = await fetch(`/api/progress?jobId=${jobId}`);
        const progressData = await progressRes.json();

        setHistoryJobProgress({
          isRunning: !progressData.isComplete,
          progress: progressData.progress,
          totalFetched: progressData.totalFetched,
          totalExpected: progressData.totalExpected,
          error: null,
        });

        if (progressData.isComplete) {
          clearInterval(pollInterval);
        }
      } catch (pollErr) {
        console.error("Polling error:", pollErr);
        clearInterval(pollInterval);
        setHistoryJobProgress({
          isRunning: false,
          error: 'Failed to fetch progress update',
        });
      }
    }, 3000); // Poll every 3 seconds

  } catch (error) {
    console.error("Scheduler error:", error);
    setHistoryJobProgress({
      isRunning: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    });
  }
},

}));
