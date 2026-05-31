// ── OpenAI TTS ────────────────────────────────────────────────────────────────
const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY || ''

export function hasOpenAI() { return !!OPENAI_KEY }

export const OPENAI_VOICES = [
  { id: 'nova',    name: 'Nova',    desc: 'Feminina — clara e amigável' },
  { id: 'alloy',   name: 'Alloy',   desc: 'Neutra — equilibrada' },
  { id: 'shimmer', name: 'Shimmer', desc: 'Feminina — suave' },
  { id: 'echo',    name: 'Echo',    desc: 'Masculina — nítida' },
  { id: 'onyx',    name: 'Onyx',    desc: 'Masculina — grave' },
  { id: 'fable',   name: 'Fable',   desc: 'Masculina — narrativa' },
]

export async function speakWithOpenAI(text, voiceId = 'nova', rate = 1.0) {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'tts-1', input: text.slice(0, 4096), voice: voiceId, speed: Math.min(Math.max(rate, 0.25), 4.0), response_format: 'mp3' }),
  })
  if (!res.ok) throw new Error(`OpenAI TTS: ${res.status}`)
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

// ── ElevenLabs TTS (free tier: 10.000 chars/mês) ────────────────────────────
const ELEVENLABS_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || ''

export function hasElevenLabs() { return !!ELEVENLABS_KEY }

export const ELEVENLABS_VOICES = [
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam',    desc: 'Masculina — grave e profissional' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel',  desc: 'Feminina — calma e clara' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi',    desc: 'Feminina — expressiva' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella',   desc: 'Feminina — suave e amigável' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni',  desc: 'Masculina — bem modulada' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli',    desc: 'Feminina — energética' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh',    desc: 'Masculina — jovem e casual' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold',  desc: 'Masculina — forte' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam',     desc: 'Masculina — racional' },
]

export async function speakWithElevenLabs(text, voiceId = 'EXAVITQu4vr4xnSDxMaL', rate = 1.0) {
  const speed = Math.min(Math.max(rate, 0.5), 2.0)
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': ELEVENLABS_KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify({
      text: text.slice(0, 5000),
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75, speed },
    }),
  })
  if (!res.ok) throw new Error(`ElevenLabs TTS: ${res.status}`)
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}

// ── Kokoro-web (zero custo, roda no browser, PT-BR nativo) ────────────────────
let kokoroInstance = null
let kokoroLoading = false
const kokoroCallbacks = []

export const KOKORO_VOICES = [
  { id: 'pf_dora',    name: 'Dora',    desc: 'Feminina — Português Brasil',  lang: 'pt' },
  { id: 'pm_alex',    name: 'Alex',    desc: 'Masculina — Português Brasil', lang: 'pt' },
  { id: 'af_heart',   name: 'Heart',   desc: 'Feminina — Inglês (EN)',       lang: 'en-us' },
  { id: 'af_sky',     name: 'Sky',     desc: 'Feminina — Inglês (EN)',       lang: 'en-us' },
  { id: 'am_michael', name: 'Michael', desc: 'Masculina — Inglês (EN)',      lang: 'en-us' },
  { id: 'bf_emma',    name: 'Emma',    desc: 'Feminina — Inglês British',    lang: 'en-gb' },
]

export async function loadKokoro(onProgress) {
  if (kokoroInstance) return kokoroInstance

  if (kokoroLoading) {
    return new Promise((resolve) => kokoroCallbacks.push(resolve))
  }

  kokoroLoading = true
  onProgress?.('Baixando modelo de voz (~80MB)...')

  try {
    const { KokoroTTS } = await import('kokoro-js')
    onProgress?.('Inicializando...')
    kokoroInstance = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-ONNX', {
      dtype: 'q8',
      progress_callback: (p) => {
        if (p.status === 'downloading') {
          const pct = p.total ? Math.round((p.loaded / p.total) * 100) : 0
          onProgress?.(`Baixando modelo ${pct}%...`)
        }
      },
    })
    kokoroCallbacks.forEach(r => r(kokoroInstance))
    kokoroCallbacks.length = 0
    onProgress?.(null)
    return kokoroInstance
  } catch (e) {
    kokoroLoading = false
    kokoroInstance = null
    throw e
  }
}

export async function speakWithKokoro(text, voiceId = 'pf_dora', rate = 1.0, onProgress) {
  const tts = await loadKokoro(onProgress)
  const result = await tts.generate(text.slice(0, 3000), { voice: voiceId })

  // Reproduz via Web Audio API
  const ctx = new AudioContext()
  const buffer = ctx.createBuffer(1, result.audio.length, result.sampling_rate)
  buffer.copyToChannel(result.audio, 0)
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.playbackRate.value = rate
  source.connect(ctx.destination)

  return new Promise((resolve, reject) => {
    source.onended = () => { ctx.close(); resolve() }
    source.onerror = (e) => { ctx.close(); reject(e) }
    source.start()
  })
}
