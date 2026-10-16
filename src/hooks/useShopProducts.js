import { useState, useEffect, useCallback } from 'react';
import { fetchProducts } from '../services/api';
import {
  onProductCreated,
  onProductUpdated,
  onProductDeleted,
  onProductStockUpdated,
} from '../services/socket';

/**
 * Hook personnalisé gérant le chargement et la synchronisation temps réel du catalogue produit.
 * Réduit la charge cognitive et respecte le principe de responsabilité unique (SOLID).
 */
export const useShopProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      const realProducts = Array.isArray(data)
        ? data.filter((p) => !p.image?.includes('unsplash.com'))
        : [];
      setProducts(realProducts);
    } catch (err) {
      setError('Impossible de joindre le serveur API. Veuillez vérifier la connexion.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const u1 = onProductCreated((p) => {
      if (p.image?.includes('unsplash.com')) return;
      setProducts((prev) => (prev.some((x) => x._id === p._id) ? prev : [p, ...prev]));
    });
    const u2 = onProductUpdated((p) =>
      setProducts((prev) =>
        prev.map((x) => ((x._id || x.id) === (p._id || p.id) ? p : x))
      )
    );
    const u3 = onProductDeleted((id) =>
      setProducts((prev) => prev.filter((x) => (x._id || x.id) !== id))
    );
    const u4 = onProductStockUpdated(({ productId, stockQuantity, inStock }) => {
      setProducts((prev) =>
        prev.map((x) =>
          (x._id || x.id) === productId
            ? { ...x, stockQuantity, inStock: inStock ?? stockQuantity > 0 }
            : x
        )
      );
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
