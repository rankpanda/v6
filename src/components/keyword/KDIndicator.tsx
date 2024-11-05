import React from 'react';

interface KDIndicatorProps {
  kd: number;
}

export function KDIndicator({ kd }: KDIndicatorProps) {
  const getKDColor = (value: number) => {
    if (value <= 14) return 'bg-green-100 text-green-800'; // Very easy
    if (value <= 29) return 'bg-emerald-100 text-emerald-800'; // Easy
    if (value <= 49) return 'bg-yellow-100 text-yellow-800'; // Possible
    if (value <= 69) return 'bg-orange-100 text-orange-800'; // Difficult
    if (value <= 84) return 'bg-red-100 text-red-800'; // Hard
    return 'bg-red-200 text-red-900'; // Very hard
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getKDColor(kd)}`}>
      {kd}
    </span>
  );
}