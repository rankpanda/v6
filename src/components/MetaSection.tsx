import React from 'react';
import { TrendingUp, Users, Target } from 'lucide-react';

interface MetaSectionProps {
  formData: {
    quantitativeGoal: number;
    currentSessions: number;
    currentResult: number;
  };
}

const SERP_CTR = [
  { position: 1, ctr: 32.26, label: '1ª Posição' },
  { position: 2, ctr: 14.67, label: '2ª Posição' },
  { position: 3, ctr: 8.55, label: '3ª Posição' },
  { position: 4, ctr: 5.66, label: '4ª Posição' },
  { position: 5, ctr: 3.93, label: '5ª Posição' },
  { position: 6, ctr: 2.82, label: '6ª Posição' },
  { position: 7, ctr: 2.11, label: '7ª Posição' },
  { position: 8, ctr: 1.63, label: '8ª Posição' },
  { position: 9, ctr: 1.30, label: '9ª Posição' },
  { position: 10, ctr: 1.07, label: '10ª Posição' }
];

export function MetaSection({ formData }: MetaSectionProps) {
  // Calculate monthly sessions projection based on the formula:
  // (objectivo quantitativo * sessoes actuais/12) / resultado actual
  const calculateMonthlySessionsProjection = () => {
    const monthlyAvgSessions = formData.currentSessions / 12;
    const projectedSessions = (formData.quantitativeGoal * monthlyAvgSessions) / formData.currentResult;
    return Math.ceil(projectedSessions);
  };

  const monthlySessionsProjection = calculateMonthlySessionsProjection();

  // Calculate required search volume for each SERP position based on CTR
  // Formula: monthly_sessions_projection * 100 / position_ctr
  const calculateRequiredVolumeByPosition = (ctrPercentage: number) => {
    return Math.round((monthlySessionsProjection * 100) / ctrPercentage);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-[#11190c] mb-6 flex items-center">
        <Target className="mr-2 h-6 w-6 text-[#11190c]" />
        Análise de Meta
      </h2>

      <div className="space-y-6">
        {/* Monthly Sessions Projection Card */}
        <div className="bg-gradient-to-br from-[#F3F1EE] to-[#E5E2DC] rounded-lg p-6">
          <h3 className="text-lg font-medium text-[#11190c] mb-2 flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-[#11190c]" />
            Projeção de Sessões Mensais
          </h3>
          <p className="text-4xl font-bold text-[#11190c]">
            {monthlySessionsProjection.toLocaleString()}
          </p>
          <p className="text-sm text-[#444638] mt-2">
            sessões mensais para atingir o objetivo
          </p>
        </div>

        {/* SERP Positions Analysis */}
        <div className="bg-gradient-to-br from-[#F3F1EE] to-[#E5E2DC] rounded-lg p-6">
          <h3 className="text-lg font-medium text-[#11190c] mb-6 flex items-center">
            <Users className="mr-2 h-5 w-5 text-[#11190c]" />
            Volume de Pesquisa Necessário por Posição SERP
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {SERP_CTR.map(({ position, ctr, label }) => {
              const requiredVolume = calculateRequiredVolumeByPosition(ctr);
              return (
                <div key={position} className="bg-white bg-opacity-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[#444638]">
                      {label}
                      <span className="text-xs text-[#787664] ml-2">({ctr}% CTR)</span>
                    </span>
                    <span className="text-sm font-bold text-[#11190c]">
                      {requiredVolume.toLocaleString()} pesquisas
                    </span>
                  </div>
                  <div className="h-2 bg-[#F3F1EE] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#e6ff00] rounded-full transition-all duration-300"
                      style={{ width: `${(ctr / SERP_CTR[0].ctr) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}