/**
 * Markdown formatting utilities for text selection
 */

export interface FormatResult {
  newContent: string;
  newSelectionStart: number;
  newSelectionEnd: number;
}

/**
 * Wraps selected text with markdown syntax
 */
export function formatSelection(
  content: string,
  selectionStart: number,
  selectionEnd: number,
  syntax: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code'
): FormatResult {
  const selectedText = content.substring(selectionStart, selectionEnd);
  const beforeText = content.substring(0, selectionStart);
  const afterText = content.substring(selectionEnd);

  // Check if the selected text is already wrapped with the syntax
  const isAlreadyWrapped = isWrapped(selectedText, syntax);

  // If already wrapped, unwrap it
  if (isAlreadyWrapped) {
    const unwrapped = unwrapText(selectedText, syntax);
    const unwrappedContent = beforeText + unwrapped + afterText;
    return {
      newContent: unwrappedContent,
      newSelectionStart: selectionStart,
      newSelectionEnd: selectionStart + unwrapped.length,
    };
  }

  // Otherwise, wrap the text
  let wrappedText: string;
  let syntaxLength: number;

  switch (syntax) {
    case 'bold':
      wrappedText = `**${selectedText}**`;
      syntaxLength = 2;
      break;
    case 'italic':
      // Use underscore to avoid conflict with bold
      wrappedText = `_${selectedText}_`;
      syntaxLength = 1;
      break;
    case 'underline':
      // Use HTML tag for underline (supported by react-markdown with rehype-raw)
      wrappedText = `<u>${selectedText}</u>`;
      syntaxLength = 3;
      break;
    case 'strikethrough':
      wrappedText = `~~${selectedText}~~`;
      syntaxLength = 2;
      break;
    case 'code':
      wrappedText = `\`${selectedText}\``;
      syntaxLength = 1;
      break;
    default:
      wrappedText = selectedText;
      syntaxLength = 0;
  }

  const newContent = beforeText + wrappedText + afterText;

  // After wrapping, select the entire wrapped text INCLUDING the syntax markers
  // This allows the next click to properly detect and unwrap
  return {
    newContent,
    newSelectionStart: selectionStart,
    newSelectionEnd: selectionStart + wrappedText.length,
  };
}

/**
 * Check if text is already wrapped with given syntax
 */
function isWrapped(text: string, syntax: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code'): boolean {
  switch (syntax) {
    case 'bold':
      return text.startsWith('**') && text.endsWith('**') && text.length > 4;
    case 'italic':
      return (text.startsWith('_') && text.endsWith('_') && text.length > 2 && !text.startsWith('__')) ||
             (text.startsWith('*') && text.endsWith('*') && text.length > 2 && !text.startsWith('**'));
    case 'underline':
      return text.startsWith('<u>') && text.endsWith('</u>') && text.length > 7;
    case 'strikethrough':
      return text.startsWith('~~') && text.endsWith('~~') && text.length > 4;
    case 'code':
      return text.startsWith('`') && text.endsWith('`') && text.length > 2 && !text.startsWith('``');
    default:
      return false;
  }
}

/**
 * Remove markdown syntax from wrapped text
 */
function unwrapText(text: string, syntax: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code'): string {
  switch (syntax) {
    case 'bold':
      return text.slice(2, -2);
    case 'italic':
      if (text.startsWith('_')) return text.slice(1, -1);
      return text.slice(1, -1);
    case 'underline':
      return text.slice(3, -4);
    case 'strikethrough':
      return text.slice(2, -2);
    case 'code':
      return text.slice(1, -1);
    default:
      return text;
  }
}

/**
 * Calculate toolbar position based on selection
 */
export function getSelectionPosition(
  textarea: HTMLTextAreaElement
): { top: number; left: number } | null {
  const { selectionStart, selectionEnd } = textarea;

  if (selectionStart === selectionEnd) {
    return null; // No selection
  }

  // Create a temporary span to measure selection position
  const span = document.createElement('span');
  const text = textarea.value.substring(0, selectionStart);
  const textNode = document.createTextNode(text);
  span.appendChild(textNode);

  // Copy styles from textarea
  const computed = window.getComputedStyle(textarea);
  span.style.font = computed.font;
  span.style.padding = computed.padding;
  span.style.border = computed.border;
  span.style.whiteSpace = 'pre-wrap';
  span.style.wordWrap = 'break-word';
  span.style.position = 'absolute';
  span.style.visibility = 'hidden';
  span.style.width = textarea.offsetWidth + 'px';

  document.body.appendChild(span);

  const rect = textarea.getBoundingClientRect();
  const spanRect = span.getBoundingClientRect();

  document.body.removeChild(span);

  // Calculate position
  const top = rect.top + window.scrollY;
  const left = rect.left + window.scrollX + (rect.width / 2);

  return { top, left };
}
