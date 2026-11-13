import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Curated philosophical reflections fallback when offline or if no key
const FALLBACK_REFLECTIONS = [
  {
    quote: "The soul is never born, nor does it ever die; having once existed, it never ceases to be. It is unborn, eternal, immemorial, and unslain though the body is slain.",
    source: "Bhagavad Gita 2.20",
    connection: "In neuroscience, consciousness remains the hard problem—while synaptic circuits assemble and dissolve, the experiencing subject remains a profound mystery."
  },
  {
    quote: "You have a right to your actions, but never to the fruits of your actions. Never let the fruits be your motive, nor remain attached to inaction.",
    source: "Bhagavad Gita 2.47",
    connection: "Modern cognitive architecture demonstrates that dopamine prediction error and outcome anxiety deplete executive prefrontal reserves; process absorption fosters flow state."
  },
  {
    quote: "For one who has conquered the mind, the mind is the best of friends; but for one who has failed to do so, the mind remains the greatest enemy.",
    source: "Bhagavad Gita 6.6",
    connection: "Neural plasticity is dual-edged: repeated compulsive ruminations strengthen depressive default mode network loops, whereas focused mindful observation rewires cortical resilience."
  },
  {
    quote: "When a person responds to the joys and sorrows of others as if they were his own, he has attained the highest spiritual union.",
    source: "Bhagavad Gita 6.32",
    connection: "The human mirror neuron system and insular empathetic mapping suggest that compassion is an evolved neurobiological imperative, not merely a moral precept."
  },
  {
    quote: "The body is the vehicle, the senses are the horses, the mind is the reins, the intellect is the charioteer, and the soul is the passenger.",
    source: "Katha Upanishad 1.3.3",
    connection: "An ancient model of top-down cognitive control: sensory afferents drive autonomic impulses until high-order prefrontal executive evaluation modulates behavior."
  }
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

// Server-side AI chat endpoint for the Krishna + Calf + Radha Rani bot
app.post('/api/krishna-chat', async (req, res) => {
  try {
    const { message, history = [], activeCompanion = 'calf' } = req.body as {
      message?: string;
      history?: Array<{ role: 'user' | 'assistant'; content: string }>;
      activeCompanion?: 'calf' | 'radha' | 'both';
    };

    const userText = (message || '').trim();
    if (!userText) {
      return res.status(400).json({ error: 'Please enter a message for Krishna.' });
    }

    if (!aiClient) {
      const lower = userText.toLowerCase();
      let summon: 'calf' | 'radha' | 'both' | 'auto' = 'auto';
      let reply = "Just as focused attention steadies the mind, neural plasticity reshapes every circuit we nurture. Ask me about Dipson's research on Parkinson's disease, deep brain stimulation, or call upon Radha Rani and the little calf anytime.";
      if (lower.includes('radha')) {
        summon = 'radha';
        reply = 'Shri Radha Rani graces this quiet moment beside the flute. May clarity, devotion, and calm curiosity guide your thoughts as you explore Dipson’s work.';
      } else if (lower.includes('calf') || lower.includes('cow')) {
        summon = 'calf';
        reply = 'Here hops the gentle white calf back to my side, bells ringing softly. Like a calm breath, simple stillness prepares the brain for deep discovery.';
      }
      return res.json({ reply, summon, isFallback: true });
    }

    const recentHistory = history
      .slice(-6)
      .map((m) => `${m.role === 'user' ? 'Visitor' : 'Krishna'}: ${m.content}`)
      .join('\n');

    const prompt = `Current visible companion beside Krishna: ${activeCompanion}.
${recentHistory ? `Recent conversation:\n${recentHistory}\n` : ''}Visitor says: "${userText}"`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction: PORTFOLIO_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: 'Krishna response in 2-4 concise, warm sentences.',
            },
            summon: {
              type: Type.STRING,
              description: 'Must be one of: "radha", "calf", "both", or "auto".',
            },
          },
          required: ['reply', 'summon'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const validSummons = ['radha', 'calf', 'both', 'auto'];
    const summon = validSummons.includes(parsed.summon) ? parsed.summon : 'auto';

    return res.json({
      reply: parsed.reply || 'Peaceful mind, luminous circuits. What would you like to explore on Dipson’s portfolio?',
      summon,
      isFallback: false,
    });
  } catch (error: any) {
    console.error('Gemini API chat error:', error?.message);
    return res.status(500).json({
      error: error?.message || 'Unable to reach Gemini right now. Please try again in a moment.',
    });
  }
});

// Server-side AI reflection endpoint combining Vedic philosophy and Neuroscience
app.post('/api/reflect', async (req, res) => {
  try {
    const { topic } = req.body;
    const queryTopic = topic || 'consciousness and peace of mind';

    if (!aiClient) {
      const selected = FALLBACK_REFLECTIONS[Math.floor(Math.random() * FALLBACK_REFLECTIONS.length)];
      return res.json({
        quote: selected.quote,
        source: selected.source,
        reflection: selected.connection,
        isFallback: true,
      });
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `Provide a short, serene, authentic philosophical reflection connecting Vedic wisdom (e.g. Bhagavad Gita, Upanishads, or Sushruta Samhita) with modern neuroscience, human biology, or cognitive architecture for a student studying consciousness. The topic is: "${queryTopic}".
Respond in JSON format with these exact keys:
- "quote": A short, authentic Sanskrit/Vedic quote translated into English (1-2 sentences).
- "source": The exact scripture reference (e.g., "Bhagavad Gita 2.47").
- "reflection": A concise 2-3 sentence reflection bridging this insight to neuroscience, neural plasticity, or the mind.`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      quote: parsed.quote || FALLBACK_REFLECTIONS[0].quote,
      source: parsed.source || FALLBACK_REFLECTIONS[0].source,
      reflection: parsed.reflection || FALLBACK_REFLECTIONS[0].connection,
      isFallback: false,
    });
  } catch (error: any) {
    console.error('Gemini API reflection error:', error?.message);
    const selected = FALLBACK_REFLECTIONS[Math.floor(Math.random() * FALLBACK_REFLECTIONS.length)];
    return res.json({
      quote: selected.quote,
      source: selected.source,
      reflection: selected.connection,
      isFallback: true,
    });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';
  const publicDir = path.resolve(process.cwd(), 'public');

  // Ensure static media files (like /audio/bansuri.mp3) always serve with proper MIME types and byte-range support
  app.use(express.static(publicDir));

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
