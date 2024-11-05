import React from 'react';
import { Layers, DollarSign, Target, BarChart3 } from 'lucide-react';

interface Cluster {
  name: string;
  keywords: any[];
  pageType: 'pilar' | 'target' | 'support';
  funnelStage: 'TOFU' | 'MOFU' | 'BOFU';
  totalVolume: number;
  projectedConversions: number;
  projectedRevenue: number;
}

interface ClusterMetricsProps {
  clusters: Cluster[];
}

export function ClusterMetrics({ clusters }: ClusterMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-[#F3F1EE] to-[#E5E2DC] p-4 rounded-lg">
        <div className="flex items-center">
          <Layers className="h-5 w-5 text-[#11190c] mr-2" />
          <h3 className="text-sm font-medium text-[#11190c]">Total Clusters</h3>
        </div>
        <p className="mt-2 text-2xl font-bold text-[#11190c]">{clusters.length}</p>
      </div>

      <div className="bg-gradient-to-br from-[#F3F1EE] to-[#E5E2DC] p-4 rounded-lg">
        <div className="flex items-center">
          <DollarSign className="h-5 w-5 text-[#11190c] mr-2" />
          <h3 className="text-sm font-medium text-[#11190c]">Receita Projetada</h3>
        </div>
        <p className="mt-2 text-2xl font-bold text-[#11190c]">
          €{Math.round(clusters.reduce((sum, c) => sum + c.projectedRevenue, 0)).toLocaleString()}
        </p>
      </div>

      <div className="bg-gradient-to-br from-[#F3F1EE] to-[#E5E2DC] p-4 rounded-lg">
        <div className="flex items-center">
          <Target className="h-5 w-5 text-[#11190c] mr-2" />
          <h3 className="text-sm font-medium text-[#11190c]">Conversões Projetadas</h3>
        </div>
        <p className="mt-2 text-2xl font-bold text-[#11190c]">
          {Math.round(clusters.reduce((sum, c) => sum + c.projectedConversions, 0)).toLocaleString()}
        </p>
      </div>

      <div className="bg-gradient-to-br from-[#F3F1EE] to-[#E5E2DC] p-4 rounded-lg">
        <div className="flex items-center">
          <BarChart3 className="h-5 w-5 text-[#11190c] mr-2" />
          <h3 className="text-sm font-medium text-[#11190c]">Volume Total</h3>
        </div>
        <p className="mt-2 text-2xl font-bold text-[#11190c]">
          {clusters.reduce((sum, c) => sum + c.totalVolume, 0).toLocaleString()}
        </p>
      </div>
    </div>
  );
}