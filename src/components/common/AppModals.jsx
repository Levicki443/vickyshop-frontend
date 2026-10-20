import React from 'react';
import { CartDrawer } from '../cart/CartDrawer';
import { WishlistDrawer } from '../cart/WishlistDrawer';
import { CheckoutModal } from '../cart/CheckoutModal';
import { ReviewModal } from '../reviews/ReviewModal';
import { AuthModal } from '../auth/AuthModal';
import { AdminAuthModal } from '../admin/AdminAuthModal';
import { NotificationCenterModal } from './NotificationCenterModal';
import { MobileBottomNav } from './MobileBottomNav';
import { ToastContainer } from './ToastContainer';
import { AIChatDrawer } from '../ai/AIChatDrawer';

/**
 * Conteneur modulaire regroupant tous les tiroirs, modales globales,
 * le tiroir conversationnel Vicky IA et la barre mobile inférieure.
 */
export const AppModals = ({
  isCheckoutOpen,
  onCloseCheckout,
  onOpenCheckout,
  isReviewModalOpen,
  onCloseReviewModal,
  reviewTargetProduct,
  reviewTargetOrderNumber,
  isAdminAuthModalOpen,
  onCloseAdminAuthModal,
  onAdminAuthSuccess,
  isNotificationCenterOpen,
  onCloseNotificationCenter,
  onSelectOrder,
  onSelectProduct,
  onOpenProfileTab,
  currentPath,
  onNavigate,
  onOpenAdmin,
  isAIDrawerOpen,
  onCloseAIDrawer,
  onAddToCart,
  onOpenCart,
  onOpenAuth,
  onOpenSeller,
  recentlyViewedIds = [],
}) => {
  return (
    <>
      <CartDrawer onOpenCheckout={onOpenCheckout} />
      <WishlistDrawer />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={onCloseCheckout} />
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={onCloseReviewModal}
        initialProduct={reviewTargetProduct}
        initialOrderNumber={reviewTargetOrderNumber}
      />
      <AuthModal />
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={onCloseAdminAuthModal}
        onAuthSuccess={onAdminAuthSuccess}
      />
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={onCloseNotificationCenter}
        onSelectOrder={onSelectOrder}
        onSelectProduct={onSelectProduct}
        onOpenSettings={() => onOpenProfileTab('notifications')}
      />
      <AIChatDrawer
        isOpen={Boolean(isAIDrawerOpen)}
        onClose={onCloseAIDrawer}
        onGoHome={() => {
          onCloseAIDrawer();
          if (onNavigate) onNavigate('/');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onTrackOrder={onSelectOrder}
        onViewProduct={onSelectProduct}
        onAddToCart={onAddToCart}
        onOpenCart={onOpenCart}
        onOpenCheckout={onOpenCheckout}
        onOpenAuth={onOpenAuth}
        onOpenSeller={onOpenSeller}
        recentlyViewedIds={recentlyViewedIds}
      />
      {!isAIDrawerOpen && (
        <MobileBottomNav currentPath={currentPath} onNavigate={onNavigate} onOpenAdmin={onOpenAdmin} />
      )}
      <ToastContainer />
    </>
  );
};

export default AppModals;
