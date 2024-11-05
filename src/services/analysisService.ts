import { supabase } from './supabaseClient';
import { toast } from '../components/ui/Toast';
import type { Tables } from './supabaseClient';
import type { KeywordAnalysis } from './keywordAnalysisService';

export type Analysis = Tables['keywords']['Row']['analysis'];

export const analysisService = {
  async saveAnalysis(keywordId: string, analysis: KeywordAnalysis) {
    try {
      const { error } = await supabase
        .from('keywords')
        .update({
          analysis,
          intent: analysis.keyword_analysis.search_intent.type,
          confirmed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', keywordId);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving analysis:', error);
      throw error;
    }
  },

  async batchSaveAnalysis(analyses: { keywordId: string; analysis: KeywordAnalysis }[]) {
    try {
      const { error } = await supabase
        .from('keywords')
        .upsert(
          analyses.map(({ keywordId, analysis }) => ({
            id: keywordId,
            analysis,
            intent: analysis.keyword_analysis.search_intent.type,
            confirmed: true,
            updated_at: new Date().toISOString()
          }))
        );

      if (error) throw error;
      toast.success(`${analyses.length} análises guardadas com sucesso`);
    } catch (error) {
      console.error('Error saving analyses:', error);
      toast.error('Erro ao guardar análises');
      throw error;
    }
  }
};