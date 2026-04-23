/**
 * ET — Editable Text component.
 * In normal mode: renders text from the content system.
 * In edit mode: renders a contentEditable element with a subtle highlight.
 */
import React, { useRef, useEffect } from 'react';
import { useContent } from '../store/content-context';

interface ETProps {
  /** Content key */
  k: string;
  /** HTML tag to render (default: span) */
  as?: keyof React.JSX.IntrinsicElements;
  /** Additional className */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export function ET({ k, as: Tag = 'span', className, style }: ETProps) {
  const { get, update, isEditMode } = useContent();
  const text = get(k);
  const elRef = useRef<HTMLElement>(null);

  // Sync content when key/text changes externally
  useEffect(() => {
    if (elRef.current && elRef.current.textContent !== text) {
      elRef.current.textContent = text;
    }
  }, [text]);

  if (!isEditMode) {
    // @ts-ignore — dynamic tag
    return <Tag className={className} style={style}>{text}</Tag>;
  }

  const editStyle: React.CSSProperties = {
    ...style,
    outline: 'none',
    cursor: 'text',
    borderBottom: '1px dashed #C8102E',
    background: 'rgba(200,16,46,0.04)',
    borderRadius: '2px',
    minWidth: '20px',
    display: Tag === 'span' ? 'inline' : undefined,
  };

  return (
    // @ts-ignore — dynamic tag
    <Tag
      ref={elRef}
      className={className}
      style={editStyle}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const newText = e.currentTarget.textContent || '';
        if (newText !== text) {
          update(k, newText);
        }
      }}
    >
      {text}
    </Tag>
  );
}

/**
 * EN — Editable Number component.
 * Same as ET but parses the blurred value as a number.
 */
export function EN({ k, prefix = '', suffix = '', className, style }: {
  k: string;
  prefix?: string;
  suffix?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { getNum, update, isEditMode } = useContent();
  const num = getNum(k);
  const display = `${prefix}${num}${suffix}`;
  const elRef = useRef<HTMLSpanElement>(null);

  if (!isEditMode) {
    return <span className={className} style={style}>{display}</span>;
  }

  const editStyle: React.CSSProperties = {
    ...style,
    outline: 'none',
    cursor: 'text',
    borderBottom: '1px dashed #C8102E',
    background: 'rgba(200,16,46,0.04)',
    borderRadius: '2px',
    minWidth: '20px',
  };

  return (
    <span
      ref={elRef}
      className={className}
      style={editStyle}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => {
        const raw = e.currentTarget.textContent || '';
        // Strip prefix/suffix and parse
        const cleaned = raw.replace(/[^0-9.]/g, '');
        const parsed = parseFloat(cleaned);
        if (!isNaN(parsed)) {
          update(k, parsed);
        }
      }}
    >
      {display}
    </span>
  );
}
