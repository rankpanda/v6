import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { KeywordTable } from './KeywordTable';
import { KeywordStats } from './KeywordStats';
import { FunnelAnalysis } from './FunnelAnalysis';
import { FileText, ShoppingBag, Users, Target, TrendingUp, Upload, Loader2 } from 'lucide-react';
import { toast } from '../ui/Toast';

const TOPICS = [
  { name: 'Content Strategy', icon: FileText },
  { name: 'Product Keywords', icon: ShoppingBag },
  { name: 'Audience Research', icon: Users },
  { name: 'Competitor Analysis', icon: Target },
  { name: 'Growth Opportunities', icon: TrendingUp }
];

export function TopicKeywords() {
  const { topicId } = useParams();
  const [keywords, setKeywords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKeywords, setSelectedKeywords] = useState(new Set());
  const [contextData, setContextData] = useState({
    conversionRate: 2,
    averageOrderValue: 125
  });

  useEffect(() => {
    loadTopicData();
  }, [topicId]);

  const loadTopicData = async () => {
    try {
      setIsLoading(true);
      const projectId = localStorage.getItem('currentProjectId');
      if (!projectId) {
        toast.error('No project selected');
        return;
      }

      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const project = projects.find(p => p.id === projectId);
      
      if (!project) {
        toast.error('Project not found');
        return;
      }

      // Load topic-specific keywords
      const topicKey = `topic${topicId}Keywords`;
      const topicKeywords = project[topicKey] || [];
      setKeywords(topicKeywords);

      // Load context data
      const savedContext = localStorage.getItem('contextFormData');
      if (savedContext) {
        setContextData(JSON.parse(savedContext));
      }
    } catch (error) {
      console.error('Error loading topic data:', error);
      toast.error('Error loading topic data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = text.split('\n').map(row => row.split(','));
      const headers = rows[0].map(h => h.toLowerCase().trim());

      const keywordIdx = headers.indexOf('keyword');
      const volumeIdx = headers.indexOf('volume');
      const difficultyIdx = headers.indexOf('difficulty');

      if (keywordIdx === -1 || volumeIdx === -1 || difficultyIdx === -1) {
        throw new Error('Required columns not found');
      }

      const newKeywords = rows.slice(1)
        .filter(row => row[keywordIdx]?.trim())
        .map(row => ({
          keyword: row[keywordIdx].trim(),
          volume: parseInt(row[volumeIdx]) || 0,
          difficulty: parseInt(row[difficultyIdx]) || 0
        }));

      // Save to project
      const projectId = localStorage.getItem('currentProjectId');
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const projectIndex = projects.findIndex(p => p.id === projectId);

      if (projectIndex !== -1) {
        const topicKey = `topic${topicId}Keywords`;
        projects[projectIndex][topicKey] = newKeywords;
        localStorage.setItem('projects', JSON.stringify(projects));
        setKeywords(newKeywords);
        toast.success('Keywords imported successfully');
      }
    } catch (error) {
      console.error('Error importing keywords:', error);
      toast.error('Error importing keywords');
    }
  };

  const getTopicName = () => {
    const index = parseInt(topicId || '1') - 1;
    return TOPICS[index]?.name || 'Topic';
  };

  const getTopicIcon = () => {
    const index = parseInt(topicId || '1') - 1;
    return TOPICS[index]?.icon || FileText;
  };

  const TopicIcon = getTopicIcon();

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
        <div className="flex items-center">
          <TopicIcon className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-2xl font-semibold text-gray-900">{getTopicName()}</h1>
        </div>
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

      {keywords.length > 0 ? (
        <>
          <KeywordStats
            stats={{
              totalVolume: keywords.reduce((sum, kw) => sum + kw.volume, 0),
              avgDifficulty: Math.round(keywords.reduce((sum, kw) => sum + kw.difficulty, 0) / keywords.length),
              totalTraffic: Math.round(keywords.reduce((sum, kw) => sum + kw.volume, 0) * 0.32),
              totalRevenue: Math.round(keywords.reduce((sum, kw) => sum + kw.volume, 0) * 0.32 * (contextData.conversionRate / 100) * contextData.averageOrderValue)
            }}
          />

          <FunnelAnalysis keywords={keywords} contextData={contextData} />

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
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No keywords imported yet. Upload a CSV file to get started.</p>
        </div>
      )}
    </div>
  );
}