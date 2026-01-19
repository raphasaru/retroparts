import type { Product } from '../data/products';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  query: string;
  isLoading?: boolean;
}

export function ProductGrid({ products, query, isLoading = false }: ProductGridProps) {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="bg-carbon-800 border border-carbon-600/30 rounded-2xl overflow-hidden animate-pulse"
          >
            <div className="h-48 bg-carbon-700"></div>
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <div className="h-3 w-16 bg-carbon-700 rounded"></div>
                <div className="h-3 w-12 bg-carbon-700 rounded"></div>
              </div>
              <div className="h-4 w-full bg-carbon-700 rounded"></div>
              <div className="h-4 w-3/4 bg-carbon-700 rounded"></div>
              <div className="flex gap-2 pt-2">
                <div className="h-5 w-16 bg-carbon-700 rounded"></div>
                <div className="h-5 w-16 bg-carbon-700 rounded"></div>
              </div>
              <div className="border-t border-carbon-600/30 pt-3 mt-3">
                <div className="h-6 w-24 bg-carbon-700 rounded"></div>
                <div className="h-3 w-32 bg-carbon-700 rounded mt-2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-carbon-700 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-steel-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-display text-white mb-2">NENHUM PRODUTO ENCONTRADO</h3>
        <p className="text-steel-500 max-w-md">
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
