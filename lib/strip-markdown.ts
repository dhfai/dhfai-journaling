/**
 * Strip markdown syntax from text for plain text preview
 */
export function stripMarkdown(markdown: string): string {
  if (!markdown) return '';

  let text = markdown;

  // Remove HTML tags (like <u>text</u>)
  text = text.replace(/<[^>]*>/g, '');

  // Remove bold (**text** or __text__)
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');

  // Remove italic (*text* or _text_)
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');

  // Remove strikethrough (~~text~~)
  text = text.replace(/~~([^~]+)~~/g, '$1');

  // Remove inline code (`text`)
  text = text.replace(/`([^`]+)`/g, '$1');

  // Remove code blocks (```text```)
  text = text.replace(/```[^```]*```/g, '');

  // Remove headers (# text)
  text = text.replace(/#{1,6}\s/g, '');

  // Remove links ([text](url))
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove images (![alt](url))
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');

  // Remove blockquotes (> text)
  text = text.replace(/>\s/g, '');

  // Remove horizontal rules (---, ***, ___)
  text = text.replace(/^[-*_]{3,}$/gm, '');

  // Remove list markers (-, *, +, 1.)
  text = text.replace(/^[\s]*[-*+]\s/gm, '');
  text = text.replace(/^[\s]*\d+\.\s/gm, '');

  // Collapse multiple spaces
  text = text.replace(/\s+/g, ' ');

  // Trim
  text = text.trim();

  return text;
}
