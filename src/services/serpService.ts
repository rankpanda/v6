import { toast } from '../components/ui/Toast';

interface SerpUsage {
  used: number;
  total: number;
  remaining: number;
}

const API_KEY = '5a4b2203-b166-4d35-ae14-bdf94f21566e';
const MONTHLY_CREDITS = 14999;

export const serpService = {
  async getUsage(): Promise<SerpUsage> {
    try {
      const savedUsage = localStorage.getItem('serp_api_usage');
      if (savedUsage) {
        return JSON.parse(savedUsage);
      }
      
      // Initial state
      const initialUsage = {
        used: 0,
        total: MONTHLY_CREDITS,
        remaining: MONTHLY_CREDITS
      };
      
      localStorage.setItem('serp_api_usage', JSON.stringify(initialUsage));
      return initialUsage;
    } catch (error) {
      console.error('Error getting SERP usage:', error);
      return { used: 0, total: MONTHLY_CREDITS, remaining: MONTHLY_CREDITS };
    }
  },

  async updateUsage(creditsUsed: number): Promise<void> {
    try {
      const currentUsage = await this.getUsage();
      const updatedUsage = {
        used: currentUsage.used + creditsUsed,
        total: currentUsage.total,
        remaining: currentUsage.total - (currentUsage.used + creditsUsed)
      };

      localStorage.setItem('serp_api_usage', JSON.stringify(updatedUsage));

      if (updatedUsage.remaining <= 100) {
        toast.warning(`Low SERP credits warning: ${updatedUsage.remaining} credits remaining`);
      }
    } catch (error) {
      console.error('Error updating SERP usage:', error);
    }
  },

  async analyzeKeyword(keyword: string, volume: number): Promise<any> {
    // Skip analysis for keywords with volume > 250
    if (volume > 250) {
      return {
        titleMatches: 0,
        kgr: null,
        kgrRating: 'not applicable',
        suggestions: []
      };
    }

    try {
      // Check remaining credits
      const usage = await this.getUsage();
      if (usage.remaining < 1) {
        throw new Error('No SERP API credits remaining');
      }

      const params = new URLSearchParams({
        apiKey: API_KEY,
        q: keyword,
        domain: 'google.pt',
        gl: 'pt',
        hl: 'pt',
        device: 'desktop',
        resultFormat: 'json',
        resultBlocks: [
          'organic_results',
          'people_also_ask',
          'related_searches',
          'answer_box'
        ].join(',')
      });

      const response = await fetch(`https://api.spaceserp.com/google/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();

      // Update credit usage
      await this.updateUsage(1);

      // Calculate KGR
      const titleMatches = data.organic_results?.filter((result: any) => 
        result.title.toLowerCase().includes(keyword.toLowerCase())
      ).length || 0;

      const kgr = volume <= 250 ? titleMatches / 10 : null;
      let kgrRating: 'great' | 'might work' | 'bad' | 'not applicable' = 'not applicable';
      
      if (kgr !== null) {
        kgrRating = kgr < 0.25 ? 'great' : kgr <= 1 ? 'might work' : 'bad';
      }

      return {
        titleMatches,
        kgr,
        kgrRating,
        suggestions: [
          ...(data.people_also_ask?.map((item: any) => ({
            keyword: item.question,
            source: 'people_also_ask'
          })) || []),
          ...(data.related_searches?.map((item: any) => ({
            keyword: item.query,
            source: 'related_searches'
          })) || []),
          ...(data.answer_box ? [{
            keyword: data.answer_box.title || data.answer_box.content,
            source: 'answer_box'
          }] : [])
        ]
      };

    } catch (error) {
      console.error(`Error analyzing keyword "${keyword}":`, error);
      throw error;
    }
  },

  async batchAnalyzeKeywords(
    keywords: Array<{ keyword: string; volume: number }>,
    onProgress?: (progress: number) => void
  ): Promise<Record<string, any>> {
    const eligibleKeywords = keywords.filter(k => k.volume <= 250);
    
    if (eligibleKeywords.length === 0) {
      toast.info('No keywords eligible for KGR analysis (volume must be ≤ 250)');
      return {};
    }

    // Check if we have enough credits
    const usage = await this.getUsage();
    if (usage.remaining < eligibleKeywords.length) {
      toast.error(`Not enough SERP credits. Need ${eligibleKeywords.length}, but only ${usage.remaining} remaining.`);
      throw new Error('Insufficient SERP credits');
    }

    const results: Record<string, any> = {};
    let completed = 0;

    for (const { keyword, volume } of keywords) {
      try {
        if (volume <= 250) {
          results[keyword] = await this.analyzeKeyword(keyword, volume);
        } else {
          results[keyword] = {
            titleMatches: 0,
            kgr: null,
            kgrRating: 'not applicable',
            suggestions: [],
            error: 'Volume exceeds KGR limit (250)'
          };
        }
      } catch (error) {
        results[keyword] = {
          titleMatches: 0,
          kgr: null,
          kgrRating: 'not applicable',
          suggestions: [],
          error: error instanceof Error ? error.message : 'Analysis failed'
        };
      }

      completed++;
      if (onProgress) {
        onProgress((completed / keywords.length) * 100);
      }

      // Add delay between requests
      if (completed < keywords.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
};