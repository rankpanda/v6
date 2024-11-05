import { Groq } from 'groq-sdk';
import { toast } from '../components/ui/Toast';

const GROQ_API_KEY = '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';
const MODELS_CACHE_KEY = 'groq_models';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface GroqModel {
  id: string;
  name: string;
  description?: string;
  created?: number;
  owned_by?: string;
  root?: string;
}

const groqClient = new Groq({
  apiKey: GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

export const groqService = {
  async getModels(): Promise<GroqModel[]> {
    try {
      const cachedModels = this.getModelsFromCache();
      if (cachedModels) return cachedModels;

      const response = await fetch('https://api.groq.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();
      const models = data.data
        .filter((model: any) => !model.id.includes('test') && !model.id.includes('deprecated'))
        .map((model: any) => ({
          id: model.id,
          name: this.getModelDisplayName(model.id),
          description: model.description,
          created: model.created,
          owned_by: model.owned_by,
          root: model.root
        }));

      localStorage.setItem(MODELS_CACHE_KEY, JSON.stringify({
        models,
        timestamp: Date.now()
      }));

      return models;
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  },

  async getCurrentModel(): Promise<string> {
    return localStorage.getItem('groq_model') || 'mixtral-8x7b-32768';
  },

  async setCurrentModel(modelId: string): Promise<void> {
    localStorage.setItem('groq_model', modelId);
  },

  async analyzeKeywords(
    keywords: Array<{ keyword: string; volume: number }>,
    contextData: any,
    onProgress?: (progress: number) => void
  ): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    const currentModel = await this.getCurrentModel();
    const batchSize = 3;
    let processedCount = 0;

    for (let i = 0; i < keywords.length; i += batchSize) {
      const batch = keywords.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async ({ keyword, volume }) => {
          try {
            const systemPrompt = this.createSystemPrompt(contextData);
            const userPrompt = this.createUserPrompt(keyword, volume, contextData);

            const completion = await groqClient.chat.completions.create({
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
              ],
              model: currentModel,
              temperature: 0.3,
              max_tokens: 1000,
              stream: false
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) {
              throw new Error('Empty response from API');
            }

            results[keyword] = JSON.parse(content);
            processedCount++;
            
            if (onProgress) {
              onProgress((processedCount / keywords.length) * 100);
            }
          } catch (error) {
            console.error(`Error analyzing keyword "${keyword}":`, error);
            results[keyword] = {
              error: error instanceof Error ? error.message : 'Analysis failed'
            };
          }
        })
      );

      // Add delay between batches
      if (i + batchSize < keywords.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return results;
  },

  getModelDisplayName(modelId: string): string {
    const displayNames: { [key: string]: string } = {
      'mixtral-8x7b-32768': 'Mixtral 8x7B (32K context)',
      'llama2-70b-4096': 'LLaMA2 70B (4K context)',
      'gemma-7b-it': 'Gemma 7B-IT',
      'llama3-70b-8192': 'LLaMA3 70B (8K context)'
    };
    return displayNames[modelId] || modelId;
  },

  getModelsFromCache(): GroqModel[] | null {
    try {
      const cached = localStorage.getItem(MODELS_CACHE_KEY);
      if (!cached) return null;

      const { models, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(MODELS_CACHE_KEY);
        return null;
      }

      return models;
    } catch {
      return null;
    }
  },

  createSystemPrompt(contextData: any): string {
    return `You are an expert SEO analyst for an e-commerce website specializing in ${contextData.category}. The brand of the site you are analyzing is ${contextData.brandName}. Your primary goal is to identify keywords that will drive qualified traffic likely to convert into sales.

Key Analysis Rules:
- Evaluate sales relevance with strong focus on ${contextData.category} and purchase intent
- Identify competitor brand keywords and assign 0 priority unless they're product brands we could sell
- Calculate funnel stage based on user intent and purchase readiness
- Classify content type strictly as Target Page, Support Article, or Pillar Page
- Be highly critical in priority assessment (0-10 scale)

Output must be strictly JSON format with these fields only:
{
  "keyword_analysis": {
    "content_classification": {
      "type": "[Target Page/Support Article/Pillar Page]"
    },
    "search_intent": {
      "type": "[Informational/Commercial/Transactional/Navigational]"
    },
    "marketing_funnel_position": {
      "stage": "[TOFU/MOFU/BOFU]"
    },
    "overall_priority": {
      "score": [0-10]
    }
  }
}`;
  },

  createUserPrompt(keyword: string, volume: number, contextData: any): string {
    return `Analyze this keyword for ${contextData.brandName}'s e-commerce website:

Keyword: ${keyword}
Monthly Volume: ${volume}
Category: ${contextData.category}
Business Context: ${contextData.businessContext}

Provide analysis in the specified JSON format. Be objective and critical:
- If keyword is a competitor brand we can't sell, assign 0 priority
- If keyword has purchase intent and aligns with our business, score higher
- Consider search volume and competition level
- Evaluate alignment with ${contextData.brandName}'s business goals`;
  }
};