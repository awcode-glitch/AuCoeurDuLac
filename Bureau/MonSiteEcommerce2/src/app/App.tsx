import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { useAuthStore } from './store/authStore';
import { useWishlistStore } from './store/wishlistStore';
import { apiGetWishlist } from './services/api';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { VendorShopPage } from './pages/VendorShopPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { VendorDashboard } from './pages/VendorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { BecomeVendorPage } from './pages/BecomeVendorPage';
import { VendorsPage } from './pages/VendorsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { MessagesPage } from './pages/MessagesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { OrdersPage } from './pages/OrdersPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { WishlistPage } from './pages/WishlistPage';
import { VendorProductFormPage } from './pages/VendorProductFormPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

function WishlistSync() {
  const { user } = useAuthStore();
  const setItems = useWishlistStore(s => s.setItems);
  useEffect(() => {
    if (user) {
      apiGetWishlist().then(setItems).catch(() => {});
    }
  }, [user?.id]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <WishlistSync />
        <Toaster position="top-right" richColors />
        <Header />
        <main className="flex-1">
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/vendor/:id" element={<VendorShopPage />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/become-vendor" element={<BecomeVendorPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Authenticated */}
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

            {/* Vendor only */}
            <Route path="/vendor/dashboard" element={<ProtectedRoute requiredRole="vendor"><VendorDashboard /></ProtectedRoute>} />
            <Route path="/vendor/products/new" element={<ProtectedRoute requiredRole="vendor"><VendorProductFormPage /></ProtectedRoute>} />
            <Route path="/vendor/products/:id/edit" element={<ProtectedRoute requiredRole="vendor"><VendorProductFormPage /></ProtectedRoute>} />
            <Route path="/vendor/onboarding-success" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />

            {/* Admin only */}
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
