'use client';

import Link from 'next/link';
import { Sparkles, Shield, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export default function Header() {
  const { openCart, getTotalItems } = useCart();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const totalItems = mounted ? getTotalItems() : 0;

  return (
    <header className="sticky top-0 z-40 bg-[#090514]/70 backdrop-blur-2xl border-b border-purple-500/15 shadow-2xl">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-all duration-300 border border-white/20">
            <Sparkles className="w-5 h-5 text-purple-100" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight text-white leading-tight">
                Catálogo<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">Express</span>
              </h1>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-purple-300/70 font-medium tracking-wide">
              Perfumaria & Cosméticos
            </p>
          </div>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-200/80 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 rounded-full transition-all active:scale-95 backdrop-blur-md"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Lojista</span>
          </Link>

          <button
            onClick={openCart}
            className="relative flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white px-3.5 py-1.5 rounded-full font-semibold text-xs shadow-lg shadow-purple-600/30 border border-white/20 transition-all active:scale-95"
            aria-label="Abrir sacola de compras"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden xs:inline">Sacola</span>
            {totalItems > 0 && (
              <span className="bg-fuchsia-400 text-[#090514] font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
