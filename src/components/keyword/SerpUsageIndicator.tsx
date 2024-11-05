import React from 'react';
import { BarChart } from 'lucide-react';

interface SerpUsageIndicatorProps {
  used: number;
  total: number;
  remaining: number;
}

export function SerpUsageIndicator({ used, total, remaining }: SerpUsageIndicatorProps) {
  const usagePercentage = (used / total) * 100;
  
  const getStatusColor = () => {
    if (usagePercentage >= 90) return 'text-red-600';
    if (usagePercentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = () => {
    if (usagePercentage >= 90) return 'bg-red-500';
    if (usagePercentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <BarChart className={`h-5 w-5 mr-2 ${getStatusColor()}`} />
          <h3 className="text-sm font-medium text-gray-700">SERP API Usage</h3>
        </div>
        <div className="text-right">
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {remaining.toLocaleString()} credits remaining
          </span>
          {remaining <= 100 && (
            <p className="text-xs text-red-600 mt-1">
              Low credits warning!
            </p>
          )}
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${Math.min(100, usagePercentage)}%` }}
        />
      </div>
      
      <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
        <span>{used.toLocaleString()} used this month</span>
        <span>{total.toLocaleString()} total monthly credits</span>
      </div>

      {usagePercentage >= 90 && (
        <div className="mt-2 text-xs text-red-600">
          Warning: API credits are almost depleted. Please use remaining credits carefully.
        </div>
      )}
    </div>
  );
}