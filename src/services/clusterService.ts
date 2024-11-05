import { supabase } from './supabaseClient';
import { toast } from '../components/ui/Toast';
import { KeywordSimilarity } from '../utils/keywordSimilarity';

export interface Keyword {
  id: string;
  keyword: string;
  volume: number;
  difficulty: number;
  intent?: string;
  cpc?: number;
  trend?: string;
}

export interface Cluster {
  id: string;
  name: string;
  funnel: 'TOFU' | 'MOFU' | 'BOFU';
  intent: string;
  pageType: 'pilar' | 'target' | 'support';
  totalVolume: number;
  avgDifficulty: number;
  keywords: Keyword[];
  createdAt: string;
}

export const clusterService = {
  async loadClusters(projectId: string): Promise<Cluster[]> {
    try {
      // First, get all clusters for the project
      const { data: clusters, error: clustersError } = await supabase
        .from('clusters')
        .select(`
          id,
          name,
          funnel,
          intent,
          page_type,
          total_volume,
          avg_difficulty,
          created_at
        `)
        .eq('project_id', projectId);

      if (clustersError) throw clustersError;

      // For each cluster, get its associated keywords
      const clustersWithKeywords = await Promise.all(clusters.map(async (cluster) => {
        const { data: keywordRefs, error: keywordsError } = await supabase
          .from('cluster_keywords')
          .select(`
            keywords (
              id,
              keyword,
              volume,
              difficulty,
              intent,
              cpc,
              trend
            )
          `)
          .eq('cluster_id', cluster.id);

        if (keywordsError) throw keywordsError;

        return {
          id: cluster.id,
          name: cluster.name,
          funnel: cluster.funnel,
          intent: cluster.intent,
          pageType: cluster.page_type,
          totalVolume: cluster.total_volume,
          avgDifficulty: cluster.avg_difficulty,
          keywords: keywordRefs.map(ref => ref.keywords),
          createdAt: cluster.created_at
        };
      }));

      return clustersWithKeywords;
    } catch (error) {
      console.error('Error loading clusters:', error);
      throw error;
    }
  },

  async saveCluster(projectId: string, cluster: Omit<Cluster, 'id' | 'createdAt'>): Promise<string> {
    try {
      // Start a Supabase transaction
      const { data: newCluster, error: clusterError } = await supabase
        .from('clusters')
        .insert({
          project_id: projectId,
          name: cluster.name,
          funnel: cluster.funnel,
          intent: cluster.intent,
          page_type: cluster.pageType,
          total_volume: cluster.totalVolume,
          avg_difficulty: cluster.avgDifficulty
        })
        .select()
        .single();

      if (clusterError) throw clusterError;

      // Create keyword associations
      const keywordAssociations = cluster.keywords.map(keyword => ({
        cluster_id: newCluster.id,
        keyword_id: keyword.id
      }));

      const { error: associationError } = await supabase
        .from('cluster_keywords')
        .insert(keywordAssociations);

      if (associationError) throw associationError;

      return newCluster.id;
    } catch (error) {
      console.error('Error saving cluster:', error);
      throw error;
    }
  },

  async deleteCluster(clusterId: string): Promise<void> {
    try {
      // First delete keyword associations
      const { error: associationError } = await supabase
        .from('cluster_keywords')
        .delete()
        .eq('cluster_id', clusterId);

      if (associationError) throw associationError;

      // Then delete the cluster
      const { error: clusterError } = await supabase
        .from('clusters')
        .delete()
        .eq('id', clusterId);

      if (clusterError) throw clusterError;
    } catch (error) {
      console.error('Error deleting cluster:', error);
      throw error;
    }
  },

  async updateCluster(clusterId: string, updates: Partial<Omit<Cluster, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const { error: updateError } = await supabase
        .from('clusters')
        .update({
          name: updates.name,
          funnel: updates.funnel,
          intent: updates.intent,
          page_type: updates.pageType,
          total_volume: updates.totalVolume,
          avg_difficulty: updates.avgDifficulty
        })
        .eq('id', clusterId);

      if (updateError) throw updateError;

      // If keywords are updated, handle keyword associations
      if (updates.keywords) {
        // Delete existing associations
        await supabase
          .from('cluster_keywords')
          .delete()
          .eq('cluster_id', clusterId);

        // Create new associations
        const keywordAssociations = updates.keywords.map(keyword => ({
          cluster_id: clusterId,
          keyword_id: keyword.id
        }));

        const { error: associationError } = await supabase
          .from('cluster_keywords')
          .insert(keywordAssociations);

        if (associationError) throw associationError;
      }
    } catch (error) {
      console.error('Error updating cluster:', error);
      throw error;
    }
  },

  generateClusters(keywords: Keyword[]): Cluster[] {
    const clusters: Cluster[] = [];
    const usedKeywords = new Set<string>();
    const similarity = new KeywordSimilarity();

    // Sort keywords by volume for better cluster creation
    const sortedKeywords = [...keywords].sort((a, b) => b.volume - a.volume);

    for (const keyword of sortedKeywords) {
      if (usedKeywords.has(keyword.keyword)) continue;

      // Start a new cluster
      const clusterKeywords = [keyword];
      usedKeywords.add(keyword.keyword);

      // Find related keywords
      for (const otherKeyword of sortedKeywords) {
        if (usedKeywords.has(otherKeyword.keyword)) continue;

        const similarityScore = similarity.calculate(
          keyword.keyword,
          otherKeyword.keyword
        );

        if (similarityScore >= 0.3) {
          clusterKeywords.push(otherKeyword);
          usedKeywords.add(otherKeyword.keyword);
        }
      }

      // Only add clusters with at least 2 keywords or high-volume single keywords
      if (clusterKeywords.length >= 2 || clusterKeywords[0].volume >= 1000) {
        const totalVolume = clusterKeywords.reduce((sum, kw) => sum + kw.volume, 0);
        const avgDifficulty = Math.round(
          clusterKeywords.reduce((sum, kw) => sum + kw.difficulty, 0) / clusterKeywords.length
        );

        clusters.push({
          id: crypto.randomUUID(),
          name: keyword.keyword,
          keywords: clusterKeywords,
          funnel: 'TOFU', // Default values, should be updated based on analysis
          intent: keyword.intent || 'informational',
          pageType: 'target',
          totalVolume,
          avgDifficulty,
          createdAt: new Date().toISOString()
        });
      }
    }

    return clusters;
  }
};