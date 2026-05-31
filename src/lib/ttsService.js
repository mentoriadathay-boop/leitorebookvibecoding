const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''

export const OPENAI_VOICES = [
  { id: 'nova',    name: 'Nova',    desc: 'Feminina — clara e amigável',     gender: 'F' },
  { id: 'alloy',   name: 'Alloy',   desc: 'Neutra — equilibrada e versátil', gender: 'N' },
  { id: 'shimmer', name: 'Shimmer', desc: 'Feminina — suave e expressiva',   gender: 'F' },
  { id: 'echo',    name: 'Echo',    desc: 'Masculina — nítida e profissional',gender: 'M' },
  { id: 'onyx',    name: 'Onyx',    desc: 'Masculina — grave e imponente',   gender: 'M' },
  { id: 'fable',   name: 'Fable',   desc: 'Masculina — calorosa e narrativa',gender: 'M' },
]

export function hasOpenAI() {
  return !!OPENAI_KEY
}

export async function speakWithOpenAI(text, voiceId = 'nova', rate = 1.0) {
  if (!OPENAI_KEY) throw new Error('VITE_OPENAI_API_KEY não configurada')

  const speed = Math.min(Math.max(rate, 0.25), 4.0)

  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text.slice(0, 4096),
      voice: voiceId,
      speed,
      response_format: 'mp3',
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI TTS erro: ${res.status} — ${err.slice(0, 100)}`)
  }

  const blob = await res.blob()
  return URL.createObjectURL(blob)
}
