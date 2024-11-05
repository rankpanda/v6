import { createClient } from '@supabase/supabase-js';
import { toast } from '../components/ui/Toast';

const supabaseUrl = 'https://ynwmnbkkhsezbzbcztjy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlud21uYmtraHNlemJ6YmN6dGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxMTQwODQsImV4cCI6MjA0NTY5MDA4NH0.6dSY9ZTVPn_u0ZHO2GvWTcWIf0OpTR30J0IgqUqJYRg';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const databaseService = {
  async initializeDatabase() {
    try {
      // Enable UUID extension
      await supabase.rpc('enable_uuid_extension');

      // Create users table
      await supabase.rpc('execute_sql', {
        sql: `
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
        `
      });

      // Create projects table
      await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS projects (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            context JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
          );
        `
      });

      // Create keywords table
      await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS keywords (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
            keyword TEXT NOT NULL,
            volume INTEGER NOT NULL,
            difficulty INTEGER NOT NULL,
            intent TEXT,
            cpc DECIMAL,
            trend TEXT,
            analysis JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
          );
        `
      });

      // Create clusters table
      await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS clusters (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            funnel TEXT NOT NULL,
            intent TEXT NOT NULL,
            page_type TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
          );
        `
      });

      // Create cluster_keywords junction table
      await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS cluster_keywords (
            cluster_id UUID REFERENCES clusters(id) ON DELETE CASCADE,
            keyword_id UUID REFERENCES keywords(id) ON DELETE CASCADE,
            PRIMARY KEY (cluster_id, keyword_id)
          );
        `
      });

      // Create groq_usage table
      await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS groq_usage (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            tokens INTEGER NOT NULL DEFAULT 0,
            model TEXT NOT NULL,
            cost DECIMAL NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
          );
        `
      });

      // Create initial admin user if not exists
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
      toast.error('Failed to initialize database');
      throw error;
    }
  },

  async checkTableExists(tableName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .single();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
  },

  async executeSQL(sql: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('execute_sql', { sql });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error executing SQL:', error);
      throw error;
    }
  }
};

// Initialize database on app start
databaseService.initializeDatabase().catch(console.error);