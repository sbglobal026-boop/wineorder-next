'use client'
import { useRef } from 'react'
import {
  Bold, Italic, Underline, Quote, TextQuote,
  SeparatorHorizontal, List, AlignLeft, AlignCenter, AlignRight, ImagePlus,
} from 'lucide-react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Placeholder from '@tiptap/extension-placeholder'
import { FontSize } from './FontSizeExtension'
import { LineSpacing } from './LineSpacingExtension'
import { QuoteStyle } from './QuoteStyleExtension'
import { PhotoCollage } from './PhotoCollageExtension'

const FONT_SIZES = [
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
  { label: '28px', value: '28px' },
  { label: '32px', value: '32px' },
  { label: '36px', value: '36px' },
  { label: '48px', value: '48px' },
]

const LINE_SPACINGS = [
  { label: '좁게', value: '0.1em' },
  { label: '보통', value: '0.3em' },
  { label: '넓게', value: '0.85em' },
  { label: '아주 넓게', value: '1.5em' },
  { label: '최대 넓게', value: '2.5em' },
]

const FONT_FAMILIES = [
  { label: 'Playfair Display', value: 'var(--font-playfair-display), serif' },
  { label: 'Schibsted Grotesk', value: 'var(--font-grotesk), sans-serif' },
  { label: 'Lato', value: 'var(--font-lato), sans-serif' },
  { label: '나눔스퀘어', value: 'var(--font-nanum-square), sans-serif' },
]

const MAX_COLLAGE_PHOTOS = 4

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
      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
        active ? 'bg-[#1C1A17] text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  )
}

function ToolbarSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { label: string; value: string }[]
}) {
  return (
    <select
      aria-label={label}
      className="h-8 text-xs rounded-lg border-none bg-transparent px-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors cursor-pointer"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{label}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

function Toolbar({
  editor,
  onUploadImages,
}: {
  editor: Editor
  onUploadImages?: (files: File[]) => Promise<string[]>
}) {
  const collageInputRef = useRef<HTMLInputElement>(null)

  const handleCollageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_COLLAGE_PHOTOS)
    e.target.value = ''
    if (files.length === 0 || !onUploadImages) return
    const urls = await onUploadImages(files)
    editor.chain().focus().setPhotoCollage(urls).run()
  }

  // 인용구는 "라인 강조"와 "따옴표 강조" 두 스타일을 각각 켜고 끌 수 있음
  const setQuoteStyle = (style: 'line' | 'quote') => {
    const isBlockquote = editor.isActive('blockquote')
    const currentStyle = editor.getAttributes('blockquote').quoteStyle || 'line'
    if (isBlockquote && currentStyle === style) {
      editor.chain().focus().lift('blockquote').run()
    } else if (isBlockquote) {
      editor.chain().focus().updateAttributes('blockquote', { quoteStyle: style }).run()
    } else {
      // wrapIn은 생성과 동시에 속성을 지정할 수 있어 toggleBlockquote+updateAttributes 조합의 타이밍 문제를 피할 수 있음
      editor.chain().focus().wrapIn('blockquote', { quoteStyle: style }).run()
    }
  }
  const activeQuoteStyle = editor.isActive('blockquote') ? (editor.getAttributes('blockquote').quoteStyle || 'line') : null

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-100 px-2 py-1.5 bg-[#FBFAF7] rounded-t-xl">
      <ToolbarButton label="굵게" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={15} strokeWidth={2} />
      </ToolbarButton>
      <ToolbarButton label="기울임" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={15} strokeWidth={2} />
      </ToolbarButton>
      <ToolbarButton label="밑줄" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <Underline size={15} strokeWidth={2} />
      </ToolbarButton>

      <span className="w-px h-6 bg-gray-200 mx-1" />

      <ToolbarSelect
        label="글자 크기"
        value={editor.getAttributes('textStyle').fontSize || ''}
        onChange={(v) => v ? editor.chain().focus().setFontSize(v).run() : editor.chain().focus().unsetFontSize().run()}
        options={FONT_SIZES}
      />
      <ToolbarSelect
        label="폰트"
        value={editor.getAttributes('textStyle').fontFamily || ''}
        onChange={(v) => v ? editor.chain().focus().setFontFamily(v).run() : editor.chain().focus().unsetFontFamily().run()}
        options={FONT_FAMILIES}
      />
      <ToolbarSelect
        label="줄간격"
        value={editor.getAttributes('paragraph').lineSpacing || editor.getAttributes('heading').lineSpacing || '0.1em'}
        onChange={(v) => v ? editor.chain().focus().setLineSpacing(v).run() : editor.chain().focus().unsetLineSpacing().run()}
        options={LINE_SPACINGS}
      />

      <span className="w-px h-6 bg-gray-200 mx-1" />
      <ToolbarButton label="인용구 (라인)" active={activeQuoteStyle === 'line'} onClick={() => setQuoteStyle('line')}>
        <TextQuote size={15} strokeWidth={2} />
      </ToolbarButton>
      <ToolbarButton label="인용구 (따옴표)" active={activeQuoteStyle === 'quote'} onClick={() => setQuoteStyle('quote')}>
        <Quote size={15} strokeWidth={2} />
      </ToolbarButton>
      <ToolbarButton label="구분선" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <SeparatorHorizontal size={15} strokeWidth={2} />
      </ToolbarButton>

      <span className="w-px h-6 bg-gray-200 mx-1" />

      <ToolbarButton label="글머리표" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List size={15} strokeWidth={2} />
      </ToolbarButton>

      <span className="w-px h-6 bg-gray-200 mx-1" />

      <ToolbarButton label="왼쪽 정렬" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
        <AlignLeft size={15} strokeWidth={2} />
      </ToolbarButton>
      <ToolbarButton label="가운데 정렬" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
        <AlignCenter size={15} strokeWidth={2} />
      </ToolbarButton>
      <ToolbarButton label="오른쪽 정렬" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
        <AlignRight size={15} strokeWidth={2} />
      </ToolbarButton>

      {onUploadImages && (
        <>
          <span className="w-px h-6 bg-gray-200 mx-1" />
          <ToolbarButton label="사진 콜라주" onClick={() => collageInputRef.current?.click()}>
            <ImagePlus size={15} strokeWidth={2} />
          </ToolbarButton>
          <input
            ref={collageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleCollageSelect}
            className="hidden"
          />
        </>
      )}
    </div>
  )
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  onUploadImages,
}: {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  onUploadImages?: (files: File[]) => Promise<string[]>
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      TextStyle,
      FontSize,
      FontFamily,
      LineSpacing,
      QuoteStyle,
      TextAlign.configure({ types: ['heading', 'paragraph', 'photoCollage'], defaultAlignment: 'left' }),
      Placeholder.configure({ placeholder: placeholder || '내용을 입력하세요' }),
      PhotoCollage,
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
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <Toolbar editor={editor} onUploadImages={onUploadImages} />
      <EditorContent editor={editor} />
    </div>
  )
}
