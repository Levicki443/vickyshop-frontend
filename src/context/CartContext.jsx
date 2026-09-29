import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const CartContext = createContext();

const FREE_SHIPPING_THRESHOLD = 50000;
const DEFAULT_SHIPPING_COST = 2000;

const PROMO_CODES = {
  VICKY10: { type: 'percent', value: 10, label: '-10% sur votre commande' },
  PROMO20: { type: 'percent', value: 20, label: '-20% Offre Spéciale' },
  BIENVENUE5000: { type: 'fixed', value: 5000, label: '5 000 FCFA offerts' },
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('vicky_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);

  useEffect(() => {
    localStorage.setItem('vicky_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1, selectedColor = null, selectedSize = null) => {
    setCart((prevCart) => {
      const prodId = product._id || product.id || String(Date.now());
      const itemKey = `${prodId}${selectedColor ? `-${selectedColor}` : ''}${selectedSize ? `-${selectedSize}` : ''}`;

      const existingIndex = prevCart.findIndex(
        (item) => item.itemKey === itemKey || (item.id === prodId && item.selectedColor === selectedColor && item.selectedSize === selectedSize)
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [
        ...prevCart,
        {
          itemKey,
          id: prodId,
          title: product.title,
          price: product.price,
          image: product.image,
          quantity,
          category: product.category,
          selectedColor: selectedColor || null,
          selectedSize: selectedSize || null,
          maxStock: product.stockQuantity !== undefined ? product.stockQuantity : 99,
        },
      ];
    });
  };

  const removeFromCart = (idOrKey) => {
    setCart((prevCart) => prevCart.filter((item) => (item.itemKey || item.id) !== idOrKey && item.id !== idOrKey));
  };

  const updateQuantity = (idOrKey, quantity) => {
    if (quantity <= 0) {
      removeFromCart(idOrKey);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => ((item.itemKey || item.id) === idOrKey || item.id === idOrKey ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
  };

  const applyPromoCode = (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (PROMO_CODES[cleanCode]) {
      setAppliedPromo({ code: cleanCode, ...PROMO_CODES[cleanCode] });
      return { success: true, message: `Code ${cleanCode} appliqué avec succès !` };
    }
    return { success: false, message: 'Code promo invalide ou expiré.' };
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === 'percent') {
      return Math.round((subtotal * appliedPromo.value) / 100);
    }
    return Math.min(appliedPromo.value, subtotal);
  }, [appliedPromo, subtotal]);

  const shippingCost = useMemo(() => {
    if (subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
    return DEFAULT_SHIPPING_COST;
  }, [subtotal]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + shippingCost);
  }, [subtotal, discountAmount, shippingCost]);

  const totalItems = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        subtotal,
        discountAmount,
        shippingCost,
        total,
        totalItems,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart doit être utilisé au sein d\'un CartProvider');
  }
  return context;
};
