"use client";

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface RichTextEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  showToolbar?: boolean;
}

export interface RichTextEditorRef {
  focus: () => void;
  editor: Editor | null;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ content, onChange, onBlur, placeholder = 'Start typing...', editable = true, className = '', showToolbar = true }, ref) => {
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
      <div className="tiptap-wrapper">
        {showToolbar && editor && (
          <div className="flex items-center gap-1 p-2 border-b border-border flex-wrap">
            <Button
              type="button"
              variant={editor.isActive('bold') ? 'default' : 'ghost'}
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleBold().run();
              }}
              title="Bold (Ctrl+B)"
              className="h-8 w-8 p-0"
            >
              <Bold className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive('italic') ? 'default' : 'ghost'}
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleItalic().run();
              }}
              title="Italic (Ctrl+I)"
              className="h-8 w-8 p-0"
            >
              <Italic className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive('underline') ? 'default' : 'ghost'}
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleUnderline().run();
              }}
              title="Underline (Ctrl+U)"
              className="h-8 w-8 p-0"
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive('strike') ? 'default' : 'ghost'}
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleStrike().run();
              }}
              title="Strikethrough (Ctrl+Shift+X)"
              className="h-8 w-8 p-0"
            >
              <Strikethrough className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive('code') ? 'default' : 'ghost'}
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleCode().run();
              }}
              title="Code (Ctrl+E)"
              className="h-8 w-8 p-0"
            >
              <Code className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Button
              type="button"
              variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleHeading({ level: 1 }).run();
              }}
              title="Heading 1"
              className="h-8 w-8 p-0"
            >
              <Heading1 className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleHeading({ level: 2 }).run();
              }}
              title="Heading 2"
              className="h-8 w-8 p-0"
            >
              <Heading2 className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleHeading({ level: 3 }).run();
              }}
              title="Heading 3"
              className="h-8 w-8 p-0"
            >
              <Heading3 className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Button
              type="button"
              variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleBulletList().run();
              }}
              title="Bullet List"
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleOrderedList().run();
              }}
              title="Numbered List"
              className="h-8 w-8 p-0"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleBlockquote().run();
              }}
              title="Quote"
              className="h-8 w-8 p-0"
            >
              <Quote className="h-4 w-4" />
            </Button>
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

// Helper function to convert Markdown to HTML for Tiptap
function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  // Split into lines for processing
  const lines = markdown.split('\n');
  const result: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Ordered list item
    if (/^\d+\.\s/.test(trimmed)) {
      if (!inList || listType !== 'ol') {
        if (inList) result.push(`</${listType}>`);
        result.push('<ol>');
        listType = 'ol';
        inList = true;
      }
      const text = trimmed.replace(/^\d+\.\s+/, '');
      result.push(`<li><p>${text}</p></li>`);
    }
    // Unordered list item
    else if (/^\*\s/.test(trimmed)) {
      if (!inList || listType !== 'ul') {
        if (inList) result.push(`</${listType}>`);
        result.push('<ul>');
        listType = 'ul';
        inList = true;
      }
      const text = trimmed.replace(/^\*\s+/, '');
      result.push(`<li><p>${text}</p></li>`);
    }
    // Regular line
    else {
      if (inList) {
        result.push(`</${listType}>`);
        inList = false;
        listType = null;
      }

      if (trimmed) {
        // Headers
        if (/^###\s/.test(trimmed)) {
          result.push(`<h3>${trimmed.replace(/^###\s+/, '')}</h3>`);
        } else if (/^##\s/.test(trimmed)) {
          result.push(`<h2>${trimmed.replace(/^##\s+/, '')}</h2>`);
        } else if (/^#\s/.test(trimmed)) {
          result.push(`<h1>${trimmed.replace(/^#\s+/, '')}</h1>`);
        } else {
          result.push(`<p>${trimmed}</p>`);
        }
      }
    }
  }

  // Close any open list
  if (inList && listType) {
    result.push(`</${listType}>`);
  }

  return result.join('');
}

// Helper function to convert HTML back to Markdown for storage
function htmlToMarkdown(html: string): string {
  if (!html) return '';

  let markdown = html;

  // Remove empty paragraphs first
  markdown = markdown.replace(/<p><\/p>/g, '');
  markdown = markdown.replace(/<p>\s*<\/p>/g, '');

  // Process lists before other elements
  // Ordered lists - properly handle nested <p> tags in <li>
  markdown = markdown.replace(/<ol>([\s\S]*?)<\/ol>/g, (match, listContent) => {
    let counter = 1;
    let result = '';
    // Match <li> with possible nested <p>
    const items = listContent.match(/<li>[\s\S]*?<\/li>/g) || [];
    items.forEach((item: string) => {
      // Extract text, removing nested <p> tags
      let text = item.replace(/<li>/, '').replace(/<\/li>/, '');
      text = text.replace(/<p>/g, '').replace(/<\/p>/g, '');
      text = text.trim();
      if (text) {
        result += `${counter++}. ${text}\n`;
      }
    });
    return result;
  });

  // Unordered lists
  markdown = markdown.replace(/<ul>([\s\S]*?)<\/ul>/g, (match, listContent) => {
    let result = '';
    const items = listContent.match(/<li>[\s\S]*?<\/li>/g) || [];
    items.forEach((item: string) => {
      let text = item.replace(/<li>/, '').replace(/<\/li>/, '');
      text = text.replace(/<p>/g, '').replace(/<\/p>/g, '');
      text = text.trim();
      if (text) {
        result += `* ${text}\n`;
      }
    });
    return result;
  });

  // Headers
  markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '# $1\n');
  markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, '## $1\n');
  markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, '### $1\n');

  // Inline formatting (bold, italic, etc)
  markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
  markdown = markdown.replace(/<b>(.*?)<\/b>/g, '**$1**');
  markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
  markdown = markdown.replace(/<i>(.*?)<\/i>/g, '*$1*');
  markdown = markdown.replace(/<u>(.*?)<\/u>/g, '<u>$1</u>');
  markdown = markdown.replace(/<s>(.*?)<\/s>/g, '~~$1~~');
  markdown = markdown.replace(/<strike>(.*?)<\/strike>/g, '~~$1~~');
  markdown = markdown.replace(/<del>(.*?)<\/del>/g, '~~$1~~');
  markdown = markdown.replace(/<code>(.*?)<\/code>/g, '`$1`');
  markdown = markdown.replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)');

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
