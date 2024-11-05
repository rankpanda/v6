import { toast } from '../components/ui/Toast';
import { autoSuggestService } from './autoSuggestService';

export interface Keyword {
  keyword: string;
  volume: number;
  difficulty: number;
  kgr?: number;
  autoSuggestions?: string[];
  contentType?: string;
  searchIntent?: string;
  funnelStage?: string;
  priority?: number;
  potentialTraffic?: number;
  potentialConversions?: number;
  potentialRevenue?: number;
}

export const keywordService = {
  async getKeywords(projectId: string): Promise<Keyword[]> {
    try {
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const project = projects.find((p: any) => p.id === projectId);
      return project?.data?.keywords || [];
    } catch (error) {
      console.error('Error loading keywords:', error);
      toast.error('Error loading keywords');
      return [];
    }
  },

  async updateKeywords(projectId: string, keywords: Keyword[]): Promise<void> {
    try {
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const projectIndex = projects.findIndex((p: any) => p.id === projectId);
      
      if (projectIndex === -1) {
        throw new Error('Project not found');
      }

      projects[projectIndex].data = {
        ...projects[projectIndex].data,
        keywords
      };

      localStorage.setItem('projects', JSON.stringify(projects));
      toast.success('Keywords updated successfully');
    } catch (error) {
      console.error('Error updating keywords:', error);
      toast.error('Error updating keywords');
      throw error;
    }
  },

  async updateAutoSuggestions(projectId: string, keywords: Keyword[], language: string): Promise<void> {
    try {
      const keywordsToUpdate = keywords.filter(kw => !kw.autoSuggestions);
      
      if (keywordsToUpdate.length === 0) {
        return;
      }

      const suggestions = await autoSuggestService.batchGetSuggestions(keywordsToUpdate, language);
      
      const updatedKeywords = keywords.map(kw => ({
        ...kw,
        autoSuggestions: suggestions[kw.keyword] || kw.autoSuggestions
      }));

      await this.updateKeywords(projectId, updatedKeywords);
    } catch (error) {
      console.error('Error updating auto suggestions:', error);
      toast.error('Error updating auto suggestions');
      throw error;
    }
  }
};