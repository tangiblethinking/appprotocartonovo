import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useContent } from '../store/content-context';
import { ET } from './EditableText';

const LINK_KEYS = [
  { labelKey: 'policy.refundLabel', contentKey: 'policy.refundContent' },
  { labelKey: 'policy.shippingLabel', contentKey: 'policy.shippingContent' },
  { labelKey: 'policy.privacyLabel', contentKey: 'policy.privacyContent' },
  { labelKey: 'policy.termsLabel', contentKey: 'policy.termsContent' },
];

function PolicyModal({ labelKey, contentKey, onClose }: { labelKey: string; contentKey: string; onClose: () => void }) {
  const { get } = useContent();
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white w-full h-full sm:h-auto sm:max-w-lg sm:rounded-xl p-6 overflow-y-auto z-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg" style={{ fontFamily: "'DM Sans', sans-serif" }}><ET k={labelKey} /></h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed"><ET k={contentKey} /></p>
      </div>
    </div>
  );
}

export function PolicyLinks({ variant = 'mobile' }: { variant?: 'mobile' | 'desktop' }) {
  const { get } = useContent();
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const isDesktop = variant === 'desktop';

  return (
    <>
      <div
        className={`flex items-center justify-center py-4 px-3 rounded-xl ${
          isDesktop ? 'bg-transparent' : 'bg-white'
        }`}
        style={{ flexWrap: 'nowrap', gap: 0, minWidth: 0 }}
      >
        {LINK_KEYS.map((link, i) => (
          <span key={link.labelKey} className="inline-flex items-center flex-shrink-0">
            {i > 0 && <span className="text-gray-300 mx-2" style={{ fontSize: '12px', userSelect: 'none' }}>|</span>}
            <button
              onClick={() => setOpenIdx(i)}
              className="text-gray-500 underline hover:text-gray-700 transition-colors whitespace-nowrap bg-transparent border-none cursor-pointer p-0"
              style={{ fontSize: '12px', fontFamily: "'DM Sans', sans-serif" }}
            >
              <ET k={link.labelKey} />
            </button>
          </span>
        ))}
      </div>
      {openIdx !== null && (
        <PolicyModal
          labelKey={LINK_KEYS[openIdx].labelKey}
          contentKey={LINK_KEYS[openIdx].contentKey}
          onClose={() => setOpenIdx(null)}
        />
      )}
    </>
  );
}
