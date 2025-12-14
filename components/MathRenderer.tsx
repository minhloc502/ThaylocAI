import React, { useEffect, useRef } from 'react';

interface MathRendererProps {
  content: string;
}

declare global {
  interface Window {
    MathJax: any;
  }
}

/**
 * Parses text and wraps mathematical expressions for basic formatting before passing to MathJax.
 * Note: A full markdown parser would be ideal, but for this constraint we handle:
 * 1. Line breaks -> <br/>
 * 2. MathJax handles the $...$ and $$...$$
 */
const formatText = (text: string) => {
  // Simple escape for HTML safety (basic implementation)
  // In a production app, use a sanitizer library like DOMPurify
  let safeText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Preserve LaTeX delimiters from being escaped incorrectly if needed, 
  // but usually MathJax handles raw strings well if we just put them in the DOM.
  // We restore line breaks to <br> for better readability in non-math parts
  return safeText.replace(/\n/g, '<br />');
};

const MathRenderer: React.FC<MathRendererProps> = ({ content }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Set the content
    // We treat the content as HTML to allow <br/> tags we generated, 
    // but MathJax will parse the $ delimiters inside.
    container.innerHTML = formatText(content);

    // 2. Trigger MathJax typeset
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([container])
        .catch((err: any) => console.error('MathJax typeset failed:', err))
        .then(() => {
          // Optional: clear formatting specific classes if needed
        });
    }
  }, [content]);

  return (
    <div 
      ref={containerRef} 
      className="math-content text-gray-800 leading-relaxed space-y-2 break-words"
    />
  );
};

export default MathRenderer;