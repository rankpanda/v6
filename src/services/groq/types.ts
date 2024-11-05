export interface GroqModel {
  id: string;
  name: string;
  description?: string;
}

export interface CacheData<T> {
  data: T;
  timestamp: number;
}

export interface ApiError {
  message: string;
  status?: number;
}