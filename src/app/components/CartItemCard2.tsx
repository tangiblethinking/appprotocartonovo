/**
 * CartItemCard2 — Dedicated card for pinkDrink2 (swatches option type).
 * All flavor swatch groups and individual swatches are unrolled into unique JSX locations.
 * All text uses content system keys for edit mode.
 */
import React from 'react';
import { Check, Square, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { CartItem } from '../store/cart-context';
import { useContent } from '../store/content-context';
import { ET, EN } from './EditableText';
import { EI } from './EditableImage';

interface CartItemCard2Props {
  item: CartItem;
  imageElement: React.ReactNode;
  priceMultiplier: number;
  hasMembership: boolean;
  selectionsOpen: boolean;
  onToggleSelections: () => void;
  onRemove: () => void;
  onQtyChange: (delta: number) => void;
  onToggleSub: () => void;
  onFlavorSelect: (flavor: string) => void;
}

export function CartItemCard2({
  item, imageElement, priceMultiplier, hasMembership, selectionsOpen,
  onToggleSelections, onRemove, onQtyChange, onToggleSub, onFlavorSelect,
}: CartItemCard2Props) {
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
            k="product.pinkDrink2.image"
            alt={get('product.pinkDrink2.name')}
            className="w-full h-full object-cover"
            containerClassName="w-[72px] h-[72px] rounded-lg overflow-hidden"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div style={{ fontSize: '15px', fontWeight: 600 }}><ET k="product.pinkDrink2.name" /></div>
          <div style={{ fontSize: '13px', color: '#555', marginTop: '1px' }}><ET k="product.pinkDrink2.subtitle" /></div>

          {/* Price — left aligned, separated from title block */}
          <div className="mt-3">
            {isEditMode ? (
              <>
                <div style={{ fontSize: '16px', fontWeight: 700 }}><EN k="product.pinkDrink2.price" prefix="$" /></div>
                {hasMembership && (
                  <div className="text-[#888]" style={{ fontSize: '12px', marginTop: '2px' }}><EN k="product.pinkDrink2.pv" suffix=" PV" /></div>
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

          {/* Selections toggle — "Flavor: X" for swatches */}
          <button
            className="flex items-center gap-1 mt-3 bg-transparent border-none p-0 cursor-pointer"
            style={{ fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
            onClick={onToggleSelections}
          >
            <ET k="cartItem.flavorLabel" /> <strong className="ml-1">{item.selectedFlavor}</strong>
            <span
              className="ml-1 inline-block transition-transform text-[#C8102E]"
              style={{
                fontSize: '16px',
                lineHeight: 1,
                transform: selectionsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              &#9662;
            </span>
          </button>

          {/* Swatches body */}
          <AnimatePresence>
            {selectionsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <div className="mt-2.5 p-1">
                  <div className="flex flex-row items-start gap-0">
                    {/* Classic Group */}
                    <div className="flex flex-row items-start">
                      <div>
                        <div className="text-[#888] mb-1.5" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
                          <ET k="card2.classicLabel" />
                        </div>
                        <div className="flex gap-3 items-center flex-wrap p-1">
                          {/* Sweet Tea swatch */}
                          <div className="relative group/sweetTea">
                            <button
                              className={`w-[16px] h-[16px] rounded-full cursor-pointer transition-all hover:scale-110 border-none ${
                                item.selectedFlavor === get('card2.sweetTea')
                                  ? 'ring-2 ring-[#C8102E] ring-offset-2'
                                  : ''
                              }`}
                              style={{ background: 'radial-gradient(circle at 40% 35%, #e8a0b0, #e8a0b0)' }}
                              onClick={() => onFlavorSelect(get('card2.sweetTea'))}
                            />
                            <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap rounded-md bg-[#1a1a1a] text-white px-2.5 py-1 opacity-0 group-hover/sweetTea:opacity-100 transition-opacity" style={{ fontSize: '12px', fontWeight: 600 }}>
                              {get('card2.sweetTea')}
                              <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#1a1a1a]" />
                            </span>
                          </div>
                          {/* Lemonade swatch */}
                          <div className="relative group/lemonade">
                            <button
                              className={`w-[16px] h-[16px] rounded-full cursor-pointer transition-all hover:scale-110 border-none ${
                                item.selectedFlavor === get('card2.lemonade')
                                  ? 'ring-2 ring-[#C8102E] ring-offset-2'
                                  : ''
                              }`}
                              style={{ background: 'radial-gradient(circle at 40% 35%, #f5e89a, #f5e89a)' }}
                              onClick={() => onFlavorSelect(get('card2.lemonade'))}
                            />
                            <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap rounded-md bg-[#1a1a1a] text-white px-2.5 py-1 opacity-0 group-hover/lemonade:opacity-100 transition-opacity" style={{ fontSize: '12px', fontWeight: 600 }}>
                              {get('card2.lemonade')}
                              <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#1a1a1a]" />
                            </span>
                          </div>
                          {/* Watermelon swatch */}
                          <div className="relative group/watermelon">
                            <button
                              className={`w-[16px] h-[16px] rounded-full cursor-pointer transition-all hover:scale-110 border-none ${
                                item.selectedFlavor === get('card2.watermelon')
                                  ? 'ring-2 ring-[#C8102E] ring-offset-2'
                                  : ''
                              }`}
                              style={{ background: 'radial-gradient(circle at 40% 35%, #C3383F, #C3383F)' }}
                              onClick={() => onFlavorSelect(get('card2.watermelon'))}
                            />
                            <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap rounded-md bg-[#1a1a1a] text-white px-2.5 py-1 opacity-0 group-hover/watermelon:opacity-100 transition-opacity" style={{ fontSize: '12px', fontWeight: 600 }}>
                              {get('card2.watermelon')}
                              <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#1a1a1a]" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="w-px bg-[#e0e0e0] self-stretch mx-4 flex-shrink-0" />

                    {/* Limited Edition Group */}
                    <div className="flex flex-row items-start">
                      <div>
                        <div className="text-[#888] mb-1.5" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
                          <ET k="card2.limitedEditionLabel" />
                        </div>
                        <div className="flex gap-3 items-center flex-wrap p-1">
                          {/* Acai Berry swatch */}
                          <div className="relative group/acai">
                            <button
                              className={`w-[16px] h-[16px] rounded-full cursor-pointer transition-all hover:scale-110 border-none ${
                                item.selectedFlavor === get('card2.acaiBerry')
                                  ? 'ring-2 ring-[#C8102E] ring-offset-2'
                                  : ''
                              }`}
                              style={{ background: 'radial-gradient(circle at 40% 35%, #c060b0, #c060b0)' }}
                              onClick={() => onFlavorSelect(get('card2.acaiBerry'))}
                            />
                            <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap rounded-md bg-[#1a1a1a] text-white px-2.5 py-1 opacity-0 group-hover/acai:opacity-100 transition-opacity" style={{ fontSize: '12px', fontWeight: 600 }}>
                              {get('card2.acaiBerry')}
                              <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#1a1a1a]" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
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