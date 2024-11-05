import React, { useState, useEffect } from 'react';
import { groqService } from '../services/groqService';
import { toast } from './ui/Toast';
import { Loader2, RefreshCw } from 'lucide-react';
import type { Cluster } from '../services/groqService';

export function KeywordClusters() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentCluster, setCurrentCluster] = useState<Cluster | null>(null);

  useEffect(() => {
    loadClusters();
  }, []);

  const loadClusters = async () => {
    try {
      setIsLoading(true);
      const projectId = localStorage.getItem('currentProjectId');
      if (!projectId) {
        toast.error('Nenhum projeto selecionado');
        return;
      }

      const savedClusters = await groqService.loadClusters(projectId);
      setClusters(savedClusters);
    } catch (error) {
      console.error('Error loading clusters:', error);
      toast.error('Erro ao carregar clusters');
    } finally {
      setIsLoading(false);
    }
  };

  const generateClusters = async () => {
    try {
      setIsProcessing(true);
      setProgress(0);
      setClusters([]);
      
      const projectId = localStorage.getItem('currentProjectId');
      if (!projectId) {
        toast.error('Nenhum projeto selecionado');
        return;
      }

      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const project = projects.find((p: any) => p.id === projectId);
      
      if (!project?.data?.keywords) {
        toast.error('Nenhuma keyword encontrada no projeto');
        return;
      }

      const confirmedKeywords = project.data.keywords.filter((kw: any) => kw.confirmed);
      
      if (confirmedKeywords.length === 0) {
        toast.error('Por favor, confirme algumas keywords primeiro');
        return;
      }

      toast.info('A gerar clusters...');

      groqService.onProgress = ({ progress, cluster }) => {
        setProgress(progress);
        if (cluster) {
          setCurrentCluster(cluster);
          setClusters(prev => [...prev, cluster]);
        }
      };

      const newClusters = await groqService.createClusters(confirmedKeywords);
      await groqService.saveClusters(projectId, newClusters);
      setClusters(newClusters);
      toast.success('Clusters gerados com sucesso');
    } catch (error) {
      console.error('Error creating clusters:', error);
      toast.error('Erro ao gerar clusters');
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setCurrentCluster(null);
    }
  };

  const getFunnelColor = (funnel: string) => {
    switch (funnel) {
      case 'TOFU': return 'bg-blue-50';
      case 'MOFU': return 'bg-green-50';
      case 'BOFU': return 'bg-purple-50';
      default: return 'bg-gray-50';
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-[#11190c]">Clusters de Keywords</h2>
        <button
          onClick={generateClusters}
          disabled={isProcessing}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#11190c] rounded-md hover:bg-[#0a0f07] transition-colors disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              A gerar clusters...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Gerar Clusters
            </>
          )}
        </button>
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-[#444638]">
              Progresso da Análise
            </span>
            <span className="text-sm font-medium text-[#11190c]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-[#e6ff00] h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {currentCluster && (
            <div className="mt-2 text-sm text-gray-600">
              Último cluster gerado: {currentCluster.name}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clusters.map((cluster) => {
          const bgColor = getFunnelColor(cluster.funnel);
          
          return (
            <div key={cluster.id} className={`${bgColor} rounded-lg p-6 shadow-sm`}>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#11190c]">{cluster.name}</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs font-medium bg-white rounded-full">
                      {cluster.funnel}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-white rounded-full">
                      {cluster.pageType}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-white rounded-full">
                      {cluster.intent}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Volume Total</p>
                    <p className="text-lg font-semibold">{cluster.totalVolume.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">KD Médio</p>
                    <p className="text-lg font-semibold">{cluster.avgDifficulty}%</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Keywords ({cluster.keywords.length})</p>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {cluster.keywords.map((keyword, kwIndex) => (
                      <div key={kwIndex} className="text-sm bg-white rounded p-2 flex justify-between">
                        <span>{keyword.keyword}</span>
                        <span className="text-gray-500">{keyword.volume.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {clusters.length === 0 && !isProcessing && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Nenhum cluster gerado. Clique no botão acima para gerar clusters.</p>
        </div>
      )}
    </div>
  );
}