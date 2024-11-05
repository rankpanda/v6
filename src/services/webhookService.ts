import { toast } from '../components/ui/Toast';

interface WebhookResponse {
  status: number;
  body: {
    ID: string;
    "Auto Suggest": string;
  };
}

interface WebhookPayload {
  keywords: Array<{
    id: string;
    keyword: string;
    volume: number;
    difficulty: number;
    metrics: {
      potentialTraffic: number;
      potentialConversions: number;
      potentialRevenue: number;
    };
  }>;
  context: {
    conversionRate: number;
    averageOrderValue: number;
    language: string;
    category?: string;
    brandName?: string;
    businessContext?: string;
  };
}

const WEBHOOK_URL = 'https://hook.integrator.boost.space/0w7dejdvm21p78a4lf4wdjkfi8dlvk25';
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

export class WebhookError extends Error {
  constructor(
    message: string, 
    public statusCode?: number,
    public responseData?: any
  ) {
    super(message);
    this.name = 'WebhookError';
  }
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function validateWebhookResponse(data: any): data is WebhookResponse {
  if (!data || typeof data !== 'object') {
    throw new WebhookError('Invalid response: not an object', 400);
  }

  if (typeof data.status !== 'number') {
    throw new WebhookError('Invalid response: missing or invalid status', 400);
  }

  if (!data.body || typeof data.body !== 'object') {
    throw new WebhookError('Invalid response: missing or invalid body', 400);
  }

  if (typeof data.body.ID !== 'string' || !data.body.ID) {
    throw new WebhookError('Invalid response: missing or invalid ID', 400);
  }

  if (typeof data.body["Auto Suggest"] !== 'string') {
    throw new WebhookError('Invalid response: missing or invalid Auto Suggest', 400);
  }

  return true;
}

export const webhookService = {
  async sendKeywordData(payload: WebhookPayload): Promise<WebhookResponse> {
    let lastError: WebhookError | null = null;

    for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
      try {
        console.log(`Sending webhook attempt ${attempt}...`);

        const response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        let responseData;
        try {
          responseData = await response.json();
        } catch (error) {
          throw new WebhookError(
            'Failed to parse response as JSON',
            response.status
          );
        }

        console.log(`Webhook response (attempt ${attempt}):`, responseData);

        if (!response.ok) {
          throw new WebhookError(
            `Server responded with ${response.status}: ${response.statusText}`,
            response.status,
            responseData
          );
        }

        // Validate response format
        if (validateWebhookResponse(responseData)) {
          return responseData;
        }

      } catch (error) {
        const webhookError = error instanceof WebhookError ? error : new WebhookError(
          error instanceof Error ? error.message : 'Unknown error occurred'
        );

        console.error(`Webhook attempt ${attempt} failed:`, {
          error: webhookError,
          details: {
            message: webhookError.message,
            statusCode: webhookError.statusCode,
            responseData: webhookError.responseData
          }
        });

        lastError = webhookError;
        
        if (attempt < RETRY_ATTEMPTS) {
          const delayTime = RETRY_DELAY * attempt;
          console.log(`Retrying in ${delayTime}ms...`);
          await delay(delayTime);
          continue;
        }
      }
    }

    const finalError = new WebhookError(
      `Failed to send data to webhook after ${RETRY_ATTEMPTS} attempts: ${lastError?.message}`,
      lastError?.statusCode,
      lastError?.responseData
    );

    console.error('All webhook attempts failed:', {
      error: finalError,
      details: {
        message: finalError.message,
        statusCode: finalError.statusCode,
        responseData: finalError.responseData
      }
    });

    throw finalError;
  }
};