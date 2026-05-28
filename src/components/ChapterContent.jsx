import { useState, useRef, useEffect, useCallback } from 'react'
import { Clock, FileText, Focus, ChevronLeft, ChevronRight, Highlighter, X } from 'lucide-react'
import AudioPlayer from './AudioPlayer'
import QuoteShare from './QuoteShare'
import Quiz from './Quiz'
import ChapterChat from './ChapterChat'
import { glossary } from '../data/glossary'
import { useHighlights } from '../hooks/useHighlights'

function injectGlossary(html, terms) {
  if (!terms?.length) return html
  let result = html
  terms.forEach(term => {
    if (!glossary[term]) return
    const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const rx = new RegExp(`(<[^>]*>[^<]*)(${esc})([^<]*<\/[^>]+>|[^<]*)`, 'g')
    result = result.replace(
      new RegExp(`(?<=>[^<]*|^(?!<))(${esc})(?=[^>]*<|[^<]*$)`, 'g'),
      `<span class="glossary-term" data-term="${term}">$1</span>`
    )
  })
  return result
}

function ContentRenderer({ html, terms, focusMode, focusIndex }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    // Glossary tooltips
    ref.current.querySelectorAll('[data-term]').forEach(el => {
      el.title = glossary[el.dataset.term] || ''
    })
  }, [html])

  // Parse HTML and add focus classes
  const processedHtml = (() => {
    if (!focusMode) return html
    // Wrap each top-level <p> in a span with para-item class
    return html.replace(/<p(\s[^>]*)?>/gi, (m, attrs) => {
      return `<p${attrs || ''} class="para-item"`
    })
  })()

  useEffect(() => {
    if (!ref.current || !focusMode) return
    const paras = ref.current.querySelectorAll('.para-item')
    paras.forEach((p, i) => {
      if (i === focusIndex) {
        p.classList.add('focused-para')
      } else {
        p.classList.remove('focused-para')
      }
    })
  }, [focusMode, focusIndex, html])

  return (
    <div
      ref={ref}
      className={`chapter-content text-[14.5px] dark:text-gray-200 ${focusMode ? 'focus-mode-active' : ''}`}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
      onClick={(e) => {
        // Handle glossary tooltip clicks
        const term = e.target.dataset?.term
        if (term) {
          const def = glossary[term]
          if (def) {
            e.target.title = def
          }
        }
      }}
    />
  )
}

export default function ChapterContent({ chapter, chapterIndex = 0, onNext, onPrev, hasNext, hasPrev, onChapterRead }) {
  const [focusMode, setFocusMode] = useState(false)
  const [focusIndex, setFocusIndex] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [paraCount, setParaCount] = useState(0)
  const [tooltip, setTooltip] = useState(null) // { x, y, text }
  const contentRef = useRef(null)
  const { highlights, add: addHighlight, remove: removeHighlight } = useHighlights(chapterIndex)

  useEffect(() => {
    setFocusMode(false)
    setFocusIndex(0)
    setShowQuiz(false)
    setTooltip(null)
    const div = document.createElement('div')
    div.innerHTML = chapter.content
    setParaCount(div.querySelectorAll('p').length)
  }, [chapter.id])

  const handleMouseUp = useCallback((e) => {
    const selection = window.getSelection()
    const text = selection?.toString().trim()
    if (!text || text.length < 5) { setTooltip(null); return }
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const containerRect = contentRef.current?.getBoundingClientRect()
    if (!containerRect) return
    setTooltip({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 8,
      text,
    })
  }, [])

  const handleHighlight = () => {
    if (!tooltip) return
    addHighlight(tooltip.text)
    setTooltip(null)
    window.getSelection()?.removeAllRanges()
  }

  const advanceFocus = () => {
    setFocusIndex(i => {
      const next = i + 1
      if (next >= paraCount) {
        setFocusMode(false)
        return 0
      }
      return next
    })
  }

  // Apply highlights to html
  const applyHighlights = (html) => {
    let result = html
    highlights.forEach(text => {
      if (!text || text.length < 5) return
      const esc = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      result = result.replace(
        new RegExp(`(${esc})`, 'g'),
        '<mark class="chapter-highlight">$1</mark>'
      )
    })
    return result
  }

  // Process content with glossary spans
  const processedContent = (() => {
    let html = chapter.content
    if (!chapter.glossaryTerms?.length) return html
    chapter.glossaryTerms.forEach(term => {
      if (!glossary[term]) return
      const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      // Only replace first occurrence outside tags
      const rx = new RegExp(`(>[^<]*)\\b(${esc})\\b`, '')
      html = html.replace(rx, `$1<span class="glossary-term" data-term="${term}">$2</span>`)
    })
    return html
  })()

  // Inject QuoteShare into blockquotes
  const contentWithShares = processedContent.replace(
    /<blockquote>([\s\S]*?)<\/blockquote>/g,
    (match, inner) => {
      return `<blockquote>${inner}<span data-quote-share="${encodeURIComponent(inner.replace(/<[^>]+>/g, ''))}"></span></blockquote>`
    }
  )

  const finalContent = applyHighlights(processedContent)

  return (
    <article className="max-w-2xl mx-auto px-1" ref={contentRef} onMouseUp={handleMouseUp}>
      {/* Chapter header */}
      <div className="mb-6">
        <span className="inline-block text-[11px] uppercase tracking-widest font-bold text-[#B91C1C] dark:text-red-400 mb-2">
          {chapter.tag}
        </span>
        <h1 className="font-playfair text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-3">
          {chapter.title}
        </h1>
        <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500 mb-4">
          <span className="flex items-center gap-1"><Clock size={12} /> {chapter.readingTime} min de leitura</span>
          <span className="flex items-center gap-1"><FileText size={12} /> Página {chapter.page}</span>
        </div>
        <div className="h-px bg-gradient-to-r from-[#B91C1C] via-[#C9A84C] to-transparent mb-5 opacity-60" />
      </div>

      {/* Audio player */}
      <AudioPlayer text={chapter.content} />

      {/* Focus mode toggle */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => {
            if (focusMode) { setFocusMode(false); setFocusIndex(0) }
            else { setFocusMode(true); setFocusIndex(0) }
          }}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
            focusMode
              ? 'bg-[#C9A84C] text-white border-[#C9A84C]'
              : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-[#C9A84C]'
          }`}
        >
          <Focus size={12} />
          {focusMode ? 'Saindo do modo foco' : 'Modo Foco'}
        </button>
        {focusMode && (
          <button
            onClick={advanceFocus}
            className="text-xs px-3 py-1.5 rounded-full bg-[#0F4A28] text-white"
          >
            Próximo parágrafo →
          </button>
        )}
      </div>

      {/* Highlight tooltip */}
      {tooltip && (
        <div
          className="absolute z-40 -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <button
            onMouseDown={e => { e.preventDefault(); handleHighlight() }}
            className="flex items-center gap-1.5 text-xs bg-[#C9A84C] hover:bg-yellow-600 text-white px-3 py-1.5 rounded-full shadow-lg font-medium whitespace-nowrap"
          >
            <Highlighter size={11} /> Destacar
          </button>
        </div>
      )}

      {/* Chapter body */}
      <ContentRenderer
        html={finalContent}
        terms={chapter.glossaryTerms}
        focusMode={focusMode}
        focusIndex={focusIndex}
      />

      {/* Highlights panel */}
      {highlights.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/40 rounded-xl">
          <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Highlighter size={12} /> Meus destaques ({highlights.length})
          </p>
          <div className="space-y-2">
            {highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2 group">
                <span className="flex-1 text-xs text-gray-700 dark:text-gray-300 bg-yellow-100 dark:bg-yellow-900/20 px-2.5 py-1.5 rounded-lg leading-relaxed border-l-2 border-yellow-400">
                  "{h}"
                </span>
                <button onClick={() => removeHighlight(h)}
                  className="shrink-0 mt-1.5 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz button */}
      {chapter.quizQuestions?.length > 0 && !showQuiz && (
        <div className="my-6 p-4 bg-[#FDF6E3] dark:bg-yellow-900/20 rounded-xl border border-[#C9A84C]/30 text-center">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            Teste seus conhecimentos sobre este capítulo
          </p>
          <button
            onClick={() => setShowQuiz(true)}
            className="text-sm bg-[#C9A84C] hover:bg-yellow-600 text-white px-5 py-2 rounded-full transition-colors font-medium"
          >
            Testar conhecimento
          </button>
        </div>
      )}

      {showQuiz && (
        <div className="my-6">
          <Quiz questions={chapter.quizQuestions} onClose={() => setShowQuiz(false)} />
        </div>
      )}

      {/* Chapter Chat */}
      <ChapterChat chapter={chapter} />

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => { onPrev?.(); onChapterRead?.() }}
          disabled={!hasPrev}
          className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-[#1B6B3A] hover:text-[#1B6B3A] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={15} /> Anterior
        </button>
        <button
          onClick={() => { onNext?.(); onChapterRead?.() }}
          disabled={!hasNext}
          className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg bg-[#1B6B3A] hover:bg-[#0F4A28] text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Próximo <ChevronRight size={15} />
        </button>
      </div>
    </article>
  )
}
