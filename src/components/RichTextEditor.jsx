import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useState } from 'react'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus,
  AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Image as ImageIcon,
  Undo, Redo,
} from 'lucide-react'

function Btn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick?.() }}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-[#0F4A28] text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-0.5 shrink-0" />
}

export default function RichTextEditor({ value, onChange, placeholder = 'Escreva o conteúdo...' }) {
  const [linkUrl, setLinkUrl] = useState('')
  const [showLink, setShowLink] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [showImage, setShowImage] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-[#1B6B3A] underline cursor-pointer' },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[280px] px-4 py-3 text-sm text-gray-800 dark:text-gray-200 leading-relaxed',
      },
    },
  })

  // Sincroniza quando value muda externamente (ex: limpar form)
  useEffect(() => {
    if (!editor) return
    if (value === '' || value === '<p></p>') {
      editor.commands.clearContent()
    }
  }, [value, editor])

  if (!editor) return null

  const insertLink = () => {
    if (!linkUrl.trim()) return
    const href = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`
    editor.chain().focus().setLink({ href }).run()
    setLinkUrl('')
    setShowLink(false)
  }

  const insertImage = () => {
    if (!imageUrl.trim()) return
    editor.chain().focus().insertContent(
      `<img src="${imageUrl}" alt="imagem" style="max-width:100%;border-radius:8px;margin:12px 0;display:block;" />`
    ).run()
    setImageUrl('')
    setShowImage(false)
  }

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-visible bg-white dark:bg-[#111]">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#1a1a1a] rounded-t-xl">

        <Btn onClick={() => editor.chain().focus().undo().run()} title="Desfazer"><Undo size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} title="Refazer"><Redo size={14} /></Btn>
        <Sep />

        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })} title="Título 1"><Heading1 size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })} title="Título 2"><Heading2 size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })} title="Título 3"><Heading3 size={14} /></Btn>
        <Sep />

        <Btn onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')} title="Negrito"><Bold size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')} title="Itálico"><Italic size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')} title="Sublinhado"><UnderlineIcon size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')} title="Tachado"><Strikethrough size={14} /></Btn>
        <Sep />

        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')} title="Lista"><List size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')} title="Lista numerada"><ListOrdered size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')} title="Citação"><Quote size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divisor"><Minus size={14} /></Btn>
        <Sep />

        <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })} title="Alinhar esquerda"><AlignLeft size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })} title="Centralizar"><AlignCenter size={14} /></Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })} title="Alinhar direita"><AlignRight size={14} /></Btn>
        <Sep />

        {/* Link */}
        <div className="relative">
          <Btn onClick={() => { setShowLink(v => !v); setShowImage(false) }}
            active={editor.isActive('link')} title="Inserir link"><LinkIcon size={14} /></Btn>
          {showLink && (
            <div className="absolute top-full left-0 mt-1 z-30 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-600 rounded-lg p-2 shadow-xl flex gap-1 w-64">
              <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && insertLink()}
                placeholder="https://..." autoFocus
                className="flex-1 text-xs border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300" />
              <button type="button" onClick={insertLink}
                className="text-xs px-2 py-1 bg-[#0F4A28] text-white rounded hover:bg-[#1B6B3A] font-semibold">OK</button>
            </div>
          )}
        </div>

        {/* Imagem por URL */}
        <div className="relative">
          <Btn onClick={() => { setShowImage(v => !v); setShowLink(false) }} title="Inserir imagem (URL)">
            <ImageIcon size={14} />
          </Btn>
          {showImage && (
            <div className="absolute top-full left-0 mt-1 z-30 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-600 rounded-lg p-2 shadow-xl flex gap-1 w-72">
              <input value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && insertImage()}
                placeholder="https://... (URL da imagem)" autoFocus
                className="flex-1 text-xs border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300" />
              <button type="button" onClick={insertImage}
                className="text-xs px-2 py-1 bg-[#0F4A28] text-white rounded hover:bg-[#1B6B3A] font-semibold">OK</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Área de edição ── */}
      <EditorContent editor={editor} />

      {/* Estilos internos do editor */}
      <style>{`
        .ProseMirror { outline: none; }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror h1 { font-size: 1.6rem; font-weight: 700; margin: .75rem 0 .4rem; color: #111827; }
        .ProseMirror h2 { font-size: 1.3rem; font-weight: 700; margin: .6rem 0 .35rem; color: #111827; }
        .ProseMirror h3 { font-size: 1.1rem; font-weight: 600; margin: .5rem 0 .25rem; color: #111827; }
        .ProseMirror p  { margin: .35rem 0; line-height: 1.7; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 1.5rem; margin: .5rem 0; }
        .ProseMirror li { margin: .25rem 0; }
        .ProseMirror blockquote { border-left: 4px solid #C9A84C; padding-left: 1rem; margin: .75rem 0; color: #6b7280; font-style: italic; background: #fdf6e3; border-radius: 0 6px 6px 0; padding: 8px 16px; }
        .ProseMirror hr  { border: none; border-top: 2px solid #e5e7eb; margin: 1rem 0; }
        .ProseMirror a   { color: #1B6B3A; text-decoration: underline; }
        .ProseMirror img { max-width: 100%; border-radius: 8px; margin: 12px 0; display: block; }
        .ProseMirror strong { font-weight: 700; }
        .ProseMirror code { background: #f3f4f6; padding: 2px 5px; border-radius: 4px; font-size: .85em; font-family: monospace; }
        .dark .ProseMirror h1, .dark .ProseMirror h2, .dark .ProseMirror h3 { color: #f9fafb; }
        .dark .ProseMirror p, .dark .ProseMirror li { color: #d1d5db; }
        .dark .ProseMirror blockquote { background: rgba(201,168,76,.08); color: #9ca3af; }
        .dark .ProseMirror code { background: #374151; color: #d1fae5; }
        .dark .ProseMirror hr { border-color: #374151; }
      `}</style>
    </div>
  )
}
