// src/pages/DiscussionForum/components/TiptapEditor.tsx
import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Strikethrough, Code, List, ListOrdered, Code2 } from 'lucide-react';
import './TiptapEditor.css'; // Import the CSS

interface TiptapEditorProps {
    content: string;
    onChange: (newContent: string) => void;
    disabled?: boolean;
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

const TiptapEditor: React.FC<TiptapEditorProps> = ({ content, onChange, disabled }) => {
    const editor = useEditor({
        extensions: [StarterKit.configure({
            bulletList: { keepMarks: true, keepAttributes: true },
            orderedList: { keepMarks: true, keepAttributes: true },
        })],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
            },
        },
        editable: !disabled,
    });
    
    // Update editor content if disabled prop changes
    React.useEffect(() => {
        if (editor) {
            editor.setEditable(!disabled);
        }
    }, [disabled, editor]);

    return (
        <div>
            <MenuBar editor={editor} disabled={disabled} />
            <EditorContent editor={editor} className="bg-purple-50/60 text-purple-900 rounded-b-lg"/>
        </div>
    );
};

export default TiptapEditor;