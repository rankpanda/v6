import { analysisService, KeywordAnalysis, AnalysisContext } from './groq/analysisService';
import { toast } from '../components/ui/Toast';

const BATCH_SIZE = 3;
const DELAY_BETWEEN_BATCHES = 2000;

export const keywordAnalysisService = {
  async batchAnalyzeKeywords(
    keywords: Array<{ keyword: string; volume: number }>,
    contextData: any,
    onProgress: (progress: number) => void
  ): Promise<Record<string, KeywordAnalysis>> {
    const results: Record<string, KeywordAnalysis> = {};
    let processedCount = 0;

    // Filter out already analyzed keywords
    const unanalyzedKeywords = keywords.filter(kw => !results[kw.keyword]);

    for (let i = 0; i < unanalyzedKeywords.length; i += BATCH_SIZE) {
      const batch = unanalyzedKeywords.slice(i, i + BATCH_SIZE);
      
      await Promise.all(
        batch.map(async ({ keyword, volume }) => {
          try {
            const context: AnalysisContext = {
              category: contextData.category,
              brandName: contextData.brandName,
              businessContext: contextData.businessContext,
              volume
            };

            const analysis = await analysisService.analyzeKeyword(keyword, context);
            results[keyword] = analysis;
            processedCount++;
            onProgress((processedCount / unanalyzedKeywords.length) * 100);
          } catch (error) {
            console.error(`Error analyzing keyword "${keyword}":`, error);
            toast.error(`Failed to analyze keyword "${keyword}"`);
          }
        })
      );

      // Add delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < unanalyzedKeywords.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    return results;
  }
};