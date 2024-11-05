import { Groq } from 'groq-sdk';
import { GROQ_CONFIG } from './config';
import { modelService } from './modelService';

const groqClient = new Groq({
  apiKey: GROQ_CONFIG.API_KEY,
  dangerouslyAllowBrowser: true
});

export interface AnalysisContext {
  category: string;
  brandName: string;
  businessContext: string;
  language: string;
}

export interface KeywordAnalysis {
  keyword_analysis: {
    content_classification: {
      type: string;
    };
    search_intent: {
      type: string;
    };
    marketing_funnel_position: {
      stage: string;
    };
    overall_priority: {
      score: number;
    };
  };
  error?: string;
}

export const analysisService = {
  async analyzeKeywords(
    keywords: Array<{ keyword: string; volume: number }>,
    contextData: AnalysisContext,
    onProgress?: (progress: number) => void
  ): Promise<Record<string, KeywordAnalysis>> {
    const results: Record<string, KeywordAnalysis> = {};
    const currentModel = await modelService.getCurrentModel();
    let processedCount = 0;

    for (let i = 0; i < keywords.length; i += GROQ_CONFIG.BATCH_SIZE) {
      const batch = keywords.slice(i, i + GROQ_CONFIG.BATCH_SIZE);
      
      try {
        const batchResults = await Promise.all(
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

              try {
                const analysis = JSON.parse(content);
                return {
                  keyword,
                  analysis: {
                    keyword_analysis: {
                      content_classification: {
                        type: analysis.keyword_analysis.content_classification.type
                      },
                      search_intent: {
                        type: analysis.keyword_analysis.search_intent.type
                      },
                      marketing_funnel_position: {
                        stage: analysis.keyword_analysis.marketing_funnel_position.stage
                      },
                      overall_priority: {
                        score: analysis.keyword_analysis.overall_priority.score
                      }
                    }
                  }
                };
              } catch (parseError) {
                console.error('Error parsing Groq response:', parseError);
                return {
                  keyword,
                  analysis: {
                    keyword_analysis: {
                      content_classification: { type: 'Target Page' },
                      search_intent: { type: 'Commercial' },
                      marketing_funnel_position: { stage: 'MOFU' },
                      overall_priority: { score: 5 }
                    },
                    error: 'Invalid response format'
                  }
                };
              }
            } catch (error) {
              console.error(`Error analyzing keyword "${keyword}":`, error);
              return {
                keyword,
                analysis: {
                  keyword_analysis: {
                    content_classification: { type: 'Target Page' },
                    search_intent: { type: 'Commercial' },
                    marketing_funnel_position: { stage: 'MOFU' },
                    overall_priority: { score: 5 }
                  },
                  error: error instanceof Error ? error.message : 'Analysis failed'
                }
              };
            }
          })
        );

        batchResults.forEach(({ keyword, analysis }) => {
          results[keyword] = analysis;
        });

        processedCount += batch.length;
        if (onProgress) {
          onProgress((processedCount / keywords.length) * 100);
        }
      } catch (error) {
        console.error('Error processing batch:', error);
        batch.forEach(({ keyword }) => {
          results[keyword] = {
            keyword_analysis: {
              content_classification: { type: 'Target Page' },
              search_intent: { type: 'Commercial' },
              marketing_funnel_position: { stage: 'MOFU' },
              overall_priority: { score: 5 }
            },
            error: 'Batch processing failed'
          };
        });
      }

      if (i + GROQ_CONFIG.BATCH_SIZE < keywords.length) {
        await new Promise(resolve => setTimeout(resolve, GROQ_CONFIG.BATCH_DELAY));
      }
    }

    return results;
  },

  createSystemPrompt(contextData: AnalysisContext): string {
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

  createUserPrompt(keyword: string, volume: number, contextData: AnalysisContext): string {
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