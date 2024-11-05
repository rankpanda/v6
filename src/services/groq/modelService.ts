import { GROQ_CONFIG } from './config';

export interface GroqModel {
  id: string;
  name: string;
  description?: string;
}

export const modelService = {
  async getModels(): Promise<GroqModel[]> {
    try {
      const cachedModels = this.getModelsFromCache();
      if (cachedModels) return cachedModels;

      // Use predefined models since API is not accessible
      const models = GROQ_CONFIG.AVAILABLE_MODELS;
      this.cacheModels(models);
      return models;
    } catch (error) {
      console.error('Error fetching models:', error);
      return GROQ_CONFIG.AVAILABLE_MODELS;
    }
  },

  async getCurrentModel(): Promise<string> {
    return localStorage.getItem('groq_model') || GROQ_CONFIG.DEFAULT_MODEL;
  },

  async setCurrentModel(modelId: string): Promise<void> {
    localStorage.setItem('groq_model', modelId);
  },

  getModelsFromCache(): GroqModel[] | null {
    try {
      const cached = localStorage.getItem(GROQ_CONFIG.MODELS_CACHE_KEY);
      if (!cached) return null;

      const { models, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > GROQ_CONFIG.CACHE_DURATION) {
        localStorage.removeItem(GROQ_CONFIG.MODELS_CACHE_KEY);
        return null;
      }

      return models;
    } catch {
      return null;
    }
  },

  cacheModels(models: GroqModel[]): void {
    localStorage.setItem(GROQ_CONFIG.MODELS_CACHE_KEY, JSON.stringify({
      models,
      timestamp: Date.now()
    }));
  }
};