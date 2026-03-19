// Utilitário para gerenciar dados de indicação no localStorage
interface ReferralData {
  indicadorId: string;
  timestamp: number;
  processed: boolean;
}

const REFERRAL_KEY = 'gira_mae_referral';

export const referralStorage = {
  set(indicadorId: string): void {
    const data: ReferralData = {
      indicadorId,
      timestamp: Date.now(),
      processed: false
    };
    localStorage.setItem(REFERRAL_KEY, JSON.stringify(data));
  },

  get(): ReferralData | null {
    try {
      const stored = localStorage.getItem(REFERRAL_KEY);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  clear(): void {
    localStorage.removeItem(REFERRAL_KEY);
  },

  isProcessed(): boolean {
    const data = this.get();
    return data?.processed || false;
  },

  markAsProcessed(): void {
    const data = this.get();
    if (data) {
      data.processed = true;
      localStorage.setItem(REFERRAL_KEY, JSON.stringify(data));
    }
  }
};