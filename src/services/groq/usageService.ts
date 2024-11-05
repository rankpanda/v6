interface GroqUsage {
  tokens: number;
  cost: number;
  lastUpdated: string;
}

const COST_PER_TOKEN = 0.0001;
const STORAGE_KEY = 'groq_usage_data';

export const usageService = {
  async getUsage(): Promise<GroqUsage> {
    try {
      const storedUsage = localStorage.getItem(STORAGE_KEY);
      if (!storedUsage) {
        const initialUsage = this.initializeUsage();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUsage));
        return initialUsage;
      }

      const usage = JSON.parse(storedUsage) as GroqUsage;
      
      // Reset usage if it's a new day
      const lastUpdate = new Date(usage.lastUpdated);
      const now = new Date();
      if (lastUpdate.getDate() !== now.getDate() || 
          lastUpdate.getMonth() !== now.getMonth() || 
          lastUpdate.getFullYear() !== now.getFullYear()) {
        const initialUsage = this.initializeUsage();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUsage));
        return initialUsage;
      }

      return usage;
    } catch (error) {
      console.error('Error getting Groq usage:', error);
      const initialUsage = this.initializeUsage();
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
      throw error;
    }
  },

  initializeUsage(): GroqUsage {
    return {
      tokens: 0,
      cost: 0,
      lastUpdated: new Date().toISOString()
    };
  }
};