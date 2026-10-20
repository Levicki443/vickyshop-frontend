import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getAdminToken } from './services/adminApi';
import { useShopProducts } from './hooks/useShopProducts';
import { useModalHistory, isRecentInternalModalBack } from './hooks/useModalHistory';
import { initScrollRestoration, saveCatalogScroll, restoreCatalogScroll } from './utils/scrollMemory';
import { Header } from './components/common/Header';
import { HeroSection } from './components/home/HeroSection';
import { FlashSale } from './components/home/FlashSale';
import { ProductFilters } from './components/products/ProductFilters';
import { ProductGrid } from './components/products/ProductGrid';
import { FloatingAIAssistantButton } from './components/common/FloatingAIAssistantButton';
import { Footer } from './components/common/Footer';
import { AnnouncementBar } from './components/common/AnnouncementBar';
import { NotFound404 } from './components/common/NotFound404';
import { PwaInstallModal } from './components/common/PwaInstallModal';

// Chargement différé (Code-Splitting) des pages et modales volumineuses
const ProductDetailsPage = React.lazy(() => import('./components/products/ProductDetailsPage'));
const UserOrdersPage = React.lazy(() => import('./components/orders/UserOrdersPage'));
const UserProfilePage = React.lazy(() => import('./components/auth/UserProfilePage'));
const ForgotPasswordPage = React.lazy(() => import('./components/auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('./components/auth/ResetPasswordPage'));
const AIAssistantPage = React.lazy(() => import('./components/ai/AIAssistantPage'));
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const SellerDashboard = React.lazy(() => import('./components/seller/SellerDashboard').then((m) => ({ default: m.SellerDashboard })));
const AppModals = React.lazy(() => import('./components/common/AppModals'));
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import { useWishlist } from './context/WishlistContext';
import { useNotifications } from './context/NotificationContext';
import { useToast } from './context/ToastContext';

export const App = () => {
  const { user, isSeller, openAuthModal, closeAuthModal, loading: authLoading, isAuthModalOpen } = useAuth();
  const { isCartOpen, openCart, closeCart, addToCart } = useCart();
  const { isWishlistOpen, closeWishlist } = useWishlist();
  const { isNotificationCenterOpen, closeNotificationCenter, openNotificationCenter } = useNotifications();
  const { addToast } = useToast();
  const { products, loading, error, loadProducts } = useShopProducts();

  const [currentPath, setCurrentPath] = useState(() => window.location.pathname.toLowerCase());
  const [selectedOrderNumber, setSelectedOrderNumber] = useState(null);
  const [isAdminViewActive, setIsAdminViewActive] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState('profile');
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState([]);

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewTargetProduct, setReviewTargetProduct] = useState(null);
  const [reviewTargetOrderNumber, setReviewTargetOrderNumber] = useState('');

  useEffect(() => {
    initScrollRestoration();
    if (window.location.pathname !== '/' && window.location.pathname !== '/accueil') {
      if (!window.history.state?.fromApp && window.history.length <= 1) {
        window.history.replaceState({ path: '/', fromApp: true }, '', '/');
        window.history.pushState({ path: window.location.pathname, fromApp: true }, '', window.location.pathname);
      }
    }
  }, []);

  const cleanPath = useMemo(() => currentPath.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/', [currentPath]);
  const isAuthRoute = ['/connexion', '/login', '/inscription', '/register', '/auth'].includes(cleanPath);
  const isHomePath = ['/', '/accueil', '/home', '/index.html'].includes(cleanPath) || isAuthRoute;
  const isSellerRoute = cleanPath.startsWith('/vendeur') || cleanPath.startsWith('/seller');
  const isAdminRoute = cleanPath.startsWith('/admin') || cleanPath.startsWith('/dashboard') || cleanPath.startsWith('/backoffice');
  const isOrdersRoute = cleanPath.startsWith('/commandes') || cleanPath.startsWith('/orders') || cleanPath.startsWith('/suivi');
  const isProfileRoute = cleanPath.startsWith('/profil') || cleanPath.startsWith('/profile') || cleanPath.startsWith('/compte');
  const isProductRoute = cleanPath.startsWith('/produit/') || cleanPath.startsWith('/produits/') || cleanPath.startsWith('/product/') || cleanPath.startsWith('/products/');
  const isCartRoute = cleanPath === '/panier' || cleanPath === '/cart';
  const isCheckoutRoute = cleanPath === '/commande' || cleanPath === '/checkout';
  const isForgotPasswordRoute = cleanPath === '/mot-de-passe-oublie' || cleanPath === '/forgot-password';
  const isResetPasswordRoute = ['/reinitialisation-mot-de-passe', '/reinitialiser-mot-de-passe', '/reset-password'].includes(cleanPath);
  const isCategoryRoute = cleanPath.startsWith('/categorie') || cleanPath.startsWith('/categories');
  const isSearchRoute = cleanPath.startsWith('/recherche') || cleanPath.startsWith('/search');
  const isAIRoute = ['/assistant-ia', '/ia', '/assistant'].includes(cleanPath);

  useEffect(() => {
    if (isCartRoute) openCart();
    else if (isCheckoutRoute) setIsCheckoutOpen(true);
    else if (isAuthRoute) openAuthModal();
  }, [isCartRoute, isCheckoutRoute, isAuthRoute, openCart, openAuthModal]);

  const isFiltering = activeCategory !== 'all' || Boolean(searchTerm && searchTerm.trim());
  const isOverlayOpen = Boolean(
    isCartOpen || isWishlistOpen || isNotificationCenterOpen ||
    isAuthModalOpen || isCheckoutOpen || isAdminAuthModalOpen || isReviewModalOpen || isAdminViewActive || isAIDrawerOpen
  );
  const showAnnouncementBar = isHomePath && !isCategoryRoute && !isSearchRoute && !isFiltering && !isOverlayOpen;

  const currentProductId = useMemo(() => {
    if (!isProductRoute) return null;
    return currentPath.split('/').filter(Boolean)[1] || null;
  }, [isProductRoute, currentPath]);

  const detailedProduct = useMemo(() => {
    if (!currentProductId || products.length === 0) return null;
    const cleanId = String(currentProductId).toLowerCase();
    return products.find(
      (p) => (p.slug && p.slug.toLowerCase() === cleanId) || String(p._id || p.id).toLowerCase() === cleanId
    ) || null;
  }, [currentProductId, products]);

  const sellerInitialTab = useMemo(() => {
    if (currentPath.includes('produit')) return 'products';
    if (currentPath.includes('commande')) return 'orders';
    if (currentPath.includes('notif')) return 'notifications';
    if (currentPath.includes('profil')) return 'profile';
    return (currentPath.includes('parametre') || currentPath.includes('setting')) ? 'settings' : 'dashboard';
  }, [currentPath]);

  const closeAllOverlays = useCallback(() => {
    closeCart();
    closeWishlist();
    closeNotificationCenter();
    closeAuthModal();
    setIsCheckoutOpen(false);
    setIsAdminAuthModalOpen(false);
    setIsReviewModalOpen(false);
    setIsAIDrawerOpen(false);
  }, [closeCart, closeWishlist, closeNotificationCenter, closeAuthModal]);

  useModalHistory(isOverlayOpen, closeAllOverlays, 'app-overlay');

  useEffect(() => {
    const handleLocationChange = () => {
      if (isRecentInternalModalBack()) {
        return;
      }
      closeAllOverlays();
      const newPath = window.location.pathname.toLowerCase();
      setCurrentPath(newPath);
      if (isAdminViewActive) setIsAdminViewActive(false);
      if (['/', '/accueil', '/home', '/index.html'].includes(newPath)) restoreCatalogScroll();
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('app-navigate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('app-navigate', handleLocationChange);
    };
  }, [closeAllOverlays, isAdminViewActive]);

  const navigateTo = useCallback((path, { replace = false } = {}) => {
    closeAllOverlays();
    if (replace) window.history.replaceState({ path, fromApp: true }, '', path);
    else window.history.pushState({ path, fromApp: true }, '', path);
    setCurrentPath(path.toLowerCase());
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [closeAllOverlays]);

  const handleSelectProduct = useCallback((prod) => {
    if (!prod) return;
    const id = prod.slug || prod._id || prod.id || (typeof prod === 'string' ? prod : null);
    if (id) {
      setRecentlyViewedIds((prev) => [String(id), ...prev.filter((x) => x !== String(id))].slice(0, 5));
      saveCatalogScroll();
      navigateTo(`/produit/${id}`);
    }
  }, [navigateTo]);

  const handleBackFromProduct = useCallback(() => {
    if (window.history.length > 1 && window.history.state?.fromApp) window.history.back();
    else navigateTo('/', { replace: true });
  }, [navigateTo]);

  const handleOpenAdmin = useCallback(() => {
    if (getAdminToken()) setIsAdminViewActive(true);
    else setIsAdminAuthModalOpen(true);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (isSellerRoute && !user) {
      addToast('Connexion requise', 'Veuillez vous connecter à votre compte Vendeur.', 'info');
      openAuthModal();
    }
  }, [isSellerRoute, user, authLoading, addToast, openAuthModal]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = activeCategory === 'all' || p.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesText = !searchTerm.trim() || p.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCat && matchesText;
    });
  }, [products, activeCategory, searchTerm]);

  if (isAdminRoute && !isAdminViewActive) return <NotFound404 onGoHome={() => navigateTo('/')} />;
  if (isAdminViewActive) {
    return (
      <React.Suspense fallback={null}>
        <AdminDashboard
          onClose={() => { setIsAdminViewActive(false); navigateTo('/'); }}
          onExitToShop={() => { setIsAdminViewActive(false); navigateTo('/'); }}
          onLogout={() => { setIsAdminViewActive(false); navigateTo('/'); }}
          onProductsUpdated={loadProducts}
        />
      </React.Suspense>
    );
  }
  if (isSellerRoute && isSeller) {
    return (
      <React.Suspense fallback={null}>
        <SellerDashboard onClose={() => navigateTo('/')} initialTab={sellerInitialTab} />
      </React.Suspense>
    );
  }

  return (
    <div className="app-root">
      <PwaInstallModal />
      {showAnnouncementBar && <AnnouncementBar />}

      {!isAIRoute && (
        <Header
          onOpenAdmin={handleOpenAdmin}
          isAdminActive={isAdminViewActive}
          onOpenAIAssistant={() => setIsAIDrawerOpen(true)}
          onOpenOrdersTracking={(ordNum) => { if (ordNum) setSelectedOrderNumber(ordNum); navigateTo('/commandes'); }}
          onOpenProfile={(tab = 'profile') => { setProfileInitialTab(tab); navigateTo('/profil'); }}
          onOpenSeller={() => navigateTo('/vendeur/dashboard')}
          onOpenNotificationCenter={openNotificationCenter}
          onSelectProduct={handleSelectProduct}
        />
      )}

      <React.Suspense fallback={null}>
        {isProductRoute ? (
          <ProductDetailsPage
            productId={currentProductId}
            initialProduct={detailedProduct}
            allProducts={products}
            onBack={handleBackFromProduct}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
            onSelectProduct={handleSelectProduct}
          />
        ) : isAIRoute ? (
          <AIAssistantPage
            onBackToShop={() => navigateTo('/')}
            onTrackOrder={(ordNum) => { if (ordNum) setSelectedOrderNumber(ordNum); navigateTo('/commandes'); }}
            onViewProduct={(slugOrId) => navigateTo(`/produit/${slugOrId}`)}
            onAddToCart={(p) => addToCart(p, 1)}
            onOpenCart={openCart}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
            onOpenAuth={openAuthModal}
            onOpenSeller={() => navigateTo('/vendeur/dashboard')}
            recentlyViewedIds={recentlyViewedIds}
          />
        ) : isForgotPasswordRoute ? (
          <ForgotPasswordPage onNavigate={navigateTo} onOpenLogin={openAuthModal} />
        ) : isResetPasswordRoute ? (
          <ResetPasswordPage onNavigate={navigateTo} onOpenLogin={openAuthModal} />
        ) : isOrdersRoute ? (
          <UserOrdersPage onBackToShop={() => navigateTo('/')} initialOrderNumber={selectedOrderNumber} />
        ) : isProfileRoute ? (
          <UserProfilePage
            onBackToShop={() => navigateTo('/')}
            onOpenSellerDashboard={() => navigateTo('/vendeur/dashboard')}
            initialTab={profileInitialTab}
          />
        ) : isHomePath ? (
          <>
            <HeroSection onExploreClick={() => document.getElementById('produits')?.scrollIntoView({ behavior: 'smooth' })} />
            <FlashSale
              products={products} loading={loading}
              onShopNow={() => document.getElementById('produits')?.scrollIntoView({ behavior: 'smooth' })}
              onQuickView={handleSelectProduct}
            />
            <main className="container products" id="produits">
              <div className="section-header">
                <span className="section-subtitle">Notre Catalogue Marketplace</span>
                <h2 className="section-title">Nos Produits Tendance</h2>
                <div className="title-underline" />
              </div>

              <ProductFilters
                activeCategory={activeCategory} onCategoryChange={setActiveCategory}
                searchTerm={searchTerm} onSearchChange={setSearchTerm}
                totalCount={filteredProducts.length} loading={loading}
              />

              <ProductGrid
                products={filteredProducts} loading={loading} error={error}
                onSelectProduct={handleSelectProduct} onQuickView={handleSelectProduct}
                onResetFilters={() => { setActiveCategory('all'); setSearchTerm(''); }}
                onRetry={loadProducts}
              />
            </main>
            <Footer />
          </>
        ) : (
          <NotFound404 onGoHome={() => navigateTo('/')} />
        )}

        <AppModals
          isCheckoutOpen={isCheckoutOpen} onCloseCheckout={() => setIsCheckoutOpen(false)} onOpenCheckout={() => setIsCheckoutOpen(true)}
          isReviewModalOpen={isReviewModalOpen} onCloseReviewModal={() => setIsReviewModalOpen(false)}
          reviewTargetProduct={reviewTargetProduct} reviewTargetOrderNumber={reviewTargetOrderNumber}
          isAdminAuthModalOpen={isAdminAuthModalOpen} onCloseAdminAuthModal={() => setIsAdminAuthModalOpen(false)}
          onAdminAuthSuccess={() => { setIsAdminAuthModalOpen(false); setIsAdminViewActive(true); }}
          isNotificationCenterOpen={isNotificationCenterOpen} onCloseNotificationCenter={closeNotificationCenter}
          onSelectOrder={(ordNum) => { if (ordNum) setSelectedOrderNumber(ordNum); navigateTo('/commandes'); }}
          onSelectProduct={handleSelectProduct} onOpenProfileTab={(tab) => { setProfileInitialTab(tab); navigateTo('/profil'); }}
          currentPath={currentPath} onNavigate={navigateTo} onOpenAdmin={handleOpenAdmin}
          isAIDrawerOpen={isAIDrawerOpen} onCloseAIDrawer={() => setIsAIDrawerOpen(false)}
          onAddToCart={(p) => addToCart(p, 1)} onOpenCart={openCart} onOpenAuth={openAuthModal}
          onOpenSeller={() => navigateTo('/vendeur/dashboard')} recentlyViewedIds={recentlyViewedIds}
        />
      </React.Suspense>

      <FloatingAIAssistantButton
        onClick={() => setIsAIDrawerOpen((prev) => !prev)}
        isOpen={isAIDrawerOpen}
        isVisible={!isAIRoute && !isAdminViewActive && !isSellerRoute && !isAIDrawerOpen}
      />
    </div>
  );
};

export default App;
