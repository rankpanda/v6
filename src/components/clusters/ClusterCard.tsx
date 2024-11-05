import React from 'react';
import { Cluster } from '../../services/groqService';

interface ClusterCardProps {
  cluster: Cluster;
}

export function ClusterCard({ cluster }: ClusterCardProps) {
  const getFunnelColor = (funnel: string) => {
    switch (funnel) {
      case 'TOFU': return 'bg-blue-50';
      case 'MOFU': return 'bg-green-50';
      case 'BOFU': return 'bg-purple-50';
      default: return 'bg-gray-50';
    }
  };

  const calculateMetrics = () => {
    const conversionRate = parseFloat(localStorage.getItem('conversionRate') || '2') / 100;
    const averageOrderValue = parseFloat(localStorage.getItem('averageOrderValue') || '125');
    const monthlyVolume = cluster.totalVolume;
    const organicCTR = 0.32;

    const potentialClicks = monthlyVolume * organicCTR;
    const potentialConversions = potentialClicks * conversionRate;
    const potentialRevenue = potentialConversions * averageOrderValue;

    return {
      potentialClicks: Math.round(potentialClicks),
      potentialConversions: Math.round(potentialConversions),
      potentialRevenue: Math.round(potentialRevenue)
    };
  };

  const metrics = calculateMetrics();
  const bgColor = getFunnelColor(cluster.funnel);

  return (
    <div className={`${bgColor} rounded-lg p-6 shadow-sm`}>
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
          <div>
            <p className="text-sm text-gray-600">Conversões</p>
            <p className="text-lg font-semibold">{metrics.potentialConversions}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Faturação</p>
            <p className="text-lg font-semibold">€{metrics.potentialRevenue.toLocaleString()}</p>
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
}