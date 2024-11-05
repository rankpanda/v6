import { supabase } from './supabaseClient';
import { toast } from '../components/ui/Toast';

export const migrationService = {
  async migrateLocalData() {
    try {
      // Get all projects from localStorage
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      
      for (const project of projects) {
        // Create project in Supabase
        const { data: newProject, error: projectError } = await supabase
          .from('projects')
          .insert({
            id: project.id,
            name: project.name,
            user_id: project.userId || 'admin', // Default to admin for old data
            context: project.context || {},
            created_at: project.createdAt || new Date().toISOString()
          })
          .select()
          .single();

        if (projectError) {
          console.error('Error migrating project:', projectError);
          continue;
        }

        // Migrate keywords
        if (project.data?.keywords) {
          const { error: keywordsError } = await supabase
            .from('keywords')
            .insert(
              project.data.keywords.map((kw: any) => ({
                project_id: newProject.id,
                keyword: kw.keyword,
                volume: kw.volume,
                difficulty: kw.difficulty,
                intent: kw.intent,
                cpc: kw.cpc,
                trend: kw.trend,
                analysis: kw.analysis,
                confirmed: kw.confirmed || false
              }))
            );

          if (keywordsError) {
            console.error('Error migrating keywords:', keywordsError);
          }
        }

        // Migrate clusters
        if (project.clusters) {
          for (const cluster of project.clusters) {
            const { data: newCluster, error: clusterError } = await supabase
              .from('clusters')
              .insert({
                project_id: newProject.id,
                name: cluster.name,
                funnel: cluster.funnel,
                intent: cluster.intent,
                page_type: cluster.pageType
              })
              .select()
              .single();

            if (clusterError) {
              console.error('Error migrating cluster:', clusterError);
              continue;
            }

            // Link keywords to cluster
            if (cluster.keywords) {
              const { error: linkError } = await supabase
                .from('cluster_keywords')
                .insert(
                  cluster.keywords.map((kw: any) => ({
                    cluster_id: newCluster.id,
                    keyword_id: kw.id
                  }))
                );

              if (linkError) {
                console.error('Error linking keywords to cluster:', linkError);
              }
            }
          }
        }
      }

      // Clear localStorage after successful migration
      localStorage.removeItem('projects');
      toast.success('Dados migrados com sucesso');
    } catch (error) {
      console.error('Error during migration:', error);
      toast.error('Erro ao migrar dados');
      throw error;
    }
  }
};