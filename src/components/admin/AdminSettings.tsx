import React, { useState, useEffect } from 'react';
import { groqService } from '../../services/groqService';
import { toast } from '../ui/Toast';
import { Cpu, DollarSign, Loader2 } from 'lucide-react';

export function AdminSettings() {
  const [selectedModel, setSelectedModel] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [usage, setUsage] = useState({ tokens: 0, cost: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoadingModels(true);
      
      // Load models
      const models = await groqService.getModels();
      setAvailableModels(models);

      // Load current model
      const currentModel = await groqService.getCurrentModel();
      setSelectedModel(currentModel);

      // Load usage
      const currentUsage = groqService.getUsage();
      setUsage(currentUsage);
    } catch (error) {
      console.error('Error loading admin settings:', error);
      toast.error('Error loading settings');
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleModelChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      const newModel = e.target.value;
      await groqService.setCurrentModel(newModel);
      setSelectedModel(newModel);
      toast.success('AI model updated');
    } catch (error) {
      console.error('Error updating model:', error);
      toast.error('Failed to update AI model');
    }
  };

  return (
    <div className="space-y-6 px-2">
      <div>
        <div className="flex items-center mb-2">
          <Cpu className="h-4 w-4 text-[#444638] mr-2" />
          <label className="text-sm font-medium text-[#444638]">
            AI Model
          </label>
        </div>
        {isLoadingModels ? (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading models...</span>
          </div>
        ) : (
          <select
            value={selectedModel}
            onChange={handleModelChange}
            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-[#11190c] focus:ring-[#11190c]"
          >
            {availableModels.map((model: any) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-[#444638] mr-2" />
            <span className="font-medium text-[#444638]">Total Cost</span>
          </div>
          <span className="text-[#11190c] font-semibold">
            €{usage.cost.toFixed(2)}
          </span>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          {usage.tokens.toLocaleString()} tokens used
        </div>
      </div>
    </div>
  );
}