import React, { useState } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { ImportDropzone } from './semrush/ImportDropzone';
import { ImportHistory } from './semrush/ImportHistory';
import { ImportedData, KeywordData } from './semrush/types';
import { parseCSV, findColumnIndex } from './semrush/utils';
import { webhookService } from '../services/webhookService';
import { historyService } from '../services/historyService';
import { toast } from './ui/Toast';

export function SemrushData() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importHistory, setImportHistory] = useState<ImportedData[]>(historyService.getHistory());

  const processCSVData = async (text: string, filename: string) => {
    try {
      setIsProcessing(true);
      const rows = parseCSV(text);
      if (rows.length < 2) {
        toast.error('Invalid CSV file: File must contain headers and data');
        return;
      }

      const headers = rows[0];
      const keywordIdx = findColumnIndex(headers, ['keyword']);
      const volumeIdx = findColumnIndex(headers, ['volume', 'search volume']);
      const difficultyIdx = findColumnIndex(headers, ['difficulty', 'keyword difficulty', 'kd']);
      const intentIdx = findColumnIndex(headers, ['intent', 'search intent']);
      const cpcIdx = findColumnIndex(headers, ['cpc', 'cost per click']);
      const trendIdx = findColumnIndex(headers, ['trend', 'trending']);

      if (keywordIdx === -1 || volumeIdx === -1 || difficultyIdx === -1) {
        toast.error('Required columns not found. Please check your CSV file format.');
        return;
      }

      const keywords: KeywordData[] = rows.slice(1)
        .filter(row => row[keywordIdx]?.trim())
        .map(row => ({
          keyword: row[keywordIdx].trim(),
          volume: parseInt(row[volumeIdx]) || 0,
          difficulty: parseInt(row[difficultyIdx]) || 0,
          ...(intentIdx !== -1 && { intent: row[intentIdx] }),
          ...(cpcIdx !== -1 && { cpc: parseFloat(row[cpcIdx]) || 0 }),
          ...(trendIdx !== -1 && { trend: row[trendIdx] })
        }));

      if (keywords.length === 0) {
        toast.error('No valid keywords found in the CSV file');
        return;
      }

      // Save to history without sending to webhook
      const importData: ImportedData = {
        keywords,
        timestamp: new Date().toISOString(),
        filename
      };

      const historyEntry = historyService.saveToHistory(importData);
      setImportHistory(historyService.getHistory());
      toast.success('Import successful');

    } catch (error) {
      console.error('Error processing data:', error);
      toast.error('Failed to process CSV file');
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
      toast.error('Please upload a CSV file');
      return;
    }

    try {
      const text = await file.text();
      await processCSVData(text, file.name);
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Failed to read file');
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    try {
      const text = await file.text();
      await processCSVData(text, file.name);
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Failed to read file');
    }
  };

  const clearHistory = () => {
    try {
      historyService.clearHistory();
      setImportHistory([]);
      toast.success('History cleared');
    } catch (error) {
      toast.error('Failed to clear history');
    }
  };

  const createNewProject = async (data: ImportedData) => {
    try {
      // Send data to webhook when creating a project
      await webhookService.sendKeywordData(data.keywords);
      localStorage.setItem('semrush_project', JSON.stringify(data));
      toast.success('Project created successfully');
      window.location.href = '/keywords';
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
          <FileSpreadsheet className="mr-2 h-6 w-6 text-indigo-600" />
          SEMrush Data Import
        </h2>
        
        <ImportDropzone
          isDragging={isDragging}
          isProcessing={isProcessing}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onFileSelect={handleFileInput}
        />
      </div>

      <ImportHistory
        imports={importHistory}
        onClearHistory={clearHistory}
        onCreateProject={createNewProject}
        onDeleteEntry={(id) => {
          historyService.deleteEntry(id);
          setImportHistory(historyService.getHistory());
        }}
      />
    </div>
  );
}