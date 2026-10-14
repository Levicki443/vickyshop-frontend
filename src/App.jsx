import React, { useState, useEffect, useMemo } from 'react';
import { getAdminToken } from './services/adminApi';
import { useShopProducts } from './hooks/useShopProducts';
import { Header } from './components/common/Header';
import { HeroSection } from './components/home/HeroSection';
import { FlashSale } from './components/home/FlashSale';
import { ReviewModal } from './components/reviews/ReviewModal';
import { ProductFilters } from './components/products/ProductFilters';
import { ProductGrid } from './components/products/ProductGrid';
import { ProductDetailsPage } from './components/products/ProductDetailsPage';
import { UserOrdersPage } from './components/orders/UserOrdersPage';
import { UserProfilePage } from './components/auth/UserProfilePage';
import { CartDrawer } from './components/cart/CartDrawer';
import { WishlistDrawer } from './components/cart/WishlistDrawer';
import { CheckoutModal } from './components/cart/CheckoutModal';
import { AuthModal } from './components/auth/AuthModal';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { AnnouncementBar } from './components/common/AnnouncementBar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminAuthModal } from './components/admin/AdminAuthModal';
import { SellerDashboard } from './components/seller/SellerDashboard';
import { NotFound404 } from './components/common/NotFound404';
import { PwaInstallModal } from './components/common/PwaInstallModal';
import { NotificationCenterModal } from './components/common/NotificationCenterModal';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import { useNotifications } from './context/NotificationContext';
import { useToast } from './context/ToastContext';

export const App = () => {
  const { user, isSeller, openAuthModal, loading: authLoading, isAuthModalOpen } = useAuth();
  const { isCartOpen, openCart } = useCart();
  const { isNotificationCenterOpen, closeNotificationCenter, openNotificationCenter } = useNotifications();
  const { addToast } = useToast();
  const { products, loading, error, loadProducts } = useShopProducts();

  const [currentPath, setCurrentPath] = useState(() => window.location.pathname.toLowerCase());
  const [selectedOrderNumber, setSelectedOrderNumber] = useState(null);
  const [isAdminViewActive, setIsAdminViewActive] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState('profile');

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewTargetProduct, setReviewTargetProduct] = useState(null);
  const [reviewTargetOrderNumber, setReviewTargetOrderNumber] = useState('');

  // Normalisation rigoureuse de l'URL (exclusion des query params, hash et barres obliques finales)
  const cleanPath = useMemo(() => {
    return currentPath.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';
  }, [currentPath]);

  // Détection stricte de la véritable page d'accueil publique (évite le piège startsWith('/'))
  const isHomePath =
    cleanPath === '/' ||
    cleanPath === '/accueil' ||
    cleanPath === '/home' ||
    cleanPath === '/index.html';

  const isSellerRoute = cleanPath.startsWith('/vendeur') || cleanPath.startsWith('/seller');
  const isAdminRoute =
    cleanPath.startsWith('/admin') ||
    cleanPath.startsWith('/dashboard') ||
    cleanPath.startsWith('/backoffice');
  const isOrdersRoute =
    cleanPath.startsWith('/commandes') ||
    cleanPath.startsWith('/orders') ||
    cleanPath.startsWith('/suivi');
  const isProfileRoute =
    cleanPath.startsWith('/profil') ||
    cleanPath.startsWith('/profile') ||
    cleanPath.startsWith('/compte');
  const isProductRoute =
    cleanPath.startsWith('/produit/') ||
    cleanPath.startsWith('/produits/') ||
    cleanPath.startsWith('/product/') ||
    cleanPath.startsWith('/products/');
  const isCartRoute = cleanPath === '/panier' || cleanPath === '/cart';
  const isCheckoutRoute = cleanPath === '/commande' || cleanPath === '/checkout';
  const isAuthRoute =
    cleanPath === '/connexion' ||
    cleanPath === '/login' ||
    cleanPath === '/inscription' ||
    cleanPath === '/register' ||
    cleanPath === '/auth';
  const isCategoryRoute = cleanPath.startsWith('/categorie') || cleanPath.startsWith('/categories');
  const isSearchRoute = cleanPath.startsWith('/recherche') || cleanPath.startsWith('/search');

  // Gestion des accès directs par URL pour le panier, commande et authentification
  useEffect(() => {
    if (isCartRoute) openCart();
    else if (isCheckoutRoute) setIsCheckoutOpen(true);
    else if (isAuthRoute) openAuthModal();
  }, [isCartRoute, isCheckoutRoute, isAuthRoute, openCart, openAuthModal]);

  // Affichage de la bannière exclusivement sur l'accueil public pur (sans filtres, sans modales)
  const isFiltering = activeCategory !== 'all' || Boolean(searchTerm && searchTerm.trim());
  const isOverlayOpen =
    Boolean(isCartOpen) ||
    Boolean(isCheckoutOpen) ||
    Boolean(isAuthModalOpen) ||
    Boolean(isAdminAuthModalOpen) ||
    Boolean(isAdminViewActive);

  const showAnnouncementBar =
    isHomePath &&
    !isProductRoute &&
    !isOrdersRoute &&
    !isProfileRoute &&
    !isSellerRoute &&
    !isAdminRoute &&
    !isCartRoute &&
    !isCheckoutRoute &&
    !isAuthRoute &&
    !isCategoryRoute &&
    !isSearchRoute &&
    !isFiltering &&
    !isOverlayOpen;

  const currentProductId = useMemo(() => {
    if (!isProductRoute) return null;
    const parts = currentPath.split('/').filter(Boolean);
    return parts[1] || null;
  }, [isProductRoute, currentPath]);

  const detailedProduct = useMemo(() => {
    if (!currentProductId || products.length === 0) return null;
    return products.find((p) => String(p._id || p.id) === String(currentProductId)) || null;
  }, [currentProductId, products]);

  const sellerInitialTab = useMemo(() => {
    if (currentPath.includes('produit')) return 'products';
    if (currentPath.includes('commande')) return 'orders';
    if (currentPath.includes('notif')) return 'notifications';
    if (currentPath.includes('profil')) return 'profile';
    if (currentPath.includes('parametre') || currentPath.includes('setting')) return 'settings';
    return 'dashboard';
  }, [currentPath]);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname.toLowerCase());
      if (isCheckoutOpen) setIsCheckoutOpen(false);
      if (isAdminAuthModalOpen) setIsAdminAuthModalOpen(false);
      if (isAdminViewActive) setIsAdminViewActive(false);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('app-navigate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('app-navigate', handleLocationChange);
    };
  }, [isCheckoutOpen, isAdminAuthModalOpen, isAdminViewActive]);

  const navigateTo = (path) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path.toLowerCase());
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSelectProduct = (prod) => {
    const id = prod?._id || prod?.id || prod;
    if (id) navigateTo(`/produit/${id}`);
  };

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

  if (isAdminRoute && !isAdminViewActive) {
    return <NotFound404 onGoHome={() => navigateTo('/')} />;
  }
  if (isAdminViewActive) {
    return (
      <AdminDashboard
        onClose={() => { setIsAdminViewActive(false); navigateTo('/'); }}
        onExitToShop={() => { setIsAdminViewActive(false); navigateTo('/'); }}
        onLogout={() => { setIsAdminViewActive(false); navigateTo('/'); }}
        onProductsUpdated={loadProducts}
      />
    );
  }
  if (isSellerRoute && isSeller) {
    return <SellerDashboard onClose={() => navigateTo('/')} initialTab={sellerInitialTab} />;
  }

  return (
    <div className="app-root">
      <PwaInstallModal />
      {showAnnouncementBar && <AnnouncementBar />}

      <Header
        onOpenAdmin={() => (getAdminToken() ? setIsAdminViewActive(true) : setIsAdminAuthModalOpen(true))}
        isAdminActive={isAdminViewActive}
        onOpenOrdersTracking={(ordNum) => {
          if (ordNum) setSelectedOrderNumber(ordNum);
          navigateTo('/commandes');
        }}
        onOpenProfile={(tab = 'profile') => {
          setProfileInitialTab(tab);
          navigateTo('/profil');
        }}
        onOpenSeller={() => navigateTo('/vendeur/dashboard')}
        onOpenNotificationCenter={openNotificationCenter}
        onSelectProduct={handleSelectProduct}
      />

      {isProductRoute ? (
        <ProductDetailsPage
          productId={currentProductId}
          initialProduct={detailedProduct}
          allProducts={products}
          onBack={() => navigateTo('/')}
          onOpenCheckout={() => setIsCheckoutOpen(true)}
          onSelectProduct={handleSelectProduct}
        />
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
            products={products}
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
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              totalCount={filteredProducts.length}
            />

            <ProductGrid
              products={filteredProducts}
              loading={loading}
              error={error}
              onSelectProduct={handleSelectProduct}
              onQuickView={handleSelectProduct}
              onResetFilters={() => { setActiveCategory('all'); setSearchTerm(''); }}
            />
          </main>
          <Footer />
        </>
      ) : (
        <NotFound404 onGoHome={() => navigateTo('/')} />
      )}

      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />
      <WishlistDrawer />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        initialProduct={reviewTargetProduct}
        initialOrderNumber={reviewTargetOrderNumber}
      />
      <AuthModal />
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onAuthSuccess={() => { setIsAdminAuthModalOpen(false); setIsAdminViewActive(true); }}
      />
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={closeNotificationCenter}
        onSelectOrder={(ordNum) => {
          setSelectedOrderNumber(ordNum);
          navigateTo('/commandes');
        }}
        onSelectProduct={handleSelectProduct}
        onOpenSettings={() => {
          setProfileInitialTab('notifications');
          navigateTo('/profil');
        }}
      />
      <MobileBottomNav currentPath={currentPath} onNavigate={navigateTo} />
      <ToastContainer />
    </div>
  );
};

export default App;
