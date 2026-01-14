import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link as LinkIcon, Undo, Redo } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  className?: string
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter description...',
  error,
  className = ''
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
  })

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  // Set placeholder
  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          attributes: {
            'data-placeholder': placeholder,
          },
        },
      })
    }
  }, [editor, placeholder])

  // Cleanup
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy()
      }
    }
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className={className}>
      <div className={`bg-muted/50 border rounded-lg ${error ? 'border-destructive' : 'border-border/50'} focus-within:ring-2 focus-within:ring-primary/50 text-xs`}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border/50">
          {/* Text Formatting */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-muted transition-colors ${
              editor.isActive('bold') ? 'bg-primary/20 text-primary' : 'text-foreground'
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-muted transition-colors ${
              editor.isActive('italic') ? 'bg-primary/20 text-primary' : 'text-foreground'
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-muted transition-colors ${
              editor.isActive('underline') ? 'bg-primary/20 text-primary' : 'text-foreground'
            }`}
            title="Underline"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-muted transition-colors ${
              editor.isActive('strike') ? 'bg-primary/20 text-primary' : 'text-foreground'
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-border/50 mx-1" />

          {/* Headers */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-muted transition-colors text-sm font-semibold ${
              editor.isActive('heading', { level: 1 }) ? 'bg-primary/20 text-primary' : 'text-foreground'
            }`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-muted transition-colors text-sm font-semibold ${
              editor.isActive('heading', { level: 2 }) ? 'bg-primary/20 text-primary' : 'text-foreground'
            }`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-muted transition-colors text-sm font-semibold ${
              editor.isActive('heading', { level: 3 }) ? 'bg-primary/20 text-primary' : 'text-foreground'
            }`}
            title="Heading 3"
          >
            H3
          </button>

          <div className="w-px h-6 bg-border/50 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-muted transition-colors ${
              editor.isActive('bulletList') ? 'bg-primary/20 text-primary' : 'text-foreground'
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-muted transition-colors ${
              editor.isActive('orderedList') ? 'bg-primary/20 text-primary' : 'text-foreground'
            }`}
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-border/50 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-muted transition-colors ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-primary/20 text-primary' : 'text-foreground'
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-muted transition-colors ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-primary/20 text-primary' : 'text-foreground'
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-muted transition-colors ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-primary/20 text-primary' : 'text-foreground'
            }`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-border/50 mx-1" />

          {/* Link */}
          <button
            type="button"
            onClick={() => {
              const url = window.prompt('Enter URL:')
              if (url) {
                editor.chain().focus().setLink({ href: url }).run()
              }
            }}
            className={`p-2 rounded hover:bg-muted transition-colors ${
              editor.isActive('link') ? 'bg-primary/20 text-primary' : 'text-foreground'
            }`}
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-border/50 mx-1" />

          {/* Undo/Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-muted transition-colors text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-muted transition-colors text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Editor Content */}
        <EditorContent editor={editor} />
      </div>
      {error && (
        <p className="mt-1 text-sm text-destructive flex items-center gap-1">
          {error}
        </p>
      )}
      <style>{`
        .ProseMirror {
          outline: none;
          min-height: 200px;
          color: var(--foreground);
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--muted-foreground);
          pointer-events: none;
          height: 0;
        }
        .ProseMirror p {
          margin: 0.5em 0;
        }
        .ProseMirror p:first-child {
          margin-top: 0;
        }
        .ProseMirror p:last-child {
          margin-bottom: 0;
        }
        .ProseMirror strong {
          font-weight: 600;
        }
        .ProseMirror em {
          font-style: italic;
        }
        .ProseMirror u {
          text-decoration: underline;
        }
        .ProseMirror s {
          text-decoration: line-through;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
          list-style-position: outside;
        }
        .ProseMirror ul {
          list-style-type: disc;
        }
        .ProseMirror ol {
          list-style-type: decimal;
        }
        .ProseMirror li {
          margin: 0.25em 0;
          display: list-item;
        }
        .ProseMirror li::marker {
          color: var(--foreground);
          font-weight: 500;
        }
        .ProseMirror ul li::marker {
          content: '• ';
          color: var(--primary);
        }
        .ProseMirror ol li::marker {
          color: var(--foreground);
        }
        .ProseMirror h1,
        .ProseMirror h2,
        .ProseMirror h3 {
          font-weight: 600;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
        .ProseMirror h1 {
          font-size: 1.5em;
        }
        .ProseMirror h2 {
          font-size: 1.25em;
        }
        .ProseMirror h3 {
          font-size: 1.1em;
        }
        .ProseMirror a {
          color: var(--primary);
          text-decoration: underline;
        }
        .ProseMirror a:hover {
          opacity: 0.8;
        }
        .ProseMirror[data-placeholder]::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--muted-foreground);
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  )
}
