'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import FloatingDock from '@/components/FloatingDock';
import { fetchProducts, fetchCategories } from '@/lib/api';
import { Product } from '@/types';
import { Search, Sparkles, RefreshCw } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [prodRes, cats] = await Promise.all([
        fetchProducts({
          category: selectedCategory || undefined,
          search: searchTerm || undefined,
          availableOnly: availableOnly || undefined,
        }),
        fetchCategories(),
      ]);

      setProducts(prodRes.products);
      setCategories(cats);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Não foi possível conectar ao servidor. Verifique se o backend está em execução.');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerm, availableOnly]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadData]);

  return (
    <div className="min-h-screen bg-[#090514] text-white flex flex-col font-sans relative overflow-x-hidden pb-24">
      {/* Luzes difusas flutuantes de fundo (Mesh Orbs para refração do vidro líquido) */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-700/20 blur-[130px] pointer-events-none animate-float-slow" />
      <div className="fixed bottom-[10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-fuchsia-600/15 blur-[120px] pointer-events-none animate-float-reverse" />
      <div className="fixed top-[40%] right-[15%] w-[350px] h-[350px] rounded-full bg-violet-800/15 blur-[100px] pointer-events-none" />

      {/* Header Estilo iOS */}
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-5 space-y-6 relative z-10">
        {/* Banner Hero Liquid Glass */}
        <div className="relative rounded-[2rem] liquid-glass p-6 sm:p-8 overflow-hidden border-purple-500/25">
          {/* Brilho interno do gradiente */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-purple-500/20 via-fuchsia-500/20 to-transparent rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 space-y-2.5 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] border border-white/15 text-[11px] font-bold text-purple-200">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Pronta Entrega & Encomendas</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Vitrine Exclusiva de <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-300 to-white">
                Perfumaria & Cosméticos
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-purple-200/70 leading-relaxed">
              Monte sua sacola em poucos toques e feche seu pedido direto no WhatsApp do seu consultor.
            </p>
          </div>
        </div>

        {/* Barra de Busca & Filtros Estilo iOS */}
        <div className="space-y-3.5">
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            {/* Campo de Busca em Cápsula iOS */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/50" />
              <input
                type="text"
                placeholder="Buscar perfume, hidratante, batom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/10 focus:border-purple-400 text-white placeholder:text-purple-300/40 text-xs sm:text-sm focus:outline-none transition-all shadow-inner"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/10 text-purple-200 hover:text-white flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Toggle "Apenas em estoque" estilo iOS Switch */}
            <label className="flex items-center gap-2 self-start sm:self-center px-3.5 py-2 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 cursor-pointer select-none transition-colors">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded accent-purple-600 w-4 h-4"
              />
              <span className="text-xs font-semibold text-purple-200/80">Apenas disponíveis</span>
            </label>
          </div>

          {/* Segmented Control iOS (Pills de Categorias) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap transition-all duration-300 active:scale-95 ${
                selectedCategory === ''
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-600/30 border border-white/20'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-purple-200/70 border border-white/10'
              }`}
            >
              Todos os Itens
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-600/30 border border-white/20'
                      : 'bg-white/[0.05] hover:bg-white/[0.1] text-purple-200/70 border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Estado da Grade de Produtos */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="liquid-glass rounded-[1.75rem] p-3 space-y-3 animate-pulse border-white/5"
              >
                <div className="aspect-square bg-white/[0.05] rounded-2xl" />
                <div className="h-4 bg-white/[0.06] rounded-md w-3/4" />
                <div className="h-3 bg-white/[0.04] rounded-md w-1/2" />
                <div className="h-7 bg-white/[0.06] rounded-xl w-1/3 mt-2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="liquid-glass rounded-3xl p-8 text-center space-y-3 max-w-md mx-auto border-purple-500/30">
            <div className="w-12 h-12 bg-purple-600/20 text-purple-400 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">Falha ao carregar vitrine</h3>
            <p className="text-xs text-purple-300/70 leading-relaxed">{error}</p>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Tentar Novamente
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="liquid-glass rounded-3xl p-12 text-center space-y-3">
            <div className="w-14 h-14 bg-white/[0.05] text-purple-300/60 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-7 h-7 stroke-1" />
            </div>
            <h3 className="font-bold text-white text-base">Nenhum produto encontrado</h3>
            <p className="text-xs text-purple-300/60 max-w-sm mx-auto">
              Tente buscar por outro termo ou escolha outra categoria para visualizar os itens.
            </p>
            {(selectedCategory || searchTerm || availableOnly) && (
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSearchTerm('');
                  setAvailableOnly(false);
                }}
                className="mt-2 text-xs font-bold text-fuchsia-400 hover:text-fuchsia-300 underline"
              >
                Limpar todos os filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Dock (Dynamic Island Style) */}
      <FloatingDock />

      {/* iOS Bottom Sheet do Carrinho */}
      <CartDrawer />

      {/* Rodapé Minimalista */}
      <footer className="mt-12 py-6 text-center text-[11px] text-purple-300/40 space-y-1 relative z-10 border-t border-white/[0.04]">
        <p className="font-semibold text-purple-200/60">Catálogo Express de Cosméticos</p>
        <p>Desenvolvido para pedidos rápidos e organizados via WhatsApp.</p>
      </footer>
    </div>
  );
}
