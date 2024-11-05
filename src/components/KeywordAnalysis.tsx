import React, { useState, useEffect } from 'react';
import { Loader2, Save, RefreshCw } from 'lucide-react';
import { KeywordTable } from './keyword/KeywordTable';
import { SerpUsageIndicator } from './keyword/SerpUsageIndicator';
import { FunnelAnalysis } from './keyword/FunnelAnalysis';
import { KeywordStats } from './keyword/KeywordStats';
import { KeywordAnalysisProgress } from './keyword/KeywordAnalysisProgress';
import { calculateTotalMetrics } from '../utils/keywordMetrics';
import { groqService } from '../services/groqService';
import { serpService } from '../services/serpService';
import { toast } from './ui/Toast';

interface Keyword {
  keyword: string;
  volume: number;
  difficulty: number;
  intent?: string;
  kgrRating?: 'great' | 'might work' | 'bad' | 'not applicable';
  analysis?: {
    keyword_analysis?: {
      content_classification?: {
        type?: string;
      };
      search_intent?: {
        type?: string;
      };
      marketing_funnel_position?: {
        stage?: string;
      };
      overall_priority?: {
        score?: number;
      };
    };
  };
}

export function KeywordAnalysis() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [stats, setStats] = useState({
    totalVolume: 0,
    avgDifficulty: 0,
    totalTraffic: 0,
    totalRevenue: 0
  });
  const [serpUsage, setSerpUsage] = useState({
    used: 0,
    total: 14999,
    remaining: 14999
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [contextData, setContextData] = useState({
    conversionRate: 2,
    averageOrderValue: 125,
    businessContext: '',
    brandName: '',
    category: '',
    currentSessions: 0,
    requiredVolume: 0,
    salesGoal: 0,
    language: 'pt'
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadKeywords(),
        loadContext(),
        loadSerpUsage()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Error loading data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSerpUsage = async () => {
    try {
      const usage = await serpService.getUsage();
      setSerpUsage(usage);
    } catch (error) {
      console.error('Error loading SERP usage:', error);
    }
  };

  const loadContext = () => {
    try {
      const savedContext = localStorage.getItem('contextFormData');
      if (savedContext) {
        setContextData(JSON.parse(savedContext));
      }
    } catch (error) {
      console.error('Error loading context:', error);
    }
  };

  const loadKeywords = async () => {
    try {
      const projectId = localStorage.getItem('currentProjectId');
      if (!projectId) {
        toast.error('No project selected');
        return;
      }

      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const project = projects.find((p: any) => p.id === projectId);
      
      if (!project?.data?.keywords) {
        toast.error('No keywords found in project');
        return;
      }

      setKeywords(project.data.keywords);
      updateStats(project.data.keywords);

      const confirmedKeywords = new Set(
        project.data.keywords
          .filter((k: Keyword) => k.confirmed)
          .map((k: Keyword) => k.keyword)
      );
      setSelectedKeywords(confirmedKeywords);
    } catch (error) {
      console.error('Error loading keywords:', error);
      toast.error('Error loading keywords');
    }
  };

  const updateStats = (keywordList: Keyword[]) => {
    const totalMetrics = calculateTotalMetrics(keywordList, contextData);
    
    setStats({
      totalVolume: keywordList.reduce((sum, kw) => sum + kw.volume, 0),
      avgDifficulty: Math.round(keywordList.reduce((sum, kw) => sum + kw.difficulty, 0) / keywordList.length),
      totalTraffic: totalMetrics.potentialTraffic,
      totalRevenue: totalMetrics.potentialRevenue
    });
  };

  const analyzeSelectedKeywords = async () => {
    if (!selectedKeywords.size) {
      toast.error('No keywords selected');
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalysisProgress(0);

      const selectedKws = keywords.filter(kw => selectedKeywords.has(kw.keyword));
      
      // First analyze with SERP API
      const serpResults = await serpService.batchAnalyzeKeywords(
        selectedKws.map(kw => ({
          keyword: kw.keyword,
          volume: kw.volume
        })),
        progress => setAnalysisProgress(progress / 2)
      );

      // Then analyze with Groq
      const groqResults = await groqService.analyzeKeywords(
        selectedKws.map(kw => ({
          keyword: kw.keyword,
          volume: kw.volume
        })),
        contextData,
        progress => setAnalysisProgress(50 + progress / 2)
      );

      // Update keywords with both results
      const updatedKeywords = keywords.map(kw => {
        if (!selectedKeywords.has(kw.keyword)) return kw;

        const serpResult = serpResults[kw.keyword];
        const groqResult = groqResults[kw.keyword];

        return {
          ...kw,
          ...(serpResult && {
            kgr: serpResult.kgr,
            kgrRating: serpResult.kgrRating,
            peopleAlsoAsk: serpResult.peopleAlsoAsk,
            autoSuggestions: serpResult.autoSuggestions,
            error: serpResult.error
          }),
          ...(groqResult && {
            analysis: groqResult,
            intent: groqResult.keyword_analysis?.search_intent?.type
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

  const saveSelectedKeywords = async () => {
    try {
      const projectId = localStorage.getItem('currentProjectId');
      if (!projectId) {
        toast.error('No project selected');
        return;
      }

      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const projectIndex = projects.findIndex((p: any) => p.id === projectId);
      
      if (projectIndex === -1) {
        toast.error('Project not found');
        return;
      }

      const updatedKeywords = keywords.map(kw => ({
        ...kw,
        confirmed: selectedKeywords.has(kw.keyword)
      }));

      projects[projectIndex].data = {
        ...projects[projectIndex].data,
        keywords: updatedKeywords
      };

      localStorage.setItem('projects', JSON.stringify(projects));
      setKeywords(updatedKeywords);
      
      toast.success(`${selectedKeywords.size} keywords saved`);
    } catch (error) {
      console.error('Error saving keywords:', error);
      toast.error('Error saving keywords');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SerpUsageIndicator
        used={serpUsage.used}
        total={serpUsage.total}
        remaining={serpUsage.remaining}
      />

      <KeywordStats stats={stats} />

      <FunnelAnalysis keywords={keywords} contextData={contextData} />

      {isAnalyzing && (
        <KeywordAnalysisProgress
          progress={analysisProgress}
          analyzedCount={Math.floor((analysisProgress / 100) * selectedKeywords.size)}
          totalCount={selectedKeywords.size}
        />
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Keywords</h2>
            <div className="flex space-x-2">
              <button
                onClick={analyzeSelectedKeywords}
                disabled={selectedKeywords.size === 0 || isAnalyzing}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#11190c] rounded-md hover:bg-[#0a0f07] transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Analyze ({selectedKeywords.size})
                  </>
                )}
              </button>
              <button
                onClick={saveSelectedKeywords}
                disabled={selectedKeywords.size === 0}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#11190c] rounded-md hover:bg-[#0a0f07] transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                Save ({selectedKeywords.size})
              </button>
            </div>
          </div>
        </div>

        <KeywordTable
          keywords={keywords}
          selectedKeywords={selectedKeywords}
          onToggleKeyword={(keyword) => {
            const newSelection = new Set(selectedKeywords);
            if (newSelection.has(keyword)) {
              newSelection.delete(keyword);
            } else {
              newSelection.add(keyword);
            }
            setSelectedKeywords(newSelection);
          }}
          onToggleAll={(selected) => {
            if (selected) {
              setSelectedKeywords(new Set(keywords.map(kw => kw.keyword)));
            } else {
              setSelectedKeywords(new Set());
            }
          }}
          contextData={contextData}
        />
      </div>
    </div>
  );
}