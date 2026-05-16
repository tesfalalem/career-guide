import React, { useRef, useCallback, useEffect } from 'react';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignJustify,
  Highlighter, Type, Code, List, ListOrdered, Minus
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

// Font size options
const FONT_SIZES = [
  { label: 'Small',    value: '12px' },
  { label: 'Normal',   value: '15px' },
  { label: 'Large',    value: '18px' },
  { label: 'H3',       value: '22px' },
  { label: 'H2',       value: '26px' },
  { label: 'H1',       value: '32px' },
];

// Text colors
const TEXT_COLORS = [
  { label: 'Default',    value: 'inherit' },
  { label: 'Navy',       value: '#02436D' },
  { label: 'Teal',       value: '#0D9488' },
  { label: 'Red',        value: '#EF4444' },
  { label: 'Orange',     value: '#F97316' },
  { label: 'Amber',      value: '#F59E0B' },
  { label: 'Green',      value: '#10B981' },
  { label: 'Purple',     value: '#8B5CF6' },
  { label: 'Slate',      value: '#64748B' },
];

// Highlight colors
const HIGHLIGHT_COLORS = [
  { label: 'None',       value: 'transparent' },
  { label: 'Yellow',     value: '#FEF08A' },
  { label: 'Green',      value: '#BBF7D0' },
  { label: 'Blue',       value: '#BAE6FD' },
  { label: 'Pink',       value: '#FBCFE8' },
  { label: 'Orange',     value: '#FED7AA' },
  { label: 'Purple',     value: '#E9D5FF' },
];

const ToolbarButton: React.FC<{
  onClick: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}> = ({ onClick, title, active, children }) => (
  <button
    type="button"
    title={title}
    onMouseDown={e => { e.preventDefault(); onClick(); }}
    className={`p-1.5 rounded-lg transition-all hover:bg-slate-200 dark:hover:bg-slate-700 ${
      active ? 'bg-careermap-teal/20 text-careermap-teal' : 'text-slate-600 dark:text-slate-400'
    }`}
  >
    {children}
  </button>
);

const Divider = () => (
  <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
);

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write content here...',
  minHeight = 180,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Sync value → DOM only when value changes externally
  useEffect(() => {
    if (!editorRef.current) return;
    if (isInternalUpdate.current) { isInternalUpdate.current = false; return; }
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = useCallback((command: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    if (editorRef.current) {
      isInternalUpdate.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalUpdate.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const isActive = (command: string) => {
    try { return document.queryCommandState(command); } catch { return false; }
  };

  const insertCodeBlock = () => {
    const sel = window.getSelection();
    const text = sel?.toString() || 'code here';
    exec('insertHTML', `<code style="background:#1e293b;color:#e2e8f0;padding:2px 8px;border-radius:6px;font-family:monospace;font-size:13px">${text}</code>`);
  };

  const insertDivider = () => {
    exec('insertHTML', '<hr style="border:none;border-top:2px solid #e2e8f0;margin:16px 0"/>');
  };

  const applyFontSize = (size: string) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;
    exec('insertHTML',
      `<span style="font-size:${size}">${range.toString()}</span>`
    );
  };

  const applyTextColor = (color: string) => {
    if (color === 'inherit') exec('removeFormat');
    else exec('foreColor', color);
  };

  const applyHighlight = (color: string) => {
    if (color === 'transparent') exec('hiliteColor', 'transparent');
    else exec('hiliteColor', color);
  };

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">

        {/* Font size */}
        <select
          onMouseDown={e => e.preventDefault()}
          onChange={e => applyFontSize(e.target.value)}
          defaultValue=""
          className="h-7 px-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 outline-none cursor-pointer mr-1"
          title="Font Size"
        >
          <option value="" disabled>Size</option>
          {FONT_SIZES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <Divider />

        {/* Bold / Italic / Underline */}
        <ToolbarButton onClick={() => exec('bold')} title="Bold" active={isActive('bold')}>
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('italic')} title="Italic" active={isActive('italic')}>
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('underline')} title="Underline" active={isActive('underline')}>
          <Underline size={14} />
        </ToolbarButton>

        <Divider />

        {/* Text color */}
        <div className="relative group" title="Text Color">
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <Type size={14} className="text-slate-600 dark:text-slate-400" />
            <span className="text-[10px] text-slate-500">A</span>
          </button>
          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 z-50 hidden group-hover:flex flex-wrap gap-1 w-40">
            {TEXT_COLORS.map(c => (
              <button
                key={c.value}
                type="button"
                title={c.label}
                onMouseDown={e => { e.preventDefault(); applyTextColor(c.value); }}
                className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 shadow-sm hover:scale-110 transition-transform"
                style={{ backgroundColor: c.value === 'inherit' ? '#64748B' : c.value }}
              />
            ))}
          </div>
        </div>

        {/* Highlight color */}
        <div className="relative group" title="Highlight Color">
          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <Highlighter size={14} className="text-slate-600 dark:text-slate-400" />
          </button>
          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 z-50 hidden group-hover:flex flex-wrap gap-1 w-40">
            {HIGHLIGHT_COLORS.map(c => (
              <button
                key={c.value}
                type="button"
                title={c.label}
                onMouseDown={e => { e.preventDefault(); applyHighlight(c.value); }}
                className="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:scale-110 transition-transform"
                style={{ backgroundColor: c.value === 'transparent' ? '#f1f5f9' : c.value }}
              />
            ))}
          </div>
        </div>

        <Divider />

        {/* Alignment */}
        <ToolbarButton onClick={() => exec('justifyLeft')} title="Align Left" active={isActive('justifyLeft')}>
          <AlignLeft size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('justifyCenter')} title="Align Center" active={isActive('justifyCenter')}>
          <AlignCenter size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('justifyFull')} title="Justify" active={isActive('justifyFull')}>
          <AlignJustify size={14} />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton onClick={() => exec('insertUnorderedList')} title="Bullet List" active={isActive('insertUnorderedList')}>
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec('insertOrderedList')} title="Numbered List" active={isActive('insertOrderedList')}>
          <ListOrdered size={14} />
        </ToolbarButton>

        <Divider />

        {/* Code & Divider */}
        <ToolbarButton onClick={insertCodeBlock} title="Inline Code">
          <Code size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={insertDivider} title="Horizontal Rule">
          <Minus size={14} />
        </ToolbarButton>
      </div>

      {/* ── Editable area ── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className={`
          px-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none
          leading-relaxed overflow-y-auto
          [&_code]:bg-slate-900 [&_code]:text-slate-100 [&_code]:px-2 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-xs
          [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
          [&_hr]:border-t-2 [&_hr]:border-slate-200 [&_hr]:my-4
          empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none
        `}
      />
    </div>
  );
};

export default RichTextEditor;
