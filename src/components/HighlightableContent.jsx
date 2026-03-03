import React, { memo, useState, useRef, useEffect } from 'react';

/**
 * Inline Toolbar Component for highlighting
 */
const InlineToolbar = ({ position, onHighlight, onEraser }) => {
  if (!position) return null;

  return (
    <div 
      className="fixed z-50 flex items-center gap-1 p-1.5 bg-gray-50 rounded-lg shadow-lg border border-gray-200 inline-toolbar"
      style={{ 
        left: position.left, 
        top: position.top,
        transform: 'translateX(-50%)'
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <button
        onClick={onHighlight}
        className="p-1.5 hover:bg-gray-200 rounded text-gray-700 transition-colors"
        title="Highlight"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          <path d="M3 21h18" strokeWidth={2} strokeLinecap="round"/>
        </svg>
        <div className="h-1 w-full bg-[#ddff00] mt-0.5 rounded-full"></div>
      </button>

      <div className="w-px h-5 bg-gray-300 mx-1"></div>

      <button
        onClick={onEraser}
        className="p-1.5 hover:bg-gray-200 rounded text-gray-700 transition-colors"
        title="Eraser"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};

/**
 * HighlightableContent - A wrapper component that enables text highlighting
 * Can be used for any content that needs highlighting functionality
 */
const HighlightableContent = memo(function HighlightableContent({ 
  children,
  className = '',
  enabled = true
}) {
  const [toolbarPos, setToolbarPos] = useState(null);
  const contentRef = useRef(null);

  // Listen for Selection Changes - OPTIMIZED: Use onMouseUp instead of selectionchange
  const handleSelectionChange = () => {
    const selection = window.getSelection();
    
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      setToolbarPos(null);
      return;
    }

    const range = selection.getRangeAt(0);
    
    // Ensure selection is inside our content
    if (!contentRef.current || !contentRef.current.contains(range.commonAncestorContainer)) {
      setToolbarPos(null);
      return;
    }

    // Calculate Position
    const rect = range.getBoundingClientRect();
    
    setToolbarPos({
      top: rect.top - 50,
      left: rect.left + (rect.width / 2)
    });
  };

  // Close toolbar when scrolling
  useEffect(() => {
    const handleScroll = () => {
        if (toolbarPos) setToolbarPos(null);
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [toolbarPos]);

  // Highlight Logic
  const handleHighlight = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const mark = document.createElement('mark');
    mark.className = 'highlight';

    try {
      range.surroundContents(mark);
    } catch (e) {
      try {
        const fragment = range.extractContents();
        mark.appendChild(fragment);
        range.insertNode(mark);
      } catch (err) {
        console.error('Highlight failed:', err);
      }
    }

    selection.removeAllRanges();
    setToolbarPos(null);
  };

  // Eraser Logic - removes highlight from selected text
  const handleEraser = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);

    // Helper function to check if a node is inside the selection range
    const isNodeInRange = (node, range) => {
      try {
        const nodeRange = document.createRange();
        nodeRange.selectNodeContents(node);
        return range.intersectsNode(node);
      } catch {
        return false;
      }
    };

    // Fallback method: find all highlights in content and remove those that intersect with selection
    const removeHighlightsInRange = () => {
      if (!contentRef.current) return false;
      
      const highlights = contentRef.current.querySelectorAll('mark.highlight');
      let removed = false;
      
      highlights.forEach(mark => {
        if (isNodeInRange(mark, range)) {
          // Replace the mark with its text content
          const textNode = document.createTextNode(mark.textContent);
          mark.parentNode.replaceChild(textNode, mark);
          removed = true;
        }
      });
      
      if (removed && contentRef.current) {
        contentRef.current.normalize();
      }
      
      return removed;
    };

    try {
      // Primary method: Extract and clean content
      const fragment = range.extractContents();
      
      // Recursively remove all mark.highlight elements, keeping their text content
      const removeHighlights = (node) => {
        if (!node) return document.createDocumentFragment();
        
        const cleanedFragment = document.createDocumentFragment();
        
        const processNode = (n) => {
          if (n.nodeType === Node.TEXT_NODE) {
            return n.cloneNode();
          }
          
          if (n.nodeType === Node.ELEMENT_NODE) {
            // If it's a highlight mark, just return its children (unwrap)
            if (n.tagName === 'MARK' && n.classList.contains('highlight')) {
              const innerFragment = document.createDocumentFragment();
              Array.from(n.childNodes).forEach(child => {
                const processed = processNode(child);
                if (processed) innerFragment.appendChild(processed);
              });
              return innerFragment;
            }
            
            // For other elements, clone and process children
            const clone = n.cloneNode(false);
            Array.from(n.childNodes).forEach(child => {
              const processed = processNode(child);
              if (processed) clone.appendChild(processed);
            });
            return clone;
          }
          
          return n.cloneNode(true);
        };
        
        Array.from(node.childNodes).forEach(child => {
          const processed = processNode(child);
          if (processed) cleanedFragment.appendChild(processed);
        });
        
        return cleanedFragment;
      };
      
      const cleanedContent = removeHighlights(fragment);
      range.insertNode(cleanedContent);
      
    } catch (e) {
      console.warn('Primary eraser method failed, trying fallback:', e);
      // Fallback: Remove highlights that intersect with selection directly
      if (!removeHighlightsInRange()) {
        console.error('Eraser fallback also failed');
      }
    }
    
    // Normalize to merge adjacent text nodes
    if (contentRef.current) {
      contentRef.current.normalize();
    }

    selection.removeAllRanges();
    setToolbarPos(null);
  };

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <>
      <InlineToolbar 
        position={toolbarPos} 
        onHighlight={handleHighlight} 
        onEraser={handleEraser} 
      />
      <div 
        ref={contentRef} 
        className={`select-text ${className}`}
        onMouseUp={handleSelectionChange} // Trigger on mouse up
        onKeyUp={handleSelectionChange}   // Trigger on key up (for keyboard selection)
      >
        {children}
      </div>
    </>
  );
});

export default HighlightableContent;
