export interface KeywordData {
  keyword: string;
  volume: number;
  difficulty: number;
  intent?: string;
  cpc?: number;
  trend?: string;
}

export interface ImportedData {
  keywords: KeywordData[];
  timestamp: string;
  filename: string;
}

export interface ImportStats {
  totalVolume: number;
  avgDifficulty: number;
  keywordCount: number;
}