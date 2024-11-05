export interface SerpResult {
  title: string;
  url: string;
}

export interface SerpUsage {
  used: number;
  total: number;
  remaining: number;
}

export interface PeopleAlsoAsk {
  question: string;
  answer?: string;
}

export interface AnswerBox {
  title?: string;
  content: string;
  type: 'paragraph' | 'list' | 'table';
}

export interface SerpAnalysisResult {
  titleMatches: number;
  totalResults: number;
  kgr: number | null;
  kgrRating: 'great' | 'might work' | 'bad' | 'not applicable';
  autoSuggestions: string[];
  peopleAlsoAsk: PeopleAlsoAsk[];
  error?: string;
}

export interface SerpConfig {
  apiKey: string;
  baseUrl: string;
  monthlyCredits: number;
  timeout: number;
  rateLimit: number;
  maxRetries: number;
  retryDelay: number;
}

export class SerpError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isRetryable: boolean = true
  ) {
    super(message);
    this.name = 'SerpError';
  }
}