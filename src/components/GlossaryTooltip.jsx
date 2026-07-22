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
          className="absolute bottom-full left-0 z-50 w-64 p-3 text-xs bg-[#FFF6E0] dark:bg-gray-800 border border-[#F5B942]/40 rounded-lg shadow-lg text-gray-700 dark:text-gray-200 fade-in"
          style={{ marginBottom: 6 }}
        >
          <strong className="text-[#3E1B4D] dark:text-magic-light block mb-1">{term}</strong>
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
