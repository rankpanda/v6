import React, { useState } from 'react';
import { Trash2, RefreshCw, Loader2, Rocket, X } from 'lucide-react';
import { ImportedData } from './types';
import { HistoryEntry } from '../../services/historyService';
import { toast } from '../ui/Toast';
import { webhookService } from '../../services/webhookService';

interface ImportHistoryProps {
  imports: HistoryEntry[];
  onClearHistory: () => void;
  onCreateProject: (data: ImportedData) => void;
  onDeleteEntry: (id: string) => void;
}

interface ProjectTier {
  id: number;
  name: string;
  clusters: number;
  description: string;
}

const TIERS: ProjectTier[] = [
  {
    id: 1,
    name: 'Tier 1',
    clusters: 1,
    description: 'Desbloqueia 1 cluster'
  },
  {
    id: 3,
    name: 'Tier 3',
    clusters: 3,
    description: 'Desbloqueia 3 clusters'
  },
  {
    id: 5,
    name: 'Tier 5',
    clusters: 5,
    description: 'Desbloqueia 5 clusters'
  }
];

interface ProjectModalProps {
  importData: ImportedData;
  onClose: () => void;
  onConfirm: (projectName: string, tier: number) => void;
  isProcessing: boolean;
}

function ProjectModal({ importData, onClose, onConfirm, isProcessing }: ProjectModalProps) {
  const [projectName, setProjectName] = useState('');
  const [selectedTier, setSelectedTier] = useState<number>(1);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="p-6">
          <h3 className="text-xl font-semibold text-[#11190c] mb-4">Criar Novo Projeto</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#444638] mb-1">
                Nome do Projeto
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Digite o nome do projeto"
                className="w-full px-3 py-2 border rounded-md focus:ring-[#11190c] focus:border-[#11190c]"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#444638] mb-2">
                Selecione o Tier
              </label>
              <div className="grid grid-cols-3 gap-3">
                {TIERS.map(tier => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`
                      p-3 border rounded-lg text-center transition-colors
                      ${selectedTier === tier.id 
                        ? 'border-[#11190c] bg-[#11190c] text-white' 
                        : 'border-gray-200 hover:border-[#11190c]'
                      }
                    `}
                  >
                    <div className="font-medium">{tier.name}</div>
                    <div className="text-xs mt-1 opacity-80">{tier.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#F3F1EE] rounded-lg p-4">
              <h4 className="text-sm font-medium text-[#444638] mb-2">Detalhes da Importação</h4>
              <div className="space-y-2 text-sm text-[#787664]">
                <p>Total de Keywords: {importData.keywords.length}</p>
                <p>Volume Total: {importData.keywords.reduce((sum, kw) => sum + kw.volume, 0).toLocaleString()}</p>
                <p>KD Médio: {Math.round(importData.keywords.reduce((sum, kw) => sum + kw.difficulty, 0) / importData.keywords.length)}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#444638] hover:text-[#11190c] transition-colors"
              disabled={isProcessing}
            >
              Cancelar
            </button>
            <button
              onClick={() => projectName.trim() && onConfirm(projectName, selectedTier)}
              disabled={!projectName.trim() || isProcessing}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#11190c] rounded-md hover:bg-[#0a0f07] transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  A processar...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  Criar Projeto
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ImportHistory({ imports, onClearHistory, onCreateProject, onDeleteEntry }: ImportHistoryProps) {
  const [selectedImport, setSelectedImport] = useState<ImportedData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCreateProject = async (projectName: string, tier: number) => {
    if (!selectedImport) return;

    try {
      setIsProcessing(true);
      
      // Send data to webhook
      await webhookService.sendKeywordData(selectedImport.keywords);
      
      // Create project with tier information
      const projectId = crypto.randomUUID();
      const newProject = {
        id: projectId,
        name: projectName,
        tier,
        maxClusters: TIERS.find(t => t.id === tier)?.clusters || 1,
        createdAt: new Date().toISOString(),
        data: {
          keywords: selectedImport.keywords,
          mainKeywords: selectedImport.keywords
        }
      };

      // Initialize tier data
      for (let i = 1; i <= tier; i++) {
        newProject.data[`tier${i}Keywords`] = [];
      }

      // Get existing projects or initialize empty array
      const existingProjects = JSON.parse(localStorage.getItem('projects') || '[]');
      existingProjects.push(newProject);
      
      // Save updated projects list and set current project
      localStorage.setItem('projects', JSON.stringify(existingProjects));
      localStorage.setItem('currentProjectId', projectId);

      toast.success('Projeto criado com sucesso');
      
      // Call the onCreateProject callback
      onCreateProject(selectedImport);
      
      // Close modal and reset state
      setSelectedImport(null);
      
      // Refresh the page to update the header
      window.location.reload();
      
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Falha ao criar projeto. Por favor tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (imports.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-[#11190c]">Histórico de Importações</h3>
        <button
          onClick={onClearHistory}
          className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Limpar Histórico
        </button>
      </div>

      <div className="space-y-4">
        {imports.map((import_) => (
          <div key={import_.id} className="border rounded-lg p-4 hover:border-[#11190c] transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-[#11190c]">{import_.filename}</p>
                  <span className="text-sm text-[#444638]">•</span>
                  <p className="text-sm text-[#444638]">
                    {new Date(import_.timestamp).toLocaleString('pt-PT')}
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-gradient-to-br from-[#F3F1EE] to-[#E5E2DC] rounded-lg p-3">
                    <p className="text-sm font-medium text-[#444638]">Keywords</p>
                    <p className="text-lg font-bold text-[#11190c]">
                      {import_.keywords.length.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-[#F3F1EE] to-[#E5E2DC] rounded-lg p-3">
                    <p className="text-sm font-medium text-[#444638]">Volume Total</p>
                    <p className="text-lg font-bold text-[#11190c]">
                      {import_.keywords.reduce((sum, kw) => sum + kw.volume, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-[#F3F1EE] to-[#E5E2DC] rounded-lg p-3">
                    <p className="text-sm font-medium text-[#444638]">KD Médio</p>
                    <p className="text-lg font-bold text-[#11190c]">
                      {Math.round(import_.keywords.reduce((sum, kw) => sum + kw.difficulty, 0) / import_.keywords.length)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => onDeleteEntry(import_.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedImport(import_)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#11190c] rounded-md hover:bg-[#0a0f07] transition-colors"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Criar Projeto
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedImport && (
        <ProjectModal
          importData={selectedImport}
          onClose={() => setSelectedImport(null)}
          onConfirm={handleCreateProject}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}