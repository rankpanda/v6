export const GROQ_CONFIG = {
  API_KEY: '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',
  MODELS_CACHE_KEY: 'groq_models',
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  BATCH_SIZE: 2,
  BATCH_DELAY: 3000, // 3 seconds between batches
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second between retries
  DEFAULT_MODEL: 'mixtral-8x7b-32768',
  AVAILABLE_MODELS: [
    {
      id: 'mixtral-8x7b-32768',
      name: 'Mixtral 8x7B (32K context)',
      description: 'Latest Mixtral model with 32K context window'
    },
    {
      id: 'llama2-70b-4096',
      name: 'LLaMA2 70B (4K context)',
      description: 'High performance model for complex tasks'
    },
    {
      id: 'gemma-7b-it',
      name: 'Gemma 7B-IT',
      description: 'Efficient model for general tasks'
    },
    {
      id: 'llama3-70b-8192',
      name: 'LLaMA3 70B (8K context)',
      description: 'Latest LLaMA3 model'
    }
  ]
};