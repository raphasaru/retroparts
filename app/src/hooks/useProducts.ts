import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAllSellerProducts } from '../services/mercadolivre';
import { convertMLProduct, getUniqueValues } from '../data/products';
import type { Product } from '../data/products';

interface UseProductsState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

export function useProducts() {
  const [state, setState] = useState<UseProductsState>({
    products: [],
    isLoading: true,
    error: null,
  });

  const loadingRef = useRef(false);

  const fetchProducts = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const mlProducts = await fetchAllSellerProducts();
      const convertedProducts = mlProducts.map(convertMLProduct);

      setState({
        products: convertedProducts,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error('Error fetching products:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Erro ao carregar produtos',
      }));
    } finally {
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filterValues = getUniqueValues(state.products);

  return {
    ...state,
    ...filterValues,
    refetch: fetchProducts,
  };
}
