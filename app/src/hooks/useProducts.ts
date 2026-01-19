import { useState, useEffect, useCallback } from 'react';
import { fetchAllSellerProducts } from '../services/mercadolivre';
import { convertMLProduct, getUniqueValues } from '../data/products';
import type { Product } from '../data/products';

interface UseProductsState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  totalFromAPI: number;
  lastUpdated: Date | null;
}

export function useProducts() {
  const [state, setState] = useState<UseProductsState>({
    products: [],
    isLoading: true,
    error: null,
    totalFromAPI: 0,
    lastUpdated: null,
  });

  const fetchProducts = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const mlProducts = await fetchAllSellerProducts();
      const convertedProducts = mlProducts.map(convertMLProduct);

      setState({
        products: convertedProducts,
        isLoading: false,
        error: null,
        totalFromAPI: mlProducts.length,
        lastUpdated: new Date(),
      });
    } catch (err) {
      console.error('Error fetching products:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Erro ao carregar produtos',
      }));
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Get unique values for filters
  const filterValues = getUniqueValues(state.products);

  return {
    ...state,
    ...filterValues,
    refetch: fetchProducts,
  };
}
