import { useState, useEffect } from 'react'
import { Headphones, Play, Pause, ExternalLink } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

function AudiobookCard({ audiobook }) {
  const [playing, setPlaying] = useState(false)
  const [audio, setAudio] = useState(null)

  const toggle = () => {
    if (!audiobook.audio_url) return
    if (playing && audio) {
      audio.pause()
      setPlaying(false)
      return
    }
    if (!audio) {
      const a = new Audio(audiobook.audio_url)
      a.onended = () => setPlaying(false)
      a.onerror = () => setPlaying(false)
      setAudio(a)
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
  }

  useEffect(() => () => { if (audio) audio.pause() }, [audio])

  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
      <div className="aspect-square bg-gradient-to-br from-[#F2E4FA] to-[#FCE4F1] dark:from-[#3E1B4D]/40 dark:to-[#5B2A6E]/20 flex items-center justify-center overflow-hidden">
        {audiobook.cover_url ? (
          <img src={audiobook.cover_url} alt={`Capa de ${audiobook.title}`} className="w-full h-full object-cover" />
        ) : (
          <Headphones size={40} className="text-[#5B2A6E] dark:text-magic-light opacity-50" />
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-playfair font-bold text-sm text-gray-900 dark:text-white mb-1">{audiobook.title}</h3>
        {audiobook.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3 flex-1">{audiobook.description}</p>
        )}
        {audiobook.audio_url ? (
          <button onClick={toggle}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 mt-auto bg-[#5B2A6E] hover:bg-[#3E1B4D] text-white rounded-xl transition-colors">
            {playing ? <><Pause size={12} /> Pausar</> : <><Play size={12} /> Ouvir</>}
          </button>
        ) : audiobook.external_url ? (
          <a href={audiobook.external_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 mt-auto bg-[#5B2A6E] hover:bg-[#3E1B4D] text-white rounded-xl transition-colors">
            Ouvir <ExternalLink size={12} />
          </a>
        ) : (
          <span className="text-xs text-gray-400 mt-auto">Áudio indisponível</span>
        )}
      </div>
    </div>
  )
}

export default function Audiobooks() {
  const [audiobooks, setAudiobooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('audiobooks')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .then(({ data }) => { setAudiobooks(data || []); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-[#5B2A6E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (audiobooks.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="w-14 h-14 rounded-2xl bg-[#F2E4FA] dark:bg-[#3E1B4D]/20 flex items-center justify-center mx-auto mb-4">
          <Headphones size={24} className="text-[#5B2A6E] dark:text-magic-light" />
        </div>
        <h3 className="font-playfair font-bold text-lg text-gray-900 dark:text-white mb-2">Nenhum audiobook disponível ainda</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Novos audiobooks aparecerão aqui em breve.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {audiobooks.map(a => <AudiobookCard key={a.id} audiobook={a} />)}
    </div>
  )
}
