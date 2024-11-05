import React from 'react';
import { ArrowDownCircle } from 'lucide-react';

interface Keyword {
  keyword: string;
  volume: number;
  analysis?: {
    keyword_analysis?: {
      marketing_funnel_position?: {
        stage?: 'TOFU' | 'MOFU' | 'BOFU';
      };
    };
  };
}

interface FunnelAnalysisProps {
  keywords: Keyword[];
  contextData: {
    conversionRate: number;
    averageOrderValue: number;
  };
}

interface StageMetrics {
  keywords: number;
  percentage: number;
  potentialVisits: number;
  potentialRevenue: number;
}

const calculateStageMetrics = (
  keywords: Keyword[], 
  stage: string,
  conversionRate: number,
  averageOrderValue: number
): StageMetrics => {
  const stageKeywords = keywords.filter(kw => 
    kw.analysis?.keyword_analysis?.marketing_funnel_position?.stage === stage
  );

  const totalVolume = stageKeywords.reduce((sum, kw) => sum + kw.volume, 0);
  const potentialVisits = Math.round(totalVolume * 0.32); // 32% CTR for first position
  const potentialConversions = Math.round(potentialVisits * (conversionRate / 100));
  const potentialRevenue = Math.round(potentialConversions * averageOrderValue);

  return {
    keywords: stageKeywords.length,
    percentage: keywords.length ? (stageKeywords.length / keywords.length) * 100 : 0,
    potentialVisits,
    potentialRevenue
  };
};

export function FunnelAnalysis({ keywords, contextData }: FunnelAnalysisProps) {
  const analyzedKeywords = keywords.filter(kw => 
    kw.analysis?.keyword_analysis?.marketing_funnel_position?.stage
  );

  const tofuMetrics = calculateStageMetrics(analyzedKeywords, 'TOFU', contextData.conversionRate, contextData.averageOrderValue);
  const mofuMetrics = calculateStageMetrics(analyzedKeywords, 'MOFU', contextData.conversionRate, contextData.averageOrderValue);
  const bofuMetrics = calculateStageMetrics(analyzedKeywords, 'BOFU', contextData.conversionRate, contextData.averageOrderValue);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <ArrowDownCircle className="h-5 w-5 mr-2 text-primary" />
        Marketing Funnel Analysis
      </h3>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-800">TOFU</h4>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600">
              {tofuMetrics.keywords} keywords - {tofuMetrics.percentage.toFixed(1)}%
            </p>
            <p className="text-lg font-semibold text-gray-900">
              €{tofuMetrics.potentialRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              {tofuMetrics.potentialVisits.toLocaleString()} potential visits/month
            </p>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-800">MOFU</h4>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600">
              {mofuMetrics.keywords} keywords - {mofuMetrics.percentage.toFixed(1)}%
            </p>
            <p className="text-lg font-semibold text-gray-900">
              €{mofuMetrics.potentialRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              {mofuMetrics.potentialVisits.toLocaleString()} potential visits/month
            </p>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-medium text-purple-800">BOFU</h4>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600">
              {bofuMetrics.keywords} keywords - {bofuMetrics.percentage.toFixed(1)}%
            </p>
            <p className="text-lg font-semibold text-gray-900">
              €{bofuMetrics.potentialRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              {bofuMetrics.potentialVisits.toLocaleString()} potential visits/month
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}