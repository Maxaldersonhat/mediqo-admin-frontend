import React, { useRef } from 'react';

interface EditorToolbarProps {
  onFormat: (command: string, value?: string) => void;
  onInsertLink: () => void;
  onUploadImage: (file: File) => void;
}

export default function EditorToolbar({
  onFormat,
  onInsertLink,
  onUploadImage,
}: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadImage(file);
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50/80 p-2 dark:border-gray-700 dark:bg-gray-800/80 sticky top-0 z-10 backdrop-blur-sm">
      {/* Formatting Tools */}
      <button
        type="button"
        onClick={() => onFormat('bold')}
        title="Bold (Ctrl+B)"
        className="rounded-lg p-2 font-extrabold text-gray-700 hover:bg-gray-200 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
      >
        B
      </button>
      <button
        type="button"
        onClick={() => onFormat('italic')}
        title="Italic (Ctrl+I)"
        className="rounded-lg p-2 italic font-serif text-gray-700 hover:bg-gray-200 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
      >
        I
      </button>
      <button
        type="button"
        onClick={() => onFormat('underline')}
        title="Underline (Ctrl+U)"
        className="rounded-lg p-2 underline text-gray-700 hover:bg-gray-200 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
      >
        U
      </button>

      <div className="h-5 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

      {/* Font Size Selector */}
      <select
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) {
            onFormat('fontSize', e.target.value);
            e.target.value = ''; // Reset select after applying
          }
        }}
        title="Font Size"
        className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 focus:outline-none cursor-pointer transition-colors"
      >
        <option value="" disabled>Font Size</option>
        <option value="1">Small (10px)</option>
        <option value="2">Normal (13px)</option>
        <option value="3">Medium (16px)</option>
        <option value="4">Large (18px)</option>
        <option value="5">X-Large (24px)</option>
        <option value="6">XX-Large (32px)</option>
      </select>

      <div className="h-5 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

      {/* Headings */}
      <button
        type="button"
        onClick={() => onFormat('formatBlock', '<h2>')}
        title="Heading 2"
        className="rounded-lg px-2.5 py-1 text-sm font-bold text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => onFormat('formatBlock', '<h3>')}
        title="Heading 3"
        className="rounded-lg px-2.5 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
      >
        H3
      </button>

      <div className="h-5 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

      {/* Alignment Tools */}
      <button
        type="button"
        onClick={() => onFormat('justifyLeft')}
        title="Align Left"
        className="rounded-lg p-2 text-gray-700 hover:bg-gray-200 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h10M4 18h14" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onFormat('justifyCenter')}
        title="Align Middle (Center)"
        className="rounded-lg p-2 text-gray-700 hover:bg-gray-200 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M7 12h10M5 18h14" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onFormat('justifyRight')}
        title="Align Right"
        className="rounded-lg p-2 text-gray-700 hover:bg-gray-200 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M10 12h10M6 18h14" />
        </svg>
      </button>

      <div className="h-5 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

      {/* Lists */}
      <button
        type="button"
        onClick={() => onFormat('insertUnorderedList')}
        title="Bullet List"
        className="rounded-lg p-2 text-gray-700 hover:bg-gray-200 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onFormat('insertOrderedList')}
        title="Numbered List"
        className="rounded-lg p-2 text-gray-700 hover:bg-gray-200 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 6h14M7 12h14M7 18h14M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      </button>

      <div className="h-5 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

      {/* Link Insertion */}
      <button
        type="button"
        onClick={onInsertLink}
        title="Insert Link"
        className="rounded-lg p-2 text-gray-700 hover:bg-gray-200 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </button>

      {/* Image Upload Button */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        title="Upload Image"
        className="rounded-lg p-2 text-gray-700 hover:bg-gray-200 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>Image</span>
      </button>
    </div>
  );
}