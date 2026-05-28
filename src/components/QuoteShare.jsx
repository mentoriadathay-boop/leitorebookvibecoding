import { Share2, Download } from 'lucide-react'
import { useRef } from 'react'

export default function QuoteShare({ quote }) {
  const canvasRef = useRef(null)

  const generate = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 800, H = 420
    canvas.width = W
    canvas.height = H

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, '#0F4A28')
    grad.addColorStop(1, '#1B6B3A')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // Gold accent bar
    ctx.fillStyle = '#C9A84C'
    ctx.fillRect(0, 0, 6, H)

    // Quote text
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'italic 600 24px Georgia, serif'
    ctx.textAlign = 'left'

    const clean = quote.replace(/<[^>]+>/g, '')
    const words = clean.split(' ')
    const lines = []
    let line = ''
    const maxW = W - 120
    words.forEach(word => {
      const test = line ? `${line} ${word}` : word
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line)
        line = word
      } else {
        line = test
      }
    })
    if (line) lines.push(line)

    const startY = H / 2 - (lines.length * 34) / 2
    ctx.fillStyle = '#FFF'
    lines.forEach((l, i) => {
      ctx.fillText(`"${i === 0 ? '' : ''}${l}${i === lines.length - 1 ? '"' : ''}`, 60, startY + i * 38)
    })

    // Brand
    ctx.font = '500 16px sans-serif'
    ctx.fillStyle = '#C9A84C'
    ctx.textAlign = 'right'
    ctx.fillText('TFA Soluções com IA — thayanefidelis.com', W - 40, H - 24)

    // Download
    const link = document.createElement('a')
    link.download = 'citacao-vibe-coding.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      <button
        onClick={generate}
        className="ml-2 inline-flex items-center gap-1 text-[10px] text-[#C9A84C] hover:text-yellow-600 transition-colors opacity-70 hover:opacity-100"
        title="Baixar imagem desta citação"
      >
        <Download size={11} />
        Compartilhar
      </button>
    </>
  )
}
