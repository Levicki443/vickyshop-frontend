import { useState, useEffect, useCallback } from 'react';
import { fetchProducts } from '../services/api';
import {
  onProductCreated,
  onProductUpdated,
  onProductDeleted,
  onProductStockUpdated,
} from '../services/socket';

const CACHE_KEY = 'vicky_catalog_cache_v1';

/**
 * Hook personnalisé gérant le chargement et la synchronisation temps réel du catalogue produit.
 * Implémente la stratégie Stale-While-Revalidate pour un affichage instantané (0 ms).
 */
export const useShopProducts = () => {
  // Lecture synchrone instantanée depuis le cache de session
  const [products, setProducts] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [];
  });

  // Si des produits sont déjà en cache, l'écran de chargement n'est pas bloquant
  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      return !cached;
    } catch (_) {
      return true;
    }
  });

  const [error, setError] = useState(null);

  const saveToCache = (data) => {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (_) {}
  };

  const loadProducts = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchProducts();
      const realProducts = Array.isArray(data)
        ? data.filter((p) => !p.image?.includes('unsplash.com'))
        : [];
      setProducts(realProducts);
      saveToCache(realProducts);
    } catch (err) {
      // Préserve les données en cache en cas d'échec réseau ponctuel
      if (products.length === 0) {
        setError('Impossible de joindre le serveur API. Veuillez vérifier la connexion.');
      }
    } finally {
      setLoading(false);
    }
  }, [products.length]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const u1 = onProductCreated((p) => {
      if (p.image?.includes('unsplash.com')) return;
      setProducts((prev) => {
        const next = prev.some((x) => x._id === p._id) ? prev : [p, ...prev];
        saveToCache(next);
        return next;
      });
    });

    const u2 = onProductUpdated((p) =>
      setProducts((prev) => {
        const next = prev.map((x) => ((x._id || x.id) === (p._id || p.id) ? p : x));
        saveToCache(next);
        return next;
      })
    );

    const u3 = onProductDeleted((id) =>
      setProducts((prev) => {
        const next = prev.filter((x) => (x._id || x.id) !== id);
        saveToCache(next);
        return next;
      })
    );

    const u4 = onProductStockUpdated(({ productId, stockQuantity, inStock }) => {
      setProducts((prev) => {
        const next = prev.map((x) =>
          (x._id || x.id) === productId
            ? { ...x, stockQuantity, inStock: inStock ?? stockQuantity > 0 }
            : x
        );
        saveToCache(next);
        return next;
      });
    });

    return () => {
      u1();
      u2();
      u3();
      u4();
    };
  }, []);

  return { products, loading, error, loadProducts };
};

export default useShopProducts;
