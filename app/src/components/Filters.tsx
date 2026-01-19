import type { Filters as FiltersType } from '../hooks/useSearch';
import { lados, comandos } from '../data/products';

interface FiltersProps {
  filters: FiltersType;
  updateFilter: (key: keyof FiltersType, value: FiltersType[keyof FiltersType]) => void;
  clearFilters: () => void;
  availableModelos: string[];
  marcas: string[];
  tiposPeca: string[];
  isOpen: boolean;
  onClose: () => void;
}

export function Filters({
  filters,
  updateFilter,
  clearFilters,
  availableModelos,
  marcas,
  tiposPeca,
  isOpen,
  onClose,
}: FiltersProps) {
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'freteGratis') return value === true;
    return value !== null;
  });

  const FilterSelect = ({
    label,
    value,
    options,
    onChange,
    placeholder = 'Todos',
  }: {
    label: string;
    value: string | null;
    options: readonly string[] | string[];
    onChange: (value: string | null) => void;
    placeholder?: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-500 dark:text-steel-400 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="w-full bg-white dark:bg-carbon-700 border border-slate-200 dark:border-carbon-500/50 rounded-lg px-4 py-3 text-slate-900 dark:text-white text-sm appearance-none cursor-pointer hover:border-amber-500/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all outline-none"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-steel-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );

  const FilterChip = ({
    label,
    isActive,
    onClick,
  }: {
    label: string;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? 'bg-amber-500 text-white dark:text-carbon-900 shadow-lg shadow-amber-500/20'
          : 'bg-slate-100 dark:bg-carbon-600 text-slate-600 dark:text-steel-400 hover:bg-slate-200 dark:hover:bg-carbon-500 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl text-slate-900 dark:text-white tracking-wide">FILTROS</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-amber-500 dark:text-amber-400 hover:text-amber-400 dark:hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpar filtros
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-carbon-500 to-transparent"></div>

      {/* Veículo Section */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Veículo
        </h4>

        <FilterSelect
          label="Marca"
          value={filters.marca}
          options={marcas}
          onChange={(value) => {
            updateFilter('marca', value);
            if (!value) updateFilter('modelo', null);
          }}
        />

        <FilterSelect
          label="Modelo"
          value={filters.modelo}
          options={availableModelos}
          onChange={(value) => updateFilter('modelo', value)}
          placeholder={filters.marca ? 'Todos os modelos' : 'Selecione a marca'}
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-carbon-500 to-transparent"></div>

      {/* Peça Section */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Tipo de Peça
        </h4>

        <FilterSelect
          label="Tipo"
          value={filters.tipoPeca}
          options={tiposPeca}
          onChange={(value) => updateFilter('tipoPeca', value)}
        />

        {/* Lado Chips */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-500 dark:text-steel-400 uppercase tracking-wider">
            Lado
          </label>
          <div className="flex flex-wrap gap-2">
            <FilterChip
              label="Todos"
              isActive={!filters.lado}
              onClick={() => updateFilter('lado', null)}
            />
            {lados.map((lado) => (
              <FilterChip
                key={lado}
                label={lado}
                isActive={filters.lado === lado}
                onClick={() => updateFilter('lado', filters.lado === lado ? null : lado)}
              />
            ))}
          </div>
        </div>

        {/* Comando Chips */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-500 dark:text-steel-400 uppercase tracking-wider">
            Comando
          </label>
          <div className="flex flex-wrap gap-2">
            <FilterChip
              label="Todos"
              isActive={!filters.comando}
              onClick={() => updateFilter('comando', null)}
            />
            {comandos.map((comando) => (
              <FilterChip
                key={comando}
                label={comando}
                isActive={filters.comando === comando}
                onClick={() => updateFilter('comando', filters.comando === comando ? null : comando)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-carbon-500 to-transparent"></div>

      {/* Preço Section */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Faixa de Preço
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 dark:text-steel-400 uppercase tracking-wider">
              Mínimo
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-steel-500 text-sm">R$</span>
              <input
                type="number"
                value={filters.precoMin || ''}
                onChange={(e) => updateFilter('precoMin', e.target.value ? Number(e.target.value) : null)}
                placeholder="0"
                className="w-full bg-white dark:bg-carbon-700 border border-slate-200 dark:border-carbon-500/50 rounded-lg pl-10 pr-4 py-3 text-slate-900 dark:text-white text-sm hover:border-amber-500/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500 dark:text-steel-400 uppercase tracking-wider">
              Máximo
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-steel-500 text-sm">R$</span>
              <input
                type="number"
                value={filters.precoMax || ''}
                onChange={(e) => updateFilter('precoMax', e.target.value ? Number(e.target.value) : null)}
                placeholder="500"
                className="w-full bg-white dark:bg-carbon-700 border border-slate-200 dark:border-carbon-500/50 rounded-lg pl-10 pr-4 py-3 text-slate-900 dark:text-white text-sm hover:border-amber-500/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Quick Price Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Até R$100', min: null, max: 100 },
            { label: 'R$100-200', min: 100, max: 200 },
            { label: 'R$200+', min: 200, max: null },
          ].map((range) => (
            <button
              key={range.label}
              onClick={() => {
                updateFilter('precoMin', range.min);
                updateFilter('precoMax', range.max);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filters.precoMin === range.min && filters.precoMax === range.max
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/50'
                  : 'bg-slate-100 dark:bg-carbon-600/50 text-slate-500 dark:text-steel-500 hover:text-slate-900 dark:hover:text-white border border-transparent'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-carbon-500 to-transparent"></div>

      {/* Frete Section */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          Entrega
        </h4>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={filters.freteGratis}
              onChange={(e) => updateFilter('freteGratis', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-slate-200 dark:bg-carbon-600 rounded-full peer-checked:bg-amber-500 transition-colors"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform"></div>
          </div>
          <span className="text-sm text-slate-600 dark:text-steel-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            Apenas com frete grátis
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-28 bg-white/80 dark:bg-carbon-800/50 backdrop-blur-sm border border-slate-200 dark:border-carbon-600/30 rounded-2xl p-6 max-h-[calc(100vh-7rem)] overflow-y-auto shadow-lg dark:shadow-none">
          {content}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-carbon-800 border-l border-slate-200 dark:border-carbon-600/30 overflow-y-auto animate-slide-in-right">
            <div className="sticky top-0 bg-white dark:bg-carbon-800 border-b border-slate-200 dark:border-carbon-600/30 px-6 py-4 flex items-center justify-between">
              <h3 className="font-display text-xl text-slate-900 dark:text-white">FILTROS</h3>
              <button
                onClick={onClose}
                className="p-2 text-slate-500 dark:text-steel-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {content}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
