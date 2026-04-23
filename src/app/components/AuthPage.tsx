import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Check, Mail } from 'lucide-react';
import { useCart } from '../store/cart-context';
import { useContent } from '../store/content-context';
import { ET } from './EditableText';

// ─── SSO Mock Overlay ─────────────────────────────────────────────────────────
function SSOLoadingOverlay({ provider, onDone }: { provider: 'google' | 'facebook'; onDone: () => void }) {
  const [done, setDone] = useState(false);
  const providerName = provider === 'google' ? 'Google' : 'Facebook';

  useState(() => {
    const t1 = setTimeout(() => setDone(true), 900);
    const t2 = setTimeout(() => onDone(), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl p-10 flex flex-col items-center gap-5 text-center" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.12)', minWidth: '320px' }}>
        {provider === 'google' ? (
          <div className="w-14 h-14 rounded-full border border-[#dadce0] flex items-center justify-center bg-white">
            <GoogleIcon size={28} />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-full bg-[#1877f2] flex items-center justify-center">
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>f</span>
          </div>
        )}
        {done ? (
          <>
            <div className="w-12 h-12 rounded-full bg-[#e6f4ea] flex items-center justify-center">
              <Check size={24} className="text-[#2e7d32]" />
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a' }}>Signed in!</div>
              <div style={{ fontSize: '14px', color: '#555', marginTop: '4px' }}>Continuing with {providerName}…</div>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full border-4 border-[#e0e0e0] border-t-[#C8102E] animate-spin" />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>Connecting to {providerName}…</div>
              <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>Please wait</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <div className="w-5 h-5 rounded-sm bg-[#1877f2] flex items-center justify-center flex-shrink-0">
      <span style={{ fontSize: '13px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>f</span>
    </div>
  );
}

function PlexusWordmark() {
  return (
    <img
      src="https://static.plexusworldwide.com/image/upload/v1773174447/dnun56agp76ys85fmhka.png"
      alt="Plexus"
      style={{ height: '36px', width: 'auto', display: 'block' }}
    />
  );
}

// ─── SSO Pill Button ──────────────────────────────────────────────────────────
function SSOButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      className="w-full flex items-center gap-3 px-6 py-3.5 rounded-full border border-[#d0d0d0] bg-white cursor-pointer transition-all hover:border-[#999] hover:shadow-sm"
      style={{ fontSize: '15px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif", maxWidth: '340px' }}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ─── Auth Hub ─────────────────────────────────────────────────────────────────
type AuthView = 'signIn' | 'join' | 'emailSignIn' | 'emailSignUp';

export function AuthHub({ initialView, onSuccess }: { initialView: AuthView; onSuccess: () => void }) {
  const { signInAsMember, signUpAsUser } = useCart();
  const { get } = useContent();
  const [view, setView] = useState<AuthView>(initialView);
  const [ssoProvider, setSsoProvider] = useState<'google' | 'facebook' | null>(null);

  // Sign In form
  const [signInEmail, setSignInEmail] = useState('tarl@plexus.com');
  const [signInPassword, setSignInPassword] = useState('password123');
  const [showSignInPw, setShowSignInPw] = useState(false);

  // Sign Up form
  const [fullName, setFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [showSignUpPw, setShowSignUpPw] = useState(false);
  const [ambassadorId, setAmbassadorId] = useState('');
  const [captchaChecked, setCaptchaChecked] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', border: '1px solid #d0d0d0',
    borderRadius: '8px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif",
    outline: 'none', background: '#fff', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '6px', display: 'block',
  };

  const handleSSODone = () => {
    setSsoProvider(null);
    signInAsMember();
    onSuccess();
  };

  // ── Sign In Hub ─────────────────────────────────────────────────────────────
  if (view === 'signIn') return (
    <div className="flex flex-col items-center w-full">
      <h1 style={{ fontSize: '32px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", color: '#1a1a1a', textAlign: 'center', marginBottom: '32px' }}>
        Sign In
      </h1>
      <div className="flex flex-col items-center gap-3 w-full" style={{ maxWidth: '340px' }}>
        <SSOButton icon={<GoogleIcon />} label="Sign in with Google" onClick={() => setSsoProvider('google')} />
        <SSOButton icon={<FacebookIcon />} label="Sign in with Facebook" onClick={() => setSsoProvider('facebook')} />
        <SSOButton icon={<Mail size={18} className="text-[#555]" />} label="Sign in with Email" onClick={() => setView('emailSignIn')} />
      </div>
      <div className="mt-8" style={{ fontSize: '15px', color: '#555' }}>
        Don't have an account?{' '}
        <button className="bg-transparent border-none cursor-pointer p-0 text-[#C8102E] hover:underline" style={{ fontSize: '15px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }} onClick={() => setView('join')}>
          Create an Account
        </button>
      </div>
      <div className="mt-16 text-center px-4" style={{ fontSize: '12px', color: '#888', lineHeight: 1.6, maxWidth: '500px' }}>
        Click "Create Account" or a sign in method to agree to Plexus Worldwide's{' '}
        <a className="text-[#888] underline cursor-pointer">Terms of Service</a> and acknowledgement that Plexus Worldwide{' '}
        <a className="text-[#888] underline cursor-pointer">Privacy Policy</a> applies to you.
      </div>
      {ssoProvider && <SSOLoadingOverlay provider={ssoProvider} onDone={handleSSODone} />}
    </div>
  );

  // ── Join Hub ────────────────────────────────────────────────────────────────
  if (view === 'join') return (
    <div className="flex flex-col items-center w-full">
      <h1 style={{ fontSize: '32px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", color: '#1a1a1a', textAlign: 'center', marginBottom: '32px' }}>
        Join
      </h1>
      <div className="flex flex-col items-center gap-3 w-full" style={{ maxWidth: '340px' }}>
        <SSOButton icon={<GoogleIcon />} label="Sign up with Google" onClick={() => setSsoProvider('google')} />
        <SSOButton icon={<FacebookIcon />} label="Sign up with Facebook" onClick={() => setSsoProvider('facebook')} />
        <SSOButton icon={<Mail size={18} className="text-[#555]" />} label="Sign up with email" onClick={() => setView('emailSignUp')} />
      </div>
      <div className="mt-8" style={{ fontSize: '15px', color: '#555' }}>
        Already have an account?{' '}
        <button className="bg-transparent border-none cursor-pointer p-0 text-[#C8102E] hover:underline" style={{ fontSize: '15px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }} onClick={() => setView('signIn')}>
          Sign in
        </button>
      </div>
      <div className="mt-16 text-center px-4" style={{ fontSize: '12px', color: '#888', lineHeight: 1.6, maxWidth: '500px' }}>
        Click "Sign Up" to agree to Plexus Worldwide's{' '}
        <a className="text-[#888] underline cursor-pointer">Terms of Service</a> and acknowledgement that Plexus Worldwide{' '}
        <a className="text-[#888] underline cursor-pointer">Privacy Policy</a> applies to you.
      </div>
      {ssoProvider && <SSOLoadingOverlay provider={ssoProvider} onDone={handleSSODone} />}
    </div>
  );

  // ── Email Sign In ───────────────────────────────────────────────────────────
  if (view === 'emailSignIn') return (
    <div className="w-full" style={{ maxWidth: '480px' }}>
      <button className="flex items-center gap-1.5 text-[#555] bg-transparent border-none cursor-pointer p-0 mb-6 hover:text-[#C8102E]" style={{ fontSize: '14px' }} onClick={() => setView('signIn')}>
        <ArrowLeft size={16} /> Back
      </button>
      <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 24px 0' }}>
        <ET k="auth.signIn.title" />
      </h2>
      <div className="mb-4">
        <label style={labelStyle}><ET k="auth.signIn.emailLabel" /></label>
        <input type="email" placeholder={get('auth.signIn.emailPlaceholder')} value={signInEmail} onChange={e => setSignInEmail(e.target.value)} style={inputStyle} />
      </div>
      <div className="mb-2">
        <label style={labelStyle}><ET k="auth.signIn.passwordLabel" /></label>
        <div className="relative">
          <input type={showSignInPw ? 'text' : 'password'} placeholder={get('auth.signIn.passwordPlaceholder')} value={signInPassword} onChange={e => setSignInPassword(e.target.value)} style={{ ...inputStyle, paddingRight: '44px' }} />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#999] p-0" onClick={() => setShowSignInPw(!showSignInPw)} type="button">
            {showSignInPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <div className="mb-6">
        <a className="text-[#C8102E] cursor-pointer no-underline hover:underline" style={{ fontSize: '13px', fontWeight: 500 }}><ET k="auth.signIn.forgotPassword" /></a>
      </div>
      <button
        className="w-full bg-[#C8102E] text-white py-3.5 rounded-full border-none cursor-pointer transition-all hover:bg-[#a00d24]"
        style={{ fontSize: '16px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
        onClick={() => { signInAsMember(); onSuccess(); }}
      >
        <ET k="auth.signIn.submitBtn" />
      </button>
      <div className="mt-6 text-center" style={{ fontSize: '14px', color: '#555' }}>
        Don't have an account?{' '}
        <button className="bg-transparent border-none cursor-pointer p-0 text-[#C8102E] hover:underline" style={{ fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }} onClick={() => setView('join')}>
          Create an Account
        </button>
      </div>
    </div>
  );

  // ── Email Sign Up ───────────────────────────────────────────────────────────
  return (
    <div className="w-full" style={{ maxWidth: '480px' }}>
      <button className="flex items-center gap-1.5 text-[#555] bg-transparent border-none cursor-pointer p-0 mb-6 hover:text-[#C8102E]" style={{ fontSize: '14px' }} onClick={() => setView('join')}>
        <ArrowLeft size={16} /> Back
      </button>
      <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 24px 0' }}>
        <ET k="auth.createAccount.title" />
      </h2>
      <div className="mb-4">
        <label style={labelStyle}><ET k="auth.createAccount.fullNameLabel" /></label>
        <input type="text" placeholder={get('auth.createAccount.fullNamePlaceholder')} value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} />
      </div>
      <div className="mb-4">
        <label style={labelStyle}><ET k="auth.createAccount.emailLabel" /></label>
        <input type="email" placeholder={get('auth.createAccount.emailPlaceholder')} value={signUpEmail} onChange={e => setSignUpEmail(e.target.value)} style={inputStyle} />
      </div>
      <div className="mb-4">
        <label style={labelStyle}><ET k="auth.createAccount.passwordLabel" /></label>
        <div className="relative">
          <input type={showSignUpPw ? 'text' : 'password'} placeholder={get('auth.createAccount.passwordPlaceholder')} value={signUpPassword} onChange={e => setSignUpPassword(e.target.value)} style={{ ...inputStyle, paddingRight: '44px' }} />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#999] p-0" onClick={() => setShowSignUpPw(!showSignUpPw)} type="button">
            {showSignUpPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label style={{ ...labelStyle, marginBottom: 0 }}><ET k="auth.createAccount.ambassadorLabel" /></label>
          <a className="text-[#C8102E] cursor-pointer no-underline hover:underline" style={{ fontSize: '12px', fontWeight: 500 }}><ET k="auth.createAccount.skipLabel" /></a>
        </div>
        <input type="text" placeholder={get('auth.createAccount.ambassadorPlaceholder')} value={ambassadorId} onChange={e => setAmbassadorId(e.target.value)} style={inputStyle} />
      </div>
      <div className="mb-4 flex items-center gap-3 rounded-lg border border-[#d0d0d0] px-4 py-3 cursor-pointer select-none" style={{ background: '#fafafa' }} onClick={() => setCaptchaChecked(!captchaChecked)}>
        <div className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors" style={{ borderColor: captchaChecked ? '#C8102E' : '#bbb', background: captchaChecked ? '#C8102E' : 'transparent' }}>
          {captchaChecked && <Check size={14} className="text-white" />}
        </div>
        <span style={{ fontSize: '13px', color: '#333' }}><ET k="auth.createAccount.captchaText" /></span>
        <span className="ml-auto text-[#999]" style={{ fontSize: '10px' }}><ET k="auth.createAccount.captchaLabel" /></span>
      </div>
      <div className="mb-6" style={{ fontSize: '12px', color: '#777', lineHeight: 1.6 }}>
        <ET k="auth.createAccount.privacyText" />{' '}
        <a className="text-[#C8102E] cursor-pointer no-underline hover:underline"><ET k="auth.createAccount.privacyLink" /></a>{' '}
        <ET k="auth.createAccount.andText" />{' '}
        <a className="text-[#C8102E] cursor-pointer no-underline hover:underline"><ET k="auth.createAccount.termsLink" /></a>.
      </div>
      <button
        className="w-full bg-[#C8102E] text-white py-3.5 rounded-full border-none cursor-pointer transition-all hover:bg-[#a00d24] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ fontSize: '16px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}
        onClick={() => { if (!fullName.trim()) return; signUpAsUser(fullName.trim()); onSuccess(); }}
        disabled={!fullName.trim()}
      >
        <ET k="auth.createAccount.submitBtn" />
      </button>
      <div className="mt-8 text-center px-4" style={{ fontSize: '12px', color: '#888', lineHeight: 1.6 }}>
        Click "Sign Up" to agree to Plexus Worldwide's{' '}
        <a className="text-[#888] underline cursor-pointer">Terms of Service</a> and acknowledgement that Plexus Worldwide{' '}
        <a className="text-[#888] underline cursor-pointer">Privacy Policy</a> applies to you.
      </div>
    </div>
  );
}

// ─── Auth Page (full page, cart flow → defaults to Join) ──────────────────────
export function AuthPage() {
  const { setPage, authReturnPage } = useCart();
  return (
    <div className="min-h-[calc(100vh-120px)]" style={{ background: '#FFFFFF' }}>
      <div className="max-w-[1280px] mx-auto px-6 pt-6 pb-2">
        <button
          className="flex items-center gap-1.5 text-[#555] bg-transparent border-none cursor-pointer p-0 transition-colors hover:text-[#C8102E]"
          style={{ fontSize: '14px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}
          onClick={() => setPage('cart')}
        >
          <ArrowLeft size={16} />
          <ET k="auth.backToCart" />
        </button>
      </div>
      <div className="flex flex-col items-center justify-center px-6 py-16">
        <AuthHub initialView="join" onSuccess={() => setPage(authReturnPage)} />
      </div>
    </div>
  );
}

// ─── Auth Modal (header login → defaults to Sign In) ─────────────────────────
export function AuthModal({ onClose }: { onClose: () => void }) {
  const { setPage } = useCart();
  return (
    <div className="fixed inset-0 z-[150]" style={{ background: 'rgba(0,0,0,0.35)' }} onClick={onClose}>
      <div className="bg-white w-full min-h-screen flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="max-w-[1280px] mx-auto w-full px-6 pt-6 pb-2">
          <button
            className="flex items-center gap-1.5 text-[#555] bg-transparent border-none cursor-pointer p-0 transition-colors hover:text-[#C8102E]"
            style={{ fontSize: '14px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}
            onClick={onClose}
          >
            <ArrowLeft size={16} />
            <ET k="auth.backToCart" />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center px-6 py-16 flex-1">
          <AuthHub initialView="signIn" onSuccess={() => { onClose(); setPage('cart'); }} />
        </div>
      </div>
    </div>
  );
}
