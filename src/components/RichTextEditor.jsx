import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useState } from 'react'
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Code,
  AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Image as ImageIcon,
  Undo, Redo, Palette,
} from 'lucide-react'

function ToolbarButton({ onClick, active, title, children, disabled }) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick?.() }}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors text-sm ${
        active
          ? 'bg-[#0F4A28] text-white'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      } disabled:opacity-30`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5" />
}

export default function RichTextEditor({ value, onChange, placeholder = 'Escreva o conteúdo...' }) {
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [showImageInput, setShowImageInput] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-[#1B6B3A] underline' } }),
      Image.configure({ HTMLAttributes: { class: 'max-w-full rounded-lg my-3 mx-auto block' } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3',
      },
    },
  })

  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value || '', false)
    }
  }, [value])

  if (!editor) return null

  const insertLink = () => {
    if (!linkUrl) return
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`
    editor.chain().focus().setLink({ href: url }).run()
    setLinkUrl('')
    setShowLinkInput(false)
  }

  const insertImage = () => {
    if (!imageUrl) return
    editor.chain().focus().setImage({ src: imageUrl }).run()
    setImageUrl('')
    setShowImageInput(false)
  }

  const COLORS = ['#000000','#374151','#1B6B3A','#0F4A28','#C9A84C','#B80E02','#2563eb','#7c3aed','#db2777','#ffffff']

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-[#111]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-[#1A1A1A]">
        {/* Undo/Redo */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Desfazer">
          <Undo size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Refazer">
          <Redo size={14} />
        </ToolbarButton>
        <Divider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })} title="Título 1">
          <Heading1 size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })} title="Título 2">
          <Heading2 size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })} title="Título 3">
          <Heading3 size={14} />
        </ToolbarButton>
        <Divider />

        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')} title="Negrito">
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')} title="Itálico">
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')} title="Sublinhado">
          <UnderlineIcon size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')} title="Tachado">
          <Strikethrough size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')} title="Código">
          <Code size={14} />
        </ToolbarButton>
        <Divider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')} title="Lista">
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')} title="Lista numerada">
          <ListOrdered size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')} title="Citação">
          <Quote size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Divisor">
          <Minus size={14} />
        </ToolbarButton>
        <Divider />

        {/* Align */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })} title="Esquerda">
          <AlignLeft size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })} title="Centro">
          <AlignCenter size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })} title="Direita">
          <AlignRight size={14} />
        </ToolbarButton>
        <Divider />

        {/* Color */}
        <div className="relative group">
          <ToolbarButton title="Cor do texto">
            <Palette size={14} />
          </ToolbarButton>
          <div className="absolute top-full left-0 mt-1 z-20 hidden group-hover:flex flex-wrap gap-1 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-600 rounded-lg p-2 shadow-lg w-36">
            {COLORS.map(c => (
              <button key={c} type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().setColor(c).run() }}
                className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                style={{ background: c }} title={c} />
            ))}
            <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetColor().run() }}
              className="text-[9px] text-gray-500 w-full text-center mt-1 hover:text-[#1B6B3A]">
              Remover cor
            </button>
          </div>
        </div>

        {/* Link */}
        <div className="relative">
          <ToolbarButton
            onClick={() => { setShowLinkInput(v => !v); setShowImageInput(false) }}
            active={editor.isActive('link')} title="Inserir link">
            <LinkIcon size={14} />
          </ToolbarButton>
          {showLinkInput && (
            <div className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-600 rounded-lg p-2 shadow-lg flex gap-1 w-64">
              <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && insertLink()}
                placeholder="https://..." autoFocus
                className="flex-1 text-xs border border-gray-200 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300" />
              <button type="button" onClick={insertLink}
                className="text-xs px-2 py-1 bg-[#0F4A28] text-white rounded hover:bg-[#1B6B3A]">OK</button>
            </div>
          )}
        </div>

        {/* Image */}
        <div className="relative">
          <ToolbarButton
            onClick={() => { setShowImageInput(v => !v); setShowLinkInput(false) }}
            title="Inserir imagem por URL">
            <ImageIcon size={14} />
          </ToolbarButton>
          {showImageInput && (
            <div className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-600 rounded-lg p-2 shadow-lg flex gap-1 w-72">
              <input value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && insertImage()}
                placeholder="https://... (URL da imagem)" autoFocus
                className="flex-1 text-xs border border-gray-200 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-[#1B6B3A] bg-white dark:bg-[#111] text-gray-700 dark:text-gray-300" />
              <button type="button" onClick={insertImage}
                className="text-xs px-2 py-1 bg-[#0F4A28] text-white rounded hover:bg-[#1B6B3A]">OK</button>
            </div>
          )}
        </div>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror { outline: none; }
        .ProseMirror h1 { font-size: 1.75rem; font-weight: 700; margin: .75rem 0 .4rem; }
        .ProseMirror h2 { font-size: 1.375rem; font-weight: 700; margin: .6rem 0 .3rem; }
        .ProseMirror h3 { font-size: 1.125rem; font-weight: 600; margin: .5rem 0 .25rem; }
        .ProseMirror p { margin: .3rem 0; line-height: 1.65; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 1.5rem; margin: .5rem 0; }
        .ProseMirror li { margin: .2rem 0; }
        .ProseMirror blockquote { border-left: 4px solid #1B6B3A; padding-left: 1rem; color: #6b7280; margin: .75rem 0; font-style: italic; }
        .ProseMirror hr { border: none; border-top: 2px solid #e5e7eb; margin: 1rem 0; }
        .ProseMirror code { background: #f3f4f6; padding: .15rem .35rem; border-radius: .25rem; font-size: .85em; }
        .ProseMirror a { color: #1B6B3A; text-decoration: underline; }
        .ProseMirror strong { font-weight: 700; }
        .dark .ProseMirror h1, .dark .ProseMirror h2, .dark .ProseMirror h3 { color: #f9fafb; }
        .dark .ProseMirror p, .dark .ProseMirror li { color: #d1d5db; }
        .dark .ProseMirror blockquote { border-color: #22c55e; color: #9ca3af; }
        .dark .ProseMirror code { background: #374151; color: #d1fae5; }
        .dark .ProseMirror hr { border-color: #374151; }
      `}</style>
    </div>
  )
}
