import { supabase } from './supabaseClient';
import { toast } from '../components/ui/Toast';
import type { Tables } from './supabaseClient';

export type ProjectContext = Tables['projects']['Row']['context'];

export const contextService = {
  async saveContext(projectId: string, context: ProjectContext) {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ context })
        .eq('id', projectId);

      if (error) throw error;
      toast.success('Contexto guardado com sucesso');
    } catch (error) {
      console.error('Error saving context:', error);
      toast.error('Erro ao guardar contexto');
      throw error;
    }
  },

  async getContext(projectId: string): Promise<ProjectContext | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('context')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data?.context || null;
    } catch (error) {
      console.error('Error loading context:', error);
      toast.error('Erro ao carregar contexto');
      return null;
    }
  }
};