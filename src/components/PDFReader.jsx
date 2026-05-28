import { useState, useEffect, useRef, useCallback } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Highlighter, X, Bookmark, BookOpen, List, Search
} from 'lucide-react'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const PAGE_KEY    = 'pdf_reader_page'
const HL_KEY      = 'pdf_reader_highlights'

const SCALES = [0.6, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]

function getHl()  { try { return JSON.parse(localStorage.getItem(HL_KEY) || '{}') } catch { return {} } }
function saveHl(h) { localStorage.setItem(HL_KEY, JSON.stringify(h)) }

export default function PDFReader() {
  const [numPages, setNumPages]       = useState(null)
  const [page, setPage]               = useState(() => parseInt(localStorage.getItem(PAGE_KEY) || '1', 10))
  const [scaleIdx, setScaleIdx]       = useState(2)           // 1.0 padrão
  const [highlights, setHighlights]   = useState(getHl)
  const [tooltip, setTooltip]         = useState(null)        // { x, y, text }
  const [showHl, setShowHl]           = useState(false)
  const [pageInput, setPageInput]     = useState('')
  const [loading, setLoading]         = useState(true)
  const containerRef                  = useRef(null)
  const [width, setWidth]             = useState(700)

  const scale = SCALES[scaleIdx]

  // Ajusta largura ao container
  useEffect(() => {
    const update = () => {
      if (containerRef.current) setWidth(containerRef.current.clientWidth - 32)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Salva página atual
  useEffect(() => {
    localStorage.setItem(PAGE_KEY, String(page))
  }, [page])

  // Navegação por teclado
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(page + 1)
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goTo(page - 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [page, numPages])

  const goTo = (p) => {
    if (!numPages) return
    setPage(Math.min(Math.max(1, p), numPages))
    setTooltip(null)
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Captura seleção de texto
  const handleMouseUp = useCallback((e) => {
    const sel  = window.getSelection()
    const text = sel?.toString().trim()
    if (!text || text.length < 4) { setTooltip(null); return }
    const range = sel.getRangeAt(0)
    const rect  = range.getBoundingClientRect()
    const wrap  = containerRef.current?.getBoundingClientRect()
    if (!wrap) return
    setTooltip({
      x: rect.left - wrap.left + rect.width / 2,
      y: rect.top  - wrap.top  - 8,
      text,
    })
  }, [])

  const addHighlight = () => {
    if (!tooltip) return
    const updated = {
      ...highlights,
      [page]: [...(highlights[page] || []), { text: tooltip.text, ts: Date.now() }],
    }
    setHighlights(updated)
    saveHl(updated)
    setTooltip(null)
    window.getSelection()?.removeAllRanges()
  }

  const removeHighlight = (pg, idx) => {
    const updated = { ...highlights, [pg]: highlights[pg].filter((_, i) => i !== idx) }
    if (!updated[pg].length) delete updated[pg]
    setHighlights(updated)
    saveHl(updated)
  }

  const totalHighlights = Object.values(highlights).reduce((s, arr) => s + arr.length, 0)
  const pageHighlights  = highlights[page] || []

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-2">
      {/* Header toolbar */}
      <div className="sticky top-16 z-30 bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-gray-700 flex items-center gap-2 px-3 py-2 flex-wrap shadow-sm rounded-t-xl mt-2">

        {/* Navegação */}
        <button onClick={() => goTo(page - 1)} disabled={page <= 1}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors">
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1.5">
          <input
            type="number" min={1} max={numPages || 1}
            value={pageInput || page}
            onFocus={() => setPageInput(String(page))}
            onChange={e => setPageInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { goTo(parseInt(pageInput)); setPageInput('') } }}
            onBlur={() => setPageInput('')}
            className="w-12 text-center text-xs border border-gray-200 dark:border-gray-600 rounded-lg py-1 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300"
          />
          <span className="text-xs text-gray-400 whitespace-nowrap">
            de {numPages || '—'}
          </span>
        </div>

        <button onClick={() => goTo(page + 1)} disabled={!numPages || page >= numPages}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors">
          <ChevronRight size={16} />
        </button>

        <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-1" />

        {/* Zoom */}
        <button onClick={() => setScaleIdx(i => Math.max(0, i - 1))} disabled={scaleIdx === 0}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors">
          <ZoomOut size={15} />
        </button>
        <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-center font-medium">
          {Math.round(scale * 100)}%
        </span>
        <button onClick={() => setScaleIdx(i => Math.min(SCALES.length - 1, i + 1))} disabled={scaleIdx === SCALES.length - 1}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors">
          <ZoomIn size={15} />
        </button>

        <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-1" />

        {/* Bookmark — ir para última página salva */}
        <div className="flex items-center gap-1 text-[11px] text-[#1B6B3A] dark:text-green-400 bg-[#E8F5EE] dark:bg-[#0F4A28]/20 px-2 py-1 rounded-full">
          <Bookmark size={11} />
          <span>Pág. {page} salva</span>
        </div>

        {/* Grifos */}
        <button onClick={() => setShowHl(v => !v)}
          className={`ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
            showHl
              ? 'bg-yellow-400 text-yellow-900'
              : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100'
          }`}>
          <Highlighter size={12} />
          Grifos {totalHighlights > 0 && `(${totalHighlights})`}
        </button>
      </div>

      {/* Painel de grifos */}
      {showHl && (
        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/40 rounded-xl p-4 mt-3">
          <p className="text-xs font-bold text-yellow-700 dark:text-yellow-400 mb-3 flex items-center gap-1.5">
            <Highlighter size={12} /> Meus grifos — {totalHighlights} no total
          </p>
          {totalHighlights === 0 ? (
            <p className="text-xs text-gray-400 italic">Selecione texto no PDF e clique "Grifar" para destacar trechos.</p>
          ) : (
            <div className="space-y-4 max-h-60 overflow-y-auto scrollbar-thin">
              {Object.entries(highlights).sort(([a], [b]) => Number(a) - Number(b)).map(([pg, items]) => (
                <div key={pg}>
                  <button onClick={() => goTo(Number(pg))}
                    className="text-[10px] font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-wider mb-1.5 hover:underline">
                    Página {pg}
                  </button>
                  <div className="space-y-1.5">
                    {items.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 group">
                        <span className="flex-1 text-xs text-gray-700 dark:text-gray-300 bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-1.5 rounded-lg border-l-2 border-yellow-400 leading-relaxed">
                          "{h.text}"
                        </span>
                        <button onClick={() => removeHighlight(Number(pg), i)}
                          className="shrink-0 mt-1.5 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Grifos desta página */}
      {!showHl && pageHighlights.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5 px-1">
          {pageHighlights.map((h, i) => (
            <span key={i} className="flex items-center gap-1 text-[11px] bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 px-2.5 py-1 rounded-full">
              <Highlighter size={10} />
              "{h.text.slice(0, 40)}{h.text.length > 40 ? '…' : ''}"
              <button onClick={() => removeHighlight(page, i)} className="text-yellow-500 hover:text-red-400 ml-0.5">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* PDF */}
      <div
        ref={containerRef}
        onMouseUp={handleMouseUp}
        className="relative mt-3 bg-gray-100 dark:bg-gray-900 rounded-xl overflow-auto flex flex-col items-center py-6 px-4 min-h-[70vh]"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {/* Tooltip de grifo */}
        {tooltip && (
          <div className="fixed z-50" style={{ left: tooltip.x + (containerRef.current?.getBoundingClientRect().left || 0), top: tooltip.y + (containerRef.current?.getBoundingClientRect().top || 0) - 40 }}>
            <button
              onMouseDown={e => { e.preventDefault(); addHighlight() }}
              className="flex items-center gap-1.5 text-xs bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-3 py-1.5 rounded-full shadow-lg font-semibold whitespace-nowrap -translate-x-1/2"
            >
              <Highlighter size={12} /> Grifar
            </button>
          </div>
        )}

        <Document
          file="/ebook-vibe-coding.pdf"
          onLoadSuccess={({ numPages }) => { setNumPages(numPages); setLoading(false) }}
          onLoadError={() => setLoading(false)}
          loading={
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F4A28] flex items-center justify-center animate-pulse">
                <BookOpen size={18} className="text-white" />
              </div>
              <p className="text-sm text-gray-400">Carregando PDF...</p>
            </div>
          }
        >
          <Page
            pageNumber={page}
            scale={scale}
            width={Math.min(width * scale, width)}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="shadow-2xl rounded-sm"
          />
        </Document>
      </div>

      {/* Rodapé de navegação */}
      <div className="flex items-center justify-between py-4 px-2">
        <button onClick={() => goTo(page - 1)} disabled={page <= 1}
          className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-[#1B6B3A] hover:text-[#1B6B3A] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <ChevronLeft size={15} /> Anterior
        </button>

        <span className="text-xs text-gray-400">
          Use ← → para navegar
        </span>

        <button onClick={() => goTo(page + 1)} disabled={!numPages || page >= numPages}
          className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-[#1B6B3A] hover:bg-[#0F4A28] text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          Próxima <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}
