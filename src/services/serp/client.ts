import { serpConfig } from './config';
import { SerpError } from './types';

export class SerpClient {
  private static instance: SerpClient;

  private constructor() {}

  static getInstance(): SerpClient {
    if (!this.instance) {
      this.instance = new SerpClient();
    }
    return this.instance;
  }

  async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), serpConfig.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-API-KEY': serpConfig.apiKey,
          ...options.headers
        }
      });

      if (!response.ok) {
        const isRetryable = response.status >= 500 || response.status === 429;
        throw new SerpError(
          `API returned status ${response.status}`,
          response.status,
          isRetryable
        );
      }

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async retryableRequest<T>(
    operation: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, serpConfig.retryDelay));
      }
      return await operation();
    } catch (error) {
      if (
        error instanceof SerpError &&
        error.isRetryable &&
        retryCount < serpConfig.maxRetries
      ) {
        return this.retryableRequest(operation, retryCount + 1);
      }
      throw error;
    }
  }
}