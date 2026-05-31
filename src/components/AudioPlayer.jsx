import { useState, useEffect, useRef } from 'react'
import { Volume2, Square, Loader2, Settings, X } from 'lucide-react'
import {
  hasOpenAI, speakWithOpenAI, OPENAI_VOICES,
  hasElevenLabs, speakWithElevenLabs, ELEVENLABS_VOICES,
  speakWithKokoro, KOKORO_VOICES,
} from '../lib/ttsService'

const ENGINES = [
  { id: 'kokoro',     label: '🆓 Kokoro',     note: 'Grátis — PT-BR nativo' },
  { id: 'elevenlabs', label: '🎙 ElevenLabs', note: '10k chars/mês grátis' },
  { id: 'openai',     label: '✨ OpenAI',     note: 'Pago (barato)' },
  { id: 'browser',    label: '🔊 Sistema',    note: 'Vozes do navegador' },
]

export default function AudioPlayer({ text, compact = false }) {
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadMsg, setLoadMsg] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  const [engine, setEngine] = useState(() =>
    hasElevenLabs() ? 'elevenlabs' : hasOpenAI() ? 'openai' : 'kokoro'
  )
  const [openaiVoice, setOpenaiVoice] = useState('nova')
  const [elevenlabsVoice, setElevenlabsVoice] = useState('EXAVITQu4vr4xnSDxMaL')
  const [kokoroVoice, setKokoroVoice] = useState('pf_dora')
  const [browserVoices, setBrowserVoices] = useState([])
  const [browserVoice, setBrowserVoice] = useState(null)
  const [rate, setRate] = useState(1.0)

  const audioElRef = useRef(null)
  const uttRef = useRef(null)

  useEffect(() => {
    const load = () => {
      const all = window.speechSynthesis.getVoices()
      const pt = all.filter(v => v.lang.startsWith('pt'))
      setBrowserVoices([...pt, ...all.filter(v => !v.lang.startsWith('pt'))])
      if (!browserVoice && pt.length > 0) setBrowserVoice(pt[0])
    }
    load()
    window.speechSynthesis.onvoiceschanged = load
    return () => { stop() }
  }, [])

  const stop = () => {
    window.speechSynthesis.cancel()
    if (audioElRef.current) { audioElRef.current.pause(); audioElRef.current = null }
    setPlaying(false); setLoading(false); setLoadMsg('')
  }

  const playUrl = async (url) => {
    const audio = new Audio(url)
    audio.onended = () => { setPlaying(false); URL.revokeObjectURL(url) }
    audio.onerror = () => { setPlaying(false); setLoading(false) }
    audioElRef.current = audio
    await audio.play()
    setLoading(false); setPlaying(true)
  }

  const play = async () => {
    if (playing || loading) { stop(); return }
    setLoading(true); setLoadMsg('')
    try {
      if (engine === 'openai') {
        await playUrl(await speakWithOpenAI(text, openaiVoice, rate))
      } else if (engine === 'elevenlabs') {
        await playUrl(await speakWithElevenLabs(text, elevenlabsVoice, rate))
      } else if (engine === 'kokoro') {
        setLoadMsg('Carregando modelo...')
        await speakWithKokoro(text, kokoroVoice, rate, msg => setLoadMsg(msg || ''))
        setLoading(false); setPlaying(false)
      } else {
        setLoading(false)
        const utt = new SpeechSynthesisUtterance(text)
        utt.lang = browserVoice?.lang || 'pt-BR'; utt.rate = rate
        if (browserVoice) utt.voice = browserVoice
        utt.onend = () => setPlaying(false); utt.onerror = () => setPlaying(false)
        uttRef.current = utt; window.speechSynthesis.speak(utt); setPlaying(true)
      }
    } catch (e) { console.error('[AudioPlayer]', e.message); setLoading(false); setLoadMsg('') }
  }

  const voices = engine === 'openai' ? OPENAI_VOICES
    : engine === 'elevenlabs' ? ELEVENLABS_VOICES
    : engine === 'kokoro' ? KOKORO_VOICES
    : browserVoices.map(v => ({ id: v.name, name: v.name, desc: v.lang }))

  const currentVoice = engine === 'openai' ? openaiVoice
    : engine === 'elevenlabs' ? elevenlabsVoice
    : engine === 'kokoro' ? kokoroVoice
    : (browserVoice?.name || '')

  const setVoice = (id) => {
    if (engine === 'openai') setOpenaiVoice(id)
    else if (engine === 'elevenlabs') setElevenlabsVoice(id)
    else if (engine === 'kokoro') setKokoroVoice(id)
    else { const v = browserVoices.find(v => v.name === id); if (v) setBrowserVoice(v) }
    if (playing || loading) stop()
  }

  return (
    <div className="relative inline-flex items-center gap-1">
      {/* Play/Stop */}
      <button onClick={play}
        className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
          playing ? 'bg-[#B80E02] text-white border-[#B80E02]'
          : loading ? 'bg-purple-400 text-white border-purple-400 cursor-wait'
          : 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-purple-500 hover:text-purple-600'
        }`}>
        {loading
          ? <><Loader2 size={9} className="animate-spin" /><span className="max-w-[90px] truncate">{loadMsg || 'Gerando...'}</span></>
          : playing ? <><Square size={9} /> Parar</>
          : <><Volume2 size={10} /> Ouvir</>}
      </button>

      {/* Settings */}
      <button onClick={() => setShowSettings(v => !v)}
        className="p-1 rounded text-gray-400 hover:text-purple-500 transition-colors" title="Configurar voz">
        {showSettings ? <X size={11} /> : <Settings size={11} />}
      </button>

      {/* Painel */}
      {showSettings && (
        <div className="absolute top-full left-0 mt-1 z-30 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl p-3 w-68 space-y-3" style={{minWidth:'260px'}}>
          {/* Engine */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Motor</p>
            <div className="grid grid-cols-2 gap-1">
              {ENGINES.map(eng => {
                const disabled = (eng.id === 'openai' && !hasOpenAI()) || (eng.id === 'elevenlabs' && !hasElevenLabs())
                return (
                  <button key={eng.id} onClick={() => { if (!disabled) { setEngine(eng.id); stop() } }}
                    disabled={disabled} title={disabled ? 'Chave não configurada' : eng.note}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-medium text-left border transition-colors ${
                      engine === eng.id ? 'bg-purple-600 text-white border-purple-600'
                      : disabled ? 'opacity-40 cursor-not-allowed border-gray-200 dark:border-gray-600 text-gray-400'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-purple-400 hover:text-purple-600'
                    }`}>
                    {eng.label}
                  </button>
                )
              })}
            </div>
          </div>
          {/* Voz */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Locutor</p>
            <select value={currentVoice} onChange={e => setVoice(e.target.value)}
              className="w-full text-[10px] border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300 focus:outline-none focus:border-purple-500">
              {voices.map(v => <option key={v.id} value={v.id}>{v.name}{v.desc ? ` — ${v.desc}` : ''}</option>)}
            </select>
          </div>
          {/* Velocidade */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Velocidade</p>
            <div className="flex gap-1">
              {[0.75, 1.0, 1.25, 1.5].map(r => (
                <button key={r} onClick={() => { setRate(r); if (playing || loading) stop() }}
                  className={`flex-1 text-[10px] py-1 rounded font-semibold transition-colors ${
                    rate === r ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-purple-100'
                  }`}>{r}×</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
