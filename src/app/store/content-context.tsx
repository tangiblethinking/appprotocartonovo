import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import defaultContent from './default-content.json';
import overrides from './content-overrides.json';

type ContentMap = Record<string, string | number>;

// Merge: overrides win over defaults
function buildMerged(): ContentMap {
  return { ...(defaultContent as ContentMap), ...(overrides as ContentMap) };
}

interface ContentContextType {
  /** Get a string value by key */
  get: (key: string) => string;
  /** Get a number value by key */
  getNum: (key: string) => number;
  /** Update an in-memory value (edit mode) */
  update: (key: string, value: string | number) => void;
  /** Is edit mode active? */
  isEditMode: boolean;
  /** Toggle edit mode */
  setEditMode: (on: boolean) => void;
  /** Copy the full state as JSON to clipboard */
  copyState: () => void;
  /** Get the full merged content map (for cart-context initialization) */
  getAll: () => ContentMap;
}

const ContentContext = createContext<ContentContextType | null>(null);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<ContentMap>(buildMerged);
  const [isEditMode, setIsEditMode] = useState(false);
  // Ref to always have latest content for copyState without stale closures
  const contentRef = useRef(content);
  contentRef.current = content;

  const get = useCallback((key: string): string => {
    const v = content[key];
    if (v === undefined) return `[${key}]`;
    return String(v);
  }, [content]);

  const getNum = useCallback((key: string): number => {
    const v = content[key];
    if (v === undefined) return 0;
    return typeof v === 'number' ? v : parseFloat(String(v)) || 0;
  }, [content]);

  const update = useCallback((key: string, value: string | number) => {
    setContent(prev => ({ ...prev, [key]: value }));
  }, []);

  const setEditMode = useCallback((on: boolean) => {
    setIsEditMode(on);
  }, []);

  const copyState = useCallback(() => {
    const json = JSON.stringify(contentRef.current, null, 2);
    navigator.clipboard?.writeText(json).then(() => {
      // Will be caught by toast in the component
    }).catch(() => {
      // fallback: prompt
      const w = window.open('', '_blank', 'width=600,height=400');
      if (w) {
        w.document.write('<pre>' + json + '</pre>');
      }
    });
  }, []);

  const getAll = useCallback((): ContentMap => {
    return { ...contentRef.current };
  }, []);

  return (
    <ContentContext.Provider value={{ get, getNum, update, isEditMode, setEditMode, copyState, getAll }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used within ContentProvider');
  return ctx;
}
