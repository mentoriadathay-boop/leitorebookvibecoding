import { useState, useRef } from 'react'
import { glossary } from '../data/glossary'

export default function GlossaryTooltip({ term, children }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  return (
    <span className="relative inline">
      <span
        ref={ref}
        className="glossary-term"
        onClick={() => setVisible(v => !v)}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children || term}
      </span>
      {visible && (
        <span
          className="absolute bottom-full left-0 z-50 w-64 p-3 text-xs bg-[#FDF6E3] dark:bg-gray-800 border border-[#C9A84C]/40 rounded-lg shadow-lg text-gray-700 dark:text-gray-200 fade-in"
          style={{ marginBottom: 6 }}
        >
          <strong className="text-[#0F4A28] dark:text-green-400 block mb-1">{term}</strong>
          {glossary[term]}
        </span>
      )}
    </span>
  )
}

export function processGlossaryTerms(html, terms) {
  if (!terms || !terms.length) return html
  let result = html
  terms.forEach(term => {
    const def = glossary[term]
    if (!def) return
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(?<!<[^>]*)(${escaped})(?![^<]*>)`, 'g')
    result = result.replace(
      regex,
      `<span class="glossary-term" data-term="${term}" title="${def}">$1</span>`
    )
  })
  return result
}
