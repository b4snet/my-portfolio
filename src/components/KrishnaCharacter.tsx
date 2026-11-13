import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Sparkles, Send, X, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { globalAudioController } from './BackgroundMusic';

type CompanionMode = 'calf' | 'radha' | 'both';
type KrishnaPose = 'namaste' | 'flute' | 'summon';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SPONTANEOUS_WHISPERS: Record<CompanionMode, string[]> = {
  calf: [
    'Peaceful focus',
    'Stillness sharpens the mind',
    'Curious about DBS?',
  ],
  radha: [
    'Radha Rani is here',
    'Serenity & devotion',
    'Ask us anything',
  ],
  both: [
    'Vrindavan calm',
    'Harmony in motion',
  ],
};

const QUICK_PROMPTS = [
  'Summon Radha Rani',
  'Call the little calf',
  'What is Dipson studying in neuroscience?',
  'Share a Gita insight for focus',
];

export const KrishnaCharacter: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);

  // Autonomous companion & pose state
  const [companion, setCompanion] = useState<CompanionMode>('calf');
  const [krishnaPose, setKrishnaPose] = useState<KrishnaPose>('namaste');
  const [calfHop, setCalfHop] = useState(false);
  const [whisper, setWhisper] = useState<string | null>(null);
  const [summonFlash, setSummonFlash] = useState(false);

  // Sound state synced with BackgroundMusic
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);

  // AI Bot chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Radhe Radhe. I’m Little Krishna, resting here with the little calf—and sometimes Radha Rani visits too. Ask me about Dipson’s neuroscience studies, his portfolio, or ask me to summon Radha Rani anytime.',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    return globalAudioController.subscribe((isOn) => {
      setIsSoundPlaying(isOn);
    });
  }, []);

  // Track visibility so autonomous loop pauses off-screen
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const triggerCompanionSwitch = useCallback(
    (next: CompanionMode, showBurst = true) => {
      setCompanion(next);
      if (showBurst) {
        setSummonFlash(true);
        setKrishnaPose('summon');
        setTimeout(() => {
          setSummonFlash(false);
          setKrishnaPose(next === 'radha' ? 'flute' : 'namaste');
        }, 1200);
      }
    },
    []
  );

  // Continuous random autonomous life: shifts between Calf, Radha Rani, Flute, Namaste, Calf hop
  useEffect(() => {
    if (!isVisible || shouldReduceMotion) return;

    const timer = window.setInterval(() => {
      if (isChatOpen) return;

      const roll = Math.random();

      if (roll < 0.28) {
        // Randomly summon Radha Rani or switch back to Calf or Both
        const choices: CompanionMode[] = ['calf', 'radha', 'calf', 'radha', 'both'];
        const picked = choices[Math.floor(Math.random() * choices.length)];
        if (picked !== companion) {
          triggerCompanionSwitch(picked, true);
          const pool = SPONTANEOUS_WHISPERS[picked];
          setWhisper(pool[Math.floor(Math.random() * pool.length)]);
          setTimeout(() => setWhisper(null), 3200);
        } else {
          setKrishnaPose((prev) => (prev === 'namaste' ? 'flute' : 'namaste'));
        }
      } else if (roll < 0.62) {
        // Krishna switches between peaceful Namaste and playing golden Bansuri flute
        setKrishnaPose((prev) => (prev === 'namaste' ? 'flute' : 'namaste'));
      } else {
        // Playful calf hop when calf is present, or gentle whisper
        if (companion === 'calf' || companion === 'both') {
          setCalfHop(true);
          setTimeout(() => setCalfHop(false), 900);
        } else {
          const pool = SPONTANEOUS_WHISPERS[companion];
          setWhisper(pool[Math.floor(Math.random() * pool.length)]);
          setTimeout(() => setWhisper(null), 2800);
        }
      }
    }, 6500);

    return () => window.clearInterval(timer);
  }, [isVisible, shouldReduceMotion, isChatOpen, companion, triggerCompanionSwitch]);

  // Auto-scroll chat log
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isSending, isChatOpen]);

  // Close chat on Escape
  useEffect(() => {
    if (!isChatOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsChatOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isChatOpen]);

  const sendMessage = async (textOverride?: string) => {
    const text = (textOverride ?? inputValue).trim();
    if (!text || isSending) return;

    setChatError(null);
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    if (!textOverride) setInputValue('');
    setIsSending(true);

    try {
      const res = await fetch('/api/krishna-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          activeCompanion: companion,
          history: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const serverError = typeof data?.error === 'string' ? data.error : null;
        const message = serverError || (res.status === 404
          ? 'Krishna’s AI endpoint is not available on this deployment yet.'
          : 'Could not reach Krishna right now. Please try again.');
        throw new Error(message);
      }
      if (!data || typeof data.reply !== 'string') {
        throw new Error('Krishna returned an invalid response. Please try again.');
      }

      if (data.summon === 'radha' || data.summon === 'calf' || data.summon === 'both') {
        triggerCompanionSwitch(data.summon, true);
      }

      const botMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setChatError(err?.message || 'Unable to connect right now.');
    } finally {
      setIsSending(false);
    }
  };

  const showCalf = companion === 'calf' || companion === 'both';
  const showRadha = companion === 'radha' || companion === 'both';

  return (
    <div
      ref={containerRef}
      className="fixed bottom-3 right-3 sm:bottom-4 sm:right-5 z-40 pointer-events-none select-none flex flex-col items-end"
    >
      {/* AI Bot Chat Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.25, ease: [0.28, 0.11, 0.32, 1] }}
            role="dialog"
            aria-label="Krishna AI Companion"
            className="pointer-events-auto mb-2 w-[calc(100vw-24px)] sm:w-[370px] bg-[#111113]/95 text-[#f5f5f7] border border-white/15 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#f5f5f7]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Krishna AI Companion</span>
                </div>
                <span className="text-[11px] font-mono text-[#86868b] block">
                  {companion === 'radha'
                    ? 'With Shri Radha Rani'
                    : companion === 'both'
                    ? 'With Radha Rani & the Calf'
                    : 'With the Sacred Calf'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => globalAudioController.toggleSound()}
                  className="p-1.5 text-[#86868b] hover:text-[#f5f5f7] hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label={isSoundPlaying ? 'Mute bansuri audio' : 'Play bansuri audio'}
                  title={isSoundPlaying ? 'Turn sound off' : 'Turn sound on'}
                >
                  {isSoundPlaying ? (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 text-[#86868b] hover:text-[#f5f5f7] hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close Krishna AI chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Companion Summon Bar */}
            <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2 text-[11px] font-mono bg-black/30">
              <span className="text-[#86868b]">Summon:</span>
              {(['calf', 'radha', 'both'] as CompanionMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => triggerCompanionSwitch(mode, true)}
                  className={`px-2 py-0.5 border transition-colors cursor-pointer capitalize ${
                    companion === mode
                      ? 'bg-[#f5f5f7] text-[#111113] border-[#f5f5f7]'
                      : 'text-[#86868b] border-white/15 hover:text-[#f5f5f7]'
                  }`}
                >
                  {mode === 'radha' ? 'Radha Rani' : mode === 'calf' ? 'Calf' : 'Both'}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div
              ref={chatScrollRef}
              className="px-4 py-3 space-y-3 max-h-[260px] overflow-y-auto text-[13px] leading-[1.45]"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 ${
                      msg.role === 'user'
                        ? 'bg-[#f5f5f7] text-[#111113]'
                        : 'bg-white/[0.06] text-[#f5f5f7] border border-white/10'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex justify-start">
                  <div className="px-3 py-2 bg-white/[0.06] border border-white/10 text-[#86868b] flex items-center gap-2 text-[12px] font-mono">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Krishna is reflecting...</span>
                  </div>
                </div>
              )}

              {chatError && (
                <div className="text-[12px] text-rose-400 bg-rose-950/30 border border-rose-500/30 px-3 py-2">
                  {chatError}
                </div>
              )}
            </div>

            {/* Starter Prompts */}
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  disabled={isSending}
                  className="text-[11px] font-mono px-2 py-1 bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-[#d1d1d6] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="p-3 border-t border-white/10 flex items-center gap-2 bg-black/40"
            >
              <input
                type="text"
                aria-label="Message Krishna"
                maxLength={2000}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Krishna or summon Radha Rani..."
                className="flex-1 px-3 py-1.5 bg-black/60 border border-white/15 text-[13px] text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-white/40"
              />
              <button
                type="submit"
                disabled={isSending || !inputValue.trim()}
                className="p-2 bg-[#f5f5f7] text-[#111113] hover:bg-white transition-colors disabled:opacity-40 cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Autonomous Whisper above characters when chat is closed */}
      <AnimatePresence>
        {!isChatOpen && whisper && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="mb-1 px-2.5 py-1 bg-[#111113]/90 text-[#f5f5f7] border border-white/15 text-[11px] font-mono tracking-tight"
          >
            {whisper}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Borderless Illustrated Cartoon Chibi Scene (Krishna + Calf + Randomly Summoned Radha Rani) */}
      <button
        type="button"
        onClick={() => setIsChatOpen((prev) => !prev)}
        aria-label="Open Krishna AI Companion chat"
        title="Ask Krishna AI Bot"
        className="pointer-events-auto relative w-[210px] sm:w-[235px] h-[165px] sm:h-[185px] bg-transparent border-0 p-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#86868b] focus-visible:outline-offset-2"
      >
        <svg
          viewBox="0 0 280 205"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Painterly Cartoon Shading Gradients */}
            <radialGradient id="krishnaSkinGrad" cx="42%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#A9D0FF" />
              <stop offset="58%" stopColor="#7EB2F5" />
              <stop offset="100%" stopColor="#5D8ED6" />
            </radialGradient>

            <radialGradient id="radhaSkinGrad" cx="42%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFF0E3" />
              <stop offset="65%" stopColor="#FAD3BA" />
              <stop offset="100%" stopColor="#E6B094" />
            </radialGradient>

            <linearGradient id="dhotiGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE680" />
              <stop offset="55%" stopColor="#F6BF3B" />
              <stop offset="100%" stopColor="#D6921B" />
            </linearGradient>

            <linearGradient id="sashOrangeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F89A3C" />
              <stop offset="50%" stopColor="#EA7B21" />
              <stop offset="100%" stopColor="#C95E12" />
            </linearGradient>

            <linearGradient id="radhaLehengaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F884AD" />
              <stop offset="55%" stopColor="#E24E84" />
              <stop offset="100%" stopColor="#B83063" />
            </linearGradient>

            <radialGradient id="calfCoatGrad" cx="45%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFFDF8" />
              <stop offset="68%" stopColor="#F6EAD9" />
              <stop offset="100%" stopColor="#E3CEB4" />
            </radialGradient>

            <radialGradient id="blushPinkGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F58D8D" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#F58D8D" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="hairChestnutGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5C382B" />
              <stop offset="55%" stopColor="#46281E" />
              <stop offset="100%" stopColor="#321B14" />
            </linearGradient>

            <linearGradient id="goldOrnamentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE680" />
              <stop offset="50%" stopColor="#EAA82B" />
              <stop offset="100%" stopColor="#B87A14" />
            </linearGradient>

            <radialGradient id="groundShadowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3A251B" stopOpacity="0.28" />
              <stop offset="65%" stopColor="#3A251B" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#3A251B" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Soft Contact Ground Shadows (No border, no card box) */}
          <ellipse cx="152" cy="190" rx="88" ry="8" fill="url(#groundShadowGrad)" />

          {/* Summon Sparkle / Lotus Petal Burst */}
          {summonFlash && !shouldReduceMotion && (
            <g>
              <g style={{ animation: 'floatPetal 1.2s ease-out forwards' }}>
                <ellipse cx="195" cy="95" rx="4" ry="2.2" fill="#F884AD" />
                <ellipse cx="222" cy="115" rx="3.5" ry="2" fill="#FFE680" />
                <ellipse cx="98" cy="108" rx="3.5" ry="2" fill="#F884AD" />
              </g>
              <path
                d="M214 78 L216 84 L222 86 L216 88 L214 94 L212 88 L206 86 L212 84 Z"
                fill="#FFE680"
              />
              <path
                d="M95 85 L96.5 89 L101 90.5 L96.5 92 L95 96 L93.5 92 L89 90.5 L93.5 89 Z"
                fill="#FFE680"
              />
            </g>
          )}

          {/* ==============================================================
              COMPANION A: RECLINING / PLAYFUL CREAM-WHITE CALF (Reference Left)
              ============================================================== */}
          <g
            style={{
              opacity: showCalf ? 1 : 0,
              transform: showCalf
                ? calfHop && !shouldReduceMotion
                  ? 'translateY(-10px) scale(1.02)'
                  : 'translateY(0px) scale(1)'
                : 'translateX(-16px) scale(0.85)',
              transformOrigin: '74px 168px',
              transition: shouldReduceMotion
                ? 'none'
                : 'opacity 0.55s ease, transform 0.55s cubic-bezier(0.28, 0.11, 0.32, 1)',
            }}
          >
            {/* Calf Body lying gracefully behind/beside Krishna like the reference */}
            <g
              style={{
                transformOrigin: '80px 168px',
                animation: shouldReduceMotion ? 'none' : 'cowBreathe 4.2s ease-in-out infinite',
              }}
            >
              {/* Hind body curve & tail resting on right */}
              <path
                d="M90 144 C118 136 168 136 196 144 C216 150 222 172 212 182 C200 189 175 186 155 184 L82 184 Z"
                fill="url(#calfCoatGrad)"
                stroke="#4D2E20"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              {/* Calf Hind Hoof */}
              <path
                d="M174 176 C182 174 190 176 192 182 C188 186 178 186 173 182 Z"
                fill="#7D5A48"
                stroke="#4D2E20"
                strokeWidth="1.8"
              />
              {/* Soft Tail with dark brown tuft */}
              <g
                style={{
                  transformOrigin: '214px 164px',
                  animation: shouldReduceMotion ? 'none' : 'cowTailSwish 3.8s ease-in-out infinite',
                }}
              >
                <path
                  d="M214 162 Q226 172 220 186"
                  stroke="#4D2E20"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <path
                  d="M220 183 C214 188 214 196 223 195 C229 194 230 186 222 183 Z"
                  fill="#4D2E20"
                />
              </g>
            </g>

            {/* Calf Folded Front Legs nestled softly on the left */}
            <path
              d="M44 174 C44 167 62 167 74 172 C76 178 72 184 56 184 C45 184 44 180 44 174 Z"
              fill="url(#calfCoatGrad)"
              stroke="#4D2E20"
              strokeWidth="2.2"
            />
            <path
              d="M66 176 C70 170 86 171 92 178 C91 185 78 187 68 184 Z"
              fill="#F6EAD9"
              stroke="#4D2E20"
              strokeWidth="2.1"
            />

            {/* Calf Beaded Necklace + Shiny Gold Bell */}
            <path
              d="M52 158 Q68 172 86 160"
              stroke="#6B402D"
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeDasharray="1 5"
            />
            <circle cx="67" cy="171" r="4.5" fill="url(#goldOrnamentGrad)" stroke="#4D2E20" strokeWidth="1.6" />
            <circle cx="65.8" cy="169.5" r="1.2" fill="#FFFDF5" />

            {/* Calf Head tilted lovingly toward Krishna */}
            <g
              style={{
                transformOrigin: '62px 145px',
                animation: shouldReduceMotion ? 'none' : 'headTiltSway 4.8s ease-in-out infinite',
              }}
            >
              {/* Left & Right Floppy Ears with Pink Inner */}
              <g
                style={{
                  transformOrigin: '42px 136px',
                  animation: shouldReduceMotion ? 'none' : 'cowEarFlick 5.5s ease-in-out infinite',
                }}
              >
                <path
                  d="M42 134 C25 133 17 142 22 148 C29 152 40 146 44 140 Z"
                  fill="url(#calfCoatGrad)"
                  stroke="#4D2E20"
                  strokeWidth="2.1"
                />
                <path
                  d="M39 138 C30 138 25 142 27 145 C31 147 37 143 40 140 Z"
                  fill="#F5A69E"
                />
              </g>
              <g>
                <path
                  d="M82 132 C96 128 105 135 101 142 C96 146 86 143 81 138 Z"
                  fill="url(#calfCoatGrad)"
                  stroke="#4D2E20"
                  strokeWidth="2.1"
                />
                <path
                  d="M84 136 C91 134 97 137 95 140 C92 142 86 140 84 138 Z"
                  fill="#F5A69E"
                />
              </g>

              {/* Cute Little Brown Horns */}
              <path
                d="M49 124 C45 114 48 110 53 114 C55 117 55 122 54 125 Z"
                fill="#A67A62"
                stroke="#4D2E20"
                strokeWidth="1.9"
              />
              <path
                d="M72 123 C73 113 78 111 81 116 C81 119 78 123 76 125 Z"
                fill="#A67A62"
                stroke="#4D2E20"
                strokeWidth="1.9"
              />

              {/* Round Calf Head */}
              <path
                d="M40 140 C38 124 50 117 64 118 C78 119 88 128 86 144 C84 156 75 164 62 163 C48 162 41 153 40 140 Z"
                fill="url(#calfCoatGrad)"
                stroke="#4D2E20"
                strokeWidth="2.2"
              />
              {/* Fluffy Forehead Tuft */}
              <path
                d="M57 119 Q61 112 65 118 Q69 114 70 120"
                fill="url(#calfCoatGrad)"
                stroke="#4D2E20"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              {/* Serene Closed Happy Eyes */}
              <path d="M48 139 Q53 143 58 139" stroke="#4D2E20" strokeWidth="2.1" strokeLinecap="round" />
              <path d="M68 139 Q73 143 78 139" stroke="#4D2E20" strokeWidth="2.1" strokeLinecap="round" />

              {/* Soft Blush */}
              <circle cx="48" cy="146" r="5" fill="url(#blushPinkGrad)" />
              <circle cx="77" cy="146" r="5" fill="url(#blushPinkGrad)" />

              {/* Cute Pink Muzzle / Snout */}
              <ellipse cx="64" cy="153" rx="14" ry="9.5" fill="#F8B4AA" stroke="#4D2E20" strokeWidth="2" />
              <circle cx="59" cy="152" r="1.7" fill="#4D2E20" />
              <circle cx="69" cy="152" r="1.7" fill="#4D2E20" />
              <path d="M60 157 Q64 160 68 157" stroke="#4D2E20" strokeWidth="1.6" strokeLinecap="round" />
              <ellipse cx="61" cy="147.5" rx="4" ry="1.4" fill="#FFFFFF" fillOpacity="0.45" />
            </g>
          </g>

          {/* ==============================================================
              MAIN HERO FIGURE: SEATED CHIBI BABY KRISHNA (Reference Center)
              ============================================================== */}
          <g
            style={{
              transformOrigin: '146px 175px',
              animation: shouldReduceMotion ? 'none' : 'krishnaDancingSway 5.4s ease-in-out infinite',
            }}
          >
            {/* Crossed Legs + Little Bare Feet + Gold Anklets (Reference Pose) */}
            <g>
              {/* Seated Golden Silk Dhoti Base */}
              <path
                d="M104 168 C94 171 92 183 106 187 C124 191 168 191 186 187 C199 183 197 171 187 167 C176 160 164 152 146 152 C128 152 115 160 104 168 Z"
                fill="url(#dhotiGoldGrad)"
                stroke="#4D2E20"
                strokeWidth="2.3"
                strokeLinejoin="round"
              />
              {/* Soft Silk Fold Lines */}
              <path d="M116 172 Q132 181 152 178" stroke="#9B6615" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M174 172 Q158 181 140 179" stroke="#9B6615" strokeWidth="1.5" strokeLinecap="round" />

              {/* Left tucked foot with gold anklet */}
              <path
                d="M135 182 C133 177 146 175 157 178 C163 180 163 188 155 189 C145 190 136 188 135 182 Z"
                fill="url(#krishnaSkinGrad)"
                stroke="#4D2E20"
                strokeWidth="2"
              />
              {/* Tiny toe lines */}
              <path d="M159 181 L161 182 M159 184 L161 185" stroke="#4D2E20" strokeWidth="1.3" strokeLinecap="round" />
              {/* Gold Anklet */}
              <path d="M137 178 Q140 185 144 188" stroke="url(#goldOrnamentGrad)" strokeWidth="3.5" strokeLinecap="round" />

              {/* Orange Silk Waist Cloth & Tied Center Knot */}
              <path
                d="M114 155 Q146 164 178 155 C180 160 177 166 172 167 Q146 173 120 167 C115 166 112 160 114 155 Z"
                fill="url(#sashOrangeGrad)"
                stroke="#4D2E20"
                strokeWidth="2.1"
              />
              <ellipse cx="146" cy="162" rx="7.5" ry="5.5" fill="url(#sashOrangeGrad)" stroke="#4D2E20" strokeWidth="2" />
            </g>

            {/* Torso + Layered Gold Bead Necklaces */}
            <g>
              <path
                d="M123 116 C118 129 118 145 121 157 Q146 164 171 157 C174 145 174 129 169 116 Z"
                fill="url(#krishnaSkinGrad)"
                stroke="#4D2E20"
                strokeWidth="2.3"
                strokeLinejoin="round"
              />
              {/* Soft chest/shoulder contour */}
              <path d="M132 134 Q146 139 160 134" stroke="#5381C7" strokeWidth="1.2" strokeOpacity="0.45" strokeLinecap="round" />

              {/* Dual Gold Bead Necklaces */}
              <path
                d="M131 118 Q146 134 161 118"
                stroke="url(#goldOrnamentGrad)"
                strokeWidth="4.2"
                strokeLinecap="round"
                strokeDasharray="2 4.2"
              />
              <path
                d="M127 120 Q146 146 165 120"
                stroke="url(#goldOrnamentGrad)"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray="2.2 4.5"
              />
              <circle cx="146" cy="136" r="3.4" fill="url(#goldOrnamentGrad)" stroke="#4D2E20" strokeWidth="1.3" />
              <circle cx="146" cy="144" r="3" fill="#E65245" stroke="#4D2E20" strokeWidth="1.2" />
            </g>

            {/* Dynamic Arms: Namaste (Reference Pose), Playing Flute, or Summoning */}
            {krishnaPose === 'flute' ? (
              <g>
                {/* Floating Musical Notes */}
                {!shouldReduceMotion && (
                  <g style={{ animation: 'floatNote 2.4s ease-out infinite' }}>
                    <text x="104" y="108" fill="#EAA82B" fontSize="13" fontWeight="600">
                      ♪
                    </text>
                    <text x="182" y="102" fill="#F884AD" fontSize="12" fontWeight="600">
                      ♫
                    </text>
                  </g>
                )}

                {/* Left bent arm */}
                <path
                  d="M123 121 C110 125 107 137 124 138"
                  stroke="url(#krishnaSkinGrad)"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <path
                  d="M123 121 C110 125 107 137 124 138"
                  stroke="#4D2E20"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                {/* Right bent arm */}
                <path
                  d="M169 121 C182 125 185 137 168 138"
                  stroke="url(#krishnaSkinGrad)"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <path
                  d="M169 121 C182 125 185 137 168 138"
                  stroke="#4D2E20"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                {/* Golden Bansuri Flute */}
                <rect
                  x="110"
                  y="130"
                  width="74"
                  height="6.5"
                  rx="3.2"
                  transform="rotate(-8 146 133)"
                  fill="url(#goldOrnamentGrad)"
                  stroke="#4D2E20"
                  strokeWidth="1.7"
                />
                <circle cx="136" cy="134" r="1.2" fill="#4D2E20" />
                <circle cx="144" cy="133" r="1.2" fill="#4D2E20" />
                <circle cx="152" cy="132" r="1.2" fill="#4D2E20" />
                <circle cx="160" cy="131" r="1.2" fill="#4D2E20" />
                {/* Hands on flute */}
                <circle cx="129" cy="136" r="5.5" fill="url(#krishnaSkinGrad)" stroke="#4D2E20" strokeWidth="1.9" />
                <circle cx="161" cy="133" r="5.5" fill="url(#krishnaSkinGrad)" stroke="#4D2E20" strokeWidth="1.9" />
              </g>
            ) : krishnaPose === 'summon' ? (
              <g>
                {/* Left gentle resting hand */}
                <path
                  d="M123 121 C107 128 106 144 120 152"
                  stroke="url(#krishnaSkinGrad)"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <path
                  d="M123 121 C107 128 106 144 120 152"
                  stroke="#4D2E20"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                {/* Right raised blessing/summoning arm */}
                <path
                  d="M169 121 C184 120 192 108 188 96"
                  stroke="url(#krishnaSkinGrad)"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <path
                  d="M169 121 C184 120 192 108 188 96"
                  stroke="#4D2E20"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <circle cx="188" cy="95" r="6" fill="url(#krishnaSkinGrad)" stroke="#4D2E20" strokeWidth="1.9" />
                <circle cx="122" cy="153" r="5.5" fill="url(#krishnaSkinGrad)" stroke="#4D2E20" strokeWidth="1.9" />
              </g>
            ) : (
              /* Default Namaste / Anjali Mudra Pose (Matching Reference Artwork) */
              <g>
                {/* Left Arm + Gold Armband & Bangle */}
                <path
                  d="M123 122 C108 128 108 148 139 144"
                  stroke="url(#krishnaSkinGrad)"
                  strokeWidth="12.5"
                  strokeLinecap="round"
                />
                <path
                  d="M123 122 C108 128 108 148 139 144"
                  stroke="#4D2E20"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <rect x="111" y="127" width="11" height="4" rx="2" transform="rotate(-18 116 129)" fill="url(#goldOrnamentGrad)" stroke="#4D2E20" strokeWidth="1.4" />

                {/* Right Arm + Gold Armband & Bangle */}
                <path
                  d="M169 122 C184 128 184 148 153 144"
                  stroke="url(#krishnaSkinGrad)"
                  strokeWidth="12.5"
                  strokeLinecap="round"
                />
                <path
                  d="M169 122 C184 128 184 148 153 144"
                  stroke="#4D2E20"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <rect x="170" y="127" width="11" height="4" rx="2" transform="rotate(18 175 129)" fill="url(#goldOrnamentGrad)" stroke="#4D2E20" strokeWidth="1.4" />

                {/* Pressed Namaste Hands */}
                <path
                  d="M141 149 C139 140 143 130 146 128 C149 130 153 140 151 149 Z"
                  fill="url(#krishnaSkinGrad)"
                  stroke="#4D2E20"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <line x1="146" y1="129" x2="146" y2="148" stroke="#4D2E20" strokeWidth="1.5" />
                {/* Wrist bangles */}
                <path d="M135 142 V150 M157 142 V150" stroke="url(#goldOrnamentGrad)" strokeWidth="3.5" strokeLinecap="round" />
              </g>
            )}

            {/* Large Cartoon Chibi Head */}
            <g
              style={{
                transformOrigin: '146px 90px',
                animation: shouldReduceMotion ? 'none' : 'headTiltSway 4.6s ease-in-out infinite',
              }}
            >
              {/* Iridescent Peacock Feather */}
              <g
                style={{
                  transformOrigin: '158px 34px',
                  animation: shouldReduceMotion ? 'none' : 'featherBob 3.2s ease-in-out infinite',
                }}
              >
                <path d="M156 36 Q165 18 184 14" stroke="#2D7B43" strokeWidth="2.5" strokeLinecap="round" />
                <path
                  d="M158 34 C160 16 178 4 196 4 C194 20 179 34 158 34 Z"
                  fill="#3B9B56"
                  stroke="#275B34"
                  strokeWidth="1.6"
                />
                <ellipse cx="177" cy="18" rx="9" ry="6.2" transform="rotate(-24 177 18)" fill="#245AA4" />
                <ellipse cx="178" cy="18" rx="5.5" ry="3.8" transform="rotate(-24 178 18)" fill="#F3BA34" />
                <circle cx="178" cy="18" r="2.4" fill="#291B18" />
                <circle cx="179" cy="17" r="0.9" fill="#FFFFFF" fillOpacity="0.85" />
              </g>

              {/* Topknot Hair Bun + Gold Pearl Band */}
              <ellipse cx="146" cy="31" rx="16" ry="12" fill="url(#hairChestnutGrad)" stroke="#4D2E20" strokeWidth="2.2" />
              <path
                d="M130 37 Q146 41 162 37"
                stroke="url(#goldOrnamentGrad)"
                strokeWidth="5.5"
                strokeLinecap="round"
                strokeDasharray="1 5"
              />

              {/* Back Hair Volume */}
              <path
                d="M106 86 C100 62 115 37 146 37 C177 37 192 62 186 86 C192 94 189 107 180 112 C170 118 122 118 112 112 C103 107 100 94 106 86 Z"
                fill="url(#hairChestnutGrad)"
                stroke="#4D2E20"
                strokeWidth="2.4"
              />

              {/* Cute Blue Ears + Gold Jhumka Drop Earrings */}
              <circle cx="107" cy="92" r="7.5" fill="url(#krishnaSkinGrad)" stroke="#4D2E20" strokeWidth="2.1" />
              <circle cx="185" cy="92" r="7.5" fill="url(#krishnaSkinGrad)" stroke="#4D2E20" strokeWidth="2.1" />
              <path d="M105 99 L101 107 L109 107 Z" fill="url(#goldOrnamentGrad)" stroke="#4D2E20" strokeWidth="1.4" />
              <path d="M187 99 L183 107 L191 107 Z" fill="url(#goldOrnamentGrad)" stroke="#4D2E20" strokeWidth="1.4" />
              <circle cx="105" cy="98" r="2.6" fill="url(#goldOrnamentGrad)" stroke="#4D2E20" strokeWidth="1.3" />
              <circle cx="187" cy="98" r="2.6" fill="url(#goldOrnamentGrad)" stroke="#4D2E20" strokeWidth="1.3" />

              {/* Soft Round Blue Face */}
              <path
                d="M111 82 C111 58 126 48 146 48 C166 48 181 58 181 82 C181 104 166 116 146 116 C126 116 111 104 111 82 Z"
                fill="url(#krishnaSkinGrad)"
                stroke="#4D2E20"
                strokeWidth="2.4"
              />

              {/* Fluffy Framing Hair Bangs & Cheek Curls (Reference Silhouette) */}
              <path
                d="M107 82 C108 55 124 41 146 41 C168 41 184 55 185 82 C180 71 174 62 164 59 C155 57 151 64 146 66 C141 64 137 57 128 59 C118 62 112 71 107 82 Z"
                fill="url(#hairChestnutGrad)"
                stroke="#4D2E20"
                strokeWidth="2.1"
              />
              {/* Side curl flicks */}
              <path d="M111 94 Q103 98 106 104" stroke="#4D2E20" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M181 94 Q189 98 186 104" stroke="#4D2E20" strokeWidth="2.2" strokeLinecap="round" />

              {/* Red & White U-Shaped Vaishnav Tilak */}
              <path
                d="M141 56 V69 C141 72 146 74 146 74 C146 74 151 72 151 69 V56"
                stroke="#FFFDF9"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <path d="M146 58 V70" stroke="#DE4436" strokeWidth="2" strokeLinecap="round" />
              <circle cx="146" cy="76.5" r="1.4" fill="#FFFDF9" />

              {/* Soft Eyebrows */}
              <path d="M120 79 Q127 75 134 79" stroke="#4D2E20" strokeWidth="2" strokeLinecap="round" />
              <path d="M158 79 Q165 75 172 79" stroke="#4D2E20" strokeWidth="2" strokeLinecap="round" />

              {/* Serene Closed Happy Eyes with Cute Lashes (Reference Expression) */}
              <g
                style={{
                  transformOrigin: '146px 88px',
                  animation: shouldReduceMotion ? 'none' : 'naturalBlink 4.5s ease-in-out infinite',
                }}
              >
                <path d="M119 88 Q127 93 135 88" stroke="#4D2E20" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M119 89 L116 91 M123 91 L121 93" stroke="#4D2E20" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M157 88 Q165 93 173 88" stroke="#4D2E20" strokeWidth="2.6" strokeLinecap="round" />
                <path d="M173 89 L176 91 M169 91 L171 93" stroke="#4D2E20" strokeWidth="1.5" strokeLinecap="round" />
              </g>

              {/* Soft Gradient Blush Cheeks */}
              <ellipse cx="122" cy="98" rx="8.5" ry="5.5" fill="url(#blushPinkGrad)" />
              <ellipse cx="170" cy="98" rx="8.5" ry="5.5" fill="url(#blushPinkGrad)" />

              {/* Cute Button Nose & Gentle Smile */}
              <path d="M143.5 96 Q146 99 148.5 96" stroke="#4D2E20" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M139 104 Q146 109 153 104" stroke="#4D2E20" strokeWidth="2.1" strokeLinecap="round" />
            </g>
          </g>

          {/* ==============================================================
              COMPANION B: RANDOMLY SUMMONED SHRI RADHA RANI (Right Side)
              ============================================================== */}
          <g
            style={{
              opacity: showRadha ? 1 : 0,
              transform: showRadha
                ? 'translate(0px, 0px) scale(1)'
                : 'translate(22px, 8px) scale(0.82)',
              transformOrigin: '224px 168px',
              transition: shouldReduceMotion
                ? 'none'
                : 'opacity 0.65s ease, transform 0.65s cubic-bezier(0.28, 0.11, 0.32, 1)',
            }}
          >
            <g
              style={{
                transformOrigin: '224px 160px',
                animation: shouldReduceMotion ? 'none' : 'radhaGentleSway 4.8s ease-in-out infinite',
              }}
            >
              {/* Soft Contact Shadow for Radha Rani */}
              <ellipse cx="224" cy="189" rx="34" ry="5.5" fill="url(#groundShadowGrad)" />

              {/* Pastel Rose-Magenta Lehenga Skirt */}
              <path
                d="M196 168 C191 174 191 185 202 187 C216 190 236 190 248 187 C257 184 257 174 250 167 L238 150 H210 Z"
                fill="url(#radhaLehengaGrad)"
                stroke="#4D2E20"
                strokeWidth="2.1"
                strokeLinejoin="round"
              />
              {/* Golden trim along lehenga */}
              <path d="M196 184 Q224 189 252 184" stroke="url(#goldOrnamentGrad)" strokeWidth="2.6" strokeLinecap="round" />

              {/* Choli Blouse + Gold Necklace */}
              <path
                d="M210 124 C207 134 207 144 210 151 H238 C241 144 241 134 238 124 Z"
                fill="url(#radhaLehengaGrad)"
                stroke="#4D2E20"
                strokeWidth="2.1"
              />
              {/* Sheer Golden-Trimmed Veil (Odhani) */}
              <path
                d="M204 80 C193 96 194 134 202 158 C210 156 212 135 212 118"
                fill="#FFE1AF"
                fillOpacity="0.62"
                stroke="#EAA82B"
                strokeWidth="1.5"
              />
              <path
                d="M244 80 C256 98 256 138 248 162 C239 158 237 136 236 118"
                fill="#FFE1AF"
                fillOpacity="0.62"
                stroke="#EAA82B"
                strokeWidth="1.5"
              />

              {/* Gracefully Folded Hands Holding a Pink Lotus */}
              <path
                d="M210 128 C201 134 204 146 221 145"
                stroke="url(#radhaSkinGrad)"
                strokeWidth="9.5"
                strokeLinecap="round"
              />
              <path
                d="M238 128 C247 134 244 146 227 145"
                stroke="url(#radhaSkinGrad)"
                strokeWidth="9.5"
                strokeLinecap="round"
              />
              <path
                d="M210 128 C201 134 204 146 221 145 M238 128 C247 134 244 146 227 145"
                stroke="#4D2E20"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
              {/* Tiny Pink Lotus Flower */}
              <path
                d="M224 135 C220 140 220 146 224 147 C228 146 228 140 224 135 Z"
                fill="#F98FB4"
                stroke="#4D2E20"
                strokeWidth="1.3"
              />
              <path
                d="M224 146 C217 144 216 139 220 137 M224 146 C231 144 232 139 228 137"
                fill="#F98FB4"
                stroke="#4D2E20"
                strokeWidth="1.3"
              />

              {/* Radha Rani's Chibi Head */}
              <g>
                {/* Flowing Dark Hair & White Jasmine Gajra */}
                <path
                  d="M196 95 C193 74 205 58 224 58 C243 58 255 74 252 95 C255 106 248 117 240 120 H208 C200 117 193 106 196 95 Z"
                  fill="url(#hairChestnutGrad)"
                  stroke="#4D2E20"
                  strokeWidth="2.1"
                />
                {/* Flower Gajra Band */}
                <path
                  d="M203 70 Q224 59 245 70"
                  stroke="#FFFDF9"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="1 5.5"
                />

                {/* Face */}
                <circle
                  cx="224"
                  cy="93"
                  r="23"
                  fill="url(#radhaSkinGrad)"
                  stroke="#4D2E20"
                  strokeWidth="2.1"
                />
                {/* Soft Parted Hair Framing Face */}
                <path
                  d="M201 91 C202 74 212 67 224 72 C236 67 246 74 247 91 C242 82 234 77 224 79 C214 77 206 82 201 91 Z"
                  fill="url(#hairChestnutGrad)"
                  stroke="#4D2E20"
                  strokeWidth="1.9"
                />

                {/* Golden Maang Tikka & Red Kumkum Bindi */}
                <line x1="224" y1="71" x2="224" y2="79" stroke="#EAA82B" strokeWidth="1.8" />
                <circle cx="224" cy="80" r="2.6" fill="#DE4436" stroke="#EAA82B" strokeWidth="1.2" />

                {/* Serene Happy Eyes + Lashes */}
                <path d="M209 94 Q214 98 219 94" stroke="#4D2E20" strokeWidth="2.1" strokeLinecap="round" />
                <path d="M229 94 Q234 98 239 94" stroke="#4D2E20" strokeWidth="2.1" strokeLinecap="round" />

                {/* Soft Rose Cheeks & Nose Ring (Nath) */}
                <ellipse cx="209" cy="101" rx="5.5" ry="3.5" fill="url(#blushPinkGrad)" />
                <ellipse cx="239" cy="101" rx="5.5" ry="3.5" fill="url(#blushPinkGrad)" />
                <circle cx="226.5" cy="101.5" r="2.2" stroke="#EAA82B" strokeWidth="1.4" fill="none" />

                {/* Warm Smile */}
                <path d="M219 105 Q224 109 229 105" stroke="#4D2E20" strokeWidth="1.8" strokeLinecap="round" />

                {/* Tiny Gold Earrings */}
                <circle cx="200" cy="100" r="2.4" fill="url(#goldOrnamentGrad)" stroke="#4D2E20" strokeWidth="1.2" />
                <circle cx="248" cy="100" r="2.4" fill="url(#goldOrnamentGrad)" stroke="#4D2E20" strokeWidth="1.2" />
              </g>
            </g>
          </g>
        </svg>
      </button>
    </div>
  );
};
