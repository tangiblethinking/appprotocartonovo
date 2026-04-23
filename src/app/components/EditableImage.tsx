/**
 * EI — Editable Image component.
 * In normal mode: renders an <img>.
 * In edit mode: shows a pencil overlay; clicking opens the URL modal.
 */
import React, { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useContent } from '../store/content-context';
import { ImageUrlModal } from './ImageUrlModal';

interface EIProps {
  /** Content key for the image URL */
  k: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Container className (wraps the image + overlay) */
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
}

export function EI({ k, alt = '', className, style, containerClassName, containerStyle }: EIProps) {
  const { get, update, isEditMode } = useContent();
  const url = get(k);
  const [modalOpen, setModalOpen] = useState(false);

  if (!isEditMode) {
    return (
      <div className={containerClassName} style={containerStyle}>
        <img src={url} alt={alt} className={className} style={style} />
      </div>
    );
  }

  return (
    <>
      <div className={containerClassName} style={{ ...containerStyle, position: 'relative' }}>
        <img src={url} alt={alt} className={className} style={style} />
        {/* Pencil overlay */}
        <button
          className="absolute bottom-1 right-1 w-7 h-7 bg-[#C8102E] text-white rounded-full flex items-center justify-center cursor-pointer border-none shadow-md hover:bg-[#a00d24] transition-colors z-10"
          onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}
          title="Edit image URL"
        >
          <Pencil size={14} />
        </button>
      </div>
      {modalOpen && (
        <ImageUrlModal
          currentUrl={url}
          onSave={(newUrl) => update(k, newUrl)}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
