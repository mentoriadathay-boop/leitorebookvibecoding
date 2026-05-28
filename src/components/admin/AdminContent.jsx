import { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import UnderlineExt from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import {
  Plus, Pencil, Trash2, ChevronUp, ChevronDown,
  Eye, EyeOff, X, Save, Database, BookOpen
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { chapters as staticChapters, chapterGroups as staticGroups } from '../../data/chapters'

/* ─── TipTap Toolbar ──────────────────────────────────────────── */
function ToolbarBtn({ active, onClick, children, title }) {
  return (
    <button type="button" onClick={onClick} title={title}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
        active ? 'bg-[#1B6B3A] text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}>
      {children}
    </button>
  )
}

function Toolbar({ editor }) {
  if (!editor) return null
  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
      <ToolbarBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Negrito"><strong>B</strong></ToolbarBtn>
      <ToolbarBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Itálico"><em>I</em></ToolbarBtn>
      <ToolbarBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Sublinhado"><u>U</u></ToolbarBtn>
      <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
      {[1, 2, 3].map(n => (
        <ToolbarBtn key={n} active={editor.isActive('heading', { level: n })}
          onClick={() => editor.chain().focus().toggleHeading({ level: n }).run()} title={`Título ${n}`}>
          H{n}
        </ToolbarBtn>
      ))}
      <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
      <ToolbarBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Lista">• Lista</ToolbarBtn>
      <ToolbarBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numerada">1. Num</ToolbarBtn>
      <ToolbarBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Citação">"Cit"</ToolbarBtn>
      <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
      <ToolbarBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Esquerda">≡L</ToolbarBtn>
      <ToolbarBtn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Centro">≡C</ToolbarBtn>
      <ToolbarBtn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Direita">≡R</ToolbarBtn>
    </div>
  )
}

/* ─── Quiz Editor ─────────────────────────────────────────────── */
function QuizEditor({ questions, onChange }) {
  const [newQ, setNewQ] = useState({ question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' })

  const add = () => {
    if (!newQ.question.trim()) return
    onChange([...questions, { ...newQ }])
    setNewQ({ question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' })
  }

  const remove = (i) => onChange(questions.filter((_, j) => j !== i))

  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start gap-2 mb-2">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{i + 1}. {q.question}</p>
            <button onClick={() => remove(i)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0"><Trash2 size={14} /></button>
          </div>
          <div className="grid grid-cols-2 gap-1 mb-2">
            {q.options.map((opt, j) => (
              <p key={j} className={`text-xs px-2 py-1 rounded ${q.correctIndex === j ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                {j === q.correctIndex ? '✓ ' : ''}{opt}
              </p>
            ))}
          </div>
          {q.explanation && <p className="text-[11px] text-gray-400 italic">{q.explanation}</p>}
        </div>
      ))}

      <div className="bg-[#E8F5EE] dark:bg-[#0F4A28]/20 rounded-xl p-4 border border-[#1B6B3A]/20 space-y-3">
        <p className="text-xs font-semibold text-[#1B6B3A] dark:text-green-400">Nova pergunta</p>
        <input value={newQ.question} onChange={e => setNewQ(p => ({ ...p, question: e.target.value }))}
          placeholder="Texto da pergunta" className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300" />
        <div className="grid grid-cols-2 gap-2">
          {newQ.options.map((opt, j) => (
            <div key={j} className="flex items-center gap-2">
              <input type="radio" checked={newQ.correctIndex === j} onChange={() => setNewQ(p => ({ ...p, correctIndex: j }))} className="accent-[#1B6B3A]" />
              <input value={opt} onChange={e => {
                const opts = [...newQ.options]; opts[j] = e.target.value
                setNewQ(p => ({ ...p, options: opts }))
              }} placeholder={`Opção ${j + 1}`} className="flex-1 text-xs border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300" />
            </div>
          ))}
        </div>
        <input value={newQ.explanation} onChange={e => setNewQ(p => ({ ...p, explanation: e.target.value }))}
          placeholder="Explicação da resposta (opcional)" className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300" />
        <button onClick={add} className="flex items-center gap-1.5 text-xs px-3 py-2 bg-[#1B6B3A] hover:bg-[#0F4A28] text-white rounded-lg transition-colors font-medium">
          <Plus size={12} /> Adicionar pergunta
        </button>
      </div>
    </div>
  )
}

/* ─── Glossary Editor ─────────────────────────────────────────── */
function GlossaryEditor({ terms, onChange }) {
  const [newTerm, setNewTerm] = useState('')
  const add = () => {
    const t = newTerm.trim()
    if (!t || terms.includes(t)) return
    onChange([...terms, t])
    setNewTerm('')
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {terms.map(t => (
          <span key={t} className="flex items-center gap-1.5 text-xs bg-[#E8F5EE] dark:bg-[#0F4A28]/30 text-[#1B6B3A] dark:text-green-400 px-3 py-1.5 rounded-full border border-[#1B6B3A]/20">
            {t}
            <button onClick={() => onChange(terms.filter(x => x !== t))} className="text-[#1B6B3A]/60 hover:text-red-500 transition-colors"><X size={11} /></button>
          </span>
        ))}
        {terms.length === 0 && <p className="text-xs text-gray-400 italic">Nenhum termo adicionado</p>}
      </div>
      <div className="flex gap-2">
        <input value={newTerm} onChange={e => setNewTerm(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Nome do termo (ex: SaaS, MRR...)"
          className="flex-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300" />
        <button onClick={add} className="px-3 py-2 bg-[#1B6B3A] hover:bg-[#0F4A28] text-white text-sm rounded-lg transition-colors font-medium">
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

/* ─── Chapter Editor Modal ────────────────────────────────────── */
function ChapterEditorModal({ chapter, onClose, onSave }) {
  const [form, setForm] = useState({
    title: chapter?.title || '',
    page: chapter?.page || 1,
    reading_time: chapter?.reading_time || 5,
    group_label: chapter?.group_label || 'Módulo 1',
    published: chapter?.published ?? true,
    glossary_terms: chapter?.glossary_terms || [],
    quiz_questions: chapter?.quiz_questions || [],
  })
  const [editorTab, setEditorTab] = useState('content')
  const [saving, setSaving] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExt,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: chapter?.content || '',
  })

  const save = async () => {
    setSaving(true)
    const payload = {
      ...form,
      content: editor?.getHTML() || '',
      updated_at: new Date().toISOString(),
    }
    await onSave(chapter?.id, payload)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex flex-col">
      <div className="bg-white dark:bg-[#1A1A1A] flex flex-col h-full max-h-screen">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h3 className="font-playfair font-bold text-gray-900 dark:text-white text-base">
            {chapter?.id ? 'Editar capítulo' : 'Novo capítulo'}
          </h3>
          <div className="flex items-center gap-3">
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#1B6B3A] hover:bg-[#0F4A28] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
              <Save size={14} /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"><X size={18} /></button>
          </div>
        </div>

        {/* Meta fields */}
        <div className="flex flex-wrap gap-3 px-5 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0">
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            placeholder="Título do capítulo"
            className="flex-1 min-w-48 text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300" />
          <input value={form.group_label} onChange={e => setForm(p => ({ ...p, group_label: e.target.value }))}
            placeholder="Grupo (ex: Módulo 1)"
            className="w-36 text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300" />
          <input type="number" value={form.page} onChange={e => setForm(p => ({ ...p, page: Number(e.target.value) }))}
            placeholder="Pág."
            className="w-20 text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300" />
          <input type="number" value={form.reading_time} onChange={e => setForm(p => ({ ...p, reading_time: Number(e.target.value) }))}
            placeholder="Min leitura"
            className="w-28 text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300" />
          <button onClick={() => setForm(p => ({ ...p, published: !p.published }))}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              form.published ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            }`}>
            {form.published ? <><Eye size={14} /> Publicado</> : <><EyeOff size={14} /> Rascunho</>}
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-5 shrink-0 bg-white dark:bg-[#1A1A1A]">
          {[['content', 'Conteúdo'], ['quiz', 'Quiz'], ['glossary', 'Glossário']].map(([id, label]) => (
            <button key={id} onClick={() => setEditorTab(id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                editorTab === id ? 'border-[#1B6B3A] text-[#1B6B3A] dark:text-green-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {editorTab === 'content' && (
            <div className="tiptap-editor border-gray-200">
              <style>{`
                .tiptap-editor .tiptap { outline: none; min-height: 400px; padding: 1rem 1.25rem; }
                .tiptap-editor .tiptap h1 { font-size: 1.5rem; font-weight: 700; margin: 1rem 0 0.5rem; }
                .tiptap-editor .tiptap h2 { font-size: 1.25rem; font-weight: 700; margin: 0.75rem 0 0.5rem; }
                .tiptap-editor .tiptap h3 { font-size: 1.1rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }
                .tiptap-editor .tiptap p { margin: 0.4rem 0; line-height: 1.65; }
                .tiptap-editor .tiptap ul { list-style: disc; margin-left: 1.5rem; margin: 0.5rem 0 0.5rem 1.5rem; }
                .tiptap-editor .tiptap ol { list-style: decimal; margin: 0.5rem 0 0.5rem 1.5rem; }
                .tiptap-editor .tiptap li { margin: 0.2rem 0; }
                .tiptap-editor .tiptap blockquote { border-left: 3px solid #1B6B3A; padding-left: 1rem; color: #6b7280; font-style: italic; margin: 0.75rem 0; }
                .tiptap-editor .tiptap strong { font-weight: 700; }
                .tiptap-editor .tiptap em { font-style: italic; }
                .tiptap-editor .tiptap u { text-decoration: underline; }
                .tiptap-editor .tiptap code { background: #f3f4f6; padding: 0.1rem 0.3rem; border-radius: 4px; font-size: 0.875em; font-family: monospace; }
              `}</style>
              <Toolbar editor={editor} />
              <EditorContent editor={editor} className="text-gray-800 dark:text-gray-200" />
            </div>
          )}

          {editorTab === 'quiz' && (
            <div className="p-5">
              <p className="text-xs text-gray-400 mb-4">
                {form.quiz_questions.length} pergunta{form.quiz_questions.length !== 1 ? 's' : ''} configurada{form.quiz_questions.length !== 1 ? 's' : ''}
              </p>
              <QuizEditor
                questions={form.quiz_questions}
                onChange={q => setForm(p => ({ ...p, quiz_questions: q }))}
              />
            </div>
          )}

          {editorTab === 'glossary' && (
            <div className="p-5">
              <p className="text-xs text-gray-400 mb-4">
                Termos que aparecem destacados no texto do capítulo.
              </p>
              <GlossaryEditor
                terms={form.glossary_terms}
                onChange={t => setForm(p => ({ ...p, glossary_terms: t }))}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Main AdminContent ───────────────────────────────────────── */
export default function AdminContent() {
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [seeding, setSeeding] = useState(false)
  const [confirmDel, setConfirmDel] = useState(null)

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('chapters').select('*').order('order_index')
    if (!error) setChapters(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const seed = async () => {
    setSeeding(true)
    const indexToGroup = {}
    staticGroups.forEach(g => g.chapters.forEach(idx => { indexToGroup[idx] = g.label }))
    const rows = staticChapters.map((ch, idx) => ({
      title: ch.title,
      content: ch.content || '',
      page: ch.page || idx + 1,
      reading_time: ch.readingTime || 5,
      glossary_terms: ch.glossaryTerms || [],
      quiz_questions: ch.quizQuestions || [],
      order_index: idx,
      group_label: indexToGroup[idx] || 'Geral',
      published: true,
    }))
    const { error } = await supabase.from('chapters').insert(rows)
    if (error) console.error('Seed error:', error)
    await load()
    setSeeding(false)
  }

  const saveChapter = async (id, payload) => {
    if (id) {
      await supabase.from('chapters').update(payload).eq('id', id)
    } else {
      await supabase.from('chapters').insert({ ...payload, order_index: chapters.length })
    }
    await load()
  }

  const deleteChapter = async (id) => {
    await supabase.from('chapters').delete().eq('id', id)
    setChapters(prev => prev.filter(c => c.id !== id))
    setConfirmDel(null)
  }

  const togglePublished = async (ch) => {
    await supabase.from('chapters').update({ published: !ch.published }).eq('id', ch.id)
    setChapters(prev => prev.map(c => c.id === ch.id ? { ...c, published: !c.published } : c))
  }

  const move = async (idx, dir) => {
    const next = idx + dir
    if (next < 0 || next >= chapters.length) return
    const updated = [...chapters]
    ;[updated[idx], updated[next]] = [updated[next], updated[idx]]
    updated[idx].order_index = idx
    updated[next].order_index = next
    setChapters(updated)
    await Promise.all([
      supabase.from('chapters').update({ order_index: idx }).eq('id', updated[idx].id),
      supabase.from('chapters').update({ order_index: next }).eq('id', updated[next].id),
    ])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-playfair text-xl font-bold text-gray-900 dark:text-white">Gestão de Conteúdo</h2>
        <div className="flex gap-2">
          {chapters.length === 0 && !loading && (
            <button onClick={seed} disabled={seeding}
              className="flex items-center gap-2 px-4 py-2 border border-[#1B6B3A] text-[#1B6B3A] hover:bg-[#E8F5EE] dark:hover:bg-[#0F4A28]/20 text-sm rounded-xl font-medium transition-colors disabled:opacity-50">
              <Database size={14} /> {seeding ? 'Importando...' : 'Importar capítulos estáticos'}
            </button>
          )}
          <button onClick={() => setEditing({})}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B6B3A] hover:bg-[#0F4A28] text-white text-sm rounded-xl font-medium transition-colors">
            <Plus size={14} /> Novo capítulo
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-gray-400">Carregando capítulos...</div>
      ) : chapters.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-700">
          <BookOpen size={36} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Nenhum capítulo no banco de dados</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Importe os capítulos estáticos ou crie um novo capítulo</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  {['Ordem', 'Título', 'Grupo', 'Pág.', 'Quiz', 'Status', 'Ações'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {chapters.map((ch, i) => (
                  <tr key={ch.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => move(i, -1)} disabled={i === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"><ChevronUp size={13} /></button>
                        <span className="text-xs text-gray-500 text-center">{i + 1}</span>
                        <button onClick={() => move(i, 1)} disabled={i === chapters.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"><ChevronDown size={13} /></button>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 max-w-xs truncate">{ch.title}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{ch.group_label || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{ch.page}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{(ch.quiz_questions || []).length} q</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${
                        ch.published
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {ch.published ? 'Publicado' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => togglePublished(ch)} title={ch.published ? 'Despublicar' : 'Publicar'}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#1B6B3A] hover:bg-[#E8F5EE] dark:hover:bg-[#0F4A28]/20 transition-colors">
                          {ch.published ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button onClick={() => setEditing(ch)} title="Editar"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setConfirmDel(ch)} title="Excluir"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing !== null && (
        <ChapterEditorModal
          chapter={editing?.id ? editing : null}
          onClose={() => setEditing(null)}
          onSave={saveChapter}
        />
      )}

      {confirmDel && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <h3 className="font-playfair font-bold text-lg text-gray-900 dark:text-white mb-2">Excluir capítulo?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              "<strong>{confirmDel.title}</strong>" será excluído permanentemente.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancelar
              </button>
              <button onClick={() => deleteChapter(confirmDel.id)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
