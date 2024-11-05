import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Save, RefreshCw, Upload } from 'lucide-react';
import { KeywordTable } from './KeywordTable';
import { FunnelAnalysis } from './FunnelAnalysis';
import { KeywordStats } from './KeywordStats';
import { toast } from '../ui/Toast';
import { webhookService, WebhookError } from '../../services/webhookService';
import { parseCSV } from '../../utils/csvParser';

interface Keyword {
  id: string;
  keyword: string;
  volume: number;
  difficulty: number;
  kgr?: number;
  autoSuggestions?: string[];
  contentType?: string;
  searchIntent?: string;
  funnelStage?: string;
  priority?: number;
  potentialTraffic?: number;
  potentialConversions?: number;
  potentialRevenue?: number;
  isAnalyzing?: boolean;
  error?: string;
}

export function TierKeywords() {
  const { tierId } = useParams<{ tierId: string }>();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [stats, setStats] = useState({
    totalVolume: 0,
    avgDifficulty: 0,
    totalTraffic: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedCount, setAnalyzedCount] = useState(0);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [contextData, setContextData] = useState({
    conversionRate: 2,
    averageOrderValue: 125,
    language: 'pt-PT',
    category: '',
    brandName: '',
    businessContext: ''
  });

  useEffect(() => {
    loadInitialData();
  }, [tierId]);

  const loadInitialData = async () => {
    try {
      const projectId = localStorage.getItem('currentProjectId');
      if (!projectId) {
        toast.error('No project selected');
        return;
      }

      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const project = projects.find((p: any) => p.id === projectId);
      
      if (!project) {
        toast.error('Project not found');
        return;
      }

      if (project.context) {
        setContextData(project.context);
      }

      const tierKey = `tier${tierId}Keywords`;
      if (project.data?.[tierKey]) {
        const keywordsWithIds = project.data[tierKey].map((kw: Keyword) => ({
          ...kw,
          id: kw.id || crypto.randomUUID()
        }));
        setKeywords(keywordsWithIds);
        updateStats(keywordsWithIds);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error loading data');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = (keywordList: Keyword[]) => {
    const totalVolume = keywordList.reduce((sum, kw) => sum + kw.volume, 0);
    const avgDifficulty = Math.round(keywordList.reduce((sum, kw) => sum + kw.difficulty, 0) / keywordList.length) || 0;
    const totalTraffic = keywordList.reduce((sum, kw) => sum + (kw.potentialTraffic || 0), 0);
    const totalRevenue = keywordList.reduce((sum, kw) => sum + (kw.potentialRevenue || 0), 0);

    setStats({ totalVolume, avgDifficulty, totalTraffic, totalRevenue });
  };

  const analyzeKeywords = async () => {
    if (selectedKeywords.size === 0) {
      toast.error('Please select keywords to analyze');
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalyzedCount(0);

      // Mark selected keywords as analyzing and clear any previous errors
      const updatedKeywords = keywords.map(kw => ({
        ...kw,
        isAnalyzing: selectedKeywords.has(kw.keyword),
        error: selectedKeywords.has(kw.keyword) ? undefined : kw.error
      }));
      setKeywords(updatedKeywords);

      const selectedKws = updatedKeywords
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

      const response = await webhookService.sendKeywordData({
        contextData,
        keywords: selectedKws
      });

      // Update the keyword with the webhook response
      const finalKeywords = keywords.map(kw => {
        if (kw.id === response.body.ID) {
          return {
            ...kw,
            autoSuggestions: response.body["Auto Suggest"].split('\n').map(s => s.trim()).filter(Boolean),
            isAnalyzing: false,
            error: undefined
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
      setAnalyzedCount(prev => prev + 1);

      toast.success('Keywords analyzed successfully');
    } catch (error) {
      console.error('Error analyzing keywords:', error);
      
      // Update keywords with error state
      const errorKeywords = keywords.map(kw => {
        if (selectedKeywords.has(kw.keyword)) {
          return {
            ...kw,
            isAnalyzing: false,
            error: error instanceof WebhookError 
              ? `Analysis failed: ${error.message}`
              : 'Failed to analyze keyword'
          };
        }
        return kw;
      });
      
      setKeywords(errorKeywords);
      
      if (error instanceof WebhookError) {
        toast.error(`Analysis failed: ${error.message}`);
      } else {
        toast.error('Failed to analyze keywords');
      }
    } finally {
      setIsAnalyzing(false);
      setAnalyzedCount(0);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const text = await file.text();
      const rows = parseCSV(text);

      const headers = rows[0].map(h => h.toLowerCase().trim());
      const keywordIdx = headers.findIndex(h => h.includes('keyword') || h.includes('term'));
      const volumeIdx = headers.findIndex(h => h.includes('volume') || h.includes('search volume'));
      const difficultyIdx = headers.findIndex(h => h.includes('difficulty') || h.includes('kd'));

      if (keywordIdx === -1 || volumeIdx === -1 || difficultyIdx === -1) {
        toast.error('Required columns not found. Please check your CSV format.');
        return;
      }

      const processedKeywords = rows.slice(1)
        .filter(row => row[keywordIdx]?.trim())
        .map(row => {
          const keyword = row[keywordIdx].trim();
          const volume = parseInt(row[volumeIdx].replace(/[^\d]/g, '')) || 0;
          const difficulty = parseInt(row[difficultyIdx].replace(/[^\d]/g, '')) || 0;

          const potentialTraffic = Math.round(volume * 0.32);
          const potentialConversions = Math.round(potentialTraffic * (contextData.conversionRate / 100));
          const potentialRevenue = Math.round(potentialConversions * contextData.averageOrderValue);

          return {
            id: crypto.randomUUID(),
            keyword,
            volume,
            difficulty,
            potentialTraffic,
            potentialConversions,
            potentialRevenue
          };
        });

      // Save to project
      const projectId = localStorage.getItem('currentProjectId');
      if (!projectId) {
        toast.error('No project selected');
        return;
      }

      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const projectIndex = projects.findIndex(p => p.id === projectId);

      if (projectIndex === -1) {
        toast.error('Project not found');
        return;
      }

      const tierKey = `tier${tierId}Keywords`;
      projects[projectIndex].data[tierKey] = processedKeywords;
      localStorage.setItem('projects', JSON.stringify(projects));
      
      setKeywords(processedKeywords);
      updateStats(processedKeywords);
      toast.success(`${processedKeywords.length} keywords imported successfully`);
    } catch (error) {
      console.error('Error importing keywords:', error);
      toast.error('Error importing keywords. Please check your file format.');
    } finally {
      setIsLoading(false);
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Tier {tierId} Keywords</h1>
        <label className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 cursor-pointer transition-colors">
          <Upload className="h-4 w-4 mr-2" />
          Import Keywords
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      <KeywordStats stats={stats} />

      <FunnelAnalysis keywords={keywords} contextData={contextData} />

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="sticky top-0 p-4 bg-white border-b border-gray-200 z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Keywords</h2>
            <div className="flex space-x-2">
              <button
                onClick={analyzeKeywords}
                disabled={selectedKeywords.size === 0 || isAnalyzing}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#11190c] rounded-md hover:bg-[#0a0f07] transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing ({analyzedCount}/{selectedKeywords.size})
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Analyze ({selectedKeywords.size})
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  const projectId = localStorage.getItem('currentProjectId');
                  if (projectId) {
                    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
                    const projectIndex = projects.findIndex(p => p.id === projectId);
                    if (projectIndex !== -1) {
                      const tierKey = `tier${tierId}Keywords`;
                      projects[projectIndex].data[tierKey] = keywords;
                      localStorage.setItem('projects', JSON.stringify(projects));
                      toast.success('Changes saved successfully');
                    }
                  }
                }}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#11190c] rounded-md hover:bg-[#0a0f07] transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
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