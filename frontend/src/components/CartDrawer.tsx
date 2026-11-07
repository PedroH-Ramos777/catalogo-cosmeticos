'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { formatCurrency } from '@/lib/utils';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import CheckoutModal from './CheckoutModal';

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalPrice,
  } = useCart();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const totalPrice = getTotalPrice();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-end">
        {/* Backdrop escurecido com desfoque de tela cheia */}
        <div
          onClick={closeCart}
          className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        />

        {/* iOS Bottom Sheet Container */}
        <div className="relative z-10 w-full max-w-lg mx-auto liquid-glass-sheet rounded-t-[2.5rem] flex flex-col max-h-[85vh] shadow-[0_-25px_60px_rgba(0,0,0,0.9)] animate-in slide-in-from-bottom duration-300">
          {/* iOS Grabber Handle */}
          <div className="pt-3 pb-1 cursor-pointer flex justify-center" onClick={closeCart}>
            <div className="w-12 h-1.5 bg-white/25 rounded-full" />
          </div>

          {/* Header da Folha */}
          <div className="px-6 py-3 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-extrabold text-white text-base leading-tight">Sua Sacola</h2>
                <p className="text-[11px] text-purple-300/70 font-medium">
                  {items.reduce((acc, i) => acc + i.quantity, 0)} {items.reduce((acc, i) => acc + i.quantity, 0) === 1 ? 'item' : 'itens'} selecionados
                </p>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors active:scale-95"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Lista de Itens (iOS Inset Style) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar">
            {items.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center p-6 text-purple-300/60">
                <div className="w-16 h-16 rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-purple-400 mb-3 shadow-inner">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <h3 className="font-bold text-white text-base mb-1">
                  Sua sacola está vazia
                </h3>
                <p className="text-xs text-purple-300/60 max-w-xs mb-5">
                  Explore nossos perfumes e cosméticos e toque em &quot;Pedir&quot; para adicionar.
                </p>
                <button
                  onClick={closeCart}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold rounded-2xl text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 rounded-2xl p-3 flex gap-3 transition-colors"
                >
                  {/* Foto do Produto */}
                  <div className="w-16 h-16 rounded-xl bg-purple-950/40 border border-white/10 flex-shrink-0 flex items-center justify-center overflow-hidden p-1 shadow-inner">
                    {item.product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <ShoppingBag className="w-5 h-5 text-purple-400/40" />
                    )}
                  </div>

                  {/* Informações e Controles */}
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-xs text-white line-clamp-1">
                          {item.product.name}
                        </h4>
                        <span className="text-[11px] text-purple-300/70 font-semibold block">
                          {formatCurrency(item.product.price)} un.
                        </span>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-neutral-400 hover:text-rose-400 p-1 transition-colors"
                        title="Remover produto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Stepper iOS & Subtotal */}
                    <div className="flex items-center justify-between pt-1.5">
                      <div className="flex items-center bg-white/[0.08] border border-white/10 rounded-xl overflow-hidden p-0.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors active:scale-95"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-black text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock_quantity}
                          className="w-7 h-7 flex items-center justify-center text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-extrabold text-white">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Rodapé da Folha com Total e CTA */}
          {items.length > 0 && (
            <div className="p-5 border-t border-white/[0.08] bg-[#0d071e]/90 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-purple-300/70 font-semibold block">Valor Total</span>
                  <span className="text-2xl font-black text-white tracking-tight">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>

                <button
                  onClick={clearCart}
                  className="text-xs text-purple-300/60 hover:text-rose-400 font-medium transition-colors"
                >
                  Limpar sacola
                </button>
              </div>

              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white py-4 px-6 rounded-2xl font-extrabold text-sm shadow-xl shadow-purple-600/30 border border-white/20 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Avançar para o Checkout</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Checkout Nativo iOS */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
}
