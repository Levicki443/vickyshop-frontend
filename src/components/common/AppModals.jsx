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

/**
 * Conteneur modulaire regroupant tous les tiroirs, modales globales et la barre mobile inférieure.
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
      <MobileBottomNav currentPath={currentPath} onNavigate={onNavigate} onOpenAdmin={onOpenAdmin} />
      <ToastContainer />
    </>
  );
};

export default AppModals;
