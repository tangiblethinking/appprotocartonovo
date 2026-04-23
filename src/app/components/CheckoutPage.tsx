import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, CreditCard, Hash, MapPin, CreditCard as CardIcon, ClipboardList, Check, ChevronDown, ChevronUp, X, UserPlus, Info } from 'lucide-react';
import { useCart, ShippingInfo, PaymentInfo } from '../store/cart-context';
import { useContent } from '../store/content-context';
import { OrderSummary } from './OrderSummary';
import { ET } from './EditableText';
import { EI } from './EditableImage';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { resolveItemPricePV } from '../data/suggested-products';

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

type Section = 'enrollment' | 'shipping' | 'payment' | 'review';

/* ─── ADDRESS VERIFICATION MODAL ─── */
function AddressVerificationModal({
  enteredAddress,
  onUseSuggested,
  onKeepOriginal,
  onClose,
}: {
  enteredAddress: { address1: string; address2: string; city: string; state: string; zip: string };
  onUseSuggested: () => void;
  onKeepOriginal: () => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<'suggested' | 'original' | null>(null);

  const suggestedAddress = {
    address1: '123 Main St',
    address2: enteredAddress.address2 ? 'Apt 4B' : '',
    city: enteredAddress.city,
    state: enteredAddress.state,
    zip: enteredAddress.zip + '-1234',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white w-full max-w-md rounded-xl p-0 overflow-hidden z-10 mx-4"
        onClick={e => e.stopPropagation()}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e0e0e0]">
          <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Verify Your Address</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors bg-transparent border-none cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4">
          <p className="text-[#555] mb-4" style={{ fontSize: '14px' }}>
            We found a more precise version of your address. Please choose which one to use.
          </p>

          {/* Suggested address */}
          <button
            className={`w-full text-left p-4 rounded-lg border-2 mb-3 cursor-pointer transition-all bg-white ${
              selected === 'suggested' ? 'border-[#C8102E] bg-[#fef2f2]' : 'border-[#e0e0e0] hover:border-[#ccc]'
            }`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            onClick={() => setSelected('suggested')}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selected === 'suggested' ? 'border-[#C8102E] bg-[#C8102E]' : 'border-[#ccc]'
              }`}>
                {selected === 'suggested' && <Check size={12} className="text-white" />}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#C8102E' }}>We Suggest</span>
            </div>
            <div className="ml-7" style={{ fontSize: '14px', color: '#333', lineHeight: 1.5 }}>
              {suggestedAddress.address1}{suggestedAddress.address2 ? `, ${suggestedAddress.address2}` : ''}<br />
              {suggestedAddress.city}, {suggestedAddress.state} {suggestedAddress.zip}
            </div>
          </button>

          {/* Original address */}
          <button
            className={`w-full text-left p-4 rounded-lg border-2 mb-4 cursor-pointer transition-all bg-white ${
              selected === 'original' ? 'border-[#C8102E] bg-[#fef2f2]' : 'border-[#e0e0e0] hover:border-[#ccc]'
            }`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            onClick={() => setSelected('original')}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                selected === 'original' ? 'border-[#C8102E] bg-[#C8102E]' : 'border-[#ccc]'
              }`}>
                {selected === 'original' && <Check size={12} className="text-white" />}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Keep Address You Entered</span>
            </div>
            <div className="ml-7" style={{ fontSize: '14px', color: '#333', lineHeight: 1.5 }}>
              {enteredAddress.address1}{enteredAddress.address2 ? `, ${enteredAddress.address2}` : ''}<br />
              {enteredAddress.city}, {enteredAddress.state} {enteredAddress.zip}
            </div>
          </button>

          <button
            className={`w-full py-3 rounded-full border-none text-white transition-all ${
              selected ? 'bg-[#C8102E] cursor-pointer hover:bg-[#a00d24]' : 'bg-[#ccc] cursor-not-allowed'
            }`}
            style={{ fontSize: '15px', fontWeight: 600 }}
            disabled={!selected}
            onClick={() => {
              if (selected === 'suggested') onUseSuggested();
              else onKeepOriginal();
            }}
          >
            Use This Address
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── PROGRESS METER ─── */
function ProgressMeter({ showEnrollment, enrollmentSaved, shippingSaved, paymentSaved, activeSection }: {
  showEnrollment: boolean;
  enrollmentSaved: boolean;
  shippingSaved: boolean;
  paymentSaved: boolean;
  activeSection: Section;
}) {
  const allSteps: { key: Section; label: string; icon: React.ReactNode }[] = [
    { key: 'enrollment', label: 'Enrollment', icon: <UserPlus size={16} /> },
    { key: 'shipping', label: 'Shipping', icon: <MapPin size={16} /> },
    { key: 'payment', label: 'Payment', icon: <CardIcon size={16} /> },
    { key: 'review', label: 'Review', icon: <ClipboardList size={16} /> },
  ];

  const steps = showEnrollment ? allSteps : allSteps.filter(s => s.key !== 'enrollment');

  const isComplete = (step: Section) => {
    if (step === 'enrollment') return enrollmentSaved;
    if (step === 'shipping') return shippingSaved;
    if (step === 'payment') return paymentSaved;
    return false;
  };

  const isActive = (step: Section) => step === activeSection;

  return (
    <div className="flex items-center justify-center w-full">
      {steps.map((step, i) => (
        <div key={step.key} className="contents">
          {/* Step circle + label */}
          <div className="flex flex-col items-center gap-1.5">
            <motion.div
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              animate={{
                backgroundColor: isComplete(step.key) ? '#C8102E' : isActive(step.key) ? '#C8102E' : '#e0e0e0',
                color: isComplete(step.key) || isActive(step.key) ? '#ffffff' : '#999',
              }}
              transition={{ duration: 0.4 }}
            >
              {isComplete(step.key) ? <Check size={16} /> : step.icon}
            </motion.div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: isComplete(step.key) || isActive(step.key) ? '#C8102E' : '#999',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {step.label}
            </span>
          </div>
          {/* Connector line */}
          {i < steps.length - 1 && (
            <div className="flex-1 h-0.5 mx-3 mb-5 rounded-full bg-[#e0e0e0] overflow-hidden relative" style={{ maxWidth: '100px' }}>
              <motion.div
                className="absolute inset-y-0 left-0 bg-[#C8102E] rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: isComplete(step.key) ? '100%' : '0%' }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── SECTION HEADER (extracted to avoid inner-component remount bug) ─── */
function SectionHeader({ section, number, titleKey, isOpen, suffix, isSaved, onEdit }: {
  section: Section; number: number; titleKey: string; isOpen: boolean; suffix?: React.ReactNode;
  isSaved: boolean; onEdit: (section: Section) => void;
}) {
  const isDisabled = !isOpen && !isSaved;

  return (
    <div
      className={`flex items-center justify-between py-4 ${isDisabled ? 'opacity-50' : ''}`}
      style={{ cursor: isSaved && !isOpen ? 'pointer' : 'default' }}
      onClick={() => {
        if (isSaved && !isOpen) onEdit(section);
      }}
    >
      <div className="flex items-center gap-2.5" style={{ fontSize: '16px', fontWeight: 700 }}>
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center ${
            isSaved ? 'bg-[#C8102E] text-white' : isOpen ? 'bg-[#C8102E] text-white' : 'bg-[#e0e0e0] text-[#999]'
          }`}
          style={{ fontSize: '13px', fontWeight: 700 }}
        >
          {isSaved ? <Check size={14} /> : number}
        </div>
        <ET k={titleKey} />
        {suffix && <span style={{ fontSize: '14px', fontWeight: 400, color: '#888' }}>{suffix}</span>}
      </div>
      <div className="flex items-center gap-2">
        {isSaved && !isOpen && (
          <button
            className="flex items-center bg-transparent border-none text-[#C8102E] cursor-pointer p-1"
            onClick={(e) => { e.stopPropagation(); onEdit(section); }}
          >
            <Edit size={15} />
          </button>
        )}
        {isOpen ? <ChevronUp size={18} className="text-[#999]" /> : <ChevronDown size={18} className="text-[#999]" />}
      </div>
    </div>
  );
}

/* ─── CHECKOUT PAGE ─── */
export function CheckoutPage() {
  const {
    setPage, saveShipping, savePayment, shippingInfo, paymentInfo,
    getOrderLines, getSubtotal, getShipping, getTotal, hasMembership,
    items, priceMultiplier, effectiveMembership, isSignedInMember,
    addMembership, getMembershipPrice,
    voucherCode, voucherApplied, setVoucherCode, setVoucherApplied,
    setShippingState,
  } = useCart();
  const { get } = useContent();

  // Whether enrollment section should show (only for new account, not signed-in members)
  const showEnrollment = !isSignedInMember;

  // Accordion state — if enrollment shows but no membership in cart, start at shipping
  const [activeSection, setActiveSection] = useState<Section>(() =>
    showEnrollment && hasMembership ? 'enrollment' : 'shipping'
  );
  const [enrollmentSaved, setEnrollmentSaved] = useState(false);
  const [shippingSaved, setShippingSaved] = useState(false);
  const [paymentSaved, setPaymentSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Address verification modal
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Shipping form
  const defaultShipping: ShippingInfo = {
    firstName: 'Jane', lastName: 'Doe', address1: '123 Main Street', address2: '',
    city: 'Phoenix', state: 'AZ', zip: '85001', phone: '(602) 555-0100',
  };
  const [sf, setSf] = useState<ShippingInfo>(() => {
    if (!shippingInfo) return defaultShipping;
    // For signed-in members, shippingInfo is fully populated; for sign-up, merge with defaults
    const merged: ShippingInfo = {
      firstName: shippingInfo.firstName || defaultShipping.firstName,
      lastName: shippingInfo.lastName || defaultShipping.lastName,
      address1: shippingInfo.address1 || defaultShipping.address1,
      address2: shippingInfo.address2 || defaultShipping.address2,
      city: shippingInfo.city || defaultShipping.city,
      state: shippingInfo.state || defaultShipping.state,
      zip: shippingInfo.zip || defaultShipping.zip,
      phone: shippingInfo.phone || defaultShipping.phone,
    };
    return merged;
  });

  // Enrollment form
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollPhone, setEnrollPhone] = useState('');
  const [enrollBirthday, setEnrollBirthday] = useState('');
  const [enrollCommercialEmails, setEnrollCommercialEmails] = useState(true);
  const [enrollTextMe, setEnrollTextMe] = useState(false);
  const [enrollCountry, setEnrollCountry] = useState('US');
  const [enrollReferralName, setEnrollReferralName] = useState(() => {
    const first = shippingInfo?.firstName || (shippingInfo ? '' : 'Jane');
    return first ? `${first.replace(/[^a-zA-Z0-9_]/g, '')}_hello_world` : '';
  });

  // Enrollment opt-out state
  const [enrollmentOptOut, setEnrollmentOptOut] = useState(false);
  const [showOptOutModal, setShowOptOutModal] = useState(false);

  // Payment form
  const [payMethod, setPayMethod] = useState<'card' | 'venmo' | 'paypal'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [billingSame, setBillingSame] = useState(true);
  const [billingAddr, setBillingAddr] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('AZ');
  const [billingZip, setBillingZip] = useState('');
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [voucherInput, setVoucherInput] = useState(voucherCode);
  const [voucherError, setVoucherError] = useState(false);
  const [stateError, setStateError] = useState(false);

  useEffect(() => {
    if (shippingInfo) {
      // For signed-in members, shippingInfo is fully populated; for sign-up, merge with defaults
      const merged: ShippingInfo = {
        firstName: shippingInfo.firstName || defaultShipping.firstName,
        lastName: shippingInfo.lastName || defaultShipping.lastName,
        address1: shippingInfo.address1 || defaultShipping.address1,
        address2: shippingInfo.address2 || defaultShipping.address2,
        city: shippingInfo.city || defaultShipping.city,
        state: shippingInfo.state || defaultShipping.state,
        zip: shippingInfo.zip || defaultShipping.zip,
        phone: shippingInfo.phone || defaultShipping.phone,
      };
      setSf(merged);
      // Only mark shipping as pre-saved if all fields are filled (signed-in member)
      if (shippingInfo.address1 && shippingInfo.city && shippingInfo.zip) {
        setShippingSaved(true);
      }
    }
    if (paymentInfo) {
      setPayMethod(paymentInfo.method as 'card' | 'venmo' | 'paypal');
      setPaymentSaved(true);
    }
    // Only auto-advance if shippingInfo is fully populated (signed-in member, not just sign-up name)
    const shippingComplete = shippingInfo && shippingInfo.address1 && shippingInfo.city && shippingInfo.zip;
    if (shippingComplete && paymentInfo) {
      setActiveSection('review');
    } else if (shippingComplete) {
      setActiveSection('payment');
    } else if (!showEnrollment) {
      setActiveSection('shipping');
    }
  }, []);

  // Watch for membership being added via Order Summary and activate enrollment section
  useEffect(() => {
    if (showEnrollment && hasMembership && activeSection !== 'enrollment' && !enrollmentSaved) {
      setActiveSection('enrollment');
    }
  }, [hasMembership, showEnrollment, enrollmentSaved, activeSection]);

  const handleShippingSaveAndContinue = () => {
    // Validate state is not empty
    if (!sf.state || sf.state.trim() === '') {
      setStateError(true);
      return;
    }
    setStateError(false);
    setShowAddressModal(true);
  };

  const handleAddressVerified = () => {
    setShowAddressModal(false);
    saveShipping(sf);
    setShippingState(sf.state);
    setShippingSaved(true);
    setIsEditing(false);
    setActiveSection('payment');
    toast.success('Shipping information saved');
  };

  const handleSavePayment = () => {
    const info: PaymentInfo = {
      method: payMethod,
      cardNumber, expiration: cardExp, cvv: cardCvv, nameOnCard: cardName,
      billingSameAsShipping: billingSame,
      billingAddress: billingAddr, billingCity, billingState, billingZip,
      voucherCode,
    };
    savePayment(info);
    setPaymentSaved(true);
    setIsEditing(false);
    setActiveSection('review');
    toast.success('Payment method saved');
  };

  const handleEditSection = (section: Section) => {
    setActiveSection(section);
    setIsEditing(true);
  };

  const formatCardInput = (value: string) => {
    const v = value.replace(/\D/g, '').substring(0, 16);
    setCardNumber(v.replace(/(.{4})/g, '$1 ').trim());
  };

  const activeItems = items.filter(i => !i.removed);
  // Enrollment is required only when membership is in cart AND user is not a signed-in member
  const enrollmentRequired = showEnrollment && hasMembership;
  const canPlaceOrder = shippingSaved && paymentSaved && (!enrollmentRequired || enrollmentSaved);

  // Dynamic step numbers
  const enrollmentNum = 1;
  const shippingNum = showEnrollment ? 2 : 1;
  const paymentNum = showEnrollment ? 3 : 2;
  const reviewNum = showEnrollment ? 4 : 3;

  const handleEnrollmentSave = () => {
    setEnrollmentSaved(true);
    setIsEditing(false);
    setActiveSection('shipping');
    toast.success('Enrollment information saved');
  };

  // Enrollment: membership price & savings calculations for the "Add Membership" prompt
  // Use base prices (member pricing) to determine the $1 vs $39.95 threshold
  const basePriceSubtotal = activeItems.reduce((s, i) => s + i.price * i.qty, 0);
  const enrollMembershipPrice = basePriceSubtotal >= 35 ? 1 : 39.95;
  // Savings = what user pays without membership minus what they'd pay with it
  const enrollPotentialSavings = activeItems.reduce((s, i) => s + i.price * 0.25 * i.qty, 0);

  const handleAddMembershipFromEnrollment = () => {
    addMembership();
    setActiveSection('enrollment');
    toast.success('Annual VIP Membership added to your cart!');
  };

  // Sticky button: "Place Order" on review (not editing), "Save and Continue" otherwise
  const onReviewAndDone = activeSection === 'review' && !isEditing;
  const stickyLabel = onReviewAndDone ? (get('checkout.placeOrderBtn') || 'Place Order') : 'Save and Continue';
  const stickyDisabled = onReviewAndDone ? !canPlaceOrder : false;

  const handleStickyBtn = () => {
    if (onReviewAndDone) {
      if (canPlaceOrder) setPage('confirmation');
      return;
    }
    if (activeSection === 'enrollment') handleEnrollmentSave();
    else if (activeSection === 'shipping') handleShippingSaveAndContinue();
    else if (activeSection === 'payment') handleSavePayment();
  };

  return (
    <>
    <div className="max-w-[1280px] mx-auto px-6 py-8 lg:pb-8 pb-28">
      {/* Back to Cart */}
      <button
        className="flex items-center gap-1 bg-transparent border-none text-[#555] cursor-pointer hover:text-[#C8102E] transition-colors mb-4"
        style={{ fontSize: '13px' }}
        onClick={() => setPage('cart')}
      >
        <ArrowLeft size={16} /> <ET k="checkout.backToCart" />
      </button>

      {/* Title */}
      <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 24px 0' }}>Checkout</h1>

      {/* Mobile sticky progress meter */}
      <div className="lg:hidden sticky top-[104px] z-40 bg-white py-3 -mx-6 px-6" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
        <ProgressMeter showEnrollment={showEnrollment} enrollmentSaved={enrollmentSaved} shippingSaved={shippingSaved} paymentSaved={paymentSaved} activeSection={activeSection} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        <div>
          {/* ─── ENROLLMENT ─── */}
          {showEnrollment && (
            <div className="px-2">
              {!hasMembership ? (
                /* ── State A: No membership in cart — show "Add Membership" prompt ── */
                <div>
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-2.5" style={{ fontSize: '16px', fontWeight: 700 }}>
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center bg-[#e0e0e0] text-[#999]"
                        style={{ fontSize: '13px', fontWeight: 700 }}
                      >
                        {enrollmentNum}
                      </div>
                      <ET k="checkout.enrollmentTitle" />
                    </div>
                  </div>
                  {/* Add Membership prompt card */}
                  <div className="border border-[#e0e0e0] rounded-lg p-4 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-[#333] m-0 mb-1" style={{ fontSize: '14px', fontWeight: 600 }}>
                          Add Annual VIP Membership (${enrollMembershipPrice === 1 ? '1.00' : '39.95'}) to enroll
                        </p>
                        {enrollPotentialSavings > 0 && (
                          <p className="text-[#2e7d32] m-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                            Save ${enrollPotentialSavings.toFixed(2)} on this order with member pricing!
                          </p>
                        )}
                        <p className="text-[#888] m-0 mt-1" style={{ fontSize: '12px', lineHeight: 1.5 }}>
                          This ensures you will collect rewards when you share Plexus.
                        </p>
                      </div>
                      <button
                        className="bg-[#C8102E] text-white px-6 py-2.5 rounded-full border-none cursor-pointer transition-all hover:bg-[#a00d24] flex-shrink-0"
                        style={{ fontSize: '14px', fontWeight: 600 }}
                        onClick={handleAddMembershipFromEnrollment}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── State B: Membership in cart — full enrollment form ── */
                <>
              <SectionHeader
                section="enrollment"
                number={enrollmentNum}
                titleKey="checkout.enrollmentTitle"
                isOpen={activeSection === 'enrollment'}
                suffix="(this ensures you will collect rewards when you share Plexus)"
                isSaved={enrollmentSaved}
                onEdit={handleEditSection}
              />
              <AnimatePresence>
                {activeSection === 'enrollment' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-6">
                      {/* Privacy policy disclaimer */}
                      <p className="text-[#555] mb-5" style={{ fontSize: '13px', lineHeight: 1.6 }}>
                        The information collected below consists of personal identifiers and commercial information as contemplated by the{' '}
                        <a href="#" className="text-[#C8102E] underline hover:text-[#a00d24] transition-colors" style={{ fontWeight: 600 }}>
                          Plexus Privacy Policy
                        </a>{' '}
                        and are used to create your account. If you create an account, this information is also used for the management of your account and provision of operations services to Plexus.
                      </p>

                      {/* Opt Out checkbox */}
                      <label className="flex items-start gap-2.5 cursor-pointer mb-5" style={{ fontSize: '13px', color: '#333', lineHeight: 1.5 }}>
                        <input
                          type="checkbox"
                          checked={enrollmentOptOut}
                          onChange={e => {
                            if (e.target.checked) {
                              setShowOptOutModal(true);
                            } else {
                              setEnrollmentOptOut(false);
                            }
                          }}
                          className="w-4 h-4 accent-[#C8102E] cursor-pointer mt-0.5 flex-shrink-0"
                        />
                        <span style={{ fontWeight: 500 }}>
                          Opt out of enrollment{' '}
                          <span className="text-[#888]" style={{ fontWeight: 400 }}>(Not Recommended)</span>
                        </span>
                      </label>

                      {/* Fields container — greyed out when opted out */}
                      <div className={`transition-opacity ${enrollmentOptOut ? 'opacity-40 pointer-events-none' : ''}`}>

                      {/* Email */}
                      <div className="mb-3.5">
                        <FieldGroup label="Email" value={enrollEmail} onChange={setEnrollEmail} type="email" placeholder="you@example.com" />
                      </div>

                      {/* Commercial Electronic Messages checkbox */}
                      <label className="flex items-start gap-2.5 cursor-pointer mb-5" style={{ fontSize: '13px', color: '#333', lineHeight: 1.5 }}>
                        <input
                          type="checkbox"
                          checked={enrollCommercialEmails}
                          onChange={e => setEnrollCommercialEmails(e.target.checked)}
                          className="w-4 h-4 accent-[#C8102E] cursor-pointer mt-0.5 flex-shrink-0"
                        />
                        <span>
                          Commercial Electronic Messages: I want to receive commercial electronic messages about Plexus and Promotions.{' '}
                          <a href="#" className="text-[#C8102E] underline hover:text-[#a00d24] transition-colors" style={{ fontWeight: 600 }}>
                            (Commercial Electronic Messages)
                          </a>
                        </span>
                      </label>

                      {/* Phone + Birthday side by side */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
                        <FieldGroup label="Phone Number" value={enrollPhone} onChange={setEnrollPhone} type="tel" placeholder="(555) 000-0000" />
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Birthday
                            </label>
                            <Info size={13} className="text-[#999] cursor-help" />
                          </div>
                          <input
                            type="text"
                            value={enrollBirthday}
                            onChange={e => setEnrollBirthday(e.target.value)}
                            placeholder="MM/DD/YYYY"
                            maxLength={10}
                            className="px-3.5 py-2.5 border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:border-[#C8102E]"
                            style={{ fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}
                          />
                        </div>
                      </div>

                      {/* Text me checkbox + SMS disclaimer */}
                      <label className="flex items-start gap-2.5 cursor-pointer mb-1" style={{ fontSize: '13px', color: '#333', lineHeight: 1.5 }}>
                        <input
                          type="checkbox"
                          checked={enrollTextMe}
                          onChange={e => setEnrollTextMe(e.target.checked)}
                          className="w-4 h-4 accent-[#C8102E] cursor-pointer mt-0.5 flex-shrink-0"
                        />
                        <span>Text me with news and offers</span>
                      </label>
                      <p className="text-[#888] mb-5 ml-[26px]" style={{ fontSize: '11px', lineHeight: 1.5 }}>
                        By checking this box, you consent to receive recurring automated promotional and personalized marketing text messages from Plexus at the cell phone number used when signing up. Consent is not a condition of any purchase. Reply HELP for help and STOP to cancel. Msg frequency varies. Msg & data rates may apply. View{' '}
                        <a href="#" className="text-[#C8102E] underline hover:text-[#a00d24] transition-colors">
                          SMS Terms & Agreements
                        </a>.
                      </p>

                      {/* Country dropdown */}
                      <div className="flex flex-col gap-1 mb-5">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Country
                        </label>
                        <select
                          value={enrollCountry}
                          onChange={e => setEnrollCountry(e.target.value)}
                          className="px-3 py-2.5 border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:border-[#C8102E]"
                          style={{ fontSize: '14px', fontFamily: "'DM Sans', sans-serif", maxWidth: '320px' }}
                        >
                          <option value="US">United States (EN)</option>
                          <option value="CA">Canada (EN)</option>
                          <option value="AU">Australia (EN)</option>
                          <option value="MX">Mexico (ES)</option>
                        </select>
                      </div>

                      <hr className="border-t border-[#e0e0e0] my-5" />

                      {/* Referral site name */}
                      <div className="mb-3.5">
                        <div className="flex items-center gap-1 mb-1">
                          <label style={{ fontSize: '12px', fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Customize your unique referral link
                          </label>
                          <span className="text-[#C8102E]" style={{ fontSize: '12px', fontWeight: 600 }}>(required)</span>
                          <Info size={13} className="text-[#999] cursor-help" />
                        </div>
                        <p className="text-[#888] mb-2" style={{ fontSize: '12px', fontStyle: 'italic' }}>
                          Example: "AmySmith" or "AmysPinkDrink"
                        </p>
                        <div className="flex items-stretch" style={{ maxWidth: '500px' }}>
                          <div
                            className="flex items-center px-3 border border-r-0 border-[#e0e0e0] rounded-l-lg bg-[#f5f5f5]"
                            style={{ fontSize: '13px', color: '#888', whiteSpace: 'nowrap' }}
                          >
                            mysite.plexusworldwide.com/
                          </div>
                          <input
                            type="text"
                            value={enrollReferralName}
                            onChange={e => setEnrollReferralName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                            placeholder="Enter Custom Link"
                            className="flex-1 px-3.5 py-2.5 border border-[#e0e0e0] rounded-r-lg bg-white focus:outline-none focus:border-[#C8102E] min-w-0"
                            style={{ fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}
                          />
                        </div>
                        <p className="mt-2" style={{ fontSize: '11px', fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Use this link to share your favorite products and get credit when someone buys!
                        </p>
                      </div>
                      </div>{/* end fields container */}

                      {/* Desktop inline button */}
                      <button
                        className="hidden lg:block w-full bg-[#C8102E] text-white py-3 rounded-full border-none cursor-pointer transition-all hover:bg-[#a00d24] mt-4"
                        style={{ fontSize: '15px', fontWeight: 600 }}
                        onClick={handleEnrollmentSave}
                      >
                        Save and Continue
                      </button>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Saved summary */}
              {enrollmentSaved && activeSection !== 'enrollment' && (
                <div className="bg-[#f5f5f5] rounded-lg p-3.5 mb-4" style={{ fontSize: '14px', lineHeight: 1.6 }}>
                  {enrollmentOptOut ? (
                    <span className="text-[#888]" style={{ fontWeight: 600 }}>Enrollment opted out (Not Recommended)</span>
                  ) : (
                    <>
                      <strong className="block">{enrollEmail || 'Email not provided'}</strong>
                      {enrollPhone && <span className="block">{enrollPhone}</span>}
                      {enrollReferralName && <span className="text-[#777]">mysite.plexusworldwide.com/{enrollReferralName}</span>}
                    </>
                  )}
                </div>
              )}
                </>
              )}
            </div>
          )}

          {showEnrollment && <hr className="border-t border-[#CCCCCC] my-0" />}

          {/* ─── SHIPPING ─── */}
          <div className="px-2">
            <SectionHeader section="shipping" number={shippingNum} titleKey="checkout.shippingTitle" isOpen={activeSection === 'shipping'} isSaved={shippingSaved} onEdit={handleEditSection} />
            <AnimatePresence>
              {activeSection === 'shipping' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
                      <FieldGroup label={get('checkout.firstNameLabel')} value={sf.firstName} onChange={v => setSf(p => ({ ...p, firstName: v }))} />
                      <FieldGroup label={get('checkout.lastNameLabel')} value={sf.lastName} onChange={v => setSf(p => ({ ...p, lastName: v }))} />
                    </div>
                    <div className="mb-3.5">
                      <FieldGroup label={get('checkout.address1Label')} value={sf.address1} onChange={v => setSf(p => ({ ...p, address1: v }))} />
                    </div>
                    <div className="mb-3.5">
                      <FieldGroup label={get('checkout.address2Label')} value={sf.address2} onChange={v => setSf(p => ({ ...p, address2: v }))} placeholder={get('checkout.address2Placeholder')} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
                      <FieldGroup label={get('checkout.cityLabel')} value={sf.city} onChange={v => setSf(p => ({ ...p, city: v }))} />
                      <div className="flex flex-col gap-1">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{get('checkout.stateLabel')}</label>
                        <select
                          value={sf.state}
                          onChange={e => { setSf(p => ({ ...p, state: e.target.value })); if (stateError) setStateError(false); }}
                          className={`px-3 py-2.5 border rounded-lg bg-white focus:outline-none ${stateError ? 'border-[#d32f2f] bg-[#fff5f5]' : 'border-[#e0e0e0] focus:border-[#C8102E]'}`}
                          style={{ fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {stateError && (
                          <div className="text-[#d32f2f] mt-1" style={{ fontSize: '12px', fontWeight: 500 }}>Required</div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
                      <FieldGroup label={get('checkout.zipLabel')} value={sf.zip} onChange={v => setSf(p => ({ ...p, zip: v }))} maxLength={5} />
                      <FieldGroup label={get('checkout.phoneLabel')} value={sf.phone} onChange={v => setSf(p => ({ ...p, phone: v }))} type="tel" />
                    </div>
                    {/* Desktop inline button */}
                    <button
                      className="hidden lg:block w-full bg-[#C8102E] text-white py-3 rounded-full border-none cursor-pointer transition-all hover:bg-[#a00d24] mt-2"
                      style={{ fontSize: '15px', fontWeight: 600 }}
                      onClick={handleShippingSaveAndContinue}
                    >
                      Save and Continue
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Saved summary */}
            {shippingSaved && activeSection !== 'shipping' && (
              <div className="bg-[#f5f5f5] rounded-lg p-3.5 mb-4" style={{ fontSize: '14px', lineHeight: 1.6 }}>
                <strong className="block">{sf.firstName} {sf.lastName}</strong>
                <span>{sf.address1}{sf.address2 ? ', ' + sf.address2 : ''}, {sf.city}, {sf.state} {sf.zip}</span>
              </div>
            )}
          </div>

          <hr className="border-t border-[#CCCCCC] my-0" />

          {/* ─── PAYMENT ─── */}
          <div className="px-2">
            <SectionHeader section="payment" number={paymentNum} titleKey="checkout.paymentTitle" isOpen={activeSection === 'payment'} isSaved={paymentSaved} onEdit={handleEditSection} />
            <AnimatePresence>
              {activeSection === 'payment' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pb-6">
                    {/* Payment method tabs (no voucher tab) */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {([
                        { key: 'card' as const, labelKey: 'checkout.creditDebit', icon: <CreditCard size={15} /> },
                        { key: 'venmo' as const, labelKey: 'checkout.venmoLabel' },
                        { key: 'paypal' as const, labelKey: 'checkout.paypalLabel' },
                      ]).map(tab => (
                        <button
                          key={tab.key}
                          className={`px-3.5 py-2 border rounded-md cursor-pointer transition-all flex items-center gap-1 ${
                            payMethod === tab.key
                              ? 'border-[#C8102E] bg-[#f9e8eb] text-[#C8102E]'
                              : 'border-[#e0e0e0] bg-white text-[#1a1a1a]'
                          }`}
                          style={{ fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
                          onClick={() => setPayMethod(tab.key)}
                        >
                          {tab.icon} <ET k={tab.labelKey} />
                        </button>
                      ))}
                    </div>

                    {payMethod === 'card' && (
                      <>
                        <div className="flex gap-1.5 mb-3.5">
                          {['VISA', 'MC', 'AMEX', 'DISC'].map(c => (
                            <div key={c} className="w-9 h-6 border border-[#e0e0e0] rounded flex items-center justify-center bg-[#f8f8f8]" style={{ fontSize: '10px', fontWeight: 700, color: '#888' }}>{c}</div>
                          ))}
                        </div>
                        <div className="mb-3.5">
                          <FieldGroup label={get('checkout.cardNumberLabel')} value={cardNumber} onChange={formatCardInput} placeholder="1234 5678 9012 3456" maxLength={19} />
                        </div>
                        <div className="grid grid-cols-2 gap-3.5 mb-3.5">
                          <FieldGroup label={get('checkout.expirationLabel')} value={cardExp} onChange={setCardExp} placeholder="MM/YY" maxLength={5} />
                          <FieldGroup label={get('checkout.cvvLabel')} value={cardCvv} onChange={setCardCvv} placeholder="..." maxLength={4} />
                        </div>
                        <div className="mb-3.5">
                          <FieldGroup label={get('checkout.nameOnCardLabel')} value={cardName} onChange={setCardName} placeholder="Jane Doe" />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer mt-3.5" style={{ fontSize: '14px' }}>
                          <input type="checkbox" checked={billingSame} onChange={e => setBillingSame(e.target.checked)} className="w-4 h-4 accent-[#C8102E] cursor-pointer" />
                          <ET k="checkout.billingSame" />
                        </label>
                        {!billingSame && (
                          <div className="mt-4">
                            <div className="mb-3.5">
                              <FieldGroup label={get('checkout.billingAddressLabel')} value={billingAddr} onChange={setBillingAddr} placeholder="Street address" />
                            </div>
                            <div className="grid grid-cols-2 gap-3.5 mb-3.5">
                              <FieldGroup label={get('checkout.billingCityLabel')} value={billingCity} onChange={setBillingCity} placeholder="City" />
                              <div className="flex flex-col gap-1">
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{get('checkout.billingStateLabel')}</label>
                                <select
                                  value={billingState}
                                  onChange={e => setBillingState(e.target.value)}
                                  className="px-3 py-2.5 border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:border-[#C8102E]"
                                  style={{ fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}
                                >
                                  {US_STATES.map(s => <option key={s}>{s}</option>)}
                                </select>
                              </div>
                            </div>
                            <div className="mb-3.5" style={{ maxWidth: '200px' }}>
                              <FieldGroup label={get('checkout.billingZipLabel')} value={billingZip} onChange={setBillingZip} placeholder="85001" maxLength={5} />
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {payMethod === 'venmo' && (
                      <div>
                        <p style={{ color: '#555', fontSize: '14px', margin: '12px 0' }}><ET k="checkout.venmoText" /></p>
                        <button className="px-5 py-2.5 rounded-md border border-[#008CFF] text-[#008CFF] bg-white cursor-pointer" style={{ fontWeight: 800 }}>
                          <ET k="checkout.venmoBtn" />
                        </button>
                      </div>
                    )}

                    {payMethod === 'paypal' && (
                      <div>
                        <p style={{ color: '#555', fontSize: '14px', margin: '12px 0' }}><ET k="checkout.paypalText" /></p>
                        <button className="bg-[#009cde] text-white px-5 py-3 rounded-md border-none cursor-pointer inline-flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 700 }}>
                          <ET k="checkout.paypalConnectBtn" />
                        </button>
                      </div>
                    )}

                    {/* Voucher — collapsible below payment method */}
                    <div className="mt-5 pt-4 border-t border-[#e8e8e8]">
                      {voucherApplied ? (
                        /* Confirmed state */
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-[#2e7d32]" style={{ fontSize: '13px', fontWeight: 600 }}>
                            <span>✓</span>
                            <span>Voucher Confirmed</span>
                          </div>
                          <span className="text-[#555]" style={{ fontSize: '12px' }}>"{voucherCode}" added</span>
                          <button
                            className="bg-transparent border-none cursor-pointer p-0.5 text-[#888] hover:text-[#C8102E] transition-colors"
                            onClick={() => {
                              setVoucherApplied(false);
                              setVoucherInput(voucherCode);
                              setVoucherOpen(true);
                            }}
                          >
                            <Edit size={14} />
                          </button>
                        </div>
                      ) : voucherOpen ? (
                        /* Input state */
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Hash size={15} className="text-[#888]" />
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>
                              Voucher Code <span className="text-[#999]" style={{ fontWeight: 400 }}>(Optional)</span>
                            </label>
                          </div>
                          <input
                            type="text"
                            placeholder={get('checkout.voucherPlaceholder') || 'Enter voucher number'}
                            value={voucherInput}
                            onChange={e => { setVoucherInput(e.target.value.replace(/[^0-9]/g, '')); if (voucherError) setVoucherError(false); }}
                            maxLength={20}
                            className={`px-3 py-2.5 border rounded-lg focus:outline-none w-full ${voucherError ? 'border-[#d32f2f] bg-[#fff5f5]' : 'border-[#e0e0e0] focus:border-[#C8102E]'}`}
                            style={{ fontSize: '14px', fontFamily: "'DM Sans', sans-serif", maxWidth: '300px' }}
                          />
                          {voucherError && (
                            <div className="text-[#d32f2f] mt-1" style={{ fontSize: '12px', fontWeight: 500 }}>Required</div>
                          )}
                          <div className="flex gap-2 mt-2">
                            <button
                              className="bg-[#C8102E] text-white px-3.5 py-2 rounded-md border-none cursor-pointer"
                              style={{ fontSize: '13px', fontWeight: 600 }}
                              onClick={() => {
                                if (voucherInput.trim()) {
                                  setVoucherCode(voucherInput.trim());
                                  setVoucherApplied(true);
                                  setVoucherOpen(false);
                                  setVoucherError(false);
                                } else {
                                  setVoucherError(true);
                                }
                              }}
                            >
                              Apply
                            </button>
                            <button
                              className="bg-transparent text-[#888] px-3.5 py-2 rounded-md border border-[#e0e0e0] cursor-pointer hover:bg-[#f5f5f5] transition-colors"
                              style={{ fontSize: '13px', fontWeight: 600 }}
                              onClick={() => {
                                setVoucherOpen(false);
                                setVoucherInput('');
                                setVoucherError(false);
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Toggle state */
                        <button
                          className="flex items-center gap-1 text-[#C8102E] bg-transparent border-none cursor-pointer p-0"
                          style={{ fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
                          onClick={() => setVoucherOpen(true)}
                        >
                          <span style={{ fontSize: '15px' }}>+</span> Voucher Code
                        </button>
                      )}
                    </div>

                    {/* Desktop inline button */}
                    <button
                      className="hidden lg:block w-full bg-[#C8102E] text-white py-3 rounded-full border-none cursor-pointer transition-all hover:bg-[#a00d24] mt-5"
                      style={{ fontSize: '15px', fontWeight: 600 }}
                      onClick={handleSavePayment}
                    >
                      Save and Continue
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Saved summary */}
            {paymentSaved && activeSection !== 'payment' && (
              <div className="bg-[#f5f5f5] rounded-lg p-3.5 mb-4" style={{ fontSize: '14px', lineHeight: 1.6 }}>
                <strong className="block">
                  {payMethod === 'card' && get('checkout.creditDebitSaved')}
                  {payMethod === 'venmo' && get('checkout.venmoSaved')}
                  {payMethod === 'paypal' && get('checkout.paypalSaved')}
                </strong>
                {payMethod === 'card' && <span>{'\u2022\u2022\u2022\u2022'} {'\u2022\u2022\u2022\u2022'} {'\u2022\u2022\u2022\u2022'} {cardNumber.slice(-4) || '3456'}</span>}
                {voucherApplied && voucherCode && <div className="text-[#2e7d32] mt-1" style={{ fontSize: '12px' }}>✓ Voucher: {voucherCode}</div>}
              </div>
            )}
          </div>

          <hr className="border-t border-[#CCCCCC] my-0" />

          {/* ─── REVIEW ─── */}
          <div className="px-2">
            <div className={`flex items-center justify-between py-4 ${!shippingSaved || !paymentSaved ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-2.5" style={{ fontSize: '16px', fontWeight: 700 }}>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    activeSection === 'review' ? 'bg-[#C8102E] text-white' : 'bg-[#e0e0e0] text-[#999]'
                  }`}
                  style={{ fontSize: '13px', fontWeight: 700 }}
                >
                  {reviewNum}
                </div>
                <ET k="checkout.reviewTitle" />
              </div>
              <div className="flex items-center gap-2">
                {activeSection === 'review' && (
                  <button
                    className="flex items-center gap-1 bg-transparent border-none text-[#C8102E] cursor-pointer"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                    onClick={() => setPage('cart')}
                  >
                    <Edit size={15} /> Edit Cart
                  </button>
                )}
                {activeSection === 'review' ? <ChevronUp size={18} className="text-[#999]" /> : <ChevronDown size={18} className="text-[#999]" />}
              </div>
            </div>
            <AnimatePresence>
              {activeSection === 'review' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pb-6">
                    {/* Full cart items — read-only */}
                    {activeItems.map(item => {
                      const resolved = resolveItemPricePV(
                        item.price, item.pv,
                        item.optionConfig?.optionsPrice,
                        item.optionConfig?.optionPriceTotal,
                        item.selections,
                      );
                      const price = resolved.price * priceMultiplier;
                      return (
                        <div key={item.id} className="flex gap-4 items-start py-4 border-b border-[#e0e0e0]">
                          {/* Product image */}
                          <div className="w-[72px] h-[72px] rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {/* Product details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div style={{ fontSize: '15px', fontWeight: 600 }}>{item.name}</div>
                                <div className="text-[#777]" style={{ fontSize: '13px' }}>{item.subtitle}</div>
                              </div>
                              <div style={{ fontSize: '15px', fontWeight: 700 }}>${(price * item.qty).toFixed(2)}</div>
                            </div>

                            {/* Selections — vertically stacked list for dropdowns */}
                            {item.optionType === 'dropdowns' && item.selections && item.selections.length > 0 && (
                              <div className="mt-2">
                                <div className="text-[#555]" style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Your Selections:</div>
                                <div className="flex flex-col gap-0.5">
                                  {item.selections.map((sel, idx) => (
                                    <div key={idx} className="text-[#555]" style={{ fontSize: '13px', paddingLeft: '8px' }}>
                                      • {sel}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Flavor for swatches */}
                            {item.optionType === 'swatches' && item.selectedFlavor && (
                              <div className="mt-2 text-[#555]" style={{ fontSize: '13px' }}>
                                <span style={{ fontWeight: 600 }}>Flavor:</span> {item.selectedFlavor}
                              </div>
                            )}

                            {/* Read-only details */}
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                              <div className="text-[#555]" style={{ fontSize: '13px' }}>
                                <span style={{ fontWeight: 600 }}>Qty:</span> {item.qty}
                              </div>
                              <div className="text-[#555]" style={{ fontSize: '13px' }}>
                                <span style={{ fontWeight: 600 }}>Subscription:</span>{' '}
                                <span className={item.subscription ? 'text-[#2e7d32]' : 'text-[#999]'}>
                                  {item.subscription ? 'Added' : 'None'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Membership line if applicable */}
                    {hasMembership && (
                      <div className="flex gap-4 items-center py-4 border-b border-[#e0e0e0]">
                        <EI
                          k="membership.image"
                          alt="VIP Membership"
                          className="w-full h-full object-cover"
                          containerClassName="w-[72px] h-[72px] rounded-lg overflow-hidden flex-shrink-0"
                        />
                        <div className="flex-1 flex items-center justify-between">
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: 600 }}>Annual VIP Membership</div>
                            <div className="text-[#777]" style={{ fontSize: '13px' }}>12-month membership</div>
                          </div>
                          <div style={{ fontSize: '15px', fontWeight: 700 }}>$1.00</div>
                        </div>
                      </div>
                    )}

                    {/* Desktop inline Place Order button */}
                    <button
                      className={`hidden lg:block w-full py-3.5 rounded-full border-none text-white mt-5 transition-all ${
                        canPlaceOrder ? 'bg-[#C8102E] cursor-pointer hover:bg-[#a00d24]' : 'bg-[#ccc] cursor-not-allowed'
                      }`}
                      style={{ fontSize: '16px', fontWeight: 600 }}
                      disabled={!canPlaceOrder}
                      onClick={() => canPlaceOrder && setPage('confirmation')}
                    >
                      <ET k="checkout.placeOrderBtn" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Order Summary sidebar */}
        <div className="lg:sticky lg:top-[104px]">
          {/* Desktop progress meter — above order summary */}
          <div className="hidden lg:block mb-6">
            <ProgressMeter showEnrollment={showEnrollment} enrollmentSaved={enrollmentSaved} shippingSaved={shippingSaved} paymentSaved={paymentSaved} activeSection={activeSection} />
          </div>
          <OrderSummary showProgress={false} showAttainedBenefits />
          <div className="flex flex-nowrap items-center justify-center gap-0 pt-5 mt-1">
            {['policy.refundLabel', 'policy.shippingLabel', 'policy.privacyLabel', 'policy.termsLabel'].map((k, i) => (
              <span key={k} className="inline-flex items-center flex-shrink-0">
                {i > 0 && <span className="text-[#ccc] mx-2" style={{ fontSize: '12px', userSelect: 'none' }}>|</span>}
                <a className="text-[#888] underline cursor-pointer hover:text-[#C8102E] transition-colors whitespace-nowrap" style={{ fontSize: '12px' }}>
                  <ET k={k} />
                </a>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Address Verification Modal */}
      {showAddressModal && (
        <AddressVerificationModal
          enteredAddress={sf}
          onUseSuggested={handleAddressVerified}
          onKeepOriginal={handleAddressVerified}
          onClose={() => setShowAddressModal(false)}
        />
      )}

      {/* Enrollment Opt-Out Confirmation Modal */}
      {showOptOutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => setShowOptOutModal(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative bg-white w-full max-w-sm rounded-xl overflow-hidden z-10 mx-4 text-center"
            onClick={e => e.stopPropagation()}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <div className="px-8 py-8">
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 10px 0', color: '#1a1a1a' }}>
                Are you sure?
              </h3>
              <p className="text-[#555] mb-6" style={{ fontSize: '14px', lineHeight: 1.6 }}>
                This benefit rewards you when you share Plexus.
              </p>
              <button
                className="w-full py-3 rounded-full border-none text-white bg-[#1a1a1a] cursor-pointer transition-all hover:bg-[#333] mb-4"
                style={{ fontSize: '15px', fontWeight: 600 }}
                onClick={() => setShowOptOutModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-transparent border-none text-[#C8102E] underline cursor-pointer transition-colors hover:text-[#a00d24]"
                style={{ fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
                onClick={() => {
                  setEnrollmentOptOut(true);
                  setShowOptOutModal(false);
                }}
              >
                Opt-Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Sticky bottom button — mobile only */}
    <div
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e0e0e0] px-6 py-4"
      style={{ boxShadow: '0 -4px 16px rgba(0,0,0,0.08)' }}
    >
      <div className="max-w-[1280px] mx-auto">
        <button
          className={`w-full py-3.5 rounded-full border-none text-white transition-all ${
            stickyDisabled
              ? 'bg-[#ccc] cursor-not-allowed'
              : 'bg-[#C8102E] cursor-pointer hover:bg-[#a00d24]'
          }`}
          style={{ fontSize: '16px', fontWeight: 600 }}
          disabled={stickyDisabled}
          onClick={handleStickyBtn}
        >
          {stickyLabel}
        </button>
      </div>
    </div>
    </>
  );
}

/* FIELD GROUP */
function FieldGroup({ label, value, onChange, placeholder, maxLength, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; maxLength?: number; type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label style={{ fontSize: '12px', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="px-3.5 py-2.5 border border-[#e0e0e0] rounded-lg bg-white focus:outline-none focus:border-[#C8102E]"
        style={{ fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}
      />
    </div>
  );
}