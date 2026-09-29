import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('vicky_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('vicky_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const openWishlist = () => setIsWishlistOpen(true);
  const closeWishlist = () => setIsWishlistOpen(false);

  const toggleWishlist = (product) => {
    setWishlist((prevList) => {
      const exists = prevList.some(
        (item) => item.id === (product._id || product.id) || item.title === product.title
      );
      if (exists) {
        return prevList.filter(
          (item) => item.id !== (product._id || product.id) && item.title !== product.title
        );
      }
      return [
        ...prevList,
        {
          id: product._id || product.id,
          _id: product._id || product.id,
          title: product.title,
          price: product.price,
          originalPrice: product.originalPrice || null,
          image: product.image || (product.images && product.images[0]) || '',
          category: product.category || '',
          inStock: product.inStock !== false,
        },
      ];
    });
  };

  const isInWishlist = (product) => {
    return wishlist.some(
      (item) => item.id === (product._id || product.id) || item.title === product.title
    );
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prevList) => prevList.filter((item) => (item.id || item._id) !== productId));
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
        wishlistCount: wishlist.length,
        isWishlistOpen,
        openWishlist,
        closeWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist doit être utilisé au sein d\'un WishlistProvider');
  }
  return context;
};
