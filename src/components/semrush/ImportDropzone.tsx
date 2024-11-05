import React from 'react';
import { Upload, Loader2 } from 'lucide-react';

interface ImportDropzoneProps {
  isDragging: boolean;
  isProcessing: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImportDropzone({
  isDragging,
  isProcessing,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect
}: ImportDropzoneProps) {
  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-8 md:p-12 text-center transition-all duration-300
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50 scale-102' 
          : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
        }
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="relative">
        {isProcessing ? (
          <Loader2 className="mx-auto h-12 w-12 text-indigo-500 animate-spin" />
        ) : (
          <Upload className="mx-auto h-12 w-12 text-gray-400 transition-colors group-hover:text-indigo-500" />
        )}
        <p className="mt-4 text-sm text-gray-600">
          {isProcessing ? (
            'Processing your file...'
          ) : (
            <>
              Drag and drop your SEMRush CSV file here, or{' '}
              <label className="text-indigo-600 hover:text-indigo-500 cursor-pointer transition-colors">
                browse
                <input
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={onFileSelect}
                  disabled={isProcessing}
                />
              </label>
            </>
          )}
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Supported columns: Keyword, Intent, Volume, Trend, Keyword Difficulty, CPC (USD)
        </p>
      </div>
    </div>
  );
}