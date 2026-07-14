import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    lineSpacing: {
      setLineSpacing: (spacing: string) => ReturnType
      unsetLineSpacing: () => ReturnType
    }
  }
}

export const LineSpacing = Extension.create({
  name: 'lineSpacing',

  addOptions() {
    return { types: ['paragraph', 'heading'] }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineSpacing: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.marginBottom || null,
            renderHTML: (attributes: { lineSpacing?: string | null }) => {
              if (!attributes.lineSpacing) return {}
              return { style: `margin-bottom: ${attributes.lineSpacing}` }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setLineSpacing:
        (spacing: string) =>
        ({ commands }) => {
          return this.options.types.every((type: string) => commands.updateAttributes(type, { lineSpacing: spacing }))
        },
      unsetLineSpacing:
        () =>
        ({ commands }) => {
          return this.options.types.every((type: string) => commands.updateAttributes(type, { lineSpacing: null }))
        },
    }
  },
})
