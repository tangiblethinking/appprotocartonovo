import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ImageUrlModalProps {
  currentUrl: string;
  onSave: (url: string) => void;
  onClose: () => void;
}

export function ImageUrlModal({ currentUrl, onSave, onClose }: ImageUrlModalProps) {
  const [url, setUrl] = useState(currentUrl);

  return (
    <div className="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl p-6 w-full max-w-[460px]"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '18px', fontWeight: 600 }}>
            Update Image URL
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors border-none bg-transparent cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3.5 py-2.5 border border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#C8102E] mb-3"
          style={{ fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}
        />

        {/* Preview */}
        {url && (
          <div className="w-full h-[120px] bg-[#f5f5f5] rounded-lg overflow-hidden mb-4 flex items-center justify-center">
            <img
              src={url}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}

        <div className="flex gap-2.5">
          <button
            className="flex-1 bg-[#C8102E] text-white py-2.5 rounded-full border-none cursor-pointer"
            style={{ fontSize: '14px', fontWeight: 600 }}
            onClick={() => { onSave(url); onClose(); }}
          >
            Save
          </button>
          <button
            className="flex-1 bg-white text-[#1a1a1a] py-2.5 rounded-full border border-[#e0e0e0] cursor-pointer"
            style={{ fontSize: '14px', fontWeight: 600 }}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
