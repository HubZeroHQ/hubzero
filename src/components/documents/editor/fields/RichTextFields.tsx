'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Code, Italic, Link as LinkIcon, type LucideIcon } from 'lucide-react';
import { useEffect } from 'react';
import type { Block } from '@/lib/documents/blocks';
import { cn } from '@/lib/utils/cn';

/**
 * The one rich-text surface in the Document Engine — deliberately scoped to
 * inline marks only (bold/italic/code/link), never block-level structure.
 * Heading/list/quote/code already exist as their own dedicated block types
 * (`blocks.ts`); letting `richText` reimplement them inline would give the
 * author two different ways to write the same thing. History is disabled
 * on the Tiptap instance itself so `Ctrl/Cmd+Z` bubbles up to the
 * document-level undo stack (`use-document-history.ts`) instead of two
 * undo systems fighting over the same keystroke.
 *
 * A static toolbar above the text, not a floating selection bubble —
 * CMS_PRODUCT_DESIGN.md §5 explicitly calls out "no floating format bubble
 * that follows the cursor everywhere" as part of what distinguishes this
 * editor from a blogging tool.
 */
export function RichTextFields({
  block,
  onChange,
}: {
  block: Extract<Block, { type: 'richText' }>;
  onChange: (next: Block) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        undoRedo: false,
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        listKeymap: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        underline: false,
        link: { openOnClick: false, autolink: true },
      }),
    ],
    content: block.data.html || '<p></p>',
    onUpdate: ({ editor: instance }) => {
      onChange({ ...block, data: { html: instance.getHTML() } });
    },
    editorProps: {
      attributes: {
        class:
          'text-text-primary min-h-[80px] text-sm leading-relaxed focus:outline-none [&_a]:text-accent [&_a]:underline [&_code]:bg-surface-elevated [&_code]:rounded-[4px] [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs',
      },
    },
  });

  // Syncs external changes (undo/redo restoring a prior blocks array, or a
  // pasted block replacing this one) into the editor. Guarded by
  // `!editor.isFocused` so a live edit's own `onUpdate` round trip never
  // fights with itself and resets the cursor mid-keystroke.
  useEffect(() => {
    if (!editor || editor.isFocused) {
      return;
    }
    const current = editor.getHTML();
    if (block.data.html && block.data.html !== current) {
      editor.commands.setContent(block.data.html, { emitUpdate: false });
    }
  }, [block.data.html, editor]);

  if (!editor) {
    return null;
  }

  function handleLinkClick() {
    if (!editor) return;
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt('Link URL');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }

  return (
    <div className="border-border-default rounded-[4px] border">
      <div
        role="toolbar"
        aria-label="Text formatting"
        className="border-border-muted flex items-center gap-1 border-b p-1.5"
      >
        <ToolbarButton
          label="Bold"
          icon={Bold}
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="Italic"
          icon={Italic}
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="Code"
          icon={Code}
          active={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
        />
        <ToolbarButton
          label={editor.isActive('link') ? 'Remove link' : 'Add link'}
          icon={LinkIcon}
          active={editor.isActive('link')}
          onClick={handleLinkClick}
        />
      </div>
      <EditorContent editor={editor} className="px-3 py-2" />
    </div>
  );
}

function ToolbarButton({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      // Keeps the current text selection alive — without this, the
      // mousedown-driven focus shift to the button would collapse the
      // editor's selection before the click handler's toggle command runs.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'rounded-control duration-fast ease-standard inline-flex min-h-11 min-w-11 items-center justify-center transition-colors',
        active
          ? 'bg-surface-elevated text-text-primary'
          : 'text-text-muted hover:bg-surface-elevated hover:text-text-primary',
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
}
