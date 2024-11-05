import React from 'react';

interface Keyword {
  keyword: string;
  volume: number;
  difficulty: number;
  intent?: string;
}

interface Cluster {
  name: string;
  keywords: Keyword[];
  pageType: 'pilar' | 'target' | 'support';
  funnelStage: 'TOFU' | 'MOFU' | 'BOFU';
  totalVolume: number;
  projectedConversions: number;
  projectedRevenue: number;
}

interface ClusterListProps {
  clusters: Cluster[];
  conversionRate: number;
  averageOrderValue: number;
}

export function ClusterList({ clusters }: ClusterListProps) {
  return (
    <div className="space-y-4">
      {clusters.map((cluster, index) => (
        <div key={index} className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[#11190c]">{cluster.name}</h3>
              <div className="flex space-x-2 mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F3F1EE] text-[#11190c]">
                  {cluster.pageType}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F3F1EE] text-[#11190c]">
                  {cluster.funnelStage}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#444638]">Receita Projetada</p>
              <p className="text-lg font-bold text-[#11190c]">
                €{Math.round(cluster.projectedRevenue).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#444638]">Keyword</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#444638]">Volume</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#444638]">KD</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-[#444638]">Intent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cluster.keywords.map((keyword, kwIndex) => (
                  <tr key={kwIndex}>
                    <td className="px-4 py-2 text-sm text-[#11190c]">{keyword.keyword}</td>
                    <td className="px-4 py-2 text-sm text-[#444638]">{keyword.volume.toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        keyword.difficulty >= 70 ? 'bg-red-100 text-red-800' :
                        keyword.difficulty >= 40 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {keyword.difficulty}%
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-[#444638]">{keyword.intent || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}