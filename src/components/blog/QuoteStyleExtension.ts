import { Extension } from '@tiptap/core'

export const QuoteStyle = Extension.create({
  name: 'quoteStyle',

  addGlobalAttributes() {
    return [
      {
        types: ['blockquote'],
        attributes: {
          quoteStyle: {
            default: 'line',
            parseHTML: (element: HTMLElement) => element.getAttribute('data-quote-style') || 'line',
            renderHTML: (attributes: { quoteStyle?: string }) => ({
              'data-quote-style': attributes.quoteStyle || 'line',
            }),
          },
        },
      },
    ]
  },
})
