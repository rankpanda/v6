import React from 'react';
import { KeywordAnalysis } from '../../services/keywordAnalysisService';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface KeywordAnalysisCardProps {
  analysis: KeywordAnalysis;
  onConfirm: () => void;
  onReject: () => void;
}

export function KeywordAnalysisCard({ 
  analysis, 
  onConfirm, 
  onReject 
}: KeywordAnalysisCardProps) {
  const { keyword_analysis: data } = analysis;

  const getPriorityColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFunnelColor = (stage: string) => {
    switch (stage) {
      case 'TOFU': return 'bg-blue-100 text-blue-800';
      case 'MOFU': return 'bg-green-100 text-green-800';
      case 'BOFU': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{data.keyword}</h3>
          <div className="flex items-center mt-1 space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFunnelColor(data.marketing_funnel_position.stage)}`}>
              {data.marketing_funnel_position.stage}
            </span>
            <span className="text-sm text-gray-500">
              Volume: {data.volume.toLocaleString()}
            </span>
          </div>
        </div>
        <div className={`text-2xl font-bold ${getPriorityColor(data.overall_priority.score)}`}>
          {data.overall_priority.score}/10
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Relevância Comercial</p>
          <p className="text-lg font-semibold">{data.sales_relevance.score}/10</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Importância Semântica</p>
          <p className="text-lg font-semibold">{data.semantic_importance.score}/10</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Potencial de Tráfego</p>
          <p className="text-lg font-semibold">
            {data.traffic_and_conversion_potential.potential_traffic.toLocaleString()} visitas/mês
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Potencial de Conversão</p>
          <p className="text-lg font-semibold">
            {data.traffic_and_conversion_potential.potential_conversions.toLocaleString()} conversões/mês
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Receita Potencial</p>
          <p className="text-lg font-semibold">
            €{data.traffic_and_conversion_potential.potential_revenue.toLocaleString()}/mês
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          onClick={onReject}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <XCircle className="h-4 w-4 mr-1" />
          Rejeitar
        </button>
        <button
          onClick={onConfirm}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-[#11190c] hover:bg-[#0a0f07] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#11190c]"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Confirmar
        </button>
      </div>
    </div>
  );
}