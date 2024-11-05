import React from 'react';
import { Trash2 } from 'lucide-react';

interface Keyword {
  keyword: string;
  volume: number;
  difficulty: number;
  intent: string;
  funnel: string;
  pageType: 'pilar' | 'target' | 'support';
  funnelStage: 'TOFU' | 'MOFU' | 'BOFU';
}

interface ClusterKeywordTableProps {
  keywords: Keyword[];
  onRemoveKeyword: (index: number) => void;
}

export function ClusterKeywordTable({ keywords, onRemoveKeyword }: ClusterKeywordTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyword</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KD</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intent</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funnel</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page Type</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {keywords.map((keyword, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">{keyword.keyword}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{keyword.volume.toLocaleString()}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  keyword.difficulty >= 70 ? 'bg-red-100 text-red-800' :
                  keyword.difficulty >= 40 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {keyword.difficulty}%
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">{keyword.intent}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{keyword.funnelStage}</td>
              <td className="px-4 py-3 text-sm text-gray-500 capitalize">{keyword.pageType}</td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onRemoveKeyword(index)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}