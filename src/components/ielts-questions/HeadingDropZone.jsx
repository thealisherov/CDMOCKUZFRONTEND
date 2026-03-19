'use client';

import React, { useState } from 'react';

/**
 * HeadingDropZone — IELTS CD-style drop zone for "List of Headings".
 *
 * Empty state:  Dashed border box with the question number centered
 *               on the top edge (floating badge style).
 * Filled state: Solid thin border (light blue), heading text in bold inside.
 */
const HeadingDropZone = ({ questionId, globalNum, onDrop, currentAnswer }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    const heading = e.dataTransfer.getData('text/heading');
    if (heading && onDrop) {
      onDrop({ [questionId]: heading });
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onDrop) {
      onDrop({ [questionId]: '' });
    }
  };

  /* ═══════════════ FILLED STATE ═══════════════ */
  if (currentAnswer) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 14px',
          border: '1.5px solid #7ecbf5',
          borderRadius: 4,
          background: '#fff',
          marginBottom: 6,
          maxWidth: '100%',
          cursor: 'pointer',
        }}
      >
        {/* Heading text */}
        <span
          style={{
            fontWeight: 700,
            fontSize: 15,
            lineHeight: 1.4,
            color: 'var(--test-fg, #111)',
          }}
          title={currentAnswer}
        >
          {currentAnswer}
        </span>

        {/* Clear ✕ button */}
        <button
          onClick={handleClear}
          title="Remove heading"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20,
            height: 20,
            border: '1px solid #ccc',
            borderRadius: 3,
            background: '#f5f5f5',
            cursor: 'pointer',
            color: '#888',
            fontSize: 13,
            fontWeight: 700,
            lineHeight: 1,
            padding: 0,
            marginLeft: 4,
            flexShrink: 0,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fee2e2';
            e.currentTarget.style.borderColor = '#fca5a5';
            e.currentTarget.style.color = '#dc2626';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#f5f5f5';
            e.currentTarget.style.borderColor = '#ccc';
            e.currentTarget.style.color = '#888';
          }}
        >
          ✕
        </button>
      </div>
    );
  }

  /* ═══════════════ EMPTY STATE ═══════════════ */
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        position: 'relative',
        display: 'inline-block',
        minWidth: 600,
        maxWidth: '80%',
        height: 40,
        border: isOver
          ? '2px dashed #2563eb'
          : '1.5px dashed #999',
        borderRadius: 4,
        background: isOver ? 'rgba(37, 99, 235, 0.04)' : 'transparent',
        marginBottom: 6,
        transition: 'all 0.2s ease',
      }}
    >
      {/* ── Number badge centered on the top border ── */}
      <div
        style={{
          position: 'absolute',
          marginTop: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 38,
          height: 24,
          padding: '0 10px',
          background: 'var(--test-panel-bg, #fff)',
          fontWeight: 700,
          fontSize: 14,
          color: 'var(--test-fg, #333)',
          userSelect: 'none',
          letterSpacing: '-0.3px',
        }}
      >
        {globalNum}
      </div>
    </div>
  );
};

export default HeadingDropZone;
