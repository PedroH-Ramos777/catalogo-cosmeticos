'use client';

import { useCart } from '@/lib/cart';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export default function FloatingDock() {
  const { openCart, getTotalItems, getTotalPrice } = useCart();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const totalItems = mounted ? getTotalItems() : 0;
  const totalPrice = mounted ? getTotalPrice() : 0;

  if (!mounted || totalItems === 0) return null;

  return (
    <div className="fixed bottom-4 inset-x-0 z-40 px-4 flex justify-center pointer-events-none animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="pointer-events-auto max-w-md w-full bg-[#150a2b]/85 backdrop-blur-2xl border border-purple-500/30 rounded-full px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(168,85,247,0.25)] flex items-center justify-between gap-3">
        {/* Left: Bag & Count */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30 border border-white/20">
            <ShoppingBag className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 bg-fuchsia-400 text-[#090514] font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {totalItems}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-purple-300/70 font-semibold block leading-tight">
              {totalItems} {totalItems === 1 ? 'item' : 'itens'} na sacola
            </span>
            <span className="text-sm font-extrabold text-white leading-tight">
              {formatCurrency(totalPrice)}
            </span>
          </div>
        </div>

        {/* Right: Action Button */}
        <button
          onClick={openCart}
          className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white px-4 py-2 rounded-full font-bold text-xs shadow-lg shadow-purple-600/30 border border-white/20 transition-all active:scale-95"
        >
          <span>Finalizar</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}

