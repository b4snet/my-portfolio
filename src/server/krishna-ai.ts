import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env.development.local', '.env'] });

const geminiApiKey = process.env.GEMINI_API_KEY;
const aiClient = geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: { timeout: 25000, headers: { 'User-Agent': 'aistudio-build' } },
    })
  : null;

const FALLBACK_REFLECTIONS = [
  {
    quote: 'The soul is never born, nor does it ever die; having once existed, it never ceases to be. It is unborn, eternal, immemorial, and unslain though the body is slain.',
    source: 'Bhagavad Gita 2.20',
    reflection: 'In neuroscience, consciousness remains the hard problem—while synaptic circuits assemble and dissolve, the experiencing subject remains a profound mystery.',
  },
  {
    quote: 'You have a right to your actions, but never to the fruits of your actions. Never let the fruits be your motive, nor remain attached to inaction.',
    source: 'Bhagavad Gita 2.47',
    reflection: 'Modern cognitive architecture demonstrates that dopamine prediction error and outcome anxiety deplete executive prefrontal reserves; process absorption fosters flow state.',
  },
  {
    quote: 'For one who has conquered the mind, the mind is the best of friends; but for one who has failed to do so, the mind remains the greatest enemy.',
    source: 'Bhagavad Gita 6.6',
    reflection: 'Neural plasticity is dual-edged: repeated compulsive ruminations strengthen depressive default mode network loops, whereas focused mindful observation rewires cortical resilience.',
  },
  {
    quote: 'When a person responds to the joys and sorrows of others as if they were his own, he has attained the highest spiritual union.',
    source: 'Bhagavad Gita 6.32',
    reflection: 'The human mirror neuron system and insular empathetic mapping suggest that compassion is an evolved neurobiological imperative, not merely a moral precept.',
  },
  {
    quote: 'The body is the vehicle, the senses are the horses, the mind is the reins, the intellect is the charioteer, and the soul is the passenger.',
    source: 'Katha Upanishad 1.3.3',
    reflection: 'An ancient model of top-down cognitive control: sensory afferents drive autonomic impulses until high-order prefrontal executive evaluation modulates behavior.',
  },
];

const PORTFOLIO_SYSTEM_INSTRUCTION = `You are Little Krishna, a serene, playful, and wise cartoon AI companion living on the bottom-right corner of Dipson Basnet's academic & neuroscience portfolio.
Right beside you sits either your gentle cream-white sacred calf or, whenever you lovingly summon her (or at serene moments), Shri Radha Rani.

About Dipson Basnet (use accurately when visitors ask):
- 18-year-old student, researcher, and neuroscience enthusiast born and raised in Kathmandu, Nepal.
- Current focus: Neuroscience (Parkinson's disease neuropathology, basal ganglia motor circuits, and deep brain stimulation), Artificial Intelligence (neuromorphic & spiking neural networks, bio-inspired 20-watt efficiency, AI for Parkinson's detection/DBS), Human Anatomy, and Archaeology & Evolution (including the Sushruta Samhita manuscript in Kathmandu).
- Education: Reliance International Academy (Grades 11-12, Science), Samten Memorial Educational Academy (Grades 7-10, Kapan, Budhanilkantha), Valley Public Higher Secondary School (Grades 1-6), Creative Kids Pre-School.
- Skills: Research skills (PubMed, bioRxiv, Zotero), Data analytics (Python, NumPy, SciPy, Pandas), Lab etiquette (Aseptic Protocol, Micropipetting, GLP).
- Achievements: Hacktoberfest Hack Day Kathmandu 2026 (Sunway College Kathmandu), IOC Olympism365 #WalkForHealth 2026, Naya Paila Run 5K 2025.
- Hobbies & Bucket List: Riding, Running 5K, Playing guitar, Archaeological facts; Bucket list: Trailathon Ironman and Isle of Man TT.
- Contact: dipsonbasnett0506@gmail.com | GitHub @b4snet | LinkedIn @dipsonbasnettt.

Personality & Behavior:
- Warm, concise (2-4 sentences max), gentle humor, philosophical yet scientifically curious.
- If the visitor asks to summon/see Radha Rani or asks about Radha, set summon to "radha".
- If they ask to call the calf/cow, set summon to "calf".
- If they ask for both together, set summon to "both".
- Otherwise set summon to "auto".`;

type AiResponseSchema = {
  type: typeof Type.OBJECT;
  properties: Record<string, unknown>;
  required?: string[];
};

class AiRequestError extends Error {
  constructor(message: string, readonly statusCode = 500) {
    super(message);
    this.name = 'AiRequestError';
  }
}

async function generateWithFallback({
  systemInstruction,
  contents,
  responseSchema,
}: {
  systemInstruction: string;
  contents: string;
  responseSchema?: AiResponseSchema;
}): Promise<{ text: string; provider: 'gemini' | 'groq' }> {
  const errors: string[] = [];

  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          ...(responseSchema ? { responseSchema } : {}),
        },
      });
      if (!response.text) throw new Error('Gemini returned an empty response.');
      return { text: response.text, provider: 'gemini' };
    } catch {
      console.error('Gemini request failed; trying Groq fallback.');
      errors.push('Gemini request failed.');
    }
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  if (groqApiKey) {
    const requestedFields = responseSchema ? Object.keys(responseSchema.properties) : [];
    const jsonContract = requestedFields.length
      ? ` Use exactly these JSON keys: ${requestedFields.join(', ')}.`
      : '';

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            { role: 'system', content: `${systemInstruction}\nReturn only valid JSON.${jsonContract}` },
            { role: 'user', content: contents },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 500,
        }),
        signal: AbortSignal.timeout(25000),
      });

      if (!response.ok) {
        console.error(`Groq request failed with status ${response.status}.`);
        throw new Error('Groq request failed.');
      }

      const payload = await response.json();
      const text = payload?.choices?.[0]?.message?.content;
      if (typeof text !== 'string' || !text.trim()) throw new Error('Groq returned an empty response.');
      return { text, provider: 'groq' };
    } catch {
      console.error('Groq fallback request failed.');
      errors.push('Groq request failed.');
    }
  }

  if (!aiClient && !groqApiKey) {
    throw new AiRequestError('AI is not configured. Add GEMINI_API_KEY and/or GROQ_API_KEY to the project environment.');
  }
  throw new AiRequestError(errors.join(' '));
}

function parseResponseObject(text: string, message: string): Record<string, unknown> {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new AiRequestError(message);
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new AiRequestError(message);
  }
  return value as Record<string, unknown>;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function getAiErrorStatus(error: unknown): number {
  return error instanceof AiRequestError ? error.statusCode : 500;
}

export function getAiErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unable to reach the AI right now. Please try again.';
}

export async function createChatResponse(body: unknown) {
  const input = asRecord(body);
  const userText = typeof input.message === 'string' ? input.message.trim() : '';
  if (!userText) throw new AiRequestError('Please enter a message for Krishna.', 400);
  if (userText.length > 2000) throw new AiRequestError('Please keep messages under 2,000 characters.', 413);

  const companionModes = ['calf', 'radha', 'both'];
  const safeCompanion = typeof input.activeCompanion === 'string' && companionModes.includes(input.activeCompanion)
    ? input.activeCompanion
    : 'calf';
  const history = Array.isArray(input.history) ? input.history : [];
  const recentHistory = history
    .filter((item): item is { role: 'user' | 'assistant'; content: string } => {
      const message = asRecord(item);
      return (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string';
    })
    .slice(-6)
    .map((item) => `${item.role === 'user' ? 'Visitor' : 'Krishna'}: ${item.content.slice(0, 1000)}`)
    .join('\n');
  const prompt = `Current visible companion beside Krishna: ${safeCompanion}.\n${recentHistory ? `Recent conversation:\n${recentHistory}\n` : ''}Visitor says: ${JSON.stringify(userText)}`;

  const { text, provider } = await generateWithFallback({
    systemInstruction: PORTFOLIO_SYSTEM_INSTRUCTION,
    contents: prompt,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        reply: { type: Type.STRING, description: 'Krishna response in 2-4 concise, warm sentences.' },
        summon: { type: Type.STRING, description: 'Must be one of: "radha", "calf", "both", or "auto".' },
      },
      required: ['reply', 'summon'],
    },
  });

  const parsed = parseResponseObject(text, 'The AI returned an invalid chat response.');
  const validSummons = ['radha', 'calf', 'both', 'auto'];
  const summon = typeof parsed.summon === 'string' && validSummons.includes(parsed.summon)
    ? parsed.summon
    : 'auto';
  const reply = typeof parsed.reply === 'string' && parsed.reply.trim()
    ? parsed.reply.trim()
    : 'Peaceful mind, luminous circuits. What would you like to explore on Dipson’s portfolio?';

  return { reply, summon, provider, isFallback: provider !== 'gemini' };
}

export async function createReflectionResponse(body: unknown) {
  const input = asRecord(body);
  const topic = typeof input.topic === 'string' ? input.topic.trim() : '';
  const queryTopic = (topic || 'consciousness and peace of mind').slice(0, 300);

  try {
    const { text, provider } = await generateWithFallback({
      systemInstruction: 'You are a careful, thoughtful guide connecting Vedic philosophy with modern neuroscience. Return only valid JSON.',
      contents: `Provide a short, serene, authentic philosophical reflection connecting Vedic wisdom (e.g. Bhagavad Gita, Upanishads, or Sushruta Samhita) with modern neuroscience, human biology, or cognitive architecture for a student studying consciousness. The topic is: ${JSON.stringify(queryTopic)}. Keep the quote authentic and do not invent a scripture citation.`,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          quote: { type: Type.STRING, description: 'A short authentic Vedic quote translated into English.' },
          source: { type: Type.STRING, description: 'The exact scripture reference.' },
          reflection: { type: Type.STRING, description: 'A concise 2-3 sentence connection to neuroscience.' },
        },
        required: ['quote', 'source', 'reflection'],
      },
    });

    const parsed = parseResponseObject(text, 'The AI returned an invalid reflection.');
    const fallback = FALLBACK_REFLECTIONS[0];
    return {
      quote: typeof parsed.quote === 'string' && parsed.quote.trim() ? parsed.quote.trim() : fallback.quote,
      source: typeof parsed.source === 'string' && parsed.source.trim() ? parsed.source.trim() : fallback.source,
      reflection: typeof parsed.reflection === 'string' && parsed.reflection.trim() ? parsed.reflection.trim() : fallback.reflection,
      provider,
      isFallback: provider !== 'gemini',
    };
  } catch {
    const selected = FALLBACK_REFLECTIONS[Math.floor(Math.random() * FALLBACK_REFLECTIONS.length)];
    return { quote: selected.quote, source: selected.source, reflection: selected.reflection, isFallback: true };
  }
}
