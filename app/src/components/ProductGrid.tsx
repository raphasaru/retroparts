import type { Product } from '../data/products';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  query: string;
  isLoading?: boolean;
}

// Skeleton card component with shimmer animation
function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="bg-white dark:bg-carbon-800 border border-slate-200 dark:border-carbon-600/30 rounded-2xl overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image skeleton with shimmer */}
      <div className="relative aspect-square bg-slate-100 dark:bg-carbon-700 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent" />
      </div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Brand & model */}
        <div className="flex gap-2">
          <div className="h-3 w-16 bg-slate-200 dark:bg-carbon-700 rounded animate-pulse" />
          <div className="h-3 w-12 bg-slate-200 dark:bg-carbon-700 rounded animate-pulse" />
        </div>
        
        {/* Title lines */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-200 dark:bg-carbon-700 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-slate-200 dark:bg-carbon-700 rounded animate-pulse" />
        </div>
        
        {/* Tags */}
        <div className="flex gap-2 pt-1">
          <div className="h-5 w-16 bg-slate-200 dark:bg-carbon-700 rounded-md animate-pulse" />
          <div className="h-5 w-14 bg-slate-200 dark:bg-carbon-700 rounded-md animate-pulse" />
        </div>
        
        {/* Price section */}
        <div className="border-t border-slate-100 dark:border-carbon-600/30 pt-3 mt-3">
          <div className="h-7 w-28 bg-slate-200 dark:bg-carbon-700 rounded animate-pulse" />
          <div className="h-3 w-24 bg-slate-200 dark:bg-carbon-700 rounded mt-2 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({ products, query, isLoading = false }: ProductGridProps) {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: 9 }).map((_, index) => (
          <SkeletonCard key={index} index={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-slate-100 dark:bg-carbon-700 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-slate-400 dark:text-steel-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-display text-slate-900 dark:text-white mb-2">NENHUM PRODUTO ENCONTRADO</h3>
        <p className="text-slate-500 dark:text-steel-500 max-w-md">
          {query
            ? `Não encontramos resultados para "${query}". Tente termos mais genéricos ou verifique os filtros.`
            : 'Nenhum produto corresponde aos filtros selecionados. Tente ajustar os filtros.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}
