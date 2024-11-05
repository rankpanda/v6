import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Upload } from 'lucide-react';
import { KeywordTable } from './keyword/KeywordTable';
import { FunnelAnalysis } from './FunnelAnalysis';
import { KeywordStats } from './KeywordStats';
import { toast } from './ui/Toast';
import { webhookService } from '../services/webhookService';
import { projectService } from '../services/projectService';
import { parseCSV } from '../utils/csvParser';

interface WebhookResponse {
  status: number;
  body: {
    ID: string;
    "Auto Suggest": string;
  };
}

interface Keyword {
  id: string;
  keyword: string;
  volume: number;
  difficulty: number;
  autoSuggestions?: string[];
  potentialTraffic?: number;
  potentialConversions?: number;
  potentialRevenue?: number;
  isAnalyzing?: boolean;
}

const WEBHOOK_URL = 'https://hook.integrator.boost.space/0w7dejdvm21p78a4lf4wdjkfi8dlvk25';

export function TierKeywords() {
  // ... existing state declarations ...

  const analyzeKeywords = async () => {
    if (selectedKeywords.size === 0) {
      toast.error('Please select keywords to analyze');
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalyzedCount(0);

      // Mark selected keywords as analyzing
      const updatedKeywords = keywords.map(kw => ({
        ...kw,
        isAnalyzing: selectedKeywords.has(kw.keyword)
      }));
      setKeywords(updatedKeywords);

      // Prepare webhook payload
      const selectedKws = keywords
        .filter(kw => selectedKeywords.has(kw.keyword))
        .map(kw => ({
          id: kw.id,
          keyword: kw.keyword,
          volume: kw.volume,
          difficulty: kw.difficulty,
          potentialTraffic: Math.round(kw.volume * 0.32),
          potentialConversions: Math.round(kw.volume * 0.32 * (contextData.conversionRate / 100)),
          potentialRevenue: Math.round(kw.volume * 0.32 * (contextData.conversionRate / 100) * contextData.averageOrderValue)
        }));

      const payload = {
        contextData,
        keywords: selectedKws
      };

      // Send webhook request
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to analyze keywords');
      }

      const data: WebhookResponse = await response.json();

      // Update keywords with webhook response
      const finalKeywords = keywords.map(kw => {
        if (!selectedKeywords.has(kw.keyword)) return kw;

        if (kw.id === data.body.ID) {
          return {
            ...kw,
            autoSuggestions: data.body["Auto Suggest"].split('\n').map(s => s.trim()).filter(Boolean),
            isAnalyzing: false
          };
        }

        return kw;
      });

      // Save to project
      const projectId = localStorage.getItem('currentProjectId');
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const projectIndex = projects.findIndex((p: any) => p.id === projectId);
      
      if (projectIndex !== -1) {
        const tierKey = `tier${tierId}Keywords`;
        projects[projectIndex].data[tierKey] = finalKeywords;
        localStorage.setItem('projects', JSON.stringify(projects));
      }

      setKeywords(finalKeywords);
      updateStats(finalKeywords);
      setAnalyzedCount(analyzedCount + 1);

      toast.success('Keywords analyzed successfully');
    } catch (error) {
      console.error('Error analyzing keywords:', error);
      toast.error('Failed to analyze keywords');
      
      // Reset analyzing state on error
      const resetKeywords = keywords.map(kw => ({
        ...kw,
        isAnalyzing: false
      }));
      setKeywords(resetKeywords);
    } finally {
      setIsAnalyzing(false);
      setAnalyzedCount(0);
    }
  };

  // ... rest of the component implementation ...
}