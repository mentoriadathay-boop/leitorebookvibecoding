import { useState, useEffect } from 'react'
import { Play, X, Video, Lock } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { isPremium } from '../lib/isPremium'
import { PremiumLockCorner } from './PremiumBadge'

// Extrai o ID do vídeo de URLs no formato:
// https://www.youtube.com/watch?v=XXXX
// https://youtu.be/XXXX
// https://www.youtube.com/embed/XXXX
// https://www.youtube.com/shorts/XXXX
function youtubeId(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1)
    if (u.hostname.includes('youtube.com')) {
      if (u.searchParams.get('v')) return u.searchParams.get('v')
      const parts = u.pathname.split('/').filter(Boolean)
      if (parts[0] === 'embed' || parts[0] === 'shorts') return parts[1]
    }
  } catch { /* ignore */ }
  return null
}

function thumb(id) {
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null
}

function VideoCard({ video, onPlay, userIsPremium }) {
  const id = youtubeId(video.url)
  const locked = video.is_premium && !userIsPremium
  const handleClick = () => {
    if (locked) window.open('https://api.whatsapp.com/message/EQIUEI67M7U2N1?autoload=1&app_absent=0', '_blank', 'noopener')
    else onPlay(video)
  }
  return (
    <button onClick={handleClick}
      className="group text-left bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col hover:border-[#5B2A6E] dark:hover:border-magic-light transition-colors relative">
      <div className="aspect-video bg-black relative overflow-hidden">
        {video.is_premium && <PremiumLockCorner />}
        {thumb(id) ? (
          <img src={thumb(id)} alt={video.title}
            className={`w-full h-full object-cover ${locked ? 'grayscale opacity-70' : ''}`} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <Video size={40} className="text-white/40" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
          <div className="w-12 h-12 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
            {locked
              ? <Lock size={20} className="text-[#5B2A6E]" />
              : <Play size={20} className="text-[#5B2A6E] fill-current translate-x-0.5" />}
          </div>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-[#5B2A6E] dark:group-hover:text-magic-light transition-colors">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{video.description}</p>
        )}
      </div>
    </button>
  )
}

function VideoModal({ video, onClose }) {
  const id = youtubeId(video?.url)
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])
  if (!video) return null
  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-4xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3 gap-4">
          <h3 className="font-playfair font-bold text-white text-base truncate">{video.title}</h3>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>
        <div className="aspect-video rounded-xl overflow-hidden bg-black">
          {id ? (
            <iframe
              src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-sm">URL do YouTube inválida</div>
          )}
        </div>
        {video.description && (
          <p className="text-xs text-white/80 mt-3 leading-relaxed">{video.description}</p>
        )}
      </div>
    </div>
  )
}

export default function YoutubeVideos({ profile }) {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(null)
  const userIsPremium = isPremium(profile)

  useEffect(() => {
    supabase
      .from('youtube_videos')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .then(({ data }) => { setVideos(data || []); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-[#5B2A6E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="w-14 h-14 rounded-2xl bg-[#F2E4FA] dark:bg-[#3E1B4D]/20 flex items-center justify-center mx-auto mb-4">
          <Video size={24} className="text-[#5B2A6E] dark:text-magic-light" />
        </div>
        <h3 className="font-playfair font-bold text-lg text-gray-900 dark:text-white mb-2">Nenhum vídeo disponível ainda</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Novos vídeos aparecerão aqui em breve.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {videos.map(v => <VideoCard key={v.id} video={v} onPlay={setPlaying} userIsPremium={userIsPremium} />)}
      </div>
      {playing && <VideoModal video={playing} onClose={() => setPlaying(null)} />}
    </>
  )
}
