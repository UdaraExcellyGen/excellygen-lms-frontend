// src/components/common/MarkdownRenderer.tsx
import React, { useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';

// Import a CSS theme for highlight.js. Choose one from the node_modules/highlight.js/styles/ folder.
import 'highlight.js/styles/atom-one-dark.css';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

// Configure marked to use highlight.js
marked.setOptions({
    highlight: function(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    },
    langPrefix: 'hljs language-', // for CSS classes
    breaks: true, // render <br> on single line breaks
});

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
    // The content from Tiptap is HTML, not Markdown. `marked` is for markdown text.
    // However, if we're saving HTML, we just need to sanitize it.
    // If the content saved is Markdown text, then this setup is correct.
    // Since Tiptap outputs HTML, we'll assume we're saving HTML.
    
    // The core function: sanitize the HTML content
    const sanitizedHtml = DOMPurify.sanitize(content);
    
    // Use an effect to highlight code blocks after the component has rendered the sanitized HTML
    const containerRef = React.useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block as HTMLElement);
            });
        }
    }, [sanitizedHtml]);


    return (
        <div
            ref={containerRef}
            className={className}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
    );
};

export default MarkdownRenderer;