import React, { useState, useEffect } from 'react';
import { Loader2, Save, RefreshCw } from 'lucide-react';
import { KeywordTable } from './KeywordTable';
import { SerpUsageIndicator } from './SerpUsageIndicator';
import { FunnelAnalysis } from './FunnelAnalysis';
import { KeywordStats } from './KeywordStats';
import { KeywordAnalysisProgress } from './KeywordAnalysisProgress';
import { calculateTotalMetrics } from '../../utils/keywordMetrics';
import { groqService } from '../../services/groqService';
import { serpService } from '../../services/serpService';
import { autoSuggestService } from '../../services/autoSuggestService';
import { toast } from '../ui/Toast';

// ... rest of the imports

export function KeywordAnalysisView() {
  // ... existing state declarations

  const analyzeSelectedKeywords = async () => {
    if (!selectedKeywords.size) {
      toast.error('No keywords selected');
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalysisProgress(0);

      const selectedKws = keywords.filter(kw => selectedKeywords.has(kw.keyword));
      
      // Get auto suggestions first
      const suggestions = await autoSuggestService.batchGetSuggestions(
        selectedKws.map(kw => ({ keyword: kw.keyword })),
        contextData.language
      );

      // First analyze with SERP API
      const serpResults = await serpService.batchAnalyzeKeywords(
        selectedKws.map(kw => ({
          keyword: kw.keyword,
          volume: kw.volume
        })),
        progress => setAnalysisProgress(progress / 3)
      );

      // Then analyze with Groq
      const groqResults = await groqService.analyzeKeywords(
        selectedKws.map(kw => ({
          keyword: kw.keyword,
          volume: kw.volume
        })),
        contextData,
        progress => setAnalysisProgress(33 + progress / 3)
      );

      // Update keywords with all results
      const updatedKeywords = keywords.map(kw => {
        if (!selectedKeywords.has(kw.keyword)) return kw;

        const serpResult = serpResults[kw.keyword];
        const groqResult = groqResults[kw.keyword];
        const autoSuggestions = suggestions[kw.keyword];

        return {
          ...kw,
          autoSuggestions,
          ...(serpResult && {
            kgr: serpResult.kgr,
            kgrRating: serpResult.kgrRating,
            error: serpResult.error
          }),
          ...(groqResult && {
            analysis: groqResult,
            contentType: groqResult.keyword_analysis?.content_classification?.type,
            searchIntent: groqResult.keyword_analysis?.search_intent?.type,
            funnelStage: groqResult.keyword_analysis?.marketing_funnel_position?.stage,
            priority: groqResult.keyword_analysis?.overall_priority?.score
          })
        };
      });

      // Save to project
      const projectId = localStorage.getItem('currentProjectId');
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const projectIndex = projects.findIndex((p: any) => p.id === projectId);
      
      if (projectIndex !== -1) {
        projects[projectIndex].data.keywords = updatedKeywords;
        localStorage.setItem('projects', JSON.stringify(projects));
      }

      setKeywords(updatedKeywords);
      updateStats(updatedKeywords);
      await loadSerpUsage();
      
      toast.success('Analysis completed successfully');
    } catch (error) {
      console.error('Error analyzing keywords:', error);
      toast.error('Error analyzing keywords');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  // ... rest of the component implementation
}