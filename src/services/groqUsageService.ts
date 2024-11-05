import { toast } from '../components/ui/Toast';

const COST_PER_TOKEN = 0.0001;
const STORAGE_KEY = 'groq_usage_data';

export interface GroqUsage {
  tokens: number;
  cost: number;
  lastUpdated: string;
}

export const groqUsageService = {
  getInitialUsage(): GroqUsage {
    return {
      tokens: 0,
      cost: 0,
      lastUpdated: new Date().toISOString()
    };
  },

  async getUsage(): Promise<GroqUsage> {
    try {
      const storedUsage = localStorage.getItem(STORAGE_KEY);
      if (!storedUsage) {
        const initialUsage = this.getInitialUsage();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUsage));
        return initialUsage;
      }

      const usage = JSON.parse(storedUsage) as GroqUsage;
      if (!usage.tokens || !usage.cost || !usage.lastUpdated) {
        const initialUsage = this.getInitialUsage();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUsage));
        return initialUsage;
      }

      // Check if it's a new day (reset usage)
      const lastUpdate = new Date(usage.lastUpdated);
      const now = new Date();
      if (lastUpdate.getDate() !== now.getDate() || 
          lastUpdate.getMonth() !== now.getMonth() || 
          lastUpdate.getFullYear() !== now.getFullYear()) {
        const initialUsage = this.getInitialUsage();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUsage));
        return initialUsage;
      }

      return usage;
    } catch (error) {
      console.error('Error getting Groq usage:', error);
      const initialUsage = this.getInitialUsage();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUsage));
      return initialUsage;
    }
  },

  async trackUsage(tokens: number): Promise<void> {
    try {
      const currentUsage = await this.getUsage();
      
      const updatedUsage: GroqUsage = {
        tokens: currentUsage.tokens + tokens,
        cost: Number((currentUsage.cost + ((tokens / 1000) * COST_PER_TOKEN)).toFixed(4)),
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsage));
    } catch (error) {
      console.error('Error tracking Groq usage:', error);
      toast.error('Failed to track Groq usage');
    }
  },

  async resetUsage(): Promise<void> {
    try {
      const initialUsage = this.getInitialUsage();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUsage));
    } catch (error) {
      console.error('Error resetting Groq usage:', error);
      toast.error('Failed to reset Groq usage');
    }
  },

  async getDailyLimit(): Promise<number> {
    const currentModel = localStorage.getItem('groq_model') || 'mixtral-8x7b-32768';
    const limits: { [key: string]: number } = {
      'mixtral-8x7b-32768': 500000,
      'llama2-70b-4096': 200000,
      'gemma-7b-it': 500000,
      'llama3-70b-8192': 500000,
      'llama3-8b-8192': 500000,
      'llama3-groq-70b-8192-tool-use-preview': 500000,
      'llama3-groq-8b-8192-tool-use-preview': 500000
    };
    return limits[currentModel] || 500000;
  },

  async getRemainingTokens(): Promise<number> {
    const usage = await this.getUsage();
    const dailyLimit = await this.getDailyLimit();
    return Math.max(0, dailyLimit - usage.tokens);
  }
};