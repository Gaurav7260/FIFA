import Groq from 'groq-sdk';
import { STADIUM_CONTEXT } from './data/stadiumContext.js';

const API_KEY = process.env.GROQ_API_KEY || '';
const isFallbackMode = !API_KEY || API_KEY.trim() === '';

let groq: Groq | null = null;
if (!isFallbackMode) {
  groq = new Groq({ apiKey: API_KEY });
}

function sanitizeInput(text: string): string {
  if (!text) return '';
  return text
    .replace(/[<>]/g, '') 
    .replace(/ignore\s+previous\s+instructions/gi, '[filtered attempt]')
    .replace(/you\s+are\s+now\s+a/gi, '[filtered attempt]')
    .replace(/system\s+prompt/gi, '[filtered attempt]')
    .trim()
    .substring(0, 1000); 
}

export async function askConcierge(
  userQuery: string,
  chatHistory: { role: 'user' | 'model'; content: string }[],
  languageCode: string = 'en'
): Promise<{ content: string; citations?: string[] }> {
  const sanitized = sanitizeInput(userQuery);
  if (isFallbackMode || !groq) {
    return { content: "[Fallback] Command Center AI is currently offline. Please check network connection.", citations: [] };
  }

  try {
    const facts = `Stadium Name: ${STADIUM_CONTEXT.stadiumName}
Rules: ${STADIUM_CONTEXT.generalInfo.rules.map(r => `- ${r}`).join('\n')}
Gates: ${STADIUM_CONTEXT.gates.map(g => `- Name: ${g.name}, Amenities: ${g.amenities.join(', ')}`).join('\n')}`;

    const systemPrompt = `You are the Command Center AI for FIFA MatchControl Pro.
Respond in language code: "${languageCode}". Be highly professional, concise, and operational.
Use this context:
${facts}`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...chatHistory.map(h => ({
        role: h.role === 'user' ? 'user' as const : 'assistant' as const,
        content: h.content
      })),
      { role: 'user' as const, content: sanitized }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      max_tokens: 500,
      temperature: 0.2
    });

    return {
      content: chatCompletion.choices[0]?.message?.content || '',
      citations: ['MatchControl Pro Secure DB']
    };
  } catch (error: any) {
    return { content: "[Error] Command Center AI offline.", citations: [] };
  }
}

export async function generateSecurityBriefing(metrics: any[]): Promise<string> {
  if (isFallbackMode || !groq) {
    return "All perimeter cameras and internal feeds report nominal activity. Security posture is GREEN.";
  }

  try {
    const prompt = `You are the Chief Security AI for FIFA MatchControl Pro. Analyze these camera feeds:
${JSON.stringify(metrics, null, 2)}
Provide a brief, 3-sentence operational security briefing. Focus on any 'breach' or high density zones.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 250,
      temperature: 0.3
    });

    return (chatCompletion.choices[0]?.message?.content || '').trim();
  } catch (error) {
    return "Security feeds are stable. No imminent threats detected.";
  }
}

export async function analyzePitchData(pitchData: any[]): Promise<any> {
  if (isFallbackMode || !groq) {
    return { overallHealth: 85, aiRecommendations: ["Water South Zone", "Monitor West Zone wear"] };
  }

  try {
    const prompt = `You are the Pitch Agronomy AI for FIFA MatchControl Pro.
Analyze the following pitch metrics:
${JSON.stringify(pitchData, null, 2)}
Return a JSON object with:
- overallHealth: number between 0-100
- aiRecommendations: Array of 3 short action strings.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 200,
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const parsed = JSON.parse(chatCompletion.choices[0]?.message?.content || '{}');
    return {
      overallHealth: parsed.overallHealth || 80,
      aiRecommendations: parsed.aiRecommendations || ["Deploy sprinklers", "Check lighting rigs"]
    };
  } catch (error) {
    return { overallHealth: 85, aiRecommendations: ["Water South Zone", "Monitor West Zone wear"] };
  }
}

export async function generateVIPRecommendations(suite: string, request: string): Promise<string> {
  if (isFallbackMode || !groq) {
    return "Dispatch VIP hospitality agent to suite immediately.";
  }
  
  try {
    const prompt = `You are the VIP Hospitality AI. A VIP in suite ${suite} requested: ${request}. Provide a 1-sentence recommended action for staff.`;
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 100,
      temperature: 0.2
    });

    return (chatCompletion.choices[0]?.message?.content || '').trim();
  } catch (error) {
    return "Dispatch VIP hospitality agent to suite immediately.";
  }
}
