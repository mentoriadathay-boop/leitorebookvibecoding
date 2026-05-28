import { useState } from 'react'
import { CheckCircle, XCircle, RotateCcw, X } from 'lucide-react'

export default function Quiz({ questions, onClose }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const select = (qi, oi) => {
    if (submitted) return
    setAnswers(p => ({ ...p, [qi]: oi }))
  }

  const score = submitted
    ? questions.filter((q, i) => answers[i] === q.correctIndex).length
    : 0

  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-playfair font-semibold text-lg text-gray-900 dark:text-white">Quiz do Capítulo</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <X size={18} />
        </button>
      </div>

      {questions.map((q, qi) => (
        <div key={qi} className="mb-5">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">
            <span className="text-[#B91C1C] dark:text-red-400 font-bold mr-1">{qi + 1}.</span>
            {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const selected = answers[qi] === oi
              const correct = q.correctIndex === oi
              let cls = 'w-full text-left text-sm px-4 py-2.5 rounded-lg border transition-all '
              if (!submitted) {
                cls += selected
                  ? 'border-[#1B6B3A] bg-[#E8F5EE] dark:bg-[#0F4A28]/30 text-[#0F4A28] dark:text-green-300'
                  : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-[#1B6B3A] hover:bg-[#E8F5EE] dark:hover:bg-[#0F4A28]/20'
              } else {
                if (correct) cls += 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                else if (selected && !correct) cls += 'border-red-400 bg-[#FEF2F2] dark:bg-red-900/20 text-red-700 dark:text-red-300'
                else cls += 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-500 opacity-60'
              }
              return (
                <button key={oi} onClick={() => select(qi, oi)} className={cls}>
                  <span className="flex items-center gap-2">
                    {submitted && correct && <CheckCircle size={14} className="text-green-500 shrink-0" />}
                    {submitted && selected && !correct && <XCircle size={14} className="text-red-500 shrink-0" />}
                    {opt}
                  </span>
                </button>
              )
            })}
          </div>
          {submitted && (
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 border-l-2 border-[#C9A84C]">
              {q.explanation}
            </p>
          )}
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < questions.length}
          className="w-full py-2.5 rounded-lg bg-[#1B6B3A] hover:bg-[#0F4A28] text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Ver resultado
        </button>
      ) : (
        <div className="text-center">
          <p className="text-2xl font-playfair font-bold mb-1">
            <span className={score === questions.length ? 'text-green-600' : score > 0 ? 'text-[#C9A84C]' : 'text-red-500'}>
              {score}/{questions.length}
            </span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {score === questions.length ? 'Perfeito! Você dominou este capítulo.' : score > 0 ? 'Bom trabalho! Revise as questões erradas.' : 'Continue estudando — você vai melhorar!'}
          </p>
          <button
            onClick={() => { setAnswers({}); setSubmitted(false) }}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1B6B3A] mx-auto transition-colors"
          >
            <RotateCcw size={12} /> Tentar novamente
          </button>
        </div>
      )}
    </div>
  )
}
