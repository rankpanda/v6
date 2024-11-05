import React from 'react';

interface ClusterMetricsCardProps {
  label: string;
  value: number | string;
  bgColorClass: string;
  textColorClass: string;
}

export function ClusterMetricsCard({ label, value, bgColorClass, textColorClass }: ClusterMetricsCardProps) {
  return (
    <div className={`rounded-lg p-4 ${bgColorClass}`}>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${textColorClass}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );
}