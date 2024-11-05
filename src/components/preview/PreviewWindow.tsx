import React from 'react';
import { Loader2 } from 'lucide-react';

interface PreviewWindowProps {
  isLoading: boolean;
  url?: string;
}

export function PreviewWindow({ isLoading, url }: PreviewWindowProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!url) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No preview available
      </div>
    );
  }

  return (
    <iframe
      src={url}
      className="w-full h-full border-0"
      title="Preview"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}