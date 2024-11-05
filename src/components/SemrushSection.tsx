import React, { useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { ImportDropzone } from './semrush/ImportDropzone';
import { ImportHistory } from './semrush/ImportHistory';
import { ImportedData } from './semrush/types';
import { parseCSV, validateAndParseKeywords } from './semrush/utils';
import { historyService } from '../services/historyService';
import { toast } from './ui/Toast';

export function SemrushSection() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importHistory, setImportHistory] = useState(historyService.getHistory());

  const processFile = async (file: File) => {
    try {
      setIsProcessing(true);
      console.log('Processing file:', file.name);

      const text = await file.text();
      console.log('File content length:', text.length);

      // Parse CSV content
      const rows = parseCSV(text);
      console.log('Parsed rows:', rows.length);

      // Validate and parse keywords
      const keywords = validateAndParseKeywords(rows);
      console.log('Parsed keywords:', keywords.length);

      if (keywords.length === 0) {
        throw new Error('No valid keywords found in CSV file');
      }

      // Save to history
      const importData: ImportedData = {
        keywords,
        timestamp: new Date().toISOString(),
        filename: file.name
      };

      const historyEntry = historyService.saveToHistory(importData);
      setImportHistory(historyService.getHistory());
      toast.success(`${keywords.length} keywords importadas com sucesso`);

    } catch (error) {
      console.error('Error processing file:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao processar o ficheiro CSV');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file?.name.toLowerCase().endsWith('.csv')) {
      toast.error('Por favor faça upload de um ficheiro CSV');
      return;
    }

    await processFile(file);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.name.toLowerCase().endsWith('.csv')) {
      toast.error('Por favor faça upload de um ficheiro CSV');
      return;
    }

    await processFile(file);
  };

  const clearHistory = () => {
    try {
      historyService.clearHistory();
      setImportHistory([]);
      toast.success('Histórico limpo');
    } catch (error) {
      toast.error('Erro ao limpar histórico');
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-[#11190c] mb-6 flex items-center">
        <FileSpreadsheet className="mr-2 h-6 w-6 text-[#11190c]" />
        Dados SEMrush
      </h2>
      
      <ImportDropzone
        isDragging={isDragging}
        isProcessing={isProcessing}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFileSelect={handleFileInput}
      />

      {importHistory.length > 0 && (
        <ImportHistory
          imports={importHistory}
          onClearHistory={clearHistory}
          onCreateProject={(data) => {
            const projectId = localStorage.getItem('currentProjectId');
            if (projectId) {
              const projects = JSON.parse(localStorage.getItem('projects') || '[]');
              const project = projects.find((p: any) => p.id === projectId);
              if (project) {
                project.semrushData = data;
                localStorage.setItem('projects', JSON.stringify(projects));
                window.location.reload();
              }
            }
          }}
          onDeleteEntry={(id) => {
            historyService.deleteEntry(id);
            setImportHistory(historyService.getHistory());
          }}
        />
      )}
    </div>
  );
}