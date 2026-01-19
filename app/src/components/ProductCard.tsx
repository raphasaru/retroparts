import { useState } from 'react';
import type { Product } from '../data/products';

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const getBadgeColor = (tipoPeca: string) => {
    switch (tipoPeca) {
      case 'Retrovisor':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Carcaça':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Capa':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Motor':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Aro/Moldura':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Lente':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-steel-500/20 text-steel-400 border-steel-500/30';
    }
  };

  const getLadoIcon = (lado: string | null) => {
    if (lado === 'Esquerdo') {
      return (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      );
    }
    if (lado === 'Direito') {
      return (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      );
    }
    return null;
  };

  return (
    <a
      href={product.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative bg-carbon-800 border border-carbon-600/30 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 h-full flex flex-col">
        {/* Product Image */}
        <div className="relative h-48 bg-gradient-to-br from-carbon-700 to-carbon-800 overflow-hidden">
          {/* Real Image or Fallback */}
          {product.thumbnail && !imageError ? (
            <img
              src={product.thumbnail}
              alt={product.titulo}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            /* Fallback: Abstract Mirror Illustration */
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Mirror Body */}
                <div className="w-24 h-32 bg-gradient-to-br from-carbon-500 to-carbon-600 rounded-lg transform -rotate-12 shadow-2xl">
                  <div className="absolute inset-2 bg-gradient-to-br from-carbon-400/50 to-carbon-600/50 rounded-md">
                    {/* Reflection effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-md"></div>
                  </div>
                </div>
                {/* Mirror Arm */}
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-6 h-3 bg-carbon-500 rounded-l-full"></div>
              </div>
            </div>
          )}

          {/* Decorative Grid Overlay (only for fallback) */}
          {(!product.thumbnail || imageError) && (
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}></div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getBadgeColor(product.tipoPeca)}`}>
              {product.tipoPeca}
            </span>
            {product.freteGratis && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                GRÁTIS
              </span>
            )}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/10 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-amber-500 text-carbon-900 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Ver no ML
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Vehicle Info */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-amber-400">{product.marca}</span>
            <span className="text-carbon-500">•</span>
            <span className="text-xs text-steel-400">{product.modelo}</span>
            {product.anoInicio && product.anoFim && (
              <>
                <span className="text-carbon-500">•</span>
                <span className="text-xs text-steel-500">{product.anoInicio}-{product.anoFim}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-medium text-white leading-snug mb-3 line-clamp-2 group-hover:text-amber-400 transition-colors flex-1">
            {product.titulo}
          </h3>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {product.lado && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-carbon-700 text-steel-400">
                {getLadoIcon(product.lado)}
                {product.lado}
              </span>
            )}
            {product.comando && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-carbon-700 text-steel-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {product.comando}
              </span>
            )}
            {product.comPisca && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-400">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Pisca
              </span>
            )}
            {product.cor && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-carbon-700 text-steel-400">
                {product.cor}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="border-t border-carbon-600/30 pt-3 mt-auto">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-white">
                  {product.precoFormatado}
                </p>
                <p className="text-xs text-steel-500 mt-0.5">{product.parcelas}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-carbon-700 text-steel-500 uppercase">
                {product.condicao}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Glow Effect on Hover */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </a>
  );
}
