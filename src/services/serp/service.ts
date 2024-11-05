import { SerpAnalysisResult, SerpError } from './types';
import { serpConfig } from './config';
import { toast } from '../../components/ui/Toast';

export const serpService = {
  async analyzeKeyword(keyword: string, volume: number, language = 'pt'): Promise<SerpAnalysisResult> {
    try {
      // Skip analysis for keywords with volume > 250
      if (volume > 250) {
        return {
          titleMatches: 0,
          totalResults: 0,
          kgr: null,
          kgrRating: 'not applicable',
          autoSuggestions: [],
          peopleAlsoAsk: [],
          error: undefined
        };
      }

      // Get auto suggestions and organic results in parallel
      const [autoSuggestResponse, organicResponse] = await Promise.all([
        fetch(`https://api.spaceserp.com/google/search?apiKey=5a4b2203-b166-4d35-ae14-bdf94f21566e&q=${encodeURIComponent(keyword)}&domain=google.${language}&gl=${language}&hl=${language}&resultFormat=json&resultBlocks=organic_results&tbm=autocomplete`),
        fetch(`https://api.spaceserp.com/google/search?apiKey=5a4b2203-b166-4d35-ae14-bdf94f21566e&q=${encodeURIComponent(keyword)}&domain=google.${language}&gl=${language}&hl=${language}&resultFormat=json&resultBlocks=organic_results,people_also_ask`)
      ]);

      if (!autoSuggestResponse.ok || !organicResponse.ok) {
        throw new SerpError(
          'API request failed',
          autoSuggestResponse.status || organicResponse.status
        );
      }

      const [autoSuggestData, organicData] = await Promise.all([
        autoSuggestResponse.json(),
        organicResponse.json()
      ]);

      // Calculate KGR
      const organicResults = organicData.organic_results || [];
      const titleMatches = organicResults.filter((result: any) => 
        result.title.toLowerCase().includes(keyword.toLowerCase())
      ).length;

      const kgr = volume <= 250 ? titleMatches / volume : null;
      let kgrRating: 'great' | 'might work' | 'bad' | 'not applicable' = 'not applicable';
      
      if (kgr !== null) {
        kgrRating = kgr < 0.25 ? 'great' : kgr <= 1 ? 'might work' : 'bad';
      }

      return {
        titleMatches,
        totalResults: organicResults.length,
        kgr,
        kgrRating,
        autoSuggestions: autoSuggestData.auto_complete?.suggestions || [],
        peopleAlsoAsk: organicData.people_also_ask?.map((item: any) => ({
          question: item.question,
          answer: item.answer
        })) || [],
        error: undefined
      };
    } catch (error) {
      console.error(`Error analyzing keyword "${keyword}":`, error);
      return {
        titleMatches: 0,
        totalResults: 0,
        kgr: null,
        kgrRating: 'not applicable',
        autoSuggestions: [],
        peopleAlsoAsk: [],
        error: error instanceof Error ? error.message : 'Analysis failed'
      };
    }
  },

  async batchAnalyzeKeywords(
    keywords: Array<{ keyword: string; volume: number }>,
    onProgress?: (progress: number) => void
  ): Promise<Record<string, SerpAnalysisResult>> {
    const results: Record<string, SerpAnalysisResult> = {};
    let processedCount = 0;

    // Get language from context
    const contextData = localStorage.getItem('contextFormData');
    const language = contextData ? JSON.parse(contextData).language || 'pt' : 'pt';

    for (const { keyword, volume } of keywords) {
      try {
        const result = await this.analyzeKeyword(keyword, volume, language);
        results[keyword] = result;

        processedCount++;
        if (onProgress) {
          onProgress((processedCount / keywords.length) * 100);
        }

        // Add delay between requests to avoid rate limiting
        if (processedCount < keywords.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Error analyzing keyword "${keyword}":`, error);
        results[keyword] = {
          titleMatches: 0,
          totalResults: 0,
          kgr: null,
          kgrRating: 'not applicable',
          autoSuggestions: [],
          peopleAlsoAsk: [],
          error: error instanceof Error ? error.message : 'Analysis failed'
        };
      }
    }

    return results;
  }
};