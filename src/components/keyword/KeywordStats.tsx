import React from 'react';
import { BarChart3, Target, TrendingUp, DollarSign } from 'lucide-react';

interface KeywordStatsProps {
  stats: {
    totalVolume: number;
    avgDifficulty: number;
    totalTraffic: number;
    totalRevenue: number;
  };
}

export function KeywordStats({ stats }: KeywordStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Total Volume
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {stats.totalVolume.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Average KD
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {stats.avgDifficulty}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Potential Traffic
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {stats.totalTraffic.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Potential Revenue
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              €{stats.totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}