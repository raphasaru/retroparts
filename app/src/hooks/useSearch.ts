import { useState, useMemo, useCallback } from 'react';
import Fuse, { type IFuseOptions } from 'fuse.js';
import type { Product } from '../data/products';

export interface Filters {
  marca: string | null;
  modelo: string | null;
  tipoPeca: string | null;
  lado: string | null;
  comando: string | null;
  precoMin: number | null;
  precoMax: number | null;
  freteGratis: boolean;
}

export const initialFilters: Filters = {
  marca: null,
  modelo: null,
  tipoPeca: null,
  lado: null,
  comando: null,
  precoMin: null,
  precoMax: null,
  freteGratis: false,
};

export interface SearchSuggestion {
  type: 'product' | 'marca' | 'modelo' | 'tipoPeca' | 'combinacao';
  label: string;
  value: string;
  product?: Product;
  filters?: Partial<Filters>;
}

interface ExtractedPattern {
  modelo?: string;
  lado?: string;
  comando?: string;
  tipoPeca?: string;
}

interface UseSearchOptions {
  products: Product[];
  marcas: string[];
  modelos: string[];
  tiposPeca: string[];
}

export function useSearch({ products, marcas, modelos, tiposPeca }: UseSearchOptions) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>(initialFilters);

  // Configuração do Fuse.js para busca fuzzy
  const fuseOptions: IFuseOptions<Product> = useMemo(() => ({
    keys: [
      { name: 'titulo', weight: 0.4 },
      { name: 'marca', weight: 0.2 },
      { name: 'modelo', weight: 0.2 },
      { name: 'tipoPeca', weight: 0.1 },
      { name: 'lado', weight: 0.05 },
      { name: 'comando', weight: 0.05 },
    ],
    threshold: 0.4,
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 2,
  }), []);

  // Instância do Fuse - recria quando products mudam
  const fuse = useMemo(() => new Fuse(products, fuseOptions), [products, fuseOptions]);

  // Filtrar produtos baseado na busca e filtros
  const filteredProducts = useMemo(() => {
    let results = products;

    // Aplicar busca textual
    if (query.trim().length >= 2) {
      const fuseResults = fuse.search(query);
      results = fuseResults.map(r => r.item);
    }

    // Aplicar filtros estruturados
    if (filters.marca) {
      results = results.filter(p => p.marca === filters.marca);
    }
    if (filters.modelo) {
      results = results.filter(p => p.modelo === filters.modelo);
    }
    if (filters.tipoPeca) {
      results = results.filter(p => p.tipoPeca === filters.tipoPeca);
    }
    if (filters.lado) {
      results = results.filter(p => p.lado === filters.lado);
    }
    if (filters.comando) {
      results = results.filter(p => p.comando === filters.comando);
    }
    if (filters.precoMin !== null) {
      results = results.filter(p => p.preco >= filters.precoMin!);
    }
    if (filters.precoMax !== null) {
      results = results.filter(p => p.preco <= filters.precoMax!);
    }
    if (filters.freteGratis) {
      results = results.filter(p => p.freteGratis);
    }

    return results;
  }, [query, filters, fuse, products]);

  // Gerar sugestões de autocomplete
  const suggestions = useMemo((): SearchSuggestion[] => {
    if (query.trim().length < 2) return [];

    const suggestionsList: SearchSuggestion[] = [];
    const queryLower = query.toLowerCase();
    const seen = new Set<string>();

    // Sugestões de marca
    for (const marca of marcas) {
      if (marca.toLowerCase().includes(queryLower) && !seen.has(`marca:${marca}`)) {
        suggestionsList.push({
          type: 'marca',
          label: `Marca: ${marca}`,
          value: marca,
          filters: { marca },
        });
        seen.add(`marca:${marca}`);
      }
    }

    // Sugestões de modelo
    for (const modelo of modelos) {
      if (modelo.toLowerCase().includes(queryLower) && !seen.has(`modelo:${modelo}`)) {
        const product = products.find(p => p.modelo === modelo);
        suggestionsList.push({
          type: 'modelo',
          label: `${product?.marca} ${modelo}`,
          value: modelo,
          filters: { marca: product?.marca || null, modelo },
        });
        seen.add(`modelo:${modelo}`);
      }
    }

    // Sugestões de tipo de peça
    for (const tipo of tiposPeca) {
      if (tipo.toLowerCase().includes(queryLower) && !seen.has(`tipo:${tipo}`)) {
        suggestionsList.push({
          type: 'tipoPeca',
          label: `Tipo: ${tipo}`,
          value: tipo,
          filters: { tipoPeca: tipo },
        });
        seen.add(`tipo:${tipo}`);
      }
    }

    // Sugestões de produtos específicos (limitado a 5)
    const fuseResults = fuse.search(query, { limit: 5 });
    for (const result of fuseResults) {
      if (!seen.has(`product:${result.item.id}`)) {
        suggestionsList.push({
          type: 'product',
          label: result.item.titulo,
          value: result.item.titulo,
          product: result.item,
        });
        seen.add(`product:${result.item.id}`);
      }
    }

    // Sugestões combinadas inteligentes
    const patterns: Array<{
      regex: RegExp;
      extract: (m: RegExpMatchArray) => ExtractedPattern;
    }> = [
      { regex: /(\w+)\s+(esquerdo|direito)/i, extract: (m) => ({ modelo: m[1], lado: m[2] }) },
      { regex: /(\w+)\s+(manual|el[eé]trico|fixo)/i, extract: (m) => ({ modelo: m[1], comando: m[2] }) },
      { regex: /(retrovisor|capa|carca[cç]a)\s+(\w+)/i, extract: (m) => ({ tipoPeca: m[1], modelo: m[2] }) },
    ];

    for (const pattern of patterns) {
      const match = query.match(pattern.regex);
      if (match) {
        const extracted = pattern.extract(match);
        const matchingProducts = products.filter(p => {
          let matches = true;
          if (extracted.modelo) {
            matches = matches && p.modelo.toLowerCase().includes(extracted.modelo.toLowerCase());
          }
          if (extracted.lado) {
            matches = matches && p.lado?.toLowerCase() === extracted.lado.toLowerCase();
          }
          if (extracted.comando) {
            const comandoNorm = extracted.comando.toLowerCase().replace('é', 'e');
            matches = matches && p.comando?.toLowerCase().replace('é', 'e') === comandoNorm;
          }
          if (extracted.tipoPeca) {
            matches = matches && p.tipoPeca.toLowerCase().includes(extracted.tipoPeca.toLowerCase());
          }
          return matches;
        });

        if (matchingProducts.length > 0 && matchingProducts.length <= 10) {
          const firstMatch = matchingProducts[0];
          const combinedLabel = `${firstMatch.tipoPeca} ${firstMatch.modelo} ${firstMatch.lado || ''} ${firstMatch.comando || ''}`.trim();
          if (!seen.has(`combined:${combinedLabel}`)) {
            suggestionsList.push({
              type: 'combinacao',
              label: `${combinedLabel} (${matchingProducts.length} produtos)`,
              value: combinedLabel,
              filters: {
                modelo: firstMatch.modelo || null,
                lado: firstMatch.lado || null,
                comando: firstMatch.comando || null,
                tipoPeca: firstMatch.tipoPeca || null,
              },
            });
            seen.add(`combined:${combinedLabel}`);
          }
        }
      }
    }

    return suggestionsList.slice(0, 10);
  }, [query, fuse, products, marcas, modelos, tiposPeca]);

  // Handlers
  const updateFilter = useCallback((key: keyof Filters, value: Filters[keyof Filters]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setQuery('');
  }, []);

  const applySuggestion = useCallback((suggestion: SearchSuggestion) => {
    if (suggestion.product) {
      setQuery(suggestion.product.titulo);
    } else if (suggestion.filters) {
      setFilters(prev => ({ ...prev, ...suggestion.filters }));
      setQuery('');
    }
  }, []);

  // Modelos disponíveis baseado na marca selecionada
  const availableModelos = useMemo(() => {
    if (!filters.marca) {
      return modelos;
    }
    return [...new Set(
      products
        .filter(p => p.marca === filters.marca)
        .map(p => p.modelo)
        .filter(Boolean)
    )].sort();
  }, [filters.marca, products, modelos]);

  return {
    query,
    setQuery,
    filters,
    updateFilter,
    clearFilters,
    filteredProducts,
    suggestions,
    applySuggestion,
    availableModelos,
    totalProducts: products.length,
  };
}
