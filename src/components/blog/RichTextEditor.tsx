'use client'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Placeholder from '@tiptap/extension-placeholder'
import { FontSize } from './FontSizeExtension'

const FONT_SIZES = [
  { label: '작게', value: '14px' },
  { label: '보통', value: '16px' },
  { label: '크게', value: '20px' },
  { label: '아주 크게', value: '28px' },
]

function ToolbarButton({
  onClick,
  active,
  children,
  label,
}: {
  onClick: () => void
  active?: boolean
  children: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-8 h-8 flex items-center justify-center text-sm border ${
        active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
      } transition-colors`}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-200 p-2 bg-gray-50">
      <ToolbarButton label="굵게" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <span className="font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton label="기울임" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <span className="italic">I</span>
      </ToolbarButton>
      <ToolbarButton label="밑줄" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <span className="underline">U</span>
      </ToolbarButton>

      <span className="w-px h-5 bg-gray-200 mx-1" />

      <select
        aria-label="글자 크기"
        className="h-8 text-xs border border-gray-200 px-1.5 bg-white text-gray-700"
        value={editor.getAttributes('textStyle').fontSize || ''}
        onChange={(e) => {
          const v = e.target.value
          if (!v) editor.chain().focus().unsetFontSize().run()
          else editor.chain().focus().setFontSize(v).run()
        }}
      >
        <option value="">글자 크기</option>
        {FONT_SIZES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <span className="w-px h-5 bg-gray-200 mx-1" />

      <ToolbarButton label="본문" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}>
        <span className="text-xs">P</span>
      </ToolbarButton>
      <ToolbarButton label="제목" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <span className="font-bold text-xs">H2</span>
      </ToolbarButton>
      <ToolbarButton label="소제목" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <span className="font-bold text-xs">H3</span>
      </ToolbarButton>

      <span className="w-px h-5 bg-gray-200 mx-1" />

      <ToolbarButton label="글머리표" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <span className="text-sm">•</span>
      </ToolbarButton>

      <span className="w-px h-5 bg-gray-200 mx-1" />

      <ToolbarButton label="왼쪽 정렬" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
        <span className="text-xs">좌</span>
      </ToolbarButton>
      <ToolbarButton label="가운데 정렬" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
        <span className="text-xs">중</span>
      </ToolbarButton>
      <ToolbarButton label="오른쪽 정렬" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
        <span className="text-xs">우</span>
      </ToolbarButton>
    </div>
  )
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      TextStyle,
      FontSize,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder || '내용을 입력하세요' }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'blog-rich-content min-h-[220px] p-4 text-sm text-gray-800 focus:outline-none',
      },
    },
  })

  if (!editor) return null

  return (
    <div className="border border-gray-200">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
