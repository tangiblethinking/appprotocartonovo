import { CartProvider, useCart } from './store/cart-context';
import { ContentProvider } from './store/content-context';
import { Header } from './components/Header';
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { ConfirmationPage } from './components/ConfirmationPage';
import { AuthPage } from './components/AuthPage';
import { Toaster } from 'sonner';

function AppContent() {
  const { currentPage } = useCart();

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif", background: '#ffffff', fontSize: '15px', lineHeight: 1.5 }}>
      <Header />
      {currentPage === 'cart' && <CartPage />}
      {currentPage === 'auth' && <AuthPage />}
      {currentPage === 'checkout' && <CheckoutPage />}
      {currentPage === 'confirmation' && <ConfirmationPage />}
      <Toaster
        position="top-center"
        richColors
        offset={104}
        duration={3000}
        visibleToasts={1}
        toastOptions={{
          style: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ContentProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </ContentProvider>
  );
}