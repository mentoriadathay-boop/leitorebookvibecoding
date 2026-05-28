import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Square, ChevronDown } from 'lucide-react'

const SPEEDS = [
  { label: '0.8×', value: 0.8 },
  { label: '1×',   value: 1.0 },
  { label: '1.25×', value: 1.25 },
  { label: '1.5×', value: 1.5 },
  { label: '2×',   value: 2.0 },
]

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function getPtVoices() {
  return window.speechSynthesis
    .getVoices()
    .filter(v => v.lang === 'pt-BR' || v.lang === 'pt_BR' || v.lang.startsWith('pt'))
}

function pickFemaleVoice(voices) {
  const femalePattern = /maria|francisca|luciana|vitoria|victoria|google português do brasil|google portuguese|female/i
  return voices.find(v => femalePattern.test(v.name)) || voices[0] || null
}

export default function AudioPlayer({ text }) {
  const [playing, setPlaying]   = useState(false)
  const [progress, setProgress] = useState(0)
  const [elapsed, setElapsed]   = useState(0)
  const [rate, setRate]         = useState(1.0)
  const [voices, setVoices]     = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)
  const intervalRef             = useRef(null)
  const estimatedSecondsRef     = useRef(1)

  const plainText      = stripHtml(text)
  const totalWords     = plainText.split(' ').length
  const estimatedSeconds = Math.ceil((totalWords / 150) * 60 / rate)
  estimatedSecondsRef.current = estimatedSeconds

  // Load voices — they may arrive async
  useEffect(() => {
    const load = () => {
      const list = getPtVoices()
      if (list.length === 0) return
      setVoices(list)
      setSelectedVoice(prev => prev ?? pickFemaleVoice(list))
    }
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [])

  useEffect(() => {
    window.speechSynthesis.cancel()
    clearInterval(intervalRef.current)
    setPlaying(false)
    setProgress(0)
    setElapsed(0)
  }, [text])

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel()
      clearInterval(intervalRef.current)
    }
  }, [])

  const startWithOptions = (r, voice) => {
    window.speechSynthesis.cancel()
    clearInterval(intervalRef.current)

    const utter = new SpeechSynthesisUtterance(plainText)
    utter.lang = 'pt-BR'
    utter.rate = r
    if (voice) {
      utter.voice = voice
      const femalePattern = /maria|francisca|luciana|vitoria|victoria|google português|female/i
      utter.pitch = femalePattern.test(voice.name) ? 1.0 : 1.15
    } else {
      utter.pitch = 1.15
    }

    utter.onstart = () => {
      setPlaying(true)
      setElapsed(0)
      setProgress(0)
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          const next = prev + 1
          setProgress(Math.min((next / estimatedSecondsRef.current) * 100, 99))
          return next
        })
      }, 1000)
    }
    utter.onend = () => {
      setPlaying(false)
      setProgress(100)
      clearInterval(intervalRef.current)
    }
    utter.onerror = () => {
      setPlaying(false)
      clearInterval(intervalRef.current)
    }

    window.speechSynthesis.speak(utter)
  }

  const handlePlay = () => {
    if (playing) {
      window.speechSynthesis.pause()
      setPlaying(false)
      clearInterval(intervalRef.current)
    } else if (progress > 0) {
      window.speechSynthesis.resume()
      setPlaying(true)
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          const next = prev + 1
          setProgress(Math.min((next / estimatedSecondsRef.current) * 100, 99))
          return next
        })
      }, 1000)
    } else {
      startWithOptions(rate, selectedVoice)
    }
  }

  const stop = () => {
    window.speechSynthesis.cancel()
    setPlaying(false)
    setProgress(0)
    setElapsed(0)
    clearInterval(intervalRef.current)
  }

  const changeRate = (newRate) => {
    setRate(newRate)
    if (playing) {
      stop()
      setTimeout(() => startWithOptions(newRate, selectedVoice), 30)
    }
  }

  const changeVoice = (voiceName) => {
    const voice = voices.find(v => v.name === voiceName) || null
    setSelectedVoice(voice)
    if (playing) {
      stop()
      setTimeout(() => startWithOptions(rate, voice), 30)
    }
  }

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="bg-[#E8F5EE] dark:bg-[#0F4A28]/30 rounded-xl p-3 my-4 border border-[#1B6B3A]/20 space-y-2">
      {/* Playback row */}
      <div className="flex items-center gap-3">
        <button
          onClick={handlePlay}
          className="w-9 h-9 rounded-full bg-[#1B6B3A] hover:bg-[#0F4A28] text-white flex items-center justify-center transition-colors shrink-0"
        >
          {playing ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
        </button>

        {progress > 0 && (
          <button
            onClick={stop}
            className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 flex items-center justify-center transition-colors shrink-0"
          >
            <Square size={11} />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="h-1.5 bg-white dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress}%`, background: 'linear-gradient(to right, #1B6B3A, #C9A84C)' }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-500 dark:text-gray-400">{fmt(elapsed)}</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">~{fmt(estimatedSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Speed row */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-[10px] text-gray-400 dark:text-gray-500 mr-1">Velocidade:</span>
        {SPEEDS.map(s => (
          <button
            key={s.value}
            onClick={() => changeRate(s.value)}
            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold transition-colors ${
              rate === s.value
                ? 'bg-[#1B6B3A] text-white'
                : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-[#1B6B3A] dark:hover:text-green-400'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Voice selector */}
      {voices.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">Voz:</span>
          <div className="relative flex-1 min-w-0">
            <select
              value={selectedVoice?.name ?? ''}
              onChange={e => changeVoice(e.target.value)}
              className="w-full text-[10px] appearance-none bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg pl-2.5 pr-6 py-1 text-gray-600 dark:text-gray-300 focus:outline-none focus:border-[#1B6B3A] cursor-pointer truncate"
            >
              {voices.map(v => (
                <option key={v.name} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {voices.length === 0 && (
        <p className="text-[10px] text-gray-400 dark:text-gray-500 italic">
          Nenhuma voz pt-BR encontrada neste navegador.
        </p>
      )}
    </div>
  )
}
