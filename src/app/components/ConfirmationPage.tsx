import React, { useState } from 'react';
import { CheckCircle, User, Share2, Package, HelpCircle, ArrowRight } from 'lucide-react';
import { useCart, SUGGESTED_PRODUCTS } from '../store/cart-context';
import { useContent } from '../store/content-context';
import { ShareCartModal } from './Modals';
import { ET } from './EditableText';
import { EI } from './EditableImage';
import { SubscriptionTimeline } from './SubscriptionTimeline';
import { toast } from 'sonner';

export function ConfirmationPage() {
  const {
    orderSnapshot,
    shippingInfo, addSuggestedToCart, items, userName, isSignedInMember,
  } = useCart();
  const { get } = useContent();
  const [shareOpen, setShareOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  // Read from the order snapshot (captured at Place Order time)
  const lines = orderSnapshot?.lines ?? [];
  const subtotal = orderSnapshot?.subtotal ?? 0;
  const shipping = orderSnapshot?.shipping ?? 0;
  const total = orderSnapshot?.total ?? 0;
  const totalPV = orderSnapshot?.totalPV ?? 0;
  const freeShipping = orderSnapshot?.freeShipping ?? true;
  const hasSubscription = orderSnapshot?.hasSubscription ?? false;

  const name = shippingInfo ? `${shippingInfo.firstName} ${shippingInfo.lastName}` : 'Jane Doe';
  const addr = shippingInfo
    ? `${shippingInfo.address1}${shippingInfo.address2 ? ', ' + shippingInfo.address2 : ''}`
    : '123 Main Street';
  const cityLine = shippingInfo
    ? `${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zip}`
    : 'Phoenix, AZ 85001';
  const phone = shippingInfo?.phone || '(602) 555-0100';

  const firstName = isSignedInMember
    ? (shippingInfo?.firstName || 'Tarl')
    : (userName || shippingInfo?.firstName || 'Jane');

  const sendInvite = () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    toast.success(`Invite sent to ${inviteEmail}`);
    setInviteEmail('');
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-10">
      {/* ─── HERO ─── */}
      <div className="text-center py-10 px-6 mb-8">
        <div className="w-[64px] h-[64px] bg-[#C8102E] rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-white" />
        </div>
        <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '30px', fontWeight: 700, marginBottom: '12px', color: '#1a1a1a' }}>
          <ET k="confirmation.thankYouPrefix" /> {firstName}!
        </h1>
        <p style={{ fontSize: '15px', color: '#555', lineHeight: 1.7, margin: '0 auto', maxWidth: '480px' }}>
          <ET k="confirmation.orderPlaced" />
        </p>
        <p style={{ fontSize: '15px', color: '#555', lineHeight: 1.7, margin: '4px auto 0', maxWidth: '480px' }}>
          <ET k="confirmation.journeyText" />
        </p>
        <div className="flex gap-3 justify-center mt-6 flex-wrap">
          <button
            className="inline-flex items-center justify-center gap-2 bg-[#C8102E] text-white py-3 px-7 rounded-full border-none cursor-pointer transition-all hover:bg-[#a00d24]"
            style={{ fontSize: '14px', fontWeight: 600 }}
            onClick={() => toast('Redirecting to My Account...')}
          >
            <User size={16} /> <ET k="confirmation.goToAccount" />
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 bg-white text-[#1a1a1a] py-3 px-7 rounded-full cursor-pointer transition-all hover:border-[#999]"
            style={{ fontSize: '14px', fontWeight: 600, border: '1px solid #d0d0d0' }}
            onClick={() => setShareOpen(true)}
          >
            <Share2 size={16} /> <ET k="confirmation.shareCartBtn" />
          </button>
        </div>
      </div>

      {/* ─── ORDER SUMMARY (left) + ORDER STATUS/SHIPPING/DELIVERY (right) ─── */}
      {/* ─── TIMELINE — above order summary per image 10 ─── */}
      <div className="mb-8" style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '24px' }}>
        <SubscriptionTimeline hasSubscription={hasSubscription} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-6 mb-8">

        {/* LEFT: Order Summary */}
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#999', marginBottom: '16px' }}>
            <ET k="confirmation.orderSummaryTitle" />
          </h3>
          {lines.map((l, i) => (
            <div key={i} className="flex justify-between items-baseline mb-2.5" style={{ fontSize: '14px' }}>
              <span className="text-[#555]">{l.name}{l.qty > 1 ? ` x${l.qty}` : ''}</span>
              <span style={{ fontWeight: 500 }}>${(l.price * l.qty).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between py-2.5 my-2.5 border-t border-b border-[#e0e0e0]" style={{ fontSize: '14px', fontWeight: 700 }}>
            <span><ET k="confirmation.pvTotal" /></span>
            <span>{totalPV} {get('cartItem.pvSuffix')}</span>
          </div>
          <div className="flex justify-between items-baseline mb-2" style={{ fontSize: '14px' }}>
            <span className="text-[#555]"><ET k="confirmation.subtotalLabel" /></span>
            <span style={{ fontWeight: 500 }}>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-baseline mb-2" style={{ fontSize: '14px' }}>
            <span className="text-[#555]"><ET k="confirmation.shippingLabel" /></span>
            <span style={{ fontWeight: 500, color: freeShipping ? '#2e7d32' : undefined }}>
              {freeShipping ? get('orderSummary.freeText') : '$9.99'}
            </span>
          </div>
          <div className="flex justify-between items-baseline mb-2" style={{ fontSize: '14px' }}>
            <span className="text-[#555]"><ET k="confirmation.taxLabel" /></span>
            <span style={{ fontWeight: 500 }}><ET k="confirmation.taxValue" /></span>
          </div>
          <hr className="border-t border-[#e0e0e0] my-3" />
          <div className="flex justify-between items-baseline">
            <span style={{ fontSize: '15px', fontWeight: 700 }}><ET k="confirmation.totalCharged" /></span>
            <span style={{ fontSize: '20px', fontWeight: 800 }}>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* RIGHT: Order Status + Shipping + Delivery — single card */}
        <div style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '24px' }}>
          {/* Order Status */}
          <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#999', marginBottom: '12px' }}>
            <ET k="confirmation.orderStatusTitle" />
          </h3>
          <div className="flex mb-3">
            <div className="inline-flex items-center gap-1.5 bg-[#e8f4fd] text-[#1565c0] py-1.5 px-3 rounded-full" style={{ fontSize: '13px', fontWeight: 600 }}>
              <div className="w-2 h-2 bg-[#1565c0] rounded-full animate-pulse" />
              <ET k="confirmation.beingProcessed" />
            </div>
          </div>
          <div style={{ fontSize: '14px', color: '#555', lineHeight: 1.8, marginBottom: '20px' }}>
            <div><span style={{ fontWeight: 600 }}><ET k="confirmation.orderNumberLabel" /></span> <ET k="confirmation.orderNumber" /></div>
            <div><span style={{ fontWeight: 600 }}><ET k="confirmation.placedLabel" /></span> <ET k="confirmation.placedDate" /></div>
          </div>
          <hr className="border-t border-[#e0e0e0] mb-5" />

          {/* Shipping To */}
          <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#999', marginBottom: '12px' }}>
            <ET k="confirmation.shippingToTitle" />
          </h3>
          <div style={{ fontSize: '14px', lineHeight: 1.8, marginBottom: '20px' }}>
            <strong>{name}</strong><br />
            {addr}<br />
            {cityLine}<br />
            <span className="text-[#888]">{phone}</span>
          </div>
          <hr className="border-t border-[#e0e0e0] mb-5" />

          {/* Expected Delivery */}
          <h3 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#999', marginBottom: '12px' }}>
            <ET k="confirmation.expectedDeliveryTitle" />
          </h3>
          <div className="flex items-start gap-2.5">
            <Package size={18} className="text-[#C8102E] flex-shrink-0 mt-0.5" />
            <div style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.5 }}>
              <ET k="confirmation.expectedDeliveryDateTime" />
            </div>
          </div>
          <button
            className="inline-flex items-center gap-1.5 bg-transparent border-none text-[#C8102E] cursor-pointer mt-3 p-0 transition-colors hover:text-[#a00d24]"
            style={{ fontSize: '14px', fontWeight: 600 }}
            onClick={() => toast('Opening order support...')}
          >
            <HelpCircle size={15} />
            <ET k="confirmation.orderSupportBtn" />
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ─── INVITE ─── */}
      <div className="py-8 text-center">
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}><ET k="confirmation.inviteTitle" /></h3>
        <p style={{ fontSize: '13px', color: '#555', marginBottom: '12px' }}><ET k="confirmation.inviteSubtitle" /></p>
        <div className="flex gap-2 justify-center max-w-md mx-auto">
          <input
            type="email"
            placeholder={get('confirmation.invitePlaceholder')}
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            className="flex-1 px-3.5 py-2.5 border border-[#e0e0e0] rounded-lg focus:outline-none focus:border-[#C8102E]"
            style={{ fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}
          />
          <button
            className="bg-white text-[#C8102E] px-5 py-2.5 rounded-md cursor-pointer transition-all hover:bg-[#fef2f2]"
            style={{ fontSize: '14px', fontWeight: 600, border: '1.5px solid #C8102E' }}
            onClick={sendInvite}
          >
            <ET k="confirmation.inviteBtn" />
          </button>
        </div>
      </div>

      {/* ─── SURVEY ─── */}
      <div
        className="rounded-xl p-7 text-white text-center my-8"
        style={{ background: 'linear-gradient(135deg, #C8102E, #a00d24)' }}
      >
        <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '22px', marginBottom: '8px' }}>
          <strong>{firstName}</strong>, <ET k="confirmation.surveyTitle" />
        </h3>
        <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '16px' }}>
          <ET k="confirmation.surveyText" />
        </p>
        <button
          className="bg-white text-[#C8102E] py-3 px-7 rounded-lg border-none cursor-pointer transition-all hover:-translate-y-0.5"
          style={{ fontSize: '14px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}
          onClick={() => toast.success('Survey opened - thank you!')}
        >
          <ET k="confirmation.surveyBtn" />
        </button>
      </div>

      {/* ─── PRODUCTS TO COMPLETE JOURNEY ─── */}
      <div className="pt-8 pb-4">
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '22px', fontWeight: 400, marginBottom: '20px' }}>
          <ET k="confirmation.productsTitle" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SUGGESTED_PRODUCTS.slice(0, 3).map(sp => {
            const imgKey = `suggested.${sp.id}.image`;
            const nameKey = `suggested.${sp.id}.name`;
            const subtitleKey = `suggested.${sp.id}.subtitle`;
            return (
              <div
                key={sp.id}
                className="bg-white rounded-xl transition-all hover:-translate-y-0.5 overflow-hidden flex flex-col"
                style={{ border: '1px solid #e8e8e8' }}
              >
                {/* Product image */}
                <EI
                  k={imgKey}
                  alt={get(nameKey)}
                  className="w-full h-full object-contain"
                  containerClassName="w-full aspect-square flex items-center justify-center bg-[#f8f8f8]"
                />
                {/* Card body — left aligned */}
                <div className="px-4 py-4 flex flex-col flex-1">
                  <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px', color: '#1a1a1a' }}>
                    <ET k={nameKey} />
                  </div>
                  <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#999' }}>
                    <ET k="cart.optionsAvailable" />
                  </div>
                  {/* Price block — visually separated */}
                  <div className="mt-auto pt-4">
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', marginBottom: '2px' }}>
                      ${sp.price.toFixed(2)}
                    </div>
                    <div className="mb-3" style={{ fontSize: '13px', fontWeight: 600, color: '#C8102E' }}>
                      {sp.pv} {get('cartItem.pvSuffix')}
                      <span className="text-[#bbb] mx-1.5">|</span>
                      <span style={{ color: '#999', textDecoration: 'line-through', fontWeight: 400 }}>
                        ${sp.retailPrice.toFixed(2)}
                      </span>
                    </div>
                    <button
                      className="w-full bg-[#1a1a1a] text-white py-2.5 rounded-full border-none cursor-pointer transition-all hover:bg-[#333]"
                      style={{ fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
                      onClick={() => {
                        addSuggestedToCart(sp);
                        toast.success(`${sp.name} added to cart!`);
                      }}
                    >
                      <ET k="cart.addToCartBtn" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ShareCartModal open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}