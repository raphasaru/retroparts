import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchSellerProductsBatch } from '../services/mercadolivre';
import { convertMLProduct, getUniqueValues } from '../data/products';
import type { Product } from '../data/products';

interface UseProductsState {
  products: Product[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  totalFromAPI: number;
  loadedCount: number;
  lastUpdated: Date | null;
  hasMore: boolean;
}

const BATCH_SIZE = 100; // Products per batch

export function useProducts() {
  const [state, setState] = useState<UseProductsState>({
    products: [],
    isLoading: true,
    isLoadingMore: false,
    error: null,
    totalFromAPI: 0,
    loadedCount: 0,
    lastUpdated: null,
    hasMore: true,
  });

  const loadingRef = useRef(false);
  const currentBatchRef = useRef(0);

  const loadBatch = useCallback(async (batch: number, append: boolean = false) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      if (!append) {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
      } else {
        setState(prev => ({ ...prev, isLoadingMore: true }));
      }

      const batchData = await fetchSellerProductsBatch(batch, BATCH_SIZE);
      const convertedProducts = batchData.results.map(convertMLProduct);

      setState(prev => ({
        products: append ? [...prev.products, ...convertedProducts] : convertedProducts,
        isLoading: false,
        isLoadingMore: false,
        error: null,
        totalFromAPI: batchData.total,
        loadedCount: append ? prev.loadedCount + convertedProducts.length : convertedProducts.length,
        lastUpdated: new Date(),
        hasMore: batchData.hasMore,
      }));

      currentBatchRef.current = batch;
    } catch (err) {
      console.error('Error fetching products batch:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isLoadingMore: false,
        error: err instanceof Error ? err.message : 'Erro ao carregar produtos',
      }));
    } finally {
      loadingRef.current = false;
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!state.hasMore || loadingRef.current) return;
    loadBatch(currentBatchRef.current + 1, true);
  }, [state.hasMore, loadBatch]);

  const fetchProducts = useCallback(async () => {
    // Reset and load first batch
    currentBatchRef.current = 0;
    await loadBatch(0, false);
  }, [loadBatch]);

  // Initial fetch - load first batch immediately
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Auto-load more batches in background
  useEffect(() => {
    if (!state.isLoading && state.hasMore && state.products.length < 300) {
      // Load next batch after a short delay
      const timer = setTimeout(() => {
        if (!loadingRef.current) {
          loadBatch(currentBatchRef.current + 1, true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.isLoading, state.hasMore, state.products.length, loadBatch]);

  // Get unique values for filters
  const filterValues = getUniqueValues(state.products);

  return {
    ...state,
    ...filterValues,
    refetch: fetchProducts,
    loadMore,
  };
}
