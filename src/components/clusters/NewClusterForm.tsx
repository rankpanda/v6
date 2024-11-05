import React from 'react';

interface NewClusterFormProps {
  name: string;
  onNameChange: (value: string) => void;
  group: string;
  onGroupChange: (value: string) => void;
  type: 'pilar' | 'target' | 'support';
  onTypeChange: (value: 'pilar' | 'target' | 'support') => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export function NewClusterForm({
  name,
  onNameChange,
  group,
  onGroupChange,
  type,
  onTypeChange,
  onCancel,
  onSubmit
}: NewClusterFormProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#444638] mb-1">
            Nome do Cluster
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
            placeholder="Ex: Produtos Principais"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#444638] mb-1">
            Grupo Semântico
          </label>
          <input
            type="text"
            value={group}
            onChange={(e) => onGroupChange(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
            placeholder="Ex: Produtos"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#444638] mb-1">
            Tipo de Página
          </label>
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value as 'pilar' | 'target' | 'support')}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
          >
            <option value="pilar">Pilar Page</option>
            <option value="target">Target Page</option>
            <option value="support">Support Page</option>
          </select>
        </div>
      </div>
      <div className="mt-4 flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          Cancelar
        </button>
        <button
          onClick={onSubmit}
          className="px-4 py-2 text-sm font-medium text-white bg-[#11190c] rounded-md hover:bg-[#0a0f07] transition-colors"
        >
          Criar Cluster
        </button>
      </div>
    </div>
  );
}