import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

export function sanitizeHtml(html) {
  if (!html) return '';
  
  const window = new JSDOM('').window;
  const purify = DOMPurify(window);
  
  return purify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
      'p', 'a', 'ul', 'ol', 'li', 'strong', 'b', 'i', 'em', 
      'blockquote', 'code', 'pre', 'img', 'span', 'div', 
      'br', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'src', 'alt', 'width', 'height', 
      'class', 'style', 'title', 'rel', 'dir', 'align'
    ],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
  });
}

