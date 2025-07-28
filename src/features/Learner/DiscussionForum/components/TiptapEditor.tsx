// src/pages/DiscussionForum/components/TiptapEditor.tsx (FULL FILE)

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Strikethrough, Code, List, ListOrdered, Code2 } from 'lucide-react';
import './TiptapEditor.css'; // Your existing CSS file

interface TiptapEditorProps {
    content: string;
    onChange: (newContent: string) => void;
    disabled?: boolean;
    minHeight?: string;
    maxHeight?: string;
}

const MenuBar: React.FC<{ editor: any, disabled?: boolean }> = ({ editor, disabled }) => {
    if (!editor) {
        return null;
    }

    const buttonClass = (type: string) => 
        `p-2 rounded-md hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            editor.isActive(type) ? 'bg-purple-200 text-purple-800' : 'text-gray-600'
        }`;
        
    return (
        <div className="flex flex-wrap items-center gap-1 border border-gray-200 bg-gray-50 p-2 rounded-t-lg">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={disabled || !editor.can().chain().focus().toggleBold().run()}
                className={buttonClass('bold')}
                title="Bold"
            >
                <Bold size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={disabled || !editor.can().chain().focus().toggleItalic().run()}
                className={buttonClass('italic')}
                 title="Italic"
            >
                <Italic size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={disabled || !editor.can().chain().focus().toggleStrike().run()}
                className={buttonClass('strike')}
                title="Strikethrough"
            >
                <Strikethrough size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                disabled={disabled || !editor.can().chain().focus().toggleCode().run()}
                className={buttonClass('code')}
                title="Inline Code"
            >
                <Code size={18} />
            </button>
             <button
                type="button"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={buttonClass('codeBlock')}
                disabled={disabled}
                title="Code Block"
            >
                <Code2 size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={buttonClass('bulletList')}
                disabled={disabled}
                title="Bullet List"
            >
                <List size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={buttonClass('orderedList')}
                disabled={disabled}
                title="Ordered List"
            >
                <ListOrdered size={18} />
            </button>
        </div>
    );
};


const TiptapEditor: React.FC<TiptapEditorProps> = ({ content, onChange, disabled, minHeight = '150px', maxHeight = '400px' }) => {
    const editor = useEditor({
        extensions: [StarterKit],
        // The editor's content is managed by the useEffect below.
        // It starts empty and gets populated once.
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
            },
        },
        editable: !disabled,
    // --- THE FIX PART 1 ---
    // The dependency array is now stable. It does NOT include `content`.
    // This ensures the editor instance is created only once and is NOT destroyed on every keystroke.
    }, [disabled]);

    // --- THE FIX PART 2 ---
    // This effect handles setting the initial content and updating it if it changes from an external source.
    React.useEffect(() => {
        if (!editor) {
            return;
        }

        // Check if the editor's current content is different from the prop.
        // This is crucial to prevent this code from running on every keystroke.
        // It allows the editor to be updated when data is loaded, but not when the user is typing.
        if (content !== editor.getHTML()) {
            // Set the content programmatically without triggering the 'onUpdate' callback,
            // which prevents an infinite loop.
            editor.commands.setContent(content, false);
        }
    }, [content, editor]); // This hook runs only when the 'content' prop or 'editor' instance changes.

    return (
        <div>
            <MenuBar editor={editor} disabled={disabled} />
            <EditorContent 
                editor={editor} 
                className="bg-purple-50/60 text-purple-900 rounded-b-lg"
                style={{ minHeight, maxHeight, overflowY: 'auto' }} 
            />
        </div>
    );
};

export default TiptapEditor;