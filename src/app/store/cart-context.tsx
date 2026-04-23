import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import defaultContent from './default-content.json';
import overrides from './content-overrides.json';
import SUGGESTED_PRODUCTS_TEMPLATE, { type SuggestedProductEntry, type FlavorGroup, type DropdownConfig, type OptionPriceEntry, resolveItemPricePV } from '../data/suggested-products';

// Merge content at module level for initialization
const C: Record<string, string | number> = { ...defaultContent, ...overrides } as any;
function cStr(key: string): string { return String(C[key] ?? ''); }
function cNum(key: string): number { const v = C[key]; return typeof v === 'number' ? v : parseFloat(String(v)) || 0; }

export interface OptionConfig {
  style: 'none' | 'single' | 'multiple';
  optionsPrice?: boolean;
  // single
  defaultFlavor?: string;
  flavorGroups?: FlavorGroup[];
  // multiple
  dropdownCount?: number;
  dropdowns?: DropdownConfig[];
  // option-dependent pricing
  optionPriceTotal?: Record<string, OptionPriceEntry>;
}

export interface CartItem {
  id: string;
  name: string;
  subtitle: string;
  price: number; // VIP price
  pv: number;
  qty: number;
  subscription: boolean;
  removed: boolean;
  image: string;
  optionType: 'dropdowns' | 'swatches' | 'none';
  selectedFlavor?: string;
  showProp65?: boolean;
  selections?: string[];
  optionConfig?: OptionConfig;
}

export interface SuggestedProduct {
  id: string;
  name: string;
  price: number;
  retailPrice: number;
  pv: number;
  image: string;
  showProp65: boolean;
  optionStyle: 'none' | 'single' | 'multiple';
  optionsPrice: boolean;
  defaultFlavor?: string;
  flavorGroups?: FlavorGroup[];
  dropdownCount?: number;
  dropdowns?: DropdownConfig[];
  optionPriceTotal?: Record<string, OptionPriceEntry>;
}

interface UndoEntry {
  itemId: string;
  itemName: string;
  visible: boolean;
}

export interface OrderSnapshot {
  lines: { name: string; price: number; pv: number; qty: number }[];
  subtotal: number;
  totalPV: number;
  shipping: number;
  total: number;
  freeShipping: boolean;
  hasSubscription: boolean;
}

interface CartState {
  hasMembership: boolean;
  effectiveMembership: boolean;
  isSignedInMember: boolean;
  membershipRemoved: boolean;
  items: CartItem[];
  suggestedProducts: SuggestedProduct[];
  undoEntries: UndoEntry[];
  shippingInfo: ShippingInfo | null;
  paymentInfo: PaymentInfo | null;
  currentPage: 'cart' | 'auth' | 'checkout' | 'confirmation';
  userName: string | null;
  authReturnPage: 'cart' | 'checkout';
  orderSnapshot: OrderSnapshot | null;
  shippingState: string | null;
}

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

export interface PaymentInfo {
  method: 'card' | 'venmo' | 'paypal' | 'voucher';
  cardNumber?: string;
  expiration?: string;
  cvv?: string;
  nameOnCard?: string;
  billingSameAsShipping: boolean;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  voucherCode?: string;
}

interface CartContextType extends CartState {
  addMembership: () => void;
  removeMembership: () => void;
  removeItem: (id: string) => void;
  undoRemoveItem: (id: string) => void;
  dismissUndo: (id: string) => void;
  changeQty: (id: string, delta: number) => void;
  toggleSubscription: (id: string) => boolean;
  confirmRemoveSubscription: (id: string) => void;
  setFlavor: (id: string, flavor: string) => void;
  updateItemSelection: (id: string, index: number, value: string) => void;
  addSuggestedToCart: (product: SuggestedProduct) => void;
  setPage: (page: 'cart' | 'auth' | 'checkout' | 'confirmation') => void;
  saveShipping: (info: ShippingInfo) => void;
  savePayment: (info: PaymentInfo) => void;
  getOrderLines: () => { name: string; price: number; pv: number; qty: number }[];
  getSubtotal: () => number;
  getTotalPV: () => number;
  getShipping: () => number;
  getTax: () => number;
  getTotal: () => number;
  getVipSavings: () => number;
  getItemCount: () => number;
  getMembershipPrice: () => number;
  getProductSubtotal: () => number;
  getPromoDiscount: () => number;
  getVoucherDiscount: () => number;
  priceMultiplier: number;
  signInAsMember: () => void;
  signUpAsUser: (name: string) => void;
  logOut: () => void;
  setAuthReturnPage: (page: 'cart' | 'checkout') => void;
  resetCartToDefaults: () => void;
  setShippingState: (state: string | null) => void;
  // Promo & Voucher
  promoCode: string;
  promoApplied: boolean;
  setPromoCode: (code: string) => void;
  setPromoApplied: (applied: boolean) => void;
  voucherCode: string;
  voucherApplied: boolean;
  setVoucherCode: (code: string) => void;
  setVoucherApplied: (applied: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

// Product images from content system
export const PRODUCT_IMAGES = {
  pinkDrink: cStr('product.pinkDrink1.image'),
  membership: cStr('membership.image'),
};

export const SUGGESTED_PRODUCTS: SuggestedProduct[] = SUGGESTED_PRODUCTS_TEMPLATE.map((entry: SuggestedProductEntry) => ({
  id: entry.id,
  name: entry.name,
  price: entry.memberPrice,
  retailPrice: entry.memberPrice * 1.25,
  pv: entry.pv,
  image: entry.image,
  showProp65: entry.showProp65,
  optionStyle: entry.optionStyle,
  optionsPrice: entry.optionsPrice,
  defaultFlavor: entry.defaultFlavor,
  flavorGroups: entry.flavorGroups,
  dropdownCount: entry.dropdownCount,
  dropdowns: entry.dropdowns,
  optionPriceTotal: entry.optionPriceTotal,
}));

const initialItems: CartItem[] = [
  {
    id: 'pinkDrink1',
    name: cStr('product.pinkDrink1.name'),
    subtitle: cStr('product.pinkDrink1.subtitle'),
    price: cNum('product.pinkDrink1.price'),
    pv: cNum('product.pinkDrink1.pv'),
    qty: 1,
    subscription: true,
    removed: false,
    image: cStr('product.pinkDrink1.image'),
    optionType: 'dropdowns',
    showProp65: false,
    selections: [
      cStr('card1.dropdown1.opt1'),
      cStr('card1.dropdown2.opt1'),
      cStr('card1.dropdown3.opt1'),
      cStr('card1.dropdown3a.opt1'),
      cStr('card1.dropdown3b.opt1'),
      cStr('card1.dropdown4.opt1'),
    ],
  },
  {
    id: 'pinkDrink2',
    name: cStr('product.pinkDrink2.name'),
    subtitle: cStr('product.pinkDrink2.subtitle'),
    price: cNum('product.pinkDrink2.price'),
    pv: cNum('product.pinkDrink2.pv'),
    qty: 1,
    subscription: true,
    removed: false,
    image: cStr('product.pinkDrink2.image'),
    optionType: 'swatches',
    selectedFlavor: 'Sweet Tea',
    showProp65: true,
  },
];

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [hasMembership, setHasMembership] = useState(true);
  const [isSignedInMember, setIsSignedInMember] = useState(false);
  const [membershipRemoved, setMembershipRemoved] = useState(false);
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [undoEntries, setUndoEntries] = useState<UndoEntry[]>([]);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [currentPage, setCurrentPage] = useState<'cart' | 'auth' | 'checkout' | 'confirmation'>('cart');
  const [userName, setUserName] = useState<string | null>(null);
  const [authReturnPage, setAuthReturnPage] = useState<'cart' | 'checkout'>('cart');
  const [orderSnapshot, setOrderSnapshot] = useState<OrderSnapshot | null>(null);
  const [shippingState, setShippingState] = useState<string | null>(null);
  // Promo & Voucher
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);

  // Derived: true if membership is in cart OR user signed in as existing member
  const effectiveMembership = hasMembership || isSignedInMember;

  const priceMultiplier = effectiveMembership ? 1 : 1.25;

  // Helper: resolve effective member price/PV for an item (handles option-dependent pricing)
  const resolveItem = useCallback((item: CartItem) => {
    return resolveItemPricePV(
      item.price, item.pv,
      item.optionConfig?.optionsPrice,
      item.optionConfig?.optionPriceTotal,
      item.selections,
    );
  }, []);

  const addMembership = useCallback(() => {
    setHasMembership(true);
    setMembershipRemoved(false);
  }, []);

  const removeMembership = useCallback(() => {
    setHasMembership(false);
    setMembershipRemoved(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, removed: true } : i));
    const item = items.find(i => i.id === id);
    if (item) {
      setUndoEntries(prev => [...prev.filter(u => u.itemId !== id), { itemId: id, itemName: item.name, visible: true }]);
    }
  }, [items]);

  const undoRemoveItem = useCallback((id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, removed: false } : i));
    setUndoEntries(prev => prev.filter(u => u.itemId !== id));
  }, []);

  const dismissUndo = useCallback((id: string) => {
    setUndoEntries(prev => prev.filter(u => u.itemId !== id));
  }, []);

  const changeQty = useCallback((id: string, delta: number) => {
    setItems(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.qty + delta);
        return { ...i, qty: newQty };
      }
      return i;
    }));
  }, []);

  const toggleSubscription = useCallback((id: string): boolean => {
    const item = items.find(i => i.id === id);
    if (!item) return false;
    if (item.subscription) {
      return true;
    } else {
      setItems(prev => prev.map(i => i.id === id ? { ...i, subscription: true } : i));
      return false;
    }
  }, [items]);

  const confirmRemoveSubscription = useCallback((id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, subscription: false } : i));
  }, []);

  const setFlavor = useCallback((id: string, flavor: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, selectedFlavor: flavor } : i));
  }, []);

  const updateItemSelection = useCallback((id: string, index: number, value: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, selections: i.selections?.map((s, idx) => idx === index ? value : s) } : i));
  }, []);

  const addSuggestedToCart = useCallback((product: SuggestedProduct) => {
    const exists = items.find(i => i.id === product.id && !i.removed);
    if (exists) return;
    const existingRemoved = items.find(i => i.id === product.id && i.removed);
    if (existingRemoved) {
      setItems(prev => prev.map(i => i.id === product.id ? { ...i, removed: false, qty: 1 } : i));
      return;
    }
    // Look up subtitle from the template
    const templateEntry = SUGGESTED_PRODUCTS_TEMPLATE.find(e => e.id === product.id);

    // Map optionStyle → legacy optionType for card routing
    const optionType: CartItem['optionType'] =
      product.optionStyle === 'single' ? 'swatches' :
      product.optionStyle === 'multiple' ? 'dropdowns' : 'none';

    // Build default selections for 'multiple' — first option from each dropdown
    const defaultSelections = product.optionStyle === 'multiple' && product.dropdowns
      ? product.dropdowns.map(d => d.options[0] || '')
      : undefined;

    const newItem: CartItem = {
      id: product.id,
      name: product.name,
      subtitle: templateEntry?.subtitle || 'Dietary Supplement',
      price: product.price,
      pv: product.pv,
      qty: 1,
      subscription: false,
      removed: false,
      image: product.image,
      optionType,
      showProp65: product.showProp65,
      selectedFlavor: product.defaultFlavor,
      selections: defaultSelections,
      optionConfig: {
        style: product.optionStyle,
        optionsPrice: product.optionsPrice,
        defaultFlavor: product.defaultFlavor,
        flavorGroups: product.flavorGroups,
        dropdownCount: product.dropdownCount,
        dropdowns: product.dropdowns,
        optionPriceTotal: product.optionPriceTotal,
      },
    };
    setItems(prev => [...prev, newItem]);
  }, [items]);

  const getOrderLines = useCallback(() => {
    const lines: { name: string; price: number; pv: number; qty: number }[] = [];
    const productSubtotal = items.filter(i => !i.removed).reduce((s, i) => {
      const resolved = resolveItem(i);
      return s + resolved.price * priceMultiplier * i.qty;
    }, 0);
    const membershipPrice = productSubtotal >= 35 ? 1 : 39.95;
    if (hasMembership) lines.push({ name: cStr('membership.name'), price: membershipPrice, pv: 0, qty: 1 });
    items.forEach(item => {
      if (!item.removed) {
        const resolved = resolveItem(item);
        lines.push({
          name: item.name,
          price: resolved.price * priceMultiplier,
          pv: effectiveMembership ? resolved.pv : 0,
          qty: item.qty,
        });
      }
    });
    return lines;
  }, [hasMembership, effectiveMembership, items, priceMultiplier, resolveItem]);

  const getSubtotal = useCallback(() => {
    return getOrderLines().reduce((s, l) => s + l.price * l.qty, 0);
  }, [getOrderLines]);

  const getTotalPV = useCallback(() => {
    return getOrderLines().reduce((s, l) => s + l.pv * l.qty, 0);
  }, [getOrderLines]);

  const getProductSubtotal = useCallback(() => {
    const productSubtotal = items.filter(i => !i.removed).reduce((s, i) => {
      const resolved = resolveItem(i);
      return s + resolved.price * priceMultiplier * i.qty;
    }, 0);
    return productSubtotal;
  }, [items, priceMultiplier, resolveItem]);

  const getShipping = useCallback(() => {
    const productSub = getProductSubtotal();
    return productSub === 0 ? 0 : productSub >= 75 ? 0 : 9.99;
  }, [getProductSubtotal]);

  const getTax = useCallback(() => {
    // Return 0 if no shipping state is set
    if (!shippingState) return 0;
    
    // Tax is calculated on subtotal after promo/voucher discounts
    const subtotal = getSubtotal();
    let discountedSubtotal = subtotal;
    if (promoApplied) discountedSubtotal -= 10;
    if (voucherApplied) discountedSubtotal -= 10;
    discountedSubtotal = Math.max(0, discountedSubtotal);
    return discountedSubtotal * 0.089; // 8.9% tax rate
  }, [shippingState, getSubtotal, promoApplied, voucherApplied]);

  const getTotal = useCallback(() => {
    let subtotal = getSubtotal();
    if (promoApplied) subtotal -= 10;
    if (voucherApplied) subtotal -= 10;
    subtotal = Math.max(0, subtotal);
    const tax = getTax();
    const shipping = getShipping();
    return subtotal + tax + shipping;
  }, [getSubtotal, getShipping, getTax, promoApplied, voucherApplied]);

  const getVipSavings = useCallback(() => {
    // Savings = effectiveMemberPrice * 0.25 per item (retail is uniformly memberPrice × 1.25)
    return items
      .filter(i => !i.removed)
      .reduce((s, i) => {
        const resolved = resolveItem(i);
        return s + resolved.price * 0.25 * i.qty;
      }, 0);
  }, [items, resolveItem]);

  const getItemCount = useCallback(() => {
    return getOrderLines().length;
  }, [getOrderLines]);

  const getMembershipPrice = useCallback(() => {
    const productSubtotal = items.filter(i => !i.removed).reduce((s, i) => {
      const resolved = resolveItem(i);
      return s + resolved.price * priceMultiplier * i.qty;
    }, 0);
    return productSubtotal >= 35 ? 1 : 39.95;
  }, [items, priceMultiplier, resolveItem]);

  const setPage = useCallback((page: 'cart' | 'auth' | 'checkout' | 'confirmation') => {
    if (page === 'confirmation') {
      // Snapshot the current order before clearing cart
      const lines = getOrderLines();
      const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
      const totalPV = lines.reduce((s, l) => s + l.pv * l.qty, 0);
      const productSub = getProductSubtotal();
      const shipping = productSub === 0 ? 0 : productSub >= 75 ? 0 : 9.99;
      const total = subtotal + shipping;
      const hasSubscription = items.some(i => !i.removed && i.subscription);
      setOrderSnapshot({
        lines,
        subtotal,
        totalPV,
        shipping,
        total,
        freeShipping: productSub >= 75,
        hasSubscription,
      });
      // Clear cart items after snapshot
      setItems([]);
      setHasMembership(false);
      setUndoEntries([]);
      // If user went through enrollment (sign-up), promote to signed-in member
      if (!isSignedInMember) {
        setIsSignedInMember(true);
      }
    }
    setCurrentPage(page);
  }, [getOrderLines, items, isSignedInMember, getProductSubtotal]);

  const saveShipping = useCallback((info: ShippingInfo) => {
    setShippingInfo(info);
  }, []);

  const savePayment = useCallback((info: PaymentInfo) => {
    setPaymentInfo(info);
  }, []);

  const suggestedProducts = useMemo(() => {
    return SUGGESTED_PRODUCTS.filter(sp => !items.find(i => i.id === sp.id && !i.removed));
  }, [items]);

  const signInAsMember = useCallback(() => {
    setIsSignedInMember(true);
    setUserName('Tarl Robinson');
    // Remove membership from cart — pricing still uses member rates via effectiveMembership
    setHasMembership(false);
    setMembershipRemoved(false); // Not user-removed, just sign-in behavior
    // Pre-populate shipping info with signed-in member's name
    setShippingInfo({
      firstName: 'Tarl', lastName: 'Robinson',
      address1: '123 Main Street', address2: '',
      city: 'Phoenix', state: 'AZ', zip: '85001', phone: '(602) 555-0100',
    });
  }, []);

  const signUpAsUser = useCallback((name: string) => {
    setUserName(name);
    // Split full name: everything before the last space = firstName, last word = lastName
    const trimmed = name.trim();
    const lastSpaceIdx = trimmed.lastIndexOf(' ');
    const firstName = lastSpaceIdx === -1 ? trimmed : trimmed.slice(0, lastSpaceIdx);
    const lastName = lastSpaceIdx === -1 ? '' : trimmed.slice(lastSpaceIdx + 1);
    setShippingInfo({
      firstName,
      lastName,
      address1: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
    });
  }, []);

  const logOut = useCallback(() => {
    setIsSignedInMember(false);
    setUserName(null);
    // Re-add membership to cart on logout
    setHasMembership(true);
    setMembershipRemoved(false);
    setShippingInfo(null);
    setCurrentPage('cart');
  }, []);

  const resetCartToDefaults = useCallback(() => {
    // Re-populate cart with default product items
    setItems(initialItems.map(i => ({ ...i })));
    // Only add membership if NOT signed in as member
    if (!isSignedInMember) {
      setHasMembership(true);
      setMembershipRemoved(false);
    }
    setUndoEntries([]);
    setPaymentInfo(null);
    setOrderSnapshot(null);
    setCurrentPage('cart');
  }, [isSignedInMember]);

  const getPromoDiscount = useCallback(() => {
    return promoApplied ? 10 : 0;
  }, [promoApplied]);

  const getVoucherDiscount = useCallback(() => {
    return voucherApplied ? 10 : 0;
  }, [voucherApplied]);

  const value: CartContextType = {
    hasMembership,
    effectiveMembership,
    isSignedInMember,
    membershipRemoved,
    items,
    suggestedProducts,
    undoEntries,
    shippingInfo,
    paymentInfo,
    currentPage,
    priceMultiplier,
    userName,
    authReturnPage,
    orderSnapshot,
    shippingState,
    addMembership,
    removeMembership,
    removeItem,
    undoRemoveItem,
    dismissUndo,
    changeQty,
    toggleSubscription,
    confirmRemoveSubscription,
    setFlavor,
    updateItemSelection,
    addSuggestedToCart,
    setPage,
    saveShipping,
    savePayment,
    getOrderLines,
    getSubtotal,
    getTotalPV,
    getShipping,
    getTax,
    getTotal,
    getVipSavings,
    getItemCount,
    getMembershipPrice,
    getProductSubtotal,
    getPromoDiscount,
    getVoucherDiscount,
    signInAsMember,
    signUpAsUser,
    logOut,
    setAuthReturnPage,
    resetCartToDefaults,
    setShippingState,
    // Promo & Voucher
    promoCode,
    promoApplied,
    setPromoCode,
    setPromoApplied,
    voucherCode,
    voucherApplied,
    setVoucherCode,
    setVoucherApplied,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}