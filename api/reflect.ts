import { createReflectionResponse, getAiErrorMessage, getAiErrorStatus } from '../src/server/krishna-ai';

export const config = { maxDuration: 60 };

interface ApiRequest {
  method?: string;
  body?: unknown;
}

interface ApiResponse {
  status(code: number): ApiResponse;
  json(body: unknown): void;
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    res.status(200).json(await createReflectionResponse(req.body));
  } catch (error) {
    res.status(getAiErrorStatus(error)).json({ error: getAiErrorMessage(error) });
  }
}
