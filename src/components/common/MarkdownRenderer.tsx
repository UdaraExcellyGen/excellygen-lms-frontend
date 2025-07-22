// src/components/common/MarkdownRenderer.tsx
import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import parse, { domToReact, Element } from 'html-react-parser'; // <-- NEW IMPORTS
import CodeBlock from './CodeBlock'; // <-- NEW IMPORT

import 'highlight.js/styles/atom-one-dark.css';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

// Configure marked (this is still useful if the input is ever markdown)
marked.setOptions({
    highlight: function(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    },
    langPrefix: 'hljs language-',
    breaks: true,
});

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
    // Since Tiptap outputs HTML, we first sanitize it.
    const sanitizedHtml = DOMPurify.sanitize(content);

    // Options for html-react-parser
    const options = {
        replace: (domNode: any) => {
            // Look for <pre> tags, which Tiptap uses for code blocks
            if (domNode instanceof Element && domNode.tagName === 'pre') {
                // The direct child of <pre> should be <code>
                const codeChild = domNode.children[0];
                
                if (codeChild && codeChild.type === 'tag' && codeChild.name === 'code') {
                    // Pass the content of the <code> tag to our custom CodeBlock component
                    return <CodeBlock>{domToReact(codeChild.children)}</CodeBlock>;
                }
            }
        },
    };

    return (
        <div className={className}>
            {parse(sanitizedHtml, options)}
        </div>
    );
};

export default MarkdownRenderer;