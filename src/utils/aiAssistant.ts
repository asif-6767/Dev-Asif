import type { SiteData } from '../types/site';

const ASIF_SIGNALS = [
  'asif',
  'islam',
  'you',
  'your',
  'he',
  'his',
  'him',
  'assistant',
  'service',
  'services',
  'website',
  'web',
  'site',
  'portfolio',
  'landing',
  'ui',
  'ux',
  'bot',
  'bots',
  'telegram',
  'video',
  'short',
  'shorts',
  'reel',
  'reels',
  'tiktok',
  'youtube',
  'facebook',
  'instagram',
  'social',
  'account',
  'appeal',
  'recover',
  'recovery',
  'suspend',
  'report',
  'impersonat',
  'harass',
  'safety',
  'cyber',
  'journey',
  'timeline',
  '2024',
  '2025',
  '2026',
  '2027',
  'about',
  'who',
  'where',
  'location',
  'kushtia',
  'daulatpur',
  'bangladesh',
  'ssc',
  'education',
  'study',
  'computer science',
  'goal',
  'future',
  'contact',
  'support',
  'whatsapp',
  'email',
  'reach',
  'connect',
  'help',
  'custom',
  'project',
  'solution',
  'price',
  'cost',
  'charge',
  'fee',
  'hire',
  'work',
  'digital',
  'creator',
  'experience',
];

export function isQueryRelevant(query: string): boolean {
  const q = query.toLowerCase().trim();
  if (!q) return false;
  if (/^(hi|hello|hey|salam|assalamu|good\s+(morning|afternoon|evening)|greetings)\b/i.test(q)) {
    return true;
  }
  return ASIF_SIGNALS.some((sig) => q.includes(sig));
}

export function generateBuiltinReply(userMessage: string, siteData: SiteData): string {
  const q = userMessage.toLowerCase().trim();
  const { ai, profile, services, knowledgeBase } = siteData;

  if (/^(hi|hello|hey|assalamu|salam|good\s+(morning|afternoon|evening))\b[!. ]*$/i.test(q)) {
    return ai.welcomeMessage;
  }

  if (!isQueryRelevant(q)) {
    return ai.offTopicMessage;
  }

  if (/\b(price|pricing|cost|charge|fee|rate|budget|how much)\b/i.test(q)) {
    return 'Project pricing is not fixed on the website because each request has unique requirements. Please contact Asif directly via WhatsApp, Email, or the Support Contact Form with your project details.';
  }

  if (/\b(guarant|100%|promise|hack|crack|mass report)\b/i.test(q)) {
    return "Asif only provides lawful, authorized guidance through official platform channels. Recovery, appeal approval, or content removal depends strictly on each platform's review team and is never guaranteed.";
  }

  const tokens = q.split(/[^a-z0-9]+/).filter((t) => t.length >= 3);
  let bestScore = 0;
  let bestAnswer = '';

  for (const entry of knowledgeBase) {
    if (!entry.isActive) continue;
    let score = 0;
    const keywords = entry.keywords
      .toLowerCase()
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const topic = entry.topic.toLowerCase();

    for (const kw of keywords) {
      if (q.includes(kw)) {
        score += kw.includes(' ') ? 5 : 3;
      }
    }
    for (const tok of tokens) {
      if (topic.includes(tok)) score += 1.5;
      for (const kw of keywords) {
        if (kw.includes(tok)) score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestAnswer = entry.answerText;
    }
  }

  for (const srv of services) {
    if (!srv.isActive) continue;
    let score = 0;
    const title = srv.title.toLowerCase();
    const shortDesc = srv.shortDescription.toLowerCase();

    for (const tok of tokens) {
      if (title.includes(tok)) score += 3.5;
      if (shortDesc.includes(tok)) score += 1.2;
    }

    if (score > bestScore) {
      bestScore = score;
      const feats = srv.features.length ? ` Includes: ${srv.features.slice(0, 4).join(', ')}.` : '';
      bestAnswer = `${srv.title} — ${srv.fullDescription}${feats}`;
    }
  }

  if (/\b(where|location|live|from|kushtia|daulatpur|education|ssc|school|batch)\b/i.test(q) && bestScore < 4.5) {
    return `${profile.name} is based in ${profile.location}. He is an ${profile.education} student who began exploring digital technology in ${profile.startedYear}, with a long-term goal to pursue ${profile.futureGoal}.`;
  }

  if (bestScore >= 2.5 && bestAnswer) {
    return bestAnswer;
  }

  return ai.fallbackMessage;
}
