'use client';

import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/lib/cart';
import { Plus, Check, Sparkles, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, items } = useCart();
  const [addedAnimation, setAddedAnimation] = useState(false);

  const cartItem = items.find((i) => i.product.id === product.id);
  const currentQuantityInCart = cartItem?.quantity || 0;
  const isOutOfStock = product.stock_quantity <= 0;
  const isMaxInCart = currentQuantityInCart >= product.stock_quantity;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock || isMaxInCart) return;

    addItem(product, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 900);
  };

  return (
    <div className="group liquid-glass-interactive rounded-[1.75rem] p-3 flex flex-col justify-between overflow-hidden relative">
      {/* Glow de fundo sutil no hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[1.75rem]" />

      <div>
        {/* Imagem do Produto */}
        <div className="relative aspect-square w-full rounded-2xl bg-gradient-to-b from-white/[0.08] to-purple-950/40 border border-white/10 overflow-hidden flex items-center justify-center p-2 mb-3 shadow-inner">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('fallback-active');
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-purple-300/40 gap-1.5">
              <Sparkles className="w-8 h-8 stroke-1" />
              <span className="text-[10px] text-purple-300/50 font-medium">Foto</span>
            </div>
          )}

          {/* Categoria em Pílula Translúcida */}
          <span className="absolute top-2.5 left-2.5 bg-[#090514]/70 backdrop-blur-md text-purple-200 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/15 shadow-sm">
            {product.category}
          </span>

          {/* Status do Estoque */}
          {isOutOfStock ? (
            <span className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md text-neutral-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10 shadow-sm">
              Esgotado
            </span>
          ) : isLowStock ? (
            <span className="absolute top-2.5 right-2.5 bg-amber-500/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-300/30 shadow-sm flex items-center gap-1">
              <AlertCircle className="w-2.5 h-2.5" />
              Restam {product.stock_quantity}
            </span>
          ) : null}
        </div>

        {/* Informações de Texto */}
        <div className="space-y-1 px-1">
          <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-purple-300 transition-colors">
            {product.name}
          </h3>
          <p className="text-[11px] text-purple-200/60 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Preço e Botão de Adicionar */}
      <div className="pt-3 mt-2 border-t border-white/[0.08] flex items-center justify-between gap-2 px-1">
        <div>
          <span className="text-[10px] text-purple-300/60 block font-medium">Por</span>
          <span className="text-sm sm:text-base font-extrabold text-white tracking-tight">
            {formatCurrency(product.price)}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isMaxInCart}
          className={`flex items-center justify-center gap-1 h-9 px-3 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-md ${
            addedAnimation
              ? 'bg-emerald-500 text-white shadow-emerald-500/30'
              : isOutOfStock
              ? 'bg-white/5 text-neutral-500 border border-white/5 cursor-not-allowed'
              : isMaxInCart
              ? 'bg-white/5 text-purple-300/40 border border-white/5 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white border border-white/20 shadow-purple-600/30'
          }`}
          aria-label={`Adicionar ${product.name} à sacola`}
        >
          {addedAnimation ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden xs:inline">Pronto</span>
            </>
          ) : isOutOfStock ? (
            <span>Fim</span>
          ) : isMaxInCart ? (
            <span>Máx</span>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden xs:inline">Pedir</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
