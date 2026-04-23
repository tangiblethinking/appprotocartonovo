import React, { useState } from 'react';
import { useCart, SUGGESTED_PRODUCTS, CartItem } from '../store/cart-context';
import { useContent } from '../store/content-context';
import {
  ArrowLeft, Share2, Zap, Trash2, Check, AlertTriangle, X, Award, Square, Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OrderSummary } from './OrderSummary';
import { ProgressRewards } from './ProgressRewards';
import { PolicyLinks } from './PolicyLinks';
import { ShareCartModal, MFAModal, VIPRemoveModal, SubscriptionRemoveModal } from './Modals';
import { toast } from 'sonner';
import { CartItemCard1 } from './CartItemCard1';
import { CartItemCard2 } from './CartItemCard2';
import { CartItemCard } from './CartItemCard';
import { ET, EN } from './EditableText';
import { EI } from './EditableImage';
import SUGGESTED_PRODUCTS_TEMPLATE, { resolveItemPricePV } from '../data/suggested-products';

export function CartPage() {
  const cart = useCart();
  const { get, isEditMode } = useContent();
  const {
    hasMembership, membershipRemoved, items, undoEntries, suggestedProducts,
    addMembership, removeMembership, removeItem, undoRemoveItem, dismissUndo,
    changeQty, toggleSubscription, confirmRemoveSubscription, setFlavor,
    addSuggestedToCart, setPage, priceMultiplier, getMembershipPrice,
    effectiveMembership, userName, isSignedInMember, setAuthReturnPage,
    updateItemSelection, shippingInfo,
  } = cart;

  const [shareOpen, setShareOpen] = useState(false);
  const [mfaOpen, setMfaOpen] = useState(false);
  const [vipModalOpen, setVipModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [subTargetId, setSubTargetId] = useState<string | null>(null);
  const [selectionsOpen, setSelectionsOpen] = useState<Record<string, boolean>>({ pinkDrink1: true, pinkDrink2: true });

  const activeItems = items.filter(i => !i.removed);
  const vipSavings = cart.getVipSavings();
  const membershipPrice = getMembershipPrice();
  const cartEmpty = activeItems.length === 0;

  // Dynamic cart title: "Tarl's Cart", "James' Cart", or "Your Cart"
  const cartOwnerFirstName = shippingInfo?.firstName || null;
  const cartOwnerPrefix = cartOwnerFirstName
    ? `${cartOwnerFirstName}${cartOwnerFirstName.endsWith('s') ? '\u2019' : '\u2019s'}`
    : 'Your';

  const handleRemoveItem = (id: string) => {
    removeItem(id);
    toast.success('Item removed from cart');
  };

  const handleToggleSub = (id: string) => {
    const showModal = toggleSubscription(id);
    if (showModal) {
      setSubTargetId(id);
      setSubModalOpen(true);
    }
  };

  const handleConfirmRemoveSub = () => {
    if (subTargetId) confirmRemoveSubscription(subTargetId);
    setSubModalOpen(false);
    setSubTargetId(null);
  };

  const handleMfaVerified = () => {
    setPage('confirmation');
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 pb-[200px] lg:pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* LEFT: Cart Items */}
        <div>
          {/* Continue Shopping */}
          <div className="mb-4">
            <button
              className="flex items-center gap-1 bg-transparent border-none text-[#555] cursor-pointer hover:text-[#C8102E] transition-colors"
              style={{ fontSize: '13px' }}
              onClick={() => toast('Continue shopping - browse our products!')}
            >
              <ArrowLeft size={16} /> <ET k="cart.continueShoppingText" />
            </button>
          </div>

          {/* Title Row */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '26px', fontWeight: 400 }}>
              {cartEmpty ? 'Your Cart is Empty' : (
                <>{cartOwnerPrefix} <ET k="cart.titleSuffix" />{' '}
                <span className="text-[#555]" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px', fontWeight: 400, marginLeft: '8px' }}>
                  ({cart.getItemCount()} item{cart.getItemCount() !== 1 ? 's' : ''}: ${cart.getTotal().toFixed(2)})
                </span></>
              )}
            </div>
            {/* Desktop buttons */}
            <div className="hidden lg:flex gap-2.5">
              {isSignedInMember && (
                <>
                  <div className="relative group/share">
                    <button
                      className={`inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border transition-all ${
                        cartEmpty
                          ? 'bg-[#f5f5f5] text-[#bbb] border-[#e0e0e0] cursor-not-allowed'
                          : 'bg-white text-[#1a1a1a] border-[#e0e0e0] cursor-pointer hover:border-[#1a1a1a] hover:bg-[#f8f8f8]'
                      }`}
                      style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.3px' }}
                      onClick={() => !cartEmpty && setShareOpen(true)}
                      disabled={cartEmpty}
                    >
                      <Share2 size={16} /> <ET k="cart.shareCartBtn" />
                    </button>
                    {cartEmpty && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#333] text-white rounded-md whitespace-nowrap opacity-0 group-hover/share:opacity-100 transition-opacity pointer-events-none z-50" style={{ fontSize: '12px' }}>
                        <ET k="cart.shareDisabledTooltip" />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#333]" />
                      </div>
                    )}
                  </div>
                  <div className="relative group/checkout">
                    <button
                      className={`inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border-2 transition-all ${
                        cartEmpty
                          ? 'bg-[#f5f5f5] text-[#bbb] border-[#d0d0d0] cursor-not-allowed'
                          : 'bg-white text-[#1a1a1a] border-[#1a1a1a] cursor-pointer hover:bg-[#1a1a1a] hover:text-white'
                      }`}
                      style={{ fontSize: '13px', fontWeight: 600 }}
                      onClick={() => !cartEmpty && setMfaOpen(true)}
                      disabled={cartEmpty}
                    >
                      <Zap size={16} /> <ET k="cart.oneClickBtn" />
                    </button>
                    {cartEmpty && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#333] text-white rounded-md whitespace-nowrap opacity-0 group-hover/checkout:opacity-100 transition-opacity pointer-events-none z-50" style={{ fontSize: '12px' }}>
                        <ET k="cart.oneClickDisabledTooltip" />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#333]" />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Sticky Top */}
          <div className="lg:hidden sticky top-[100px] z-40 bg-white border-b border-[#e0e0e0] -mx-6 px-6 pb-2 pt-1">
            {isSignedInMember && (
            <div className="flex gap-2.5 flex-wrap py-3">
              <div className="relative group/sharemobile">
                <button
                  className={`inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border transition-all ${
                    cartEmpty
                      ? 'bg-[#f5f5f5] text-[#bbb] border-[#e0e0e0] cursor-not-allowed'
                      : 'bg-white text-[#1a1a1a] border-[#e0e0e0] cursor-pointer hover:border-[#1a1a1a] hover:bg-[#f8f8f8]'
                  }`}
                  style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.3px' }}
                  onClick={() => !cartEmpty && setShareOpen(true)}
                  disabled={cartEmpty}
                >
                  <Share2 size={16} /> <ET k="cart.shareCartBtn" />
                </button>
                {cartEmpty && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#333] text-white rounded-md whitespace-nowrap opacity-0 group-hover/sharemobile:opacity-100 transition-opacity pointer-events-none z-50" style={{ fontSize: '12px' }}>
                    <ET k="cart.shareDisabledTooltip" />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#333]" />
                  </div>
                )}
              </div>
              <div className="relative group/checkoutmobile">
                <button
                  className={`inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border-2 transition-all ${
                    cartEmpty
                      ? 'bg-[#f5f5f5] text-[#bbb] border-[#d0d0d0] cursor-not-allowed'
                      : 'bg-white text-[#1a1a1a] border-[#1a1a1a] cursor-pointer hover:bg-[#1a1a1a] hover:text-white'
                  }`}
                  style={{ fontSize: '13px', fontWeight: 600 }}
                  onClick={() => !cartEmpty && setMfaOpen(true)}
                  disabled={cartEmpty}
                >
                  <Zap size={16} /> <ET k="cart.oneClickBtn" />
                </button>
                {cartEmpty && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#333] text-white rounded-md whitespace-nowrap opacity-0 group-hover/checkoutmobile:opacity-100 transition-opacity pointer-events-none z-50" style={{ fontSize: '12px' }}>
                    <ET k="cart.oneClickDisabledTooltip" />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#333]" />
                  </div>
                )}
              </div>
            </div>
            )}
            <ProgressRewards />
          </div>

          {/* Special Offer banner — always shown, above membership */}
          <SpecialOfferBanner onAdd={() => {
            const slimProduct = SUGGESTED_PRODUCTS.find(p => p.id === 'slimTrim');
            if (slimProduct) {
              addSuggestedToCart(slimProduct);
              toast.success('Slim & Trim Combo added to cart!');
            }
          }} />

          {/* VIP Banner / Membership */}
          {!isSignedInMember && (
            hasMembership ? (
              <MembershipCard onRemove={() => setVipModalOpen(true)} membershipPrice={membershipPrice} />
            ) : (
              <VIPBanner onAdd={addMembership} membershipPrice={membershipPrice} />
            )
          )}

          {/* Undo bars */}
          <AnimatePresence>
            {undoEntries.map(u => (
              <motion.div
                key={u.itemId}
                className="bg-white border border-[#e0e0e0] rounded-lg px-4 py-3 flex items-center justify-between mb-3"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <span className="text-[#333]" style={{ fontSize: '13px' }}>{u.itemName} <ET k="cart.itemRemovedSuffix" /></span>
                <div className="flex items-center gap-2">
                  <button
                    className="bg-transparent border-none text-[#1a6fbf] cursor-pointer px-2 py-1 rounded"
                    style={{ fontSize: '13px', fontWeight: 700 }}
                    onClick={() => {
                      undoRemoveItem(u.itemId);
                      toast.success('Item restored');
                    }}
                  >
                    <ET k="cart.undoBtn" />
                  </button>
                  <button
                    className="bg-transparent border-none text-[#555] cursor-pointer flex items-center p-0.5"
                    onClick={() => dismissUndo(u.itemId)}
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Cart Items */}
          <AnimatePresence>
            {items.map(item => {
              if (item.removed) return null;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {item.id === 'pinkDrink1' ? (
                    <CartItemCard1
                      item={item}
                      imageElement={null}
                      priceMultiplier={priceMultiplier}
                      hasMembership={effectiveMembership}
                      selectionsOpen={selectionsOpen[item.id] ?? false}
                      onToggleSelections={() =>
                        setSelectionsOpen(prev => ({ ...prev, [item.id]: !prev[item.id] }))
                      }
                      onRemove={() => handleRemoveItem(item.id)}
                      onQtyChange={(delta) => changeQty(item.id, delta)}
                      onToggleSub={() => handleToggleSub(item.id)}
                      onSelectionChange={(index, value) => updateItemSelection(item.id, index, value)}
                    />
                  ) : item.id === 'pinkDrink2' ? (
                    <CartItemCard2
                      item={item}
                      imageElement={null}
                      priceMultiplier={priceMultiplier}
                      hasMembership={effectiveMembership}
                      selectionsOpen={selectionsOpen[item.id] ?? false}
                      onToggleSelections={() =>
                        setSelectionsOpen(prev => ({ ...prev, [item.id]: !prev[item.id] }))
                      }
                      onRemove={() => handleRemoveItem(item.id)}
                      onQtyChange={(delta) => changeQty(item.id, delta)}
                      onToggleSub={() => handleToggleSub(item.id)}
                      onFlavorSelect={(flavor) => setFlavor(item.id, flavor)}
                    />
                  ) : (
                    <CartItemCard
                      item={item}
                      imageElement={null}
                      priceMultiplier={priceMultiplier}
                      hasMembership={effectiveMembership}
                      selectionsOpen={selectionsOpen[item.id] ?? false}
                      onToggleSelections={() =>
                        setSelectionsOpen(prev => ({ ...prev, [item.id]: !prev[item.id] }))
                      }
                      onRemove={() => handleRemoveItem(item.id)}
                      onQtyChange={(delta) => changeQty(item.id, delta)}
                      onToggleSub={() => handleToggleSub(item.id)}
                      onFlavorSelect={(flavor) => setFlavor(item.id, flavor)}
                      onSelectionChange={(index, value) => updateItemSelection(item.id, index, value)}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Suggested Products */}
          <div className="mt-8">
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '22px', fontWeight: 400, marginBottom: '16px' }}>
              <ET k="cart.youMayAlsoLike" />
            </div>
            {suggestedProducts.length === 0 ? (
              <div className="bg-[#f0faf0] border border-[#c8e6c9] rounded-xl p-8 text-center">
                <div className="text-[#2e7d32]" style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
                  Congratulations!
                </div>
                <div style={{ fontSize: '14px', color: '#555' }}>
                  You have the perfect health regimen ordered!
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestedProducts.slice(0, 3).map(item => {
                  const templateEntry = SUGGESTED_PRODUCTS_TEMPLATE.find(e => e.id === item.id);
                  // Compute default effective price for option-priced products
                  const defaultSelections = item.dropdowns?.map(d => d.options[0] || '');
                  const resolved = resolveItemPricePV(
                    item.price, item.pv,
                    item.optionsPrice,
                    item.optionPriceTotal,
                    defaultSelections,
                  );
                  const cardMemberPrice = resolved.price;
                  const cardRetailPrice = resolved.price * 1.25;
                  const cardPV = resolved.pv;
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-[#e8e8e8] overflow-hidden transition-all hover:-translate-y-0.5 flex flex-col"
                    >
                      <div className="w-full aspect-square bg-[#f8f8f8] overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        {/* Title + subtitle — left aligned, separated from price */}
                        <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px' }}>{item.name}</div>
                        <div className="text-[#888] italic" style={{ fontSize: '12px' }}>{templateEntry?.subtitle || 'Options Available'}</div>
                        {/* Price block — visually separated with top margin */}
                        <div className="mt-auto pt-4">
                          {effectiveMembership ? (
                            <>
                              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', marginBottom: '2px' }}>
                                ${cardMemberPrice.toFixed(2)}
                              </div>
                              <div className="text-[#C8102E] mb-3" style={{ fontSize: '13px', fontWeight: 600 }}>
                                {cardPV} PV
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', marginBottom: '2px' }}>
                                ${cardRetailPrice.toFixed(2)}
                              </div>
                              <div className="text-[#C8102E] mb-3" style={{ fontSize: '13px', fontWeight: 600 }}>
                                ${cardMemberPrice.toFixed(2)} VIP Customers
                              </div>
                            </>
                          )}
                          <button
                            className="w-full bg-[#1a1a1a] text-white py-2.5 rounded-full border-none cursor-pointer transition-all hover:bg-[#333]"
                            style={{ fontSize: '14px', fontWeight: 600 }}
                            onClick={() => {
                              addSuggestedToCart(item);
                              toast.success(`${item.name} added to cart!`);
                            }}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Order Summary */}
        <div className="lg:sticky lg:top-[104px]">
          <OrderSummary
            showProgress
            showCheckoutBtn
            showPaypal
            showPromo
            onCheckout={() => {
              if (userName) {
                setPage('checkout');
              } else {
                setAuthReturnPage('checkout');
                setPage('auth');
              }
            }}
          />
          <div className="hidden lg:block">
            <PolicyLinks variant="desktop" />
          </div>
        </div>
      </div>

      {/* Policy links — mobile */}
      <div className="lg:hidden mt-4">
        <PolicyLinks />
      </div>

      {/* Modals */}
      <ShareCartModal open={shareOpen} onClose={() => setShareOpen(false)} />
      <MFAModal open={mfaOpen} onClose={() => setMfaOpen(false)} onVerified={handleMfaVerified} />
      <VIPRemoveModal
        open={vipModalOpen}
        savings={vipSavings}
        onKeep={() => setVipModalOpen(false)}
        onRemove={() => { removeMembership(); setVipModalOpen(false); toast('Membership removed. Prices updated.'); }}
      />
      <SubscriptionRemoveModal
        open={subModalOpen}
        onKeep={() => setSubModalOpen(false)}
        onRemove={handleConfirmRemoveSub}
      />

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e0e0e0] px-4 py-3 z-50 lg:hidden">
        <div className="flex justify-between items-baseline mb-2">
          <span style={{ fontSize: '15px', fontWeight: 700 }}>
            <ET k="cart.estimatedTotalLabel" /> ({cart.getItemCount()} Item{cart.getItemCount() !== 1 ? 's' : ''})
          </span>
          <span style={{ fontSize: '20px', fontWeight: 800 }}>${cart.getTotal().toFixed(2)}</span>
        </div>
        <button
          className="w-full bg-[#C8102E] text-white py-3.5 px-7 rounded-full border-none cursor-pointer transition-all hover:bg-[#a00d24]"
          style={{ fontSize: '16px', fontWeight: 600, letterSpacing: '0.3px' }}
          onClick={() => {
            if (userName) {
              setPage('checkout');
            } else {
              setAuthReturnPage('checkout');
              setPage('auth');
            }
          }}
        >
          <ET k="cart.checkoutBtn" />
        </button>
        {/* PayPal — text only, matching desktop style */}
        <div className="text-center mt-2">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <span style={{ fontSize: '15px', fontWeight: 900, fontStyle: 'italic', fontFamily: "'DM Sans', sans-serif", WebkitTextStroke: '0.4px currentColor' }}>
              <span style={{ color: '#003087' }}>Pay</span><span style={{ color: '#009cde' }}>Pal</span>
            </span>
            <span style={{ fontSize: '14px', fontWeight: 400, color: '#1a1a1a', marginLeft: '3px', fontFamily: "'DM Sans', sans-serif" }}>Checkout</span>
          </div>
          <div className="flex items-center justify-center gap-2 flex-nowrap" style={{ whiteSpace: 'nowrap', fontSize: '12px', color: '#333' }}>
            <span style={{ whiteSpace: 'nowrap' }}>Pay in 4 interest-free payments of ${(cart.getTotal() / 4).toFixed(2)}.</span>
            <a className="cursor-pointer hover:underline flex-shrink-0" style={{ color: '#009cde', fontWeight: 600, whiteSpace: 'nowrap' }}>Learn more</a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* SPECIAL OFFER BANNER */
function SpecialOfferBanner({ onAdd }: { onAdd: () => void }) {
  const [dismissed, setDismissed] = React.useState(false);
  if (dismissed) return null;
  return (
    <div
      className="rounded-xl p-3.5 flex items-center justify-between mb-4 gap-3 flex-wrap mt-3"
      style={{ border: '1.5px solid #009cde', background: '#fff' }}
    >
      <div className="flex items-center gap-2.5">
        {/* Blue tag icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#009cde" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
          <line x1="7" y1="7" x2="7.01" y2="7"/>
        </svg>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#009cde', marginBottom: '2px' }}>Special Offer!</h3>
          <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>
            Optimize your goals with a limited time offer of 50% off your first delivery of{' '}
            <a className="cursor-pointer hover:text-[#007ab8] transition-colors" style={{ color: '#009cde', textDecoration: 'underline' }}>Slim and Trim</a>!
          </p>
        </div>
      </div>
      <button
        className="cursor-pointer whitespace-nowrap transition-all hover:bg-[#f0f9fe]"
        style={{
          fontSize: '14px', fontWeight: 600, color: '#1a1a1a',
          background: '#fff', border: '1.5px solid #d0d0d0',
          borderRadius: '999px', padding: '8px 20px',
          fontFamily: "'DM Sans', sans-serif",
        }}
        onClick={() => { onAdd(); setDismissed(true); }}
      >
        Add to Cart
      </button>
    </div>
  );
}

/* VIP BANNER */
function VIPBanner({ onAdd, membershipPrice }: { onAdd: () => void; membershipPrice: number }) {
  const { get } = useContent();
  const { getVipSavings } = useCart();
  const savings = getVipSavings();
  const hasItems = savings > 0;
  return (
    <div className="bg-[#f9e8eb] border border-[#e8c0c8] rounded-xl p-3.5 flex items-center justify-between mb-4 gap-3 flex-wrap">
      <div className="flex items-center gap-2.5">
        <Award size={20} className="text-[#C8102E]" />
        <div>
          <h3 className="text-[#C8102E]" style={{ fontSize: '15px', fontWeight: 700 }}><ET k="vip.bannerTitle" /></h3>
          <p style={{ fontSize: '13px', color: '#555', marginTop: '2px' }}>
            {hasItems ? (
              <>
                <ET k="vip.bannerDescPrefix" /> <span style={{ fontWeight: 700 }}>${savings.toFixed(2)}</span> <ET k="vip.bannerDescSuffix" /> (${membershipPrice.toFixed(2)} fee)
              </>
            ) : (
              <ET k="vip.bannerDescEmpty" />
            )}
          </p>
        </div>
      </div>
      <button
        className="bg-[#C8102E] text-white px-5 py-2.5 rounded-full border-none cursor-pointer whitespace-nowrap"
        style={{ fontSize: '14px', fontWeight: 600 }}
        onClick={() => { onAdd(); toast.success('VIP Membership added!'); }}
      >
        <ET k="vip.addToCartBtn" />
      </button>
    </div>
  );
}

/* MEMBERSHIP CARD */
function MembershipCard({ onRemove, membershipPrice }: { onRemove: () => void; membershipPrice: number }) {
  const { get } = useContent();
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
        <div className="flex flex-col items-center flex-shrink-0">
          <EI
            k="membership.image"
            alt="VIP Membership"
            className="w-full h-full object-cover"
            containerClassName="w-[72px] h-[72px] rounded-lg overflow-hidden"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: '15px', fontWeight: 600 }}><ET k="membership.name" /></div>
          <div style={{ fontSize: '13px', color: '#555', marginTop: '1px' }}>
            <ET k="membership.description" />
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '6px' }}>${membershipPrice.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}