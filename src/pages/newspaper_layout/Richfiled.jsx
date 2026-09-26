import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

// ─── Color Picker Portal ───────────────────────────────────────────────────────
function ColorPickerPortal({ pos, colors, onPick, onClose }) {
  useEffect(() => {
    const handler = () => onClose();
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div
      onMouseDown={e => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 4,
        padding: 8,
        background: '#2a2a2a',
        border: '1px solid #555',
        borderRadius: 6,
        zIndex: 999999,
        boxShadow: '0 4px 16px rgba(0,0,0,0.7)',
        minWidth: 120,
      }}
    >
      {colors.map(c => (
        <div
          key={c}
          onMouseDown={e => { e.preventDefault(); e.stopPropagation(); onPick(c); }}
          style={{
            width: 22,
            height: 22,
            borderRadius: 3,
            background: c,
            border: '1px solid #666',
            cursor: 'pointer',
          }}
        />
      ))}
    </div>,
    document.body
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN MAIN COMPONENT (Pure Web/JSX React)
// ══════════════════════════════════════════════════════════════════════════════
export default function RichField({ label, value, onChange }) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgPicker, setShowBgPicker]       = useState(false);
  const [pickerPos, setPickerPos]             = useState({ top: 0, left: 0 });
  const colorBtnRef = useRef(null);
  const bgBtnRef    = useRef(null);
  const editorRef   = useRef(null);
  const initDone    = useRef(false);

  // Set initial value only once
  useEffect(() => {
    if (editorRef.current && !initDone.current) {
      editorRef.current.innerHTML = value || '';
      initDone.current = true;
    }
  }, [value]);

  const exec = (cmd, val = null) => {
    editorRef.current?.focus();
    setTimeout(() => document.execCommand(cmd, false, val), 10);
  };

  const openPicker = (type, btnRef) => {
    const r = btnRef.current?.getBoundingClientRect();
    setPickerPos(r ? { top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX } : { top: 100, left: 100 });
    if (type === 'color') {
      setShowBgPicker(false);
      setShowColorPicker(v => !v);
    } else {
      setShowColorPicker(false);
      setShowBgPicker(v => !v);
    }
  };

  const COLORS = [
    '#000000','#ffffff','#ff0000','#cc0000','#ff6600',
    '#ea580c','#ff9900','#ffcc00','#008000','#0000ff',
    '#800080','#ff69b4','#808080','#c0c0c0','#1a1a1a',
  ];

  const FONTS = ['Mukta','Noto Sans Devanagari','Noto Serif Devanagari','Arial','Times New Roman','Georgia','Courier New'];
  const SIZES = ['10px','12px','14px','16px','18px','20px','24px','28px','32px','36px','48px'];

  const sanitizedLabel = label?.replace(/\s/g,'_') || 'editor';

  return (
    <div style={{ marginBottom: 14, fontFamily: 'sans-serif' }}>
      {/* Label rendering for Web */}
      {label && (
        <div style={{ color: '#888', fontSize: 11, fontWeight: '600', marginBottom: 5, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          {label}
        </div>
      )}

      <style>{`
        .rte-toolbar-${sanitizedLabel} {
          background:#2a2a2a; border:1px solid #444; border-bottom:none;
          border-radius:6px 6px 0 0; padding:5px 7px;
          display:flex; flex-wrap:wrap; gap:3px; align-items:center;
        }
        .rte-btn { background:#3a3a3a; border:1px solid #555; color:#ccc; padding:3px 7px; border-radius:4px; cursor:pointer; font-size:12px; min-width:26px; line-height:1.4; }
        .rte-btn:hover { background:#ea580c !important; color:#fff !important; border-color:#ea580c !important; }
        .rte-select { background:#3a3a3a; border:1px solid #555; color:#ccc; padding:3px 5px; border-radius:4px; cursor:pointer; font-size:11px; max-width:100px; }
        .rte-select option { background:#2a2a2a; }
        .rte-sep { width:1px; height:18px; background:#555; margin:0 2px; flex-shrink:0; }
        .rte-editor {
          background:#1e1e1e; border:1px solid #444; border-radius:0 0 6px 6px;
          min-height:120px; color:#fff; padding:10px 12px;
          font-family:'Mukta','Noto Sans Devanagari',sans-serif;
          font-size:13px; outline:none; line-height:1.6;
          word-break:break-word; overflow-wrap:break-word;
        }
        .rte-editor:empty:before { content:attr(data-placeholder); color:#555; pointer-events:none; }
        .rte-editor h1 { font-size:24px; font-weight:900; color:#fff; }
        .rte-editor h2 { font-size:20px; font-weight:800; color:#fff; }
        .rte-editor h3 { font-size:16px; font-weight:700; color:#fff; }
        @media print {
          .rte-toolbar-${sanitizedLabel} { display:none !important; }
          .rte-editor {
            border:none !important;
            padding:0 !important;
            min-height:0 !important;
            background:transparent !important;
            color:#000 !important;
            outline:none !important;
            box-shadow:none !important;
          }
          .rte-editor * { background:transparent !important; }
          .rte-editor h1, .rte-editor h2, .rte-editor h3 { color:#000 !important; }
          [contenteditable] { outline:none !important; border:none !important; }
        }
      `}</style>

      <div className={`rte-toolbar-${sanitizedLabel}`}>

        {/* Font Family */}
        <select className="rte-select"
          defaultValue=""
          onChange={e => exec('fontName', e.target.value)}
        >
          <option value="" disabled>Font</option>
          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>

        {/* Font Size */}
        <select className="rte-select"
          defaultValue=""
          onChange={e => {
            const newSize = e.target.value;
            editorRef.current?.focus();
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
              document.execCommand('fontSize', false, '7');
              setTimeout(() => {
                const els = editorRef.current?.querySelectorAll('font[size="7"]');
                els?.forEach(el => {
                  el.removeAttribute('size');
                  el.style.fontSize = newSize;
                  el.querySelectorAll('[style*="font-size"]').forEach(child => {
                    child.style.fontSize = newSize;
                  });
                });
                onChange && onChange(editorRef.current.innerHTML);
              }, 0);
            } else {
              editorRef.current.querySelectorAll('*').forEach(el => {
                el.style.fontSize = newSize;
              });
              onChange && onChange(editorRef.current.innerHTML);
            }
          }}
        >
          <option value="" disabled>Size</option>
          {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <div className="rte-sep"/>

        {/* Bold Italic Underline Strikethrough */}
        <button className="rte-btn" type="button" onMouseDown={e=>{e.preventDefault();exec('bold')}}><b>B</b></button>
        <button className="rte-btn" type="button" onMouseDown={e=>{e.preventDefault();exec('italic')}}><i>I</i></button>
        <button className="rte-btn" type="button" onMouseDown={e=>{e.preventDefault();exec('underline')}}><u>U</u></button>
        <button className="rte-btn" type="button" onMouseDown={e=>{e.preventDefault();exec('strikeThrough')}}><s>S</s></button>

        <div className="rte-sep"/>

        {/* Text Color */}
        <button
          ref={colorBtnRef}
          className="rte-btn"
          type="button"
          onMouseDown={e => { e.preventDefault(); e.stopPropagation(); openPicker('color', colorBtnRef); }}
          style={{ display:'flex', alignItems:'center', gap:3 }}
        >
          <span>A</span>
          <span style={{ width:10, height:3, background:'#ff0000', borderRadius:1, display:'block' }}/>
        </button>

        {/* Highlight Color */}
        <button
          ref={bgBtnRef}
          className="rte-btn"
          type="button"
          onMouseDown={e => { e.preventDefault(); e.stopPropagation(); openPicker('bg', bgBtnRef); }}
          style={{ display:'flex', alignItems:'center', gap:3 }}
        >
          <span>H</span>
          <span style={{ width:10, height:3, background:'#ffff00', borderRadius:1, display:'block' }}/>
        </button>

        <div className="rte-sep"/>

        {/* Alignment */}
        <button className="rte-btn" type="button" onMouseDown={e=>{e.preventDefault();exec('justifyLeft')}}>≡L</button>
        <button className="rte-btn" type="button" onMouseDown={e=>{e.preventDefault();exec('justifyCenter')}}>≡C</button>
        <button className="rte-btn" type="button" onMouseDown={e=>{e.preventDefault();exec('justifyRight')}}>≡R</button>

        <div className="rte-sep"/>

        {/* Lists */}
        <button className="rte-btn" type="button" onMouseDown={e=>{e.preventDefault();exec('insertUnorderedList')}}>•</button>
        <button className="rte-btn" type="button" onMouseDown={e=>{e.preventDefault();exec('insertOrderedList')}}>1.</button>

        <div className="rte-sep"/>

        {/* Headings */}
        <button className="rte-btn" type="button" onMouseDown={e=>{e.preventDefault();exec('formatBlock','H1')}}>H1</button>
        <button className="rte-btn" type="button" onMouseDown={e=>{e.preventDefault();exec('formatBlock','H2')}}>H2</button>
        <button className="rte-btn" type="button" onMouseDown={e=>{e.preventDefault();exec('formatBlock','P')}}>P</button>
      </div>

      {/* Editor Box */}
      <div
        ref={editorRef}
        className={`rte-editor`}
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Type here..."
        onInput={e => onChange && onChange(e.currentTarget.innerHTML)}
      />

      {/* Color Pickers via Portal */}
      {showColorPicker && (
        <ColorPickerPortal
          pos={pickerPos}
          colors={COLORS}
          onPick={c => { exec('foreColor', c); setShowColorPicker(false); }}
          onClose={() => setShowColorPicker(false)}
        />
      )}
      {showBgPicker && (
        <ColorPickerPortal
          pos={pickerPos}
          colors={COLORS}
          onPick={c => { exec('hiliteColor', c); setShowBgPicker(false); }}
          onClose={() => setShowBgPicker(false)}
        />
      )}
    </div>
  );
}