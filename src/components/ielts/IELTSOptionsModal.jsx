'use client';

import { useState } from 'react';

export default function IELTSOptionsModal({
  isOpen,
  onClose,
  onExit,
  onSubmit,
  contrast = 'black-on-white',
  onContrastChange,
  textSize = 'regular',
  onTextSizeChange,
}) {
  const [view, setView] = useState('main');

  if (!isOpen) return null;

  const handleClose = () => { setView('main'); onClose(); };
  const handleContrastSelect = (v) => { onContrastChange?.(v); setView('main'); };
  const handleTextSizeSelect = (v) => { onTextSizeChange?.(v); setView('main'); };
  const handleConfirmExit = () => { setView('main'); onClose(); onExit?.(); };
  const handleGoToSubmission = () => { handleClose(); onSubmit?.(); };

  const overlay = {
    position: 'fixed', inset: 0, zIndex: 2000,
    background: 'rgba(0,0,0,0.2)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
  };
  const box = {
    background: 'var(--opts-bg, #fff)',
    color: 'var(--opts-fg, #111)',
    width: '100%', maxWidth: 560, minHeight: '100vh',
    fontFamily: 'Arial, sans-serif',
    position: 'relative',
  };
  const header = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '22px 24px 18px', borderBottom: '1px solid var(--opts-border, #eee)',
    position: 'relative', marginBottom: 8,
  };
  const titleStyle = { fontSize: 22, fontWeight: 400 };
  const closeBtn = {
    position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', fontSize: 28, cursor: 'pointer',
    color: 'var(--opts-fg, #111)', lineHeight: 1, padding: '2px 8px',
  };
  const backBtn = {
    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', fontSize: 15, cursor: 'pointer',
    color: 'var(--opts-fg, #111)', fontWeight: 500, padding: '4px 6px',
    display: 'flex', alignItems: 'center', gap: 2,
  };
  const listItem = (highlighted = false) => ({
    display: 'flex', alignItems: 'center', padding: '18px 24px',
    cursor: 'pointer', fontSize: 17,
    background: highlighted ? 'var(--opts-highlight, #ebebeb)' : 'var(--opts-bg, #fff)',
    color: 'var(--opts-fg, #111)',
    borderBottom: '1px solid var(--opts-border, #eee)',
    userSelect: 'none',
  });

  // EXIT CONFIRM
  if (view === 'exit-confirm') {
    return (
      <div style={overlay} onClick={handleClose}>
        <div style={{ ...box, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
          <button style={closeBtn} onClick={handleClose}>✕</button>
          <div style={{ padding: '0 40px', textAlign: 'center', maxWidth: 380 }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 14, color: 'var(--opts-fg, #111)' }}>Leave test?</h2>
            <p style={{ fontSize: 15, color: 'var(--opts-muted, #555)', marginBottom: 40, lineHeight: 1.6 }}>
              Are you sure you want to exit? Your progress will not be saved.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setView('main')} style={{
                padding: '12px 32px', border: '1px solid #bbb', borderRadius: 4,
                background: 'var(--opts-bg, #fff)', color: 'var(--opts-fg, #222)',
                fontSize: 15, cursor: 'pointer', fontWeight: 500,
              }}>Cancel</button>
              <button onClick={handleConfirmExit} style={{
                padding: '12px 32px', border: 'none', borderRadius: 4,
                background: '#c8102e', color: '#fff', fontSize: 15, cursor: 'pointer', fontWeight: 600,
              }}>OK</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CONTRAST
  if (view === 'contrast') {
    const opts = [
      { value: 'black-on-white', label: 'Black on white' },
      { value: 'white-on-black', label: 'White on black' },
      { value: 'yellow-on-black', label: 'Yellow on black' },
    ];
    return (
      <div style={overlay} onClick={handleClose}>
        <div style={box} onClick={e => e.stopPropagation()}>
          <div style={header}>
            <button style={backBtn} onClick={() => setView('main')}>‹ Options</button>
            <span style={titleStyle}>Contrast</span>
            <button style={closeBtn} onClick={handleClose}>✕</button>
          </div>
          <div style={{ margin: '12px 24px', border: '1px solid var(--opts-border, #ddd)', borderRadius: 4, overflow: 'hidden' }}>
            {opts.map((o, i) => (
              <div key={o.value} style={{ ...listItem(o.value === 'white-on-black'), borderBottom: i < opts.length - 1 ? '1px solid var(--opts-border, #eee)' : 'none' }} onClick={() => handleContrastSelect(o.value)}>
                <span style={{ width: 28, flexShrink: 0, fontWeight: 700, fontSize: 18 }}>{contrast === o.value ? '✓' : ''}</span>
                {o.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // TEXT SIZE
  if (view === 'textsize') {
    const sizes = [
      { value: 'regular', label: 'Regular' },
      { value: 'large', label: 'Large' },
      { value: 'extra-large', label: 'Extra large' },
    ];
    return (
      <div style={overlay} onClick={handleClose}>
        <div style={box} onClick={e => e.stopPropagation()}>
          <div style={header}>
            <button style={backBtn} onClick={() => setView('main')}>‹ Options</button>
            <span style={titleStyle}>Text size</span>
            <button style={closeBtn} onClick={handleClose}>✕</button>
          </div>
          <div style={{ margin: '12px 24px', border: '1px solid var(--opts-border, #ddd)', borderRadius: 4, overflow: 'hidden' }}>
            {sizes.map((sz, i) => (
              <div key={sz.value} style={{ ...listItem(), borderBottom: i < sizes.length - 1 ? '1px solid var(--opts-border, #eee)' : 'none' }} onClick={() => handleTextSizeSelect(sz.value)}>
                <span style={{ width: 28, flexShrink: 0, fontWeight: 700, fontSize: 18 }}>{textSize === sz.value ? '✓' : ''}</span>
                {sz.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // MAIN
  return (
    <div style={overlay} onClick={handleClose}>
      <div style={box} onClick={e => e.stopPropagation()}>
        <div style={header}>
          <span style={titleStyle}>Options</span>
          <button style={closeBtn} onClick={handleClose}>✕</button>
        </div>

        <div style={{ padding: '8px 24px 4px' }}>
          <button onClick={handleGoToSubmission} style={{
            display: 'flex', alignItems: 'center', width: '100%', padding: '20px 22px',
            background: '#c8102e', color: '#fff', border: 'none', borderRadius: 4,
            fontSize: 17, fontWeight: 500, cursor: 'pointer',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 14, flexShrink: 0 }}>
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Go to submission page
            <span style={{ marginLeft: 'auto', fontSize: 20 }}>›</span>
          </button>
        </div>

        <div style={{ margin: '20px 24px 0', border: '1px solid var(--opts-border, #ddd)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ ...listItem(), borderBottom: '1px solid var(--opts-border, #eee)' }} onClick={() => setView('contrast')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginRight: 14, opacity: 0.5, flexShrink: 0 }}>
              <circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18V3z" fill="currentColor" fillOpacity="0.35"/>
            </svg>
            Contrast
            <span style={{ marginLeft: 'auto', fontSize: 20, color: '#999' }}>›</span>
          </div>
          <div style={listItem()} onClick={() => setView('textsize')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginRight: 14, opacity: 0.5, flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
            Text size
            <span style={{ marginLeft: 'auto', fontSize: 20, color: '#999' }}>›</span>
          </div>
        </div>

        <div style={{ padding: '20px 24px' }}>
          <button onClick={() => setView('exit-confirm')} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', padding: '16px 22px',
            background: 'var(--opts-bg, #fff)', color: '#c8102e',
            border: '1px solid #c8102e', borderRadius: 4,
            fontSize: 16, fontWeight: 600, cursor: 'pointer',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Exit test
          </button>
        </div>
      </div>
    </div>
  );
}
