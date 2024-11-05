import { groqService } from './groqService';
import { toast } from '../components/ui/Toast';

export const adminService = {
  async loadSettings() {
    try {
      const models = await groqService.getModels();
      const usage = groqService.getUsage();
      const currentModel = await groqService.getCurrentModel();

      return {
        models,
        usage,
        currentModel
      };
    } catch (error) {
      console.error('Error loading admin settings:', error);
      toast.error('Failed to load admin settings');
      throw error;
    }
  },

  async updateModel(modelId: string) {
    try {
      await groqService.setCurrentModel(modelId);
      toast.success('AI model updated successfully');
    } catch (error) {
      console.error('Error updating model:', error);
      toast.error('Failed to update AI model');
      throw error;
    }
  }
};