import { Node, mergeAttributes } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer, NodeViewProps } from '@tiptap/react'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    photoCollage: {
      setPhotoCollage: (images: string[]) => ReturnType
    }
  }
}

type CollageSize = 'sm' | 'md' | 'lg'
type CollageAlign = 'left' | 'center' | 'right' | 'justify'

const SIZE_CLASS: Record<CollageSize, string> = {
  sm: 'max-w-[50%]',
  md: 'max-w-[75%]',
  lg: 'max-w-full',
}

const SIZE_LABEL: Record<CollageSize, string> = {
  sm: '작게',
  md: '보통',
  lg: '크게',
}

// 좌/중/우 정렬은 상단 툴바의 텍스트 정렬 버튼(TextAlign 확장)이 이 attrs.textAlign 값을 직접 제어함
const ALIGN_CLASS: Record<CollageAlign, string> = {
  left: 'mr-auto',
  center: 'mx-auto',
  right: 'ml-auto',
  justify: 'mr-auto',
}

// 사진 개수에 따른 그리드 레이아웃 (에디터 미리보기와 공개 페이지 렌더링이 동일한 클래스를 써야 함)
function gridClass(count: number): string {
  if (count <= 1) return 'grid grid-cols-1'
  if (count === 3) return 'grid grid-cols-2'
  return 'grid grid-cols-2'
}

function cellClass(count: number, i: number): string {
  if (count === 3 && i === 0) return 'row-span-2'
  return ''
}

function CollageView({ node, deleteNode, updateAttributes }: NodeViewProps) {
  const images: string[] = node.attrs.images || []
  const size: CollageSize = node.attrs.size || 'lg'
  const align: CollageAlign = node.attrs.textAlign || 'left'

  return (
    <NodeViewWrapper className={`my-4 group relative ${SIZE_CLASS[size]} ${ALIGN_CLASS[align]}`}>
      <div className={`${gridClass(images.length)} gap-1.5`}>
        {images.map((src, i) => (
          <div key={i} className={`${cellClass(images.length, i)} aspect-square overflow-hidden rounded-lg bg-gray-100`}>
            <img src={src} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {(['sm', 'md', 'lg'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => updateAttributes({ size: s })}
            className={`text-[10px] font-semibold px-2 py-1 rounded-full transition-colors ${
              size === s ? 'bg-gray-900 text-white' : 'bg-white/90 text-gray-700 hover:bg-white'
            }`}
          >
            {SIZE_LABEL[s]}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => deleteNode()}
        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >×</button>
    </NodeViewWrapper>
  )
}

export const PhotoCollage = Node.create({
  name: 'photoCollage',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      images: {
        default: [] as string[],
        parseHTML: (element: HTMLElement) => {
          const raw = element.getAttribute('data-images')
          try { return raw ? JSON.parse(raw) : [] } catch { return [] }
        },
        renderHTML: (attributes: { images?: string[] }) => ({
          'data-images': JSON.stringify(attributes.images || []),
        }),
      },
      size: {
        default: 'lg' as CollageSize,
        parseHTML: (element: HTMLElement) => (element.getAttribute('data-size') as CollageSize) || 'lg',
        renderHTML: (attributes: { size?: CollageSize }) => ({
          'data-size': attributes.size || 'lg',
        }),
      },
      // textAlign 자체는 RichTextEditor의 TextAlign.configure({ types: [..., 'photoCollage'] })가 등록해줌
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="photo-collage"]' }]
  },

  // 공개 페이지는 Tiptap 없이 이 HTML을 그대로 그려야 하므로 정적 마크업으로 직접 렌더링
  renderHTML({ node, HTMLAttributes }) {
    const images: string[] = (() => {
      try { return JSON.parse(HTMLAttributes['data-images'] ?? '[]') } catch { return [] }
    })()
    const size: CollageSize = (HTMLAttributes['data-size'] as CollageSize) || 'lg'
    const align: CollageAlign = node.attrs.textAlign || 'left'
    const wrapperClass = `my-4 ${SIZE_CLASS[size]} ${ALIGN_CLASS[align]}`.trim()

    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'photo-collage', class: wrapperClass }),
      [
        'div',
        { class: `${gridClass(images.length)} gap-1.5` },
        ...images.map((src, i) => [
          'div',
          { class: `${cellClass(images.length, i)} aspect-square overflow-hidden rounded-lg bg-gray-100` },
          ['img', { src, alt: '', class: 'w-full h-full object-cover' }],
        ]),
      ],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(CollageView)
  },

  addCommands() {
    return {
      setPhotoCollage:
        (images: string[]) =>
        ({ commands }) => {
          return commands.insertContent({ type: this.name, attrs: { images } })
        },
    }
  },
})
