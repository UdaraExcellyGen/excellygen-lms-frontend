// src/components/common/CodeBlock.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check } from 'lucide-react';
import hljs from 'highlight.js';

interface CodeBlockProps {
    children: React.ReactNode;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children }) => {
    const [copied, setCopied] = useState(false);
    const codeRef = useRef<HTMLElement>(null);
    const textToCopy = useRef('');

    // Extract the raw text content once and store it for copying
    useEffect(() => {
        if (codeRef.current) {
            textToCopy.current = codeRef.current.textContent || '';
        }
    }, [children]);

    // Apply syntax highlighting after the component mounts
    useEffect(() => {
        if (codeRef.current) {
            hljs.highlightElement(codeRef.current);
        }
    }, [children]);

    const handleCopy = async () => {
        if (textToCopy.current) {
            await navigator.clipboard.writeText(textToCopy.current);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Show "Copied" for 2 seconds
        }
    };

    return (
        <div className="relative group my-4">
            <button
                onClick={handleCopy}
                disabled={copied}
                className="absolute top-2 right-2 p-1.5 bg-gray-800 text-gray-300 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 hover:bg-gray-700 disabled:opacity-100 disabled:bg-green-700"
                aria-label="Copy code"
            >
                {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <pre className="rounded-md">
                <code ref={codeRef}>
                    {children}
                </code>
            </pre>
        </div>
    );
};

export default CodeBlock;