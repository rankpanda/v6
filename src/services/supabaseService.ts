import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ynwmnbkkhsezbzbcztjy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlud21uYmtraHNlemJ6YmN6dGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxMTQwODQsImV4cCI6MjA0NTY5MDA4NH0.6dSY9ZTVPn_u0ZHO2GvWTcWIf0OpTR30J0IgqUqJYRg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const initializeDatabase = async () => {
  try {
    // Create tables
    await supabase.rpc('create_tables', {
      sql: `
        -- Users table
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          last_login TIMESTAMP WITH TIME ZONE
        );

        -- Projects table
        CREATE TABLE IF NOT EXISTS projects (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          user_id UUID REFERENCES users(id),
          context JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );

        -- Keywords table
        CREATE TABLE IF NOT EXISTS keywords (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          project_id UUID REFERENCES projects(id),
          keyword TEXT NOT NULL,
          volume INTEGER NOT NULL,
          difficulty INTEGER NOT NULL,
          intent TEXT,
          cpc DECIMAL,
          trend TEXT,
          analysis JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );

        -- Clusters table
        CREATE TABLE IF NOT EXISTS clusters (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          project_id UUID REFERENCES projects(id),
          name TEXT NOT NULL,
          funnel TEXT NOT NULL,
          intent TEXT NOT NULL,
          page_type TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );

        -- Cluster keywords junction table
        CREATE TABLE IF NOT EXISTS cluster_keywords (
          cluster_id UUID REFERENCES clusters(id),
          keyword_id UUID REFERENCES keywords(id),
          PRIMARY KEY (cluster_id, keyword_id)
        );

        -- AI usage tracking
        CREATE TABLE IF NOT EXISTS groq_usage (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id),
          tokens INTEGER NOT NULL,
          model TEXT NOT NULL,
          cost DECIMAL NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );
      `
    });

    // Create admin user if not exists
    const { data: adminExists } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'rui@rankpanda.pt')
      .single();

    if (!adminExists) {
      await supabase.from('users').insert({
        email: 'rui@rankpanda.pt',
        name: 'Rui Admin',
        password: 'bb212977923BB', // In production, this should be hashed
        role: 'admin',
        status: 'approved'
      });
    }

    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const databaseService = {
  async createUser(userData: any) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateUser(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createProject(projectData: any) {
    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getProject(projectId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        keywords (*),
        clusters (
          *,
          cluster_keywords (
            keyword_id
          )
        )
      `)
      .eq('id', projectId)
      .single();

    if (error) throw error;
    return data;
  },

  async saveKeywords(projectId: string, keywords: any[]) {
    const { data, error } = await supabase
      .from('keywords')
      .insert(
        keywords.map(k => ({
          project_id: projectId,
          ...k
        }))
      )
      .select();

    if (error) throw error;
    return data;
  },

  async createCluster(clusterData: any) {
    const { data, error } = await supabase
      .from('clusters')
      .insert(clusterData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async trackAIUsage(userId: string, tokens: number, model: string, cost: number) {
    const { error } = await supabase
      .from('groq_usage')
      .insert({
        user_id: userId,
        tokens,
        model,
        cost
      });

    if (error) throw error;
  }
};