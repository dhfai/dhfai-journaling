"use client";

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { useEffect, forwardRef, useImperativeHandle } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export interface RichTextEditorRef {
  focus: () => void;
  editor: Editor | null;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ content, onChange, onBlur, placeholder = 'Start typing...', editable = true, className = '' }, ref) => {
    const editor = useEditor({
      immediatelyRender: false, // Fix SSR hydration mismatch
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
        }),
        Underline,
        Placeholder.configure({
          placeholder,
          emptyEditorClass: 'is-editor-empty',
        }),
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
      ],
      content: content || '',
      editable,
      editorProps: {
        attributes: {
          class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none max-w-none ${className}`,
        },
      },
      onUpdate: ({ editor }) => {
        // Convert HTML to Markdown for storage
        const markdown = htmlToMarkdown(editor.getHTML());
        onChange(markdown);
      },
      onBlur: () => {
        onBlur?.();
      },
    });

    // Update editor content when prop changes (from external sources)
    useEffect(() => {
      if (editor && content !== undefined) {
        const markdown = content || '';
        const html = markdownToHtml(markdown);
        const currentHtml = editor.getHTML();

        // Only update if content actually changed to avoid cursor jumping
        if (html !== currentHtml && !editor.isFocused) {
          editor.commands.setContent(html);
        }
      }
    }, [content, editor]);

    // Expose editor methods to parent
    useImperativeHandle(ref, () => ({
      focus: () => {
        editor?.commands.focus('end');
      },
      editor,
    }));

    if (!editor) {
      return null;
    }

    return (
      <div className="w-full">
        <EditorContent
          editor={editor}
          className="w-full"
        />
        <style jsx global>{`
          .ProseMirror {
            min-height: 100px;
            width: 100%;
            border-radius: 0.375rem;
            border: 1px solid hsl(var(--input));
            background-color: transparent;
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
            line-height: 1.25rem;
            outline: none;
          }

          .ProseMirror:focus {
            outline: none;
            ring: 2px;
            ring-color: hsl(var(--ring));
            ring-offset: 2px;
            border-color: hsl(var(--ring));
          }

          .ProseMirror p.is-editor-empty:first-child::before {
            color: hsl(var(--muted-foreground));
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
          }

          .ProseMirror h1 {
            font-size: 1.875rem;
            font-weight: 700;
            margin-top: 1.5rem;
            margin-bottom: 1rem;
            line-height: 2.25rem;
          }

          .ProseMirror h2 {
            font-size: 1.5rem;
            font-weight: 700;
            margin-top: 1.25rem;
            margin-bottom: 0.75rem;
            line-height: 2rem;
          }

          .ProseMirror h3 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
            line-height: 1.75rem;
          }

          .ProseMirror p {
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
          }

          .ProseMirror strong {
            font-weight: 700;
          }

          .ProseMirror em {
            font-style: italic;
          }

          .ProseMirror u {
            text-decoration: underline;
          }

          .ProseMirror ul,
          .ProseMirror ol {
            padding-left: 1.5rem;
            margin: 0.5rem 0;
          }

          .ProseMirror ul {
            list-style-type: disc;
          }

          .ProseMirror ol {
            list-style-type: decimal;
          }

          .ProseMirror li {
            margin: 0.25rem 0;
          }

          .ProseMirror code {
            background-color: hsl(var(--muted));
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
            font-family: monospace;
            font-size: 0.875em;
          }

          .ProseMirror pre {
            background-color: hsl(var(--muted));
            padding: 0.75rem;
            border-radius: 0.375rem;
            overflow-x: auto;
            margin: 0.5rem 0;
          }

          .ProseMirror pre code {
            background-color: transparent;
            padding: 0;
            font-family: monospace;
          }

          .ProseMirror blockquote {
            border-left: 3px solid hsl(var(--border));
            padding-left: 1rem;
            margin: 0.5rem 0;
            color: hsl(var(--muted-foreground));
          }

          .ProseMirror hr {
            border: none;
            border-top: 2px solid hsl(var(--border));
            margin: 1.5rem 0;
          }

          .ProseMirror ul[data-type="taskList"] {
            list-style: none;
            padding-left: 0;
          }

          .ProseMirror ul[data-type="taskList"] li {
            display: flex;
            align-items: flex-start;
          }

          .ProseMirror ul[data-type="taskList"] li > label {
            flex: 0 0 auto;
            margin-right: 0.5rem;
            user-select: none;
          }

          .ProseMirror ul[data-type="taskList"] li > div {
            flex: 1 1 auto;
          }
        `}</style>
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

// Helper function to convert Markdown to HTML for Tiptap
function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Underline
  html = html.replace(/<u>(.+?)<\/u>/g, '<u>$1</u>');

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<s>$1</s>');

  // Code
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');

  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

  // Unordered lists
  html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*<\/li>)/, '<ul>$1</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');

  // Task lists
  html = html.replace(/^- \[ \] (.+)$/gim, '<li data-type="taskItem" data-checked="false">$1</li>');
  html = html.replace(/^- \[x\] (.+)$/gim, '<li data-type="taskItem" data-checked="true">$1</li>');

  // Blockquotes
  html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>');

  // Line breaks
  html = html.replace(/\n/g, '<br>');

  // Paragraphs
  html = html.replace(/(<br>)+/g, '</p><p>');
  html = `<p>${html}</p>`;
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<h[1-3]>)/g, '$1');
  html = html.replace(/(<\/h[1-3]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');
  html = html.replace(/<p>(<blockquote>)/g, '$1');
  html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');

  return html;
}

// Helper function to convert HTML back to Markdown for storage
function htmlToMarkdown(html: string): string {
  if (!html) return '';

  let markdown = html;

  // Remove empty paragraphs
  markdown = markdown.replace(/<p><\/p>/g, '');

  // Headers
  markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '# $1\n');
  markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, '## $1\n');
  markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, '### $1\n');

  // Bold
  markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
  markdown = markdown.replace(/<b>(.*?)<\/b>/g, '**$1**');

  // Italic
  markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
  markdown = markdown.replace(/<i>(.*?)<\/i>/g, '*$1*');

  // Underline
  markdown = markdown.replace(/<u>(.*?)<\/u>/g, '<u>$1</u>');

  // Strikethrough
  markdown = markdown.replace(/<s>(.*?)<\/s>/g, '~~$1~~');
  markdown = markdown.replace(/<strike>(.*?)<\/strike>/g, '~~$1~~');
  markdown = markdown.replace(/<del>(.*?)<\/del>/g, '~~$1~~');

  // Code
  markdown = markdown.replace(/<code>(.*?)<\/code>/g, '`$1`');

  // Links
  markdown = markdown.replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)');

  // Task lists
  markdown = markdown.replace(/<li data-type="taskItem" data-checked="true">(.*?)<\/li>/g, '- [x] $1');
  markdown = markdown.replace(/<li data-type="taskItem" data-checked="false">(.*?)<\/li>/g, '- [ ] $1');

  // Unordered lists
  markdown = markdown.replace(/<li>(.*?)<\/li>/g, '* $1\n');
  markdown = markdown.replace(/<ul>([\s\S]*?)<\/ul>/g, '$1');

  // Ordered lists (simplified)
  markdown = markdown.replace(/<ol>([\s\S]*?)<\/ol>/g, '$1');

  // Blockquotes
  markdown = markdown.replace(/<blockquote>(.*?)<\/blockquote>/g, '> $1\n');

  // Paragraphs
  markdown = markdown.replace(/<p>(.*?)<\/p>/g, '$1\n\n');

  // Line breaks
  markdown = markdown.replace(/<br\s*\/?>/g, '\n');

  // Clean up extra newlines
  markdown = markdown.replace(/\n{3,}/g, '\n\n');

  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]+>/g, '');

  return markdown.trim();
}
