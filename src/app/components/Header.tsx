import { ShoppingCart, User, HelpCircle, Globe, Menu, X, ChevronRight, Copy, LogOut, ChevronDown, Search } from 'lucide-react';
import { useCart } from '../store/cart-context';
import { useContent } from '../store/content-context';
import { useState, useEffect, useRef } from 'react';
import { ET } from './EditableText';
import { EI } from './EditableImage';
import { toast } from 'sonner';
import { AuthModal } from './AuthPage';
import { SUGGESTED_PRODUCTS } from '../store/cart-context';

export function Header() {
  const { getItemCount, setPage, userName, logOut, setAuthReturnPage, currentPage, resetCartToDefaults, addSuggestedToCart } = useCart();
  const { isEditMode, setEditMode, copyState } = useContent();
  const count = getItemCount();
  const isOnConfirmation = currentPage === 'confirmation';
  const hasItems = !isOnConfirmation && count > 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleCopyState = () => {
    copyState();
    toast.success('State copied to clipboard!');
  };

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const filteredProducts = searchQuery.trim()
    ? SUGGESTED_PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : SUGGESTED_PRODUCTS;

  const handleDropdownEnter = () => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimerRef.current = setTimeout(() => setDropdownOpen(false), 150);
  };

  const handleLogOut = () => {
    logOut();
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  const handleLoginClick = () => {
    setAuthModalOpen(true);
    setMenuOpen(false);
  };

  const isLoggedIn = !!userName;

  // Derive display first name using last-space splitting (same as signUpAsUser logic)
  const displayFirstName = userName
    ? (userName.trim().lastIndexOf(' ') === -1
        ? userName.trim()
        : userName.trim().slice(0, userName.trim().lastIndexOf(' ')))
    : null;

  // Dropdown menu items
  const virtualOfficeItems = [
    { key: 'header.dropdown.dashboard' },
    { key: 'header.dropdown.plexusMerch', hasArrow: true },
  ];

  const myAccountItems = [
    { key: 'header.dropdown.overview' },
    { key: 'header.dropdown.profile' },
    { key: 'header.dropdown.orders' },
    { key: 'header.dropdown.payment' },
    { key: 'header.dropdown.subscriptions' },
    { key: 'header.dropdown.addressBook' },
    { key: 'header.dropdown.referralLink' },
    { key: 'header.dropdown.plexusPerks' },
    { key: 'header.dropdown.notifications' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div className="bg-[#C8102E] text-white text-center py-2 px-4" style={{ fontSize: '13px', fontWeight: 500 }}>
          <ET k="header.banner.text" />{' '}
          <a className="text-white underline cursor-pointer"><ET k="header.banner.linkText" /></a>
        </div>
        <div className="max-w-[1280px] mx-auto flex items-stretch h-16 px-6">
          {/* Logo container */}
          <div
            className="flex items-end justify-center shrink-0"
            style={{ width: '110px' }}
          >
            <EI
              k="header.logo"
              alt="Plexus"
              className="object-contain w-full"
              style={{ maxHeight: '52px' }}
            />
          </div>

          {/* Nav + utilities row */}
          <div className="flex items-center justify-end flex-1 pl-6">
            {/* Nav links — desktop only */}
            {currentPage !== 'checkout' && (
            <nav className="hidden md:flex gap-7 mr-auto">
              <a className="text-[#555] no-underline cursor-pointer transition-colors hover:text-[#C8102E]" style={{ fontSize: '14px', fontWeight: 500 }}>
                <ET k="header.nav.1" />
              </a>
              <a className="text-[#555] no-underline cursor-pointer transition-colors hover:text-[#C8102E]" style={{ fontSize: '14px', fontWeight: 500 }}>
                <ET k="header.nav.2" />
              </a>
              <a className="text-[#555] no-underline cursor-pointer transition-colors hover:text-[#C8102E]" style={{ fontSize: '14px', fontWeight: 500 }}>
                <ET k="header.nav.3" />
              </a>
              <a className="text-[#555] no-underline cursor-pointer transition-colors hover:text-[#C8102E]" style={{ fontSize: '14px', fontWeight: 500 }}>
                <ET k="header.nav.4" />
              </a>
            </nav>
            )}

            {/* Right-side utilities */}
            <div className="flex items-center gap-5">

              {/* Search — expands inline when open */}
              <div ref={searchRef} className="relative flex items-center">
                {searchOpen ? (
                  <div className="flex items-center gap-2">
                    <Search size={18} className="text-[#555] flex-shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="border-b border-[#555] bg-transparent outline-none"
                      style={{ fontSize: '14px', width: '180px', fontFamily: "'DM Sans', sans-serif", paddingBottom: '2px' }}
                    />
                    <button
                      className="text-[#555] bg-transparent border-none cursor-pointer p-0 hover:text-[#C8102E] transition-colors"
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    className="text-[#555] bg-transparent border-none cursor-pointer p-0 flex items-center gap-1 hover:text-[#C8102E] transition-colors"
                    style={{ fontSize: '14px', fontWeight: 500 }}
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search size={18} />
                  </button>
                )}

                {/* Search dropdown */}
                {searchOpen && (
                  <div
                    className="absolute top-full right-0 mt-3 bg-white rounded-xl shadow-xl border border-[#e8e8e8] z-[200] overflow-hidden"
                    style={{ width: '340px', fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {filteredProducts.length === 0 ? (
                      <div className="px-4 py-6 text-center text-[#999]" style={{ fontSize: '13px' }}>No products found</div>
                    ) : (
                      filteredProducts.slice(0, 4).map(sp => {
                        const displayPrice = sp.price;
                        const retailPrice = sp.retailPrice;
                        return (
                          <div key={sp.id} className="flex gap-3 p-3 border-b border-[#f0f0f0] last:border-0 hover:bg-[#f9f9f9] transition-colors">
                            <img src={sp.image} alt={sp.name} className="w-14 h-14 object-contain rounded-lg bg-[#f5f5f5] flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>{sp.name}</div>
                              <div style={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>{sp.subtitle || 'Options Available'}</div>
                              <div className="flex items-baseline gap-2 mt-1">
                                <span style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a' }}>${displayPrice.toFixed(2)}</span>
                                <span style={{ fontSize: '12px', color: '#C8102E', fontWeight: 600 }}>${(displayPrice).toFixed(2)} VIP</span>
                              </div>
                            </div>
                            <button
                              className="self-end bg-[#1a1a1a] text-white px-3 py-2 rounded-full border-none cursor-pointer hover:bg-[#333] transition-colors flex-shrink-0"
                              style={{ fontSize: '12px', fontWeight: 600 }}
                              onClick={() => {
                                addSuggestedToCart(sp);
                                toast.success(`${sp.name} added to cart!`);
                                setSearchOpen(false);
                                setSearchQuery('');
                              }}
                            >
                              Add to Cart
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
              {/* Desktop: User / Login with dropdown */}
              <div
                className="relative"
                ref={dropdownRef}
                onMouseEnter={isLoggedIn ? handleDropdownEnter : undefined}
                onMouseLeave={isLoggedIn ? handleDropdownLeave : undefined}
              >
                <a
                  className="text-[#555] cursor-pointer flex items-center gap-1"
                  style={{ fontSize: '14px', fontWeight: 500 }}
                  onClick={isLoggedIn ? () => setDropdownOpen(!dropdownOpen) : handleLoginClick}
                >
                  <User size={18} />
                  <span className="hidden sm:inline">
                    {isLoggedIn ? displayFirstName : <ET k="header.loginText" />}
                  </span>
                  {isLoggedIn && <ChevronDown size={14} className="hidden sm:inline" />}
                </a>

                {/* Desktop hover dropdown */}
                {isLoggedIn && dropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-[#e8e8e8] w-[240px] py-2 z-[200] hidden sm:block"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                  >
                    {/* Virtual Office section */}
                    <div className="px-4 py-2">
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <ET k="header.dropdown.virtualOffice" />
                      </div>
                    </div>
                    {virtualOfficeItems.map(item => (
                      <a
                        key={item.key}
                        className="flex items-center justify-between px-4 py-2.5 text-[#333] no-underline cursor-pointer transition-colors hover:bg-[#f5f5f5]"
                        style={{ fontSize: '14px', fontWeight: 400 }}
                      >
                        <ET k={item.key} />
                        {item.hasArrow && <ChevronRight size={14} className="text-[#999]" />}
                      </a>
                    ))}

                    <hr className="border-t border-[#f0f0f0] my-1 mx-3" />

                    {/* My Account section */}
                    <div className="px-4 py-2">
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <ET k="header.dropdown.myAccount" />
                      </div>
                    </div>
                    {myAccountItems.map(item => (
                      <a
                        key={item.key}
                        className="flex items-center px-4 py-2 text-[#333] no-underline cursor-pointer transition-colors hover:bg-[#f5f5f5]"
                        style={{ fontSize: '14px', fontWeight: 400 }}
                      >
                        <ET k={item.key} />
                      </a>
                    ))}

                    <hr className="border-t border-[#f0f0f0] my-1 mx-3" />

                    {/* Log Out */}
                    <button
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-[#C8102E] bg-transparent border-none cursor-pointer transition-colors hover:bg-[#fef2f2]"
                      style={{ fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
                      onClick={handleLogOut}
                    >
                      <LogOut size={16} />
                      <ET k="header.dropdown.logOut" />
                    </button>
                  </div>
                )}
              </div>

              <a className="text-[#555] cursor-pointer flex items-center gap-1" style={{ fontSize: '14px', fontWeight: 500 }}>
                <HelpCircle size={18} /> <span className="hidden sm:inline"><ET k="header.helpText" /></span>
              </a>
              <a
                className="text-[#555] cursor-pointer relative"
                onClick={() => isOnConfirmation ? resetCartToDefaults() : setPage('cart')}
              >
                <ShoppingCart
                  size={22}
                  fill={hasItems ? 'currentColor' : 'none'}
                  strokeWidth={hasItems ? 1.5 : 2}
                />
                {hasItems && (
                  <span
                    className="absolute bg-[#C8102E] text-white rounded-full inline-flex items-center justify-center"
                    style={{
                      width: '18px',
                      height: '18px',
                      fontSize: '10px',
                      fontWeight: 700,
                      top: '-6px',
                      right: '-8px',
                    }}
                  >
                    {count}
                  </span>
                )}
              </a>
              <a className="text-[#555] cursor-pointer hidden lg:flex items-center gap-1" style={{ fontSize: '14px', fontWeight: 500 }}>
                <Globe size={14} /> <ET k="header.localeText" />
              </a>
              {/* Hamburger — mobile only */}
              <button
                className="md:hidden flex items-center justify-center text-[#555]"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidesheet overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={() => setMenuOpen(false)}
          />
          {/* Sidesheet */}
          <div
            className="relative bg-white w-[300px] max-w-[80vw] h-full flex flex-col shadow-2xl animate-slide-in"
            style={{ animation: 'slideInLeft 0.25s ease-out' }}
          >
            {/* Sidesheet header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-[#e5e5e5]">
              <EI
                k="header.logo"
                alt="Plexus"
                className="object-contain"
                style={{ height: '36px' }}
              />
              <button
                className="text-[#555] p-1"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Edit Mode Toggle + Copy State */}
            <div className="px-5 py-4 border-b border-[#e5e5e5] bg-[#f9f9f9]">
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>Edit Mode</span>
                {/* Toggle switch */}
                <button
                  className="relative inline-flex items-center cursor-pointer border-none bg-transparent p-0"
                  onClick={() => setEditMode(!isEditMode)}
                  aria-label="Toggle edit mode"
                >
                  <div
                    className="w-11 h-6 rounded-full transition-colors"
                    style={{ background: isEditMode ? '#C8102E' : '#ccc' }}
                  >
                    <div
                      className="w-5 h-5 bg-white rounded-full shadow-md transition-transform"
                      style={{
                        transform: isEditMode ? 'translateX(22px) translateY(2px)' : 'translateX(2px) translateY(2px)',
                      }}
                    />
                  </div>
                </button>
              </div>
              {isEditMode && (
                <button
                  className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] text-white py-2 rounded-lg border-none cursor-pointer transition-colors hover:bg-[#333]"
                  style={{ fontSize: '13px', fontWeight: 600 }}
                  onClick={handleCopyState}
                >
                  <Copy size={14} /> Copy State
                </button>
              )}
            </div>

            {/* Nav links */}
            <nav className="flex flex-col flex-1 py-2 overflow-y-auto">
              {(['header.nav.1', 'header.nav.2', 'header.nav.3', 'header.nav.4'] as const).map(k => (
                <a
                  key={k}
                  className="flex items-center justify-between px-5 py-4 text-[#333] no-underline cursor-pointer transition-colors hover:bg-[#f5f5f5] border-b border-[#f0f0f0]"
                  style={{ fontSize: '16px', fontWeight: 500 }}
                  onClick={() => setMenuOpen(false)}
                >
                  <ET k={k} />
                  <ChevronRight size={18} className="text-[#999]" />
                </a>
              ))}

              {/* Logged-in user menu items in mobile sidesheet */}
              {isLoggedIn && (
                <>
                  <div className="px-5 pt-5 pb-2">
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <ET k="header.dropdown.virtualOffice" />
                    </div>
                  </div>
                  {virtualOfficeItems.map(item => (
                    <a
                      key={item.key}
                      className="flex items-center justify-between px-5 py-3 text-[#333] no-underline cursor-pointer transition-colors hover:bg-[#f5f5f5]"
                      style={{ fontSize: '15px', fontWeight: 400 }}
                    >
                      <ET k={item.key} />
                      {item.hasArrow && <ChevronRight size={16} className="text-[#999]" />}
                    </a>
                  ))}

                  <div className="px-5 pt-4 pb-2">
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <ET k="header.dropdown.myAccount" />
                    </div>
                  </div>
                  {myAccountItems.map(item => (
                    <a
                      key={item.key}
                      className="flex items-center px-5 py-3 text-[#333] no-underline cursor-pointer transition-colors hover:bg-[#f5f5f5]"
                      style={{ fontSize: '15px', fontWeight: 400 }}
                    >
                      <ET k={item.key} />
                    </a>
                  ))}
                </>
              )}
            </nav>

            {/* Sidesheet footer */}
            <div className="border-t border-[#e5e5e5] px-5 py-4 flex flex-col gap-3">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-2 text-[#333]" style={{ fontSize: '14px', fontWeight: 600 }}>
                    <User size={18} /> {displayFirstName}
                  </div>
                  <button
                    className="flex items-center gap-2 text-[#C8102E] bg-transparent border-none cursor-pointer p-0 transition-colors hover:text-[#a00d24]"
                    style={{ fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
                    onClick={handleLogOut}
                  >
                    <LogOut size={18} /> <ET k="header.dropdown.logOut" />
                  </button>
                </>
              ) : (
                <a className="flex items-center gap-2 text-[#555] cursor-pointer" style={{ fontSize: '14px', fontWeight: 500 }} onClick={handleLoginClick}>
                  <User size={18} /> <ET k="header.mobileLogin" />
                </a>
              )}
              <a className="flex items-center gap-2 text-[#555] cursor-pointer" style={{ fontSize: '14px', fontWeight: 500 }}>
                <HelpCircle size={18} /> <ET k="header.mobileHelp" />
              </a>
              <a className="flex items-center gap-2 text-[#555] cursor-pointer" style={{ fontSize: '14px', fontWeight: 500 }}>
                <Globe size={18} /> <ET k="header.mobileLocale" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Keyframe for sidesheet slide-in */}
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      {/* Auth Modal — triggered by header login icon */}
      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
    </>
  );
}