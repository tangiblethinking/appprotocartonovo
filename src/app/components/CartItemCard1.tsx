/**
 * CartItemCard1 — Dedicated card for pinkDrink1 (dropdowns option type).
 * All dropdowns are unrolled into unique JSX locations for individual Figma editability.
 * All text uses content system keys for edit mode.
 */
import React from 'react';
import { Check, Square, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { CartItem } from '../store/cart-context';
import { useContent } from '../store/content-context';
import { ET, EN } from './EditableText';
import { EI } from './EditableImage';

interface CartItemCard1Props {
  item: CartItem;
  imageElement: React.ReactNode;
  priceMultiplier: number;
  hasMembership: boolean;
  selectionsOpen: boolean;
  onToggleSelections: () => void;
  onRemove: () => void;
  onQtyChange: (delta: number) => void;
  onToggleSub: () => void;
  onSelectionChange: (index: number, value: string) => void;
}

export function CartItemCard1({
  item, imageElement, priceMultiplier, hasMembership, selectionsOpen,
  onToggleSelections, onRemove, onQtyChange, onToggleSub, onSelectionChange,
}: CartItemCard1Props) {
  const { get, isEditMode } = useContent();
  const price = item.price * priceMultiplier;
  const IMAGE_COL_WIDTH = 72;
  const GAP = 16;
  const indentPx = IMAGE_COL_WIDTH + GAP;

  return (
    <div className="bg-white border-b border-[#e0e0e0] p-5 mb-0 relative">
      {/* X remove button — top right */}
      <div className="relative group/remove">
        <button
          className="absolute top-0 right-0 text-[#999] cursor-pointer bg-transparent border-none p-1 transition-colors hover:text-[#C8102E]"
          onClick={onRemove}
          aria-label="Remove item from cart"
        >
          <X size={16} />
        </button>
        <span className="pointer-events-none absolute right-6 top-0 whitespace-nowrap rounded-md bg-[#1a1a1a] text-white px-2.5 py-1 opacity-0 group-hover/remove:opacity-100 transition-opacity z-10" style={{ fontSize: '11px', fontWeight: 500 }}>
          Remove item from cart
        </span>
      </div>
      <div className="flex gap-4 items-start pr-5">
        {/* Image + Trash */}
        <div className="flex flex-col items-center flex-shrink-0">
          <EI
            k="product.pinkDrink1.image"
            alt={get('product.pinkDrink1.name')}
            className="w-full h-full object-cover"
            containerClassName="w-[72px] h-[72px] rounded-lg overflow-hidden"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div style={{ fontSize: '15px', fontWeight: 600 }}><ET k="product.pinkDrink1.name" /></div>
          <div style={{ fontSize: '13px', color: '#555', marginTop: '1px' }}><ET k="product.pinkDrink1.subtitle" /></div>

          {/* Price — left aligned, separated from title block */}
          <div className="mt-3">
            {isEditMode ? (
              <>
                <div style={{ fontSize: '16px', fontWeight: 700 }}><EN k="product.pinkDrink1.price" prefix="$" /></div>
                {hasMembership && (
                  <div className="text-[#888]" style={{ fontSize: '12px', marginTop: '2px' }}><EN k="product.pinkDrink1.pv" suffix=" PV" /></div>
                )}
              </>
            ) : (
              <>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>${(price * item.qty).toFixed(2)}</div>
                {hasMembership && (
                  <div className="text-[#888]" style={{ fontSize: '12px', marginTop: '2px' }}>{item.pv} <ET k="cartItem.pvSuffix" /></div>
                )}
              </>
            )}
          </div>

          {/* Selections toggle */}
          <button
            className="flex items-center gap-1 mt-3 bg-transparent border-none p-0 cursor-pointer"
            style={{ fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
            onClick={onToggleSelections}
          >
            <ET k="cartItem.yourSelections" />
            <span
              className="ml-1 inline-block transition-transform text-[#C8102E]"
              style={{
                fontSize: '16px',
                lineHeight: 1,
                transition: 'transform 0.2s',
                transform: selectionsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              &#9662;
            </span>
          </button>

          {/* Dropdowns body */}
          <AnimatePresence>
            {selectionsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <div className="mt-2.5">
                  {/* Dropdown Group 1 */}
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-2.5">
                    <select
                      className="flex-1 min-w-0 w-full sm:w-auto sm:min-w-[180px] px-3 py-2 border border-[#e0e0e0] rounded-md bg-white cursor-pointer focus:outline-none focus:border-[#C8102E] truncate"
                      style={{ fontSize: '13px', fontFamily: "'DM Sans', sans-serif", textOverflow: 'ellipsis' }}
                      value={item.selections?.[0] || ''}
                      onChange={(e) => onSelectionChange(0, e.target.value)}
                    >
                      <option>{get('card1.dropdown1.opt1')}</option>
                      <option>{get('card1.dropdown1.opt2')}</option>
                      <option>{get('card1.dropdown1.opt3')}</option>
                    </select>
                  </div>

                  {/* Dropdown Group 2 */}
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-2.5">
                    <select
                      className="flex-1 min-w-0 w-full sm:w-auto sm:min-w-[180px] px-3 py-2 border border-[#e0e0e0] rounded-md bg-white cursor-pointer focus:outline-none focus:border-[#C8102E] truncate"
                      style={{ fontSize: '13px', fontFamily: "'DM Sans', sans-serif", textOverflow: 'ellipsis' }}
                      value={item.selections?.[1] || ''}
                      onChange={(e) => onSelectionChange(1, e.target.value)}
                    >
                      <option>{get('card1.dropdown2.opt1')}</option>
                      <option>{get('card1.dropdown2.opt2')}</option>
                      <option>{get('card1.dropdown2.opt3')}</option>
                    </select>
                  </div>

                  {/* Dropdown Group 3 (with additional selects) */}
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-2.5">
                    <select
                      className="flex-1 min-w-0 w-full sm:w-auto sm:min-w-[180px] px-3 py-2 border border-[#e0e0e0] rounded-md bg-white cursor-pointer focus:outline-none focus:border-[#C8102E] truncate"
                      style={{ fontSize: '13px', fontFamily: "'DM Sans', sans-serif", textOverflow: 'ellipsis' }}
                      value={item.selections?.[2] || ''}
                      onChange={(e) => onSelectionChange(2, e.target.value)}
                    >
                      <option>{get('card1.dropdown3.opt1')}</option>
                      <option>{get('card1.dropdown3.opt2')}</option>
                    </select>
                    <select
                      className="w-full sm:w-auto px-3 py-2 border border-[#e0e0e0] rounded-md bg-white cursor-pointer focus:outline-none focus:border-[#C8102E] truncate"
                      style={{ fontSize: '13px', fontFamily: "'DM Sans', sans-serif", maxWidth: '100%', textOverflow: 'ellipsis' }}
                      value={item.selections?.[3] || ''}
                      onChange={(e) => onSelectionChange(3, e.target.value)}
                    >
                      <option>{get('card1.dropdown3a.opt1')}</option>
                      <option>{get('card1.dropdown3a.opt2')}</option>
                    </select>
                    <select
                      className="w-full sm:w-auto px-3 py-2 border border-[#e0e0e0] rounded-md bg-white cursor-pointer focus:outline-none focus:border-[#C8102E] truncate"
                      style={{ fontSize: '13px', fontFamily: "'DM Sans', sans-serif", maxWidth: '100%', textOverflow: 'ellipsis' }}
                      value={item.selections?.[4] || ''}
                      onChange={(e) => onSelectionChange(4, e.target.value)}
                    >
                      <option>{get('card1.dropdown3b.opt1')}</option>
                      <option>{get('card1.dropdown3b.opt2')}</option>
                    </select>
                  </div>

                  {/* Dropdown Group 4 */}
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-2.5">
                    <select
                      className="flex-1 min-w-0 w-full sm:w-auto sm:min-w-[180px] px-3 py-2 border border-[#e0e0e0] rounded-md bg-white cursor-pointer focus:outline-none focus:border-[#C8102E] truncate"
                      style={{ fontSize: '13px', fontFamily: "'DM Sans', sans-serif", textOverflow: 'ellipsis' }}
                      value={item.selections?.[5] || ''}
                      onChange={(e) => onSelectionChange(5, e.target.value)}
                    >
                      <option>{get('card1.dropdown4.opt1')}</option>
                      <option>{get('card1.dropdown4.opt2')}</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quantity */}
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center border border-[#e0e0e0] rounded-md overflow-hidden">
              <button
                className="w-8 h-8 flex items-center justify-center bg-transparent border-none cursor-pointer transition-colors hover:bg-[#f5f5f5]"
                style={{ fontSize: '18px', fontWeight: 300 }}
                onClick={() => onQtyChange(-1)}
              >
                -
              </button>
              <span className="min-w-[36px] text-center select-none" style={{ fontSize: '15px', fontWeight: 600 }}>
                {item.qty}
              </span>
              <button
                className="w-8 h-8 flex items-center justify-center bg-transparent border-none cursor-pointer transition-colors hover:bg-[#f5f5f5]"
                style={{ fontSize: '18px', fontWeight: 300 }}
                onClick={() => onQtyChange(1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Subscription */}
          <div className="flex items-start gap-2.5 mt-3">
            <button
              className={`w-[18px] h-[18px] rounded-sm flex items-center justify-center cursor-pointer flex-shrink-0 mt-0.5 transition-all border-none ${
                item.subscription ? 'bg-[#C8102E]' : 'bg-transparent'
              }`}
              onClick={onToggleSub}
            >
              {item.subscription ? (
                <Check size={13} className="text-white" />
              ) : (
                <Square size={18} className="text-[#aaa]" />
              )}
            </button>
            <div>
              <div className="text-[#C8102E]" style={{ fontSize: '13px', fontWeight: 700 }}>
                <ET k={item.subscription ? 'cartItem.subscriptionAdded' : 'cartItem.addSubscription'} />
              </div>
              {item.subscription && (
                <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>
                  <ET k="cartItem.subscriptionNote" />
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Prop65 */}
      {item.showProp65 && (
        <div className="bg-[#fffde7] border border-[#f9a825] rounded-md p-2.5 mt-2.5 flex gap-2 items-start" style={{ marginLeft: `${indentPx}px` }}>
          <AlertTriangle size={18} className="text-[#f9a825] flex-shrink-0 mt-0.5" />
          <p style={{ fontSize: '11.5px', color: '#5d4037', lineHeight: 1.5 }}>
            <strong><ET k="prop65.warning" /></strong><br />
            <ET k="prop65.text" />{' '}
            <a href="https://www.P65Warnings.ca.gov" target="_blank" className="text-[#C8102E]">
              <ET k="prop65.linkText" />
            </a>.
          </p>
        </div>
      )}
    </div>
  );
}