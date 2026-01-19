import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-carbon-900/95 backdrop-blur-md border-b border-slate-200/50 dark:border-carbon-600/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center transform -rotate-6 shadow-lg shadow-amber-500/20">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-white dark:text-carbon-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl text-slate-900 dark:text-white tracking-wide">
                RETRO<span className="text-amber-500">PARTS</span>
              </h1>
              <p className="text-[10px] md:text-xs text-slate-500 dark:text-steel-400 tracking-[0.2em] uppercase -mt-1">
                Retrovisores Originais
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-slate-600 dark:text-steel-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors text-sm font-medium tracking-wide">
              Catálogo
            </a>
            <a href="#" className="text-slate-600 dark:text-steel-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors text-sm font-medium tracking-wide">
              Sobre
            </a>
            <a href="#" className="text-slate-600 dark:text-steel-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors text-sm font-medium tracking-wide">
              Contato
            </a>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-carbon-800 text-slate-600 dark:text-steel-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-200 dark:hover:bg-carbon-700 transition-all"
              title={isDark ? 'Modo claro' : 'Modo escuro'}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <a
              href="https://www.mercadolivre.com.br/perfil/RETROPARTS1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white dark:text-carbon-900 px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:shadow-lg hover:shadow-amber-500/20"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              Mercado Livre
            </a>
          </nav>

          {/* Mobile: Theme Toggle + Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-carbon-800 text-slate-600 dark:text-steel-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-steel-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
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
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200/50 dark:border-carbon-600/50 animate-fade-in">
            <nav className="flex flex-col gap-4">
              <a href="#" className="text-slate-600 dark:text-steel-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors text-sm font-medium tracking-wide">
                Catálogo
              </a>
              <a href="#" className="text-slate-600 dark:text-steel-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors text-sm font-medium tracking-wide">
                Sobre
              </a>
              <a href="#" className="text-slate-600 dark:text-steel-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors text-sm font-medium tracking-wide">
                Contato
              </a>
              <a
                href="https://www.mercadolivre.com.br/perfil/RETROPARTS1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white dark:text-carbon-900 px-4 py-3 rounded-lg font-semibold text-sm transition-all"
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
