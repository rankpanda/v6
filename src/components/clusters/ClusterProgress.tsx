import React from 'react';
import { Loader2 } from 'lucide-react';

interface ClusterProgressProps {
  isProcessing: boolean;
  progress: number;
  processedKeywords: number;
  totalKeywords: number;
}

export function ClusterProgress({ 
  isProcessing, 
  progress, 
  processedKeywords, 
  totalKeywords 
}: ClusterProgressProps) {
  if (!isProcessing) return null;

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <Loader2 className="h-4 w-4 mr-2 animate-spin text-primary" />
          <span className="text-sm font-medium text-gray-700">
            Analisando Keywords
          </span>
        </div>
        <span className="text-sm text-gray-500">
          {processedKeywords} de {totalKeywords} keywords
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-[#11190c] h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-gray-500 text-center">
        {progress.toFixed(1)}% concluído
      </p>
    </div>
  );
}