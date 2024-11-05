import React from 'react';
import { Cat } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#F3F1EE] flex items-center justify-center z-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#11190c] mb-4 animate-bounce">
          <Cat className="w-8 h-8 text-[#e6ff00]" />
        </div>
        <h2 className="text-4xl font-moonwalk font-bold text-[#11190c] tracking-tight mb-2">
          RankPanda
        </h2>
        <p className="text-sm text-[#444638]">
          A inicializar aplicação...
        </p>
      </div>
    </div>
  );
}