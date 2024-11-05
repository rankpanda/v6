export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'user';
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
        };
        Insert: {
          email: string;
          name: string;
          role?: 'admin' | 'user';
          status?: 'pending' | 'approved' | 'rejected';
        };
        Update: {
          email?: string;
          name?: string;
          role?: 'admin' | 'user';
          status?: 'pending' | 'approved' | 'rejected';
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          user_id: string;
          context: any;
          created_at: string;
        };
        Insert: {
          name: string;
          user_id: string;
          context?: any;
        };
        Update: {
          name?: string;
          context?: any;
        };
      };
      keywords: {
        Row: {
          id: string;
          project_id: string;
          keyword: string;
          volume: number;
          difficulty: number;
          intent?: string;
          analysis?: any;
          created_at: string;
        };
        Insert: {
          project_id: string;
          keyword: string;
          volume: number;
          difficulty: number;
          intent?: string;
          analysis?: any;
        };
        Update: {
          volume?: number;
          difficulty?: number;
          intent?: string;
          analysis?: any;
        };
      };
      clusters: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          funnel: string;
          page_type: string;
          created_at: string;
        };
        Insert: {
          project_id: string;
          name: string;
          funnel: string;
          page_type: string;
        };
        Update: {
          name?: string;
          funnel?: string;
          page_type?: string;
        };
      };
      cluster_keywords: {
        Row: {
          cluster_id: string;
          keyword_id: string;
        };
        Insert: {
          cluster_id: string;
          keyword_id: string;
        };
        Update: {
          cluster_id?: string;
          keyword_id?: string;
        };
      };
      groq_usage: {
        Row: {
          id: string;
          user_id: string;
          tokens: number;
          cost: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          tokens: number;
          cost: number;
        };
        Update: {
          tokens?: number;
          cost?: number;
        };
      };
    };
  };
}