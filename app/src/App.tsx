import { useState } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { Filters } from './components/Filters';
import { ProductGrid } from './components/ProductGrid';
import { useProducts } from './hooks/useProducts';
import { useSearch } from './hooks/useSearch';

function App() {
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Fetch products from ML API
  const {
    products,
    isLoading,
    error,
    marcas,
    modelos,
    tiposPeca,
    refetch,
  } = useProducts();

  // Search and filter logic
  const {
    query,
    setQuery,
    filters,
    updateFilter,
    clearFilters,
    filteredProducts,
    suggestions,
    applySuggestion,
    availableModelos,
    totalProducts,
  } = useSearch({ products, marcas, modelos, tiposPeca });

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'freteGratis') return value === true;
    return value !== null;
  }).length;

  return (
    <div className="min-h-screen bg-carbon-900">
      {/* Background Texture */}
      <div className="fixed inset-0 bg-carbon-texture pointer-events-none"></div>

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-8 md:pb-12 overflow-visible">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Text */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-white tracking-wide mb-4">
              ENCONTRE A PEÇA
              <span className="block text-amber-400">PERFEITA</span>
            </h2>
            <p className="text-steel-400 text-lg md:text-xl max-w-2xl mx-auto">
              Retrovisores e componentes originais usados para todas as marcas.
              Busca inteligente que entende o que você precisa.
            </p>
          </div>

          {/* Search Bar */}
          <SearchBar
            query={query}
            setQuery={setQuery}
            suggestions={suggestions}
            onSuggestionSelect={applySuggestion}
            resultsCount={filteredProducts.length}
            totalCount={totalProducts}
            isLoading={isLoading}
          />

          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-6 md:gap-12 mt-8 text-center">
            <div>
              <p className="font-display text-2xl md:text-3xl text-amber-400">
                {isLoading ? '...' : totalProducts}
              </p>
              <p className="text-xs text-steel-500 uppercase tracking-wider">Produtos</p>
            </div>
            <div className="w-px h-10 bg-carbon-600"></div>
            <div>
              <p className="font-display text-2xl md:text-3xl text-white">
                {isLoading ? '...' : marcas.length}
              </p>
              <p className="text-xs text-steel-500 uppercase tracking-wider">Marcas</p>
            </div>
            <div className="w-px h-10 bg-carbon-600"></div>
            <div>
              <p className="font-display text-2xl md:text-3xl text-white">
                {isLoading ? '...' : tiposPeca.length}
              </p>
              <p className="text-xs text-steel-500 uppercase tracking-wider">Tipos</p>
            </div>
          </div>

          {/* API Status Indicator */}
          {!isLoading && !error && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-steel-500">Dados em tempo real do Mercado Livre</span>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
            <p className="text-red-400 mb-2">{error}</p>
            <button
              onClick={refetch}
              className="text-sm text-amber-400 hover:text-amber-300 underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setFiltersOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-carbon-800 border border-carbon-600/50 rounded-xl px-4 py-3 text-white font-medium hover:border-amber-500/50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtros
            {activeFiltersCount > 0 && (
              <span className="bg-amber-500 text-carbon-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <Filters
            filters={filters}
            updateFilter={updateFilter}
            clearFilters={clearFilters}
            availableModelos={availableModelos}
            marcas={marcas}
            tiposPeca={tiposPeca}
            isOpen={filtersOpen}
            onClose={() => setFiltersOpen(false)}
          />

          {/* Products Section */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-xl text-white">
                  {isLoading
                    ? 'CARREGANDO...'
                    : filteredProducts.length === totalProducts
                    ? 'TODOS OS PRODUTOS'
                    : `${filteredProducts.length} RESULTADO${filteredProducts.length !== 1 ? 'S' : ''}`}
                </h3>
                {query && (
                  <p className="text-sm text-steel-500 mt-1">
                    Buscando por: <span className="text-amber-400">"{query}"</span>
                  </p>
                )}
              </div>

              {/* Sort Dropdown (Visual only for MVP) */}
              <div className="hidden sm:block">
                <select className="bg-carbon-800 border border-carbon-600/50 rounded-lg px-4 py-2 text-sm text-steel-400 appearance-none cursor-pointer hover:border-amber-500/50 focus:border-amber-500 outline-none pr-10 relative">
                  <option>Mais relevantes</option>
                  <option>Menor preço</option>
                  <option>Maior preço</option>
                </select>
              </div>
            </div>

            {/* Active Filters Pills */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs text-steel-500 uppercase tracking-wider">Filtros ativos:</span>
                {filters.marca && (
                  <button
                    onClick={() => updateFilter('marca', null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium hover:bg-amber-500/20 transition-colors"
                  >
                    {filters.marca}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {filters.modelo && (
                  <button
                    onClick={() => updateFilter('modelo', null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium hover:bg-amber-500/20 transition-colors"
                  >
                    {filters.modelo}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {filters.tipoPeca && (
                  <button
                    onClick={() => updateFilter('tipoPeca', null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium hover:bg-amber-500/20 transition-colors"
                  >
                    {filters.tipoPeca}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {filters.lado && (
                  <button
                    onClick={() => updateFilter('lado', null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium hover:bg-amber-500/20 transition-colors"
                  >
                    {filters.lado}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {filters.comando && (
                  <button
                    onClick={() => updateFilter('comando', null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium hover:bg-amber-500/20 transition-colors"
                  >
                    {filters.comando}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {filters.freteGratis && (
                  <button
                    onClick={() => updateFilter('freteGratis', false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-medium hover:bg-green-500/20 transition-colors"
                  >
                    Frete grátis
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {(filters.precoMin || filters.precoMax) && (
                  <button
                    onClick={() => {
                      updateFilter('precoMin', null);
                      updateFilter('precoMax', null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-xs font-medium hover:bg-amber-500/20 transition-colors"
                  >
                    {filters.precoMin && filters.precoMax
                      ? `R$${filters.precoMin}-${filters.precoMax}`
                      : filters.precoMin
                      ? `A partir de R$${filters.precoMin}`
                      : `Até R$${filters.precoMax}`}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Product Grid */}
            <ProductGrid products={filteredProducts} query={query} isLoading={isLoading} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-carbon-700/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-carbon-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="font-display text-lg text-white">RETRO<span className="text-amber-400">PARTS</span></span>
            </div>
            <p className="text-sm text-steel-500">
              Dados em tempo real via API do Mercado Livre. Todos os produtos redirecionam para o ML.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.mercadolivre.com.br/perfil/RETROPARTS1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-steel-400 hover:text-amber-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
