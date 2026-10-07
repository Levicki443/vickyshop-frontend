import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchProducts, formatPrice } from './services/api';
import { getAdminToken } from './services/adminApi';
import {
  onProductCreated,
  onProductUpdated,
  onProductDeleted,
  onProductStockUpdated,
  joinSellerRoom,
  onSellerNewOrder,
  onClientOrderUpdate,
} from './services/socket';
import { Header } from './components/common/Header';
import { HeroSection } from './components/home/HeroSection';
import { FlashSale } from './components/home/FlashSale';
import { TestimonialsSection } from './components/home/TestimonialsSection';
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
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';

export const App = () => {
  const { user, isSeller, openAuthModal, refreshSellerUnreadCount, refreshClientUnreadCount, loading: authLoading } = useAuth();
  const { addToast } = useToast();

  const [currentPath, setCurrentPath] = useState(() => window.location.pathname.toLowerCase());
  const [selectedOrderNumber, setSelectedOrderNumber] = useState(null);
  const [isAdminViewActive, setIsAdminViewActive] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewTargetProduct, setReviewTargetProduct] = useState(null);
  const [reviewTargetOrderNumber, setReviewTargetOrderNumber] = useState('');

  // Détection exhaustive des routes
  const isSellerRoute = currentPath.startsWith('/vendeur');
  const isAdminRoute = currentPath.startsWith('/admin') || currentPath.startsWith('/dashboard') || currentPath.startsWith('/backoffice');
  const isOrdersRoute = currentPath.startsWith('/commandes') || currentPath.startsWith('/orders');
  const isProfileRoute = currentPath.startsWith('/profil') || currentPath.startsWith('/profile');
  const isProductRoute =
    currentPath.startsWith('/produit/') ||
    currentPath.startsWith('/produits/') ||
    currentPath.startsWith('/product/') ||
    currentPath.startsWith('/products/');

  // Extraction propre de l'identifiant produit
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

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      setError('Impossible de joindre le serveur API. Veuillez vérifier la connexion.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Écoute Socket.IO globale pour vendeur connecté
  useEffect(() => {
    if (isSeller && user) {
      const sellerId = user.id || user._id;
      joinSellerRoom(sellerId);
      const unsub = onSellerNewOrder((orderData) => {
        if (refreshSellerUnreadCount) refreshSellerUnreadCount();
        addToast('📦 Nouvelle Commande Reçue !', `Commande #${orderData.orderNumber} (${formatPrice(orderData.total)}).`, 'success');
      });
      return () => unsub();
    }
  }, [isSeller, user, addToast, refreshSellerUnreadCount]);

  // Écoute Socket.IO en direct pour le Client connecté
  useEffect(() => {
    if (user) {
      const unsub = onClientOrderUpdate((updateData) => {
        if (refreshClientUnreadCount) refreshClientUnreadCount();
        addToast(
          updateData.title || '🔔 Commande mise à jour',
          updateData.message || `Votre commande #${updateData.orderNumber} a changé de statut.`,
          'info'
        );
      });
      return () => unsub();
    }
  }, [user, addToast, refreshClientUnreadCount]);

  // Synchronisation temps réel du catalogue
  useEffect(() => {
    const u1 = onProductCreated((p) => setProducts((prev) => (prev.some((x) => x._id === p._id) ? prev : [p, ...prev])));
    const u2 = onProductUpdated((p) => setProducts((prev) => prev.map((x) => ((x._id || x.id) === (p._id || p.id) ? p : x))));
    const u3 = onProductDeleted((id) => setProducts((prev) => prev.filter((x) => (x._id || x.id) !== id)));
    const u4 = onProductStockUpdated(({ productId, stockQuantity, inStock }) => {
      setProducts((prev) => prev.map((x) => ((x._id || x.id) === productId ? { ...x, stockQuantity, inStock: inStock ?? stockQuantity > 0 } : x)));
    });
    return () => { u1(); u2(); u3(); u4(); };
  }, []);

  // Synchronisation avec l'historique et la barre d'adresse
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
    if (id) {
      navigateTo(`/produit/${id}`);
    }
  };

  // Sécurité et restrictions d'accès Vendeur
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

  // Vues Plein Écran : 404, Admin, Vendeur
  if (isAdminRoute && !isAdminViewActive) {
    return <NotFound404 onGoHome={() => navigateTo('/')} />;
  }
  if (isAdminViewActive) {
    return (
      <AdminDashboard
        onClose={() => {
          setIsAdminViewActive(false);
          navigateTo('/');
        }}
        onExitToShop={() => {
          setIsAdminViewActive(false);
          navigateTo('/');
        }}
        onLogout={() => {
          setIsAdminViewActive(false);
          navigateTo('/');
        }}
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

      <AnnouncementBar />

      <Header
        onOpenAdmin={() => (getAdminToken() ? setIsAdminViewActive(true) : setIsAdminAuthModalOpen(true))}
        isAdminActive={isAdminViewActive}
        onOpenOrdersTracking={(ordNum) => {
          if (ordNum) setSelectedOrderNumber(ordNum);
          navigateTo('/commandes');
        }}
        onOpenProfile={() => navigateTo('/profil')}
        onOpenSeller={() => navigateTo('/vendeur/dashboard')}
      />

      {/* ROUTE 1 : PAGE DÉDIÉE DÉTAILS DU PRODUIT (STRICTEMENT ISOLÉE) */}
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
        /* ROUTE 2 : PAGE DÉDIÉE VOS COMMANDES */
        <UserOrdersPage onBackToShop={() => navigateTo('/')} initialOrderNumber={selectedOrderNumber} />
      ) : isProfileRoute ? (
        /* ROUTE 3 : PAGE DÉDIÉE PROFIL & PARAMÈTRES */
        <UserProfilePage
          onBackToShop={() => navigateTo('/')}
          onOpenSellerDashboard={() => navigateTo('/vendeur/dashboard')}
        />
      ) : (
        /* ROUTE 4 : PAGE D'ACCUEIL & CATALOGUE PRINCIPAL */
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
          <TestimonialsSection
            onOpenReviewModal={() => {
              setReviewTargetProduct(null);
              setReviewTargetOrderNumber('');
              setIsReviewModalOpen(true);
            }}
            onSelectProduct={handleSelectProduct}
          />
        </>
      )}

      <Footer />
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
      <ToastContainer />
    </div>
  );
};

export default App;
