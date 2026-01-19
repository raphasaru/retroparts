import { useState } from 'react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-carbon-900/95 backdrop-blur-md border-b border-carbon-600/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center transform -rotate-6 shadow-lg shadow-amber-500/20">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-carbon-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl text-white tracking-wide">
                RETRO<span className="text-amber-400">PARTS</span>
              </h1>
              <p className="text-[10px] md:text-xs text-steel-400 tracking-[0.2em] uppercase -mt-1">
                Retrovisores Originais
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-steel-400 hover:text-amber-400 transition-colors text-sm font-medium tracking-wide">
              Catálogo
            </a>
            <a href="#" className="text-steel-400 hover:text-amber-400 transition-colors text-sm font-medium tracking-wide">
              Sobre
            </a>
            <a href="#" className="text-steel-400 hover:text-amber-400 transition-colors text-sm font-medium tracking-wide">
              Contato
            </a>
            <a
              href="https://www.mercadolivre.com.br/perfil/RETROPARTS1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-carbon-900 px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:shadow-lg hover:shadow-amber-500/20"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              Mercado Livre
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-steel-400 hover:text-amber-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-carbon-600/50 animate-fade-in">
            <nav className="flex flex-col gap-4">
              <a href="#" className="text-steel-400 hover:text-amber-400 transition-colors text-sm font-medium tracking-wide">
                Catálogo
              </a>
              <a href="#" className="text-steel-400 hover:text-amber-400 transition-colors text-sm font-medium tracking-wide">
                Sobre
              </a>
              <a href="#" className="text-steel-400 hover:text-amber-400 transition-colors text-sm font-medium tracking-wide">
                Contato
              </a>
              <a
                href="https://www.mercadolivre.com.br/perfil/RETROPARTS1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-carbon-900 px-4 py-3 rounded-lg font-semibold text-sm transition-all"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                Ver no Mercado Livre
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
