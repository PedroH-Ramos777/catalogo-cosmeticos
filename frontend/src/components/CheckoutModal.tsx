'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { createCheckout } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { OrderCreate } from '@/types';
import { X, Send, CreditCard, QrCode, Banknote, Sparkles, CheckCircle2, MapPin, User, ShieldCheck } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, getTotalPrice, clearCart, closeCart } = useCart();
  const totalPrice = getTotalPrice();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successLink, setSuccessLink] = useState<string | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [complement, setComplement] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Pix' | 'Dinheiro' | 'Cartão de Crédito' | 'Cartão de Débito'>('Pix');
  const [installments, setInstallments] = useState(1);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || !customerPhone.trim() || !street.trim() || !number.trim() || !neighborhood.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    if (items.length === 0) {
      setError('Sua sacola está vazia.');
      return;
    }

    try {
      setLoading(true);

      const orderData: OrderCreate = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.replace(/\D/g, ''),
        street: street.trim(),
        number: number.trim(),
        neighborhood: neighborhood.trim(),
        complement: complement.trim() || undefined,
        payment_method: paymentMethod,
        installments: paymentMethod === 'Cartão de Crédito' ? installments : 1,
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      };

      const response = await createCheckout(orderData);

      setSuccessLink(response.whatsapp_url);
      clearCart();

      // Abrir o WhatsApp automaticamente em nova janela
      window.open(response.whatsapp_url, '_blank');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro ao finalizar o pedido. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFinishAndClose = () => {
    setSuccessLink(null);
    onClose();
    closeCart();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-end">
      {/* Backdrop com desfoque */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
      />

      {/* iOS Bottom Sheet Container */}
      <div className="relative z-10 w-full max-w-lg mx-auto liquid-glass-sheet rounded-t-[2.5rem] flex flex-col max-h-[92vh] shadow-[0_-25px_60px_rgba(0,0,0,0.9)] animate-in slide-in-from-bottom duration-300">
        {/* iOS Grabber */}
        <div className="pt-3 pb-1 cursor-pointer flex justify-center" onClick={onClose}>
          <div className="w-12 h-1.5 bg-white/25 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-3 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h2 className="font-extrabold text-white text-base">Finalizar Pedido</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors active:scale-95"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo da Folha */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 no-scrollbar">
          {successLink ? (
            /* Tela de Sucesso */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-white">
                  Pedido Pronto para Envio!
                </h3>
                <p className="text-xs text-purple-200/70 max-w-xs mx-auto">
                  A conversa no WhatsApp com o lojista foi iniciada com a sua comanda formatada.
                </p>
              </div>

              <div className="pt-3 flex flex-col gap-2.5">
                <a
                  href={successLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white py-4 px-6 rounded-2xl font-extrabold text-sm shadow-xl shadow-emerald-500/30 border border-white/20 transition-all active:scale-98"
                >
                  <Send className="w-4 h-4" />
                  Abrir WhatsApp Agora
                </a>
                <button
                  type="button"
                  onClick={handleFinishAndClose}
                  className="w-full text-purple-300/80 hover:text-white py-2 text-xs font-semibold transition-colors"
                >
                  Voltar ao Catálogo
                </button>
              </div>
            </div>
          ) : (
            /* Formulário de Checkout iOS Grouped */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-200 rounded-2xl text-xs font-semibold">
                  {error}
                </div>
              )}

              {/* Card Resumo do Total */}
              <div className="liquid-glass rounded-2xl p-4 flex items-center justify-between border-purple-500/30">
                <div>
                  <span className="text-[11px] text-purple-300/80 font-bold block">Total a pagar:</span>
                  <span className="text-2xl font-black text-white tracking-tight">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
                <span className="text-xs bg-purple-500/20 border border-purple-400/30 text-purple-200 font-semibold px-3 py-1 rounded-full">
                  {items.reduce((acc, i) => acc + i.quantity, 0)} itens
                </span>
              </div>

              {/* Grupo 1: Dados Pessoais */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-purple-300/70 uppercase tracking-wider flex items-center gap-1.5 px-1">
                  <User className="w-3 h-3 text-purple-400" />
                  <span>1. Seus Dados</span>
                </label>
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3 space-y-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Seu Nome Completo *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-purple-300/40 text-xs sm:text-sm focus:outline-none focus:border-purple-400 focus:bg-white/[0.1] transition-all"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="WhatsApp (ex: 83 99415-9831) *"
                    value={customerPhone}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
                      if (raw.length <= 2) {
                        setCustomerPhone(raw);
                      } else if (raw.length <= 7) {
                        setCustomerPhone(`(${raw.slice(0, 2)}) ${raw.slice(2)}`);
                      } else {
                        setCustomerPhone(`(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-purple-300/40 text-xs sm:text-sm focus:outline-none focus:border-purple-400 focus:bg-white/[0.1] transition-all"
                  />
                </div>
              </div>

              {/* Grupo 2: Endereço de Entrega */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-purple-300/70 uppercase tracking-wider flex items-center gap-1.5 px-1">
                  <MapPin className="w-3 h-3 text-purple-400" />
                  <span>2. Endereço de Entrega</span>
                </label>
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3 space-y-2.5">
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Rua / Avenida *"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="col-span-2 px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-purple-300/40 text-xs sm:text-sm focus:outline-none focus:border-purple-400 focus:bg-white/[0.1] transition-all"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Nº *"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="col-span-1 px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-purple-300/40 text-xs sm:text-sm focus:outline-none focus:border-purple-400 focus:bg-white/[0.1] transition-all text-center"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Bairro *"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-purple-300/40 text-xs sm:text-sm focus:outline-none focus:border-purple-400 focus:bg-white/[0.1] transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Apto / Complemento"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      className="px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-purple-300/40 text-xs sm:text-sm focus:outline-none focus:border-purple-400 focus:bg-white/[0.1] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Grupo 3: Forma de Pagamento */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-purple-300/70 uppercase tracking-wider flex items-center gap-1.5 px-1">
                  <CreditCard className="w-3 h-3 text-purple-400" />
                  <span>3. Pagamento na Entrega/Fechamento</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: 'Pix', label: 'Pix', icon: QrCode },
                      { id: 'Dinheiro', label: 'Dinheiro', icon: Banknote },
                      { id: 'Cartão de Crédito', label: 'Crédito', icon: CreditCard },
                      { id: 'Cartão de Débito', label: 'Débito', icon: CreditCard },
                    ] as const
                  ).map((m) => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-purple-600/30 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                            : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-purple-200/70'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-fuchsia-400' : 'text-purple-400/60'}`} />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Parcelas para Cartão de Crédito */}
                {paymentMethod === 'Cartão de Crédito' && (
                  <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-3 mt-2">
                    <label className="text-[11px] font-semibold text-purple-300/80 block mb-1.5">
                      Número de parcelas:
                    </label>
                    <select
                      value={installments}
                      onChange={(e) => setInstallments(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#150a2b] border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-400"
                    >
                      {[1, 2, 3, 4, 5, 6, 10, 12].map((num) => (
                        <option key={num} value={num}>
                          {num}x de {formatCurrency(totalPrice / num)}{' '}
                          {num === 1 ? '(à vista)' : '(sem juros)'}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Botão de Envio WhatsApp */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white py-4 px-6 rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/25 border border-white/20 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Formatando pedido...' : 'Enviar Pedido pelo WhatsApp'}</span>
                </button>
                <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[11px] text-purple-300/60 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pedido enviado com segurança para o número do consultor</span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
