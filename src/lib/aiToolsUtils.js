import { askAI } from './anthropicClient'

export function extractJSON(text) {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try { return JSON.parse(cleaned) } catch {}
  const match = text.match(/\{[\s\S]*\}/)
  if (match) { try { return JSON.parse(match[0]) } catch {} }
  return null
}

export async function callAIForJSON(userMessage, systemPrompt) {
  const raw = await askAI([{ role: 'user', content: userMessage }], systemPrompt)
  const result = extractJSON(raw)
  if (!result) throw new Error('A IA retornou um formato inválido. Por favor tente novamente.')
  return result
}
