import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchProducts } from './services/api';
import { getAdminToken } from './services/adminApi';
import {
  onProductCreated,
  onProductUpdated,
  onProductDeleted,
  onProductStockUpdated,
} from './services/socket';
import { Header } from './components/common/Header';
import { HeroSection } from './components/home/HeroSection';
import { FlashSale } from './components/home/FlashSale';
import { ProductFilters } from './components/products/ProductFilters';
import { ProductGrid } from './components/products/ProductGrid';
import { QuickViewModal } from './components/products/QuickViewModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { WishlistDrawer } from './components/cart/WishlistDrawer';
import { OrdersTrackingModal } from './components/cart/OrdersTrackingModal';
import { CheckoutModal } from './components/cart/CheckoutModal';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminAuthModal } from './components/admin/AdminAuthModal';
import { NotFound404 } from './components/common/NotFound404';
import { WelcomeOverlay } from './components/common/WelcomeOverlay';

export const App = () => {
  // Vérification de l'URL directe pour blocage 404
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname.toLowerCase());

  const isRestrictedDirectRoute = useMemo(() => {
    return (
      currentPath.startsWith('/admin') ||
      currentPath.startsWith('/dashboard') ||
      currentPath.startsWith('/backoffice')
    );
  }, [currentPath]);

  // États du Backoffice
  const [isAdminViewActive, setIsAdminViewActive] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);

  // États de la boutique
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersTrackingOpen, setIsOrdersTrackingOpen] = useState(false);

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

  // Synchronisation en direct des produits via Socket.IO
  useEffect(() => {
    const unsubCreated = onProductCreated((newProd) => {
      setProducts((prev) => {
        const exists = prev.some((p) => p._id === newProd._id);
        if (exists) return prev.map((p) => (p._id === newProd._id ? newProd : p));
        return [newProd, ...prev];
      });
    });

    const unsubUpdated = onProductUpdated((updatedProd) => {
      setProducts((prev) =>
        prev.map((p) => (p._id === updatedProd._id ? updatedProd : p))
      );
      setSelectedProduct((prev) => (prev && prev._id === updatedProd._id ? updatedProd : prev));
    });

    const unsubDeleted = onProductDeleted((deletedId) => {
      setProducts((prev) => prev.filter((p) => p._id !== deletedId));
      setSelectedProduct((prev) => (prev && prev._id === deletedId ? null : prev));
    });

    const unsubStock = onProductStockUpdated(({ productId, stockQuantity, inStock }) => {
      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId
            ? { ...p, stockQuantity, inStock: inStock !== undefined ? inStock : stockQuantity > 0 }
            : p
        )
      );
      setSelectedProduct((prev) =>
        prev && prev._id === productId
          ? {
              ...prev,
              stockQuantity,
              inStock: inStock !== undefined ? inStock : stockQuantity > 0,
            }
          : prev
      );
    });

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
      unsubStock();
    };
  }, []);

  // Écoute des changements de navigation dans la fenêtre
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname.toLowerCase());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Déclenchement secret Backoffice (10s maintien sur Accueil)
  const handleOpenAdminTrigger = useCallback(() => {
    const adminToken = getAdminToken();
    if (adminToken) {
      setIsAdminViewActive(true);
    } else {
      setIsAdminAuthModalOpen(true);
    }
  }, []);

  // Filtrage local en temps réel
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        activeCategory === 'all' || p.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch =
        !searchTerm.trim() ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchTerm]);

  const scrollToProducts = () => {
    const el = document.getElementById('produits');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setActiveCategory('all');
    setSearchTerm('');
  };

  // Si tentative d'accès direct par URL à une route secrète non autorisée -> 404
  if (isRestrictedDirectRoute && !isAdminViewActive) {
    return <NotFound404 onGoHome={() => (window.location.href = '/')} />;
  }

  // Rendu de la vue Backoffice Administrateur
  if (isAdminViewActive) {
    return (
      <AdminDashboard
        onClose={() => setIsAdminViewActive(false)}
        onProductsUpdated={loadProducts}
      />
    );
  }

  return (
    <div className="app-root">
      {/* Overlay de Bienvenue & Vidéo */}
      <WelcomeOverlay />

      {/* Barre d'Annonces Défilante */}
      <div className="announcement-bar">
        <div className="announcement-track">
          <div className="announcement-item">
            <span><i className="fa-solid fa-fire"></i> <strong>VENTE FLASH :</strong> Jusqu&apos;à -50%</span>
            <span className="bullet">•</span>
            <span><i className="fa-solid fa-bolt"></i> <strong>LIVRAISON EXPRESS :</strong> 24/48h en Côte d&apos;Ivoire</span>
            <span className="bullet">•</span>
            <span><i className="fa-solid fa-credit-card"></i> <strong>PAIEMENT SÉCURISÉ :</strong> Wave, Orange Money, MTN MoMo</span>
            <span className="bullet">•</span>
            <span><i className="fa-solid fa-gift"></i> <strong>CODE PROMO :</strong> VICKY10 (-10%)</span>
          </div>
          <div className="announcement-item" aria-hidden="true">
            <span><i className="fa-solid fa-fire"></i> <strong>VENTE FLASH :</strong> Jusqu&apos;à -50%</span>
            <span className="bullet">•</span>
            <span><i className="fa-solid fa-bolt"></i> <strong>LIVRAISON EXPRESS :</strong> 24/48h en Côte d&apos;Ivoire</span>
            <span className="bullet">•</span>
            <span><i className="fa-solid fa-credit-card"></i> <strong>PAIEMENT SÉCURISÉ :</strong> Wave, Orange Money, MTN MoMo</span>
            <span className="bullet">•</span>
            <span><i className="fa-solid fa-gift"></i> <strong>CODE PROMO :</strong> VICKY10 (-10%)</span>
          </div>
        </div>
      </div>

      {/* En-tête avec navigation et boutons d'action */}
      <Header
        onOpenAdmin={handleOpenAdminTrigger}
        isAdminActive={isAdminViewActive}
        onOpenOrdersTracking={() => setIsOrdersTrackingOpen(true)}
      />

      {/* Hero Section */}
      <HeroSection onExploreClick={scrollToProducts} />

      {/* Section Vente Flash & Articles en Vedette */}
      <FlashSale
        products={products}
        onShopNow={scrollToProducts}
        onQuickView={(product) => setSelectedProduct(product)}
      />

      {/* Catalogue de Produits */}
      <main className="container products" id="produits">
        <div className="section-header">
          <span className="section-subtitle">Notre Catalogue</span>
          <h2 className="section-title">Nos Produits Tendance</h2>
          <div className="title-underline"></div>
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
          onQuickView={(product) => setSelectedProduct(product)}
          onResetFilters={handleResetFilters}
        />
      </main>

      {/* Pied de page */}
      <Footer />

      {/* Panier Latéral */}
      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />

      {/* Tiroir Favoris */}
      <WishlistDrawer />

      {/* Modale de Suivi de Commandes & Facturation */}
      <OrdersTrackingModal
        isOpen={isOrdersTrackingOpen}
        onClose={() => setIsOrdersTrackingOpen(false)}
      />

      {/* Modale de Commande Multi-Paiements */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      {/* Modale d'Authentification Client */}
      <AuthModal />

      {/* Modale de Gestion du Profil et Paramètres Utilisateur */}
      <UserProfileModal />

      {/* Modale Secrète d'Authentification Administrateur */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onAuthSuccess={() => {
          setIsAdminAuthModalOpen(false);
          setIsAdminViewActive(true);
        }}
      />

      {/* Modale Aperçu Rapide */}
      <QuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Alertes Toasts */}
      <ToastContainer />
    </div>
  );
};

export default App;
