'use client';

import { useState, useCallback } from 'react';

const CONTRAST_THEMES = {
  'black-on-white': {
    '--test-bg':        '#ffffff',
    '--test-fg':        '#333333',
    '--test-header-bg': '#ffffff',
    '--test-header-fg': '#333333',
    '--test-strip-bg':  '#f2f3f2',
    '--test-strip-fg':  '#000000',
    '--test-panel-bg':  '#ffffff',
    '--test-border':    '#e0e0e0',
    '--test-input-bg':  '#ffffff',
    '--test-nav-bg':    '#ffffff',
    '--test-nav-fg':    '#333333',
    '--opts-bg':        '#ffffff',
    '--opts-fg':        '#111111',
    '--opts-border':    '#e0e0e0',
    '--opts-highlight': '#ebebeb',
    '--opts-muted':     '#555555',
    '--test-hl-bg':     '#ffee58',
    '--test-hl-fg':     '#000000',
    '--test-note-bg':   '#bfd4f2',
    '--test-note-fg':   '#000000',
    '--test-note-border': '#a6c1e3',
  },
  'white-on-black': {
    '--test-bg':        '#000000',
    '--test-fg':        '#ffffff',
    '--test-header-bg': '#000000',
    '--test-header-fg': '#ffffff',
    '--test-strip-bg':  '#111111',
    '--test-strip-fg':  '#ffffff',
    '--test-panel-bg':  '#000000',
    '--test-border':    '#444444',
    '--test-input-bg':  '#111111',
    '--test-nav-bg':    '#000000',
    '--test-nav-fg':    '#ffffff',
    '--opts-bg':        '#000000',
    '--opts-fg':        '#ffffff',
    '--opts-border':    '#444444',
    '--opts-highlight': '#222222',
    '--opts-muted':     '#aaaaaa',
    '--test-hl-bg':     '#ffee58',
    '--test-hl-fg':     '#000000',
    '--test-note-bg':   '#bfd4f2',
    '--test-note-fg':   '#000000',
    '--test-note-border': '#a6c1e3',
  },
  'yellow-on-black': {
    '--test-bg':        '#000000',
    '--test-fg':        '#ffff00',
    '--test-header-bg': '#000000',
    '--test-header-fg': '#ffff00',
    '--test-strip-bg':  '#111111',
    '--test-strip-fg':  '#ffff00',
    '--test-panel-bg':  '#000000',
    '--test-border':    '#555500',
    '--test-input-bg':  '#111100',
    '--test-nav-bg':    '#000000',
    '--test-nav-fg':    '#ffff00',
    '--opts-bg':        '#000000',
    '--opts-fg':        '#ffff00',
    '--opts-border':    '#555500',
    '--opts-highlight': '#1a1a00',
    '--opts-muted':     '#cccc00',
    '--test-hl-bg':     '#ffff00',
    '--test-hl-fg':     '#000000',
    '--test-note-bg':   '#ffff00',
    '--test-note-fg':   '#000000',
    '--test-note-border': '#555500',
  },
};

const TEXT_SIZE_MAP = {
  'regular':     '16px',
  'large':       '19px',
  'extra-large': '22px',
};

export function useIELTSTheme() {
  const [contrast, setContrast] = useState('black-on-white');
  const [textSize, setTextSize] = useState('regular');

  const getWrapperStyle = useCallback(() => {
    const vars = CONTRAST_THEMES[contrast] || CONTRAST_THEMES['black-on-white'];
    return {
      ...vars,
      fontSize: TEXT_SIZE_MAP[textSize] || '16px',
    };
  }, [contrast, textSize]);

  return { contrast, setContrast, textSize, setTextSize, getWrapperStyle };
}
