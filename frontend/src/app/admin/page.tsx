'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  fetchProducts,
  fetchOrders,
  loginAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from '@/lib/api';
import { Product, OrderResponse } from '@/types';
import { formatCurrency, formatPhone } from '@/lib/utils';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  Package,
  AlertTriangle,
  DollarSign,
  ShoppingBag,
  ArrowLeft,
  X,
  LogOut,
  Send,
  Upload,
} from 'lucide-react';

function subscribeAdminToken(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export default function AdminPage() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Dashboard Data
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [activeTab, setActiveTab] = useState<'produtos' | 'pedidos'>('produtos');
  const [copiedLink, setCopiedLink] = useState(false);

  // Modal State for Product CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock_quantity: '',
    image_url: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const storedToken = useSyncExternalStore(
    subscribeAdminToken,
    () => localStorage.getItem('catalogo_admin_token'),
    () => null
  );

  const token = authToken || storedToken;

  // Load dashboard data when token is present
  useEffect(() => {
    if (!token) return;
    let isCancelled = false;

    fetchProducts()
      .then((prodRes) => {
        if (!isCancelled) setProducts(prodRes.products);
      })
      .catch(console.error);

    fetchOrders()
      .then((ordersRes) => {
        if (!isCancelled) setOrders(ordersRes);
      })
      .catch(() => {
        if (!isCancelled) setOrders([]);
      });

    return () => {
      isCancelled = true;
    };
  }, [token]);

  const loadDashboard = async () => {
    try {
      const [prodRes, ordersRes] = await Promise.all([
        fetchProducts(),
        fetchOrders().catch(() => []),
      ]);
      setProducts(prodRes.products);
      setOrders(ordersRes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await loginAdmin(username, password);
      localStorage.setItem('catalogo_admin_token', res.access_token);
      setAuthToken(res.access_token);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setLoginError(err.message);
      } else {
        setLoginError('Credenciais incorretas.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('catalogo_admin_token');
    setAuthToken(null);
  };

  const handleCopyLink = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const openNewProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: '',
      stock_quantity: '',
      image_url: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      description: p.description,
      price: p.price.toString(),
      category: p.category,
      stock_quantity: p.stock_quantity.toString(),
      image_url: p.image_url || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setFormError(null);

    const price = parseFloat(productForm.price.replace(',', '.'));
    const stock = parseInt(productForm.stock_quantity, 10);

    if (isNaN(price) || price <= 0) {
      setFormError('Informe um preço válido maior que zero.');
      return;
    }
    if (isNaN(stock) || stock < 0) {
      setFormError('Informe um estoque válido maior ou igual a zero.');
      return;
    }

    try {
      setSavingProduct(true);
      if (editingProduct) {
        await updateProduct(
          editingProduct.id,
          {
            name: productForm.name,
            description: productForm.description,
            price,
            category: productForm.category,
            stock_quantity: stock,
            image_url: productForm.image_url.trim() || null,
          },
          token
        );
      } else {
        await createProduct(
          {
            name: productForm.name,
            description: productForm.description,
            price,
            category: productForm.category,
            stock_quantity: stock,
            image_url: productForm.image_url.trim() || null,
          },
          token
        );
      }
      setIsModalOpen(false);
      loadDashboard();
    } catch (err: unknown) {
      if (err instanceof Error) setFormError(err.message);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!token) return;
    if (!confirm('Deseja realmente desativar este produto da vitrine?')) return;
    try {
      await deleteProduct(id, token);
      loadDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics
  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => p.stock_quantity <= 5).length;
  const totalStockValue = products.reduce((acc, p) => acc + p.price * p.stock_quantity, 0);

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) return null;

  // Tela de Login Estilo Liquid Glass
  if (!token) {
    return (
      <div className="min-h-screen bg-[#090514] text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Orbs de luz difusa */}
        <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-700/20 blur-[130px] pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-fuchsia-600/15 blur-[120px] pointer-events-none" />

        <div className="liquid-glass w-full max-w-md rounded-[2.5rem] p-8 space-y-6 relative z-10 border-purple-500/25">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-fuchsia-600 flex items-center justify-center mx-auto shadow-lg shadow-purple-600/30 border border-white/20 text-white">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Painel do Lojista</h2>
            <p className="text-xs text-purple-200/60 max-w-xs mx-auto">
              Acesso exclusivo para gerenciar produtos, estoque e acompanhar pedidos.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-200 rounded-xl text-xs font-semibold">
                {loginError}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-purple-300/80 block mb-1">Usuário</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-400 focus:bg-white/[0.1] transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-purple-300/80 block mb-1">Senha</label>
              <input
                type="password"
                required
                placeholder="Padrão: admin123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm focus:outline-none focus:border-purple-400 focus:bg-white/[0.1] transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-extrabold py-3.5 rounded-2xl shadow-xl shadow-purple-600/30 border border-white/20 transition-all active:scale-95"
            >
              Acessar Painel
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-purple-300/60 hover:text-white font-semibold inline-flex items-center gap-1.5 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para a vitrine</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard do Lojista
  return (
    <div className="min-h-screen bg-[#090514] text-white pb-20 relative overflow-x-hidden">
      {/* Luzes difusas de fundo */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-700/15 blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-fuchsia-600/15 blur-[130px] pointer-events-none" />

      {/* Header do Painel */}
      <header className="sticky top-0 z-30 bg-[#090514]/75 backdrop-blur-2xl border-b border-purple-500/15">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-purple-300 hover:text-white transition-colors"
              title="Voltar para vitrine pública"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base text-white leading-tight">Painel Lojista</h1>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Autenticado
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-white/15 active:scale-95 ${
                copiedLink
                  ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] text-purple-200'
              }`}
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 text-purple-300/60 hover:text-rose-400 bg-white/[0.06] hover:bg-white/[0.12] rounded-full transition-colors"
              title="Encerrar sessão"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6 relative z-10">
        {/* Cards de Métricas Liquid Glass */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="liquid-glass p-4 rounded-2xl border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/25 border border-purple-400/30 text-purple-300 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-purple-300/70 font-semibold block">Produtos</span>
              <span className="text-xl font-black text-white">{totalProducts}</span>
            </div>
          </div>

          <div className="liquid-glass p-4 rounded-2xl border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/25 border border-amber-400/30 text-amber-300 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-purple-300/70 font-semibold block">Estoque Baixo</span>
              <span className="text-xl font-black text-amber-400">{lowStockCount}</span>
            </div>
          </div>

          <div className="liquid-glass p-4 rounded-2xl border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-purple-300/70 font-semibold block">Valor Estoque</span>
              <span className="text-base sm:text-lg font-black text-white">{formatCurrency(totalStockValue)}</span>
            </div>
          </div>

          <div className="liquid-glass p-4 rounded-2xl border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-fuchsia-600/25 border border-fuchsia-400/30 text-fuchsia-300 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-purple-300/70 font-semibold block">Pedidos</span>
              <span className="text-xl font-black text-white">{orders.length}</span>
            </div>
          </div>
        </div>

        {/* Abas e Tabela Liquid Glass */}
        <div className="liquid-glass rounded-[2rem] border-white/10 overflow-hidden">
          {/* Barra de Abas */}
          <div className="p-4 border-b border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('produtos')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  activeTab === 'produtos'
                    ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md border border-white/20'
                    : 'bg-white/[0.04] text-purple-200/70 hover:bg-white/[0.08]'
                }`}
              >
                Produtos ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('pedidos')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  activeTab === 'pedidos'
                    ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md border border-white/20'
                    : 'bg-white/[0.04] text-purple-200/70 hover:bg-white/[0.08]'
                }`}
              >
                Histórico ({orders.length})
              </button>
            </div>

            {activeTab === 'produtos' && (
              <button
                onClick={openNewProductModal}
                className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 border border-white/20 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Novo Produto</span>
              </button>
            )}
          </div>

          {/* ABA 1: PRODUTOS */}
          {activeTab === 'produtos' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-purple-100">
                <thead className="bg-white/[0.03] border-b border-white/[0.08] text-purple-300/70 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="p-3.5">Produto</th>
                    <th className="p-3.5">Categoria</th>
                    <th className="p-3.5">Preço</th>
                    <th className="p-3.5">Estoque</th>
                    <th className="p-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {products.map((p) => {
                    const isLow = p.stock_quantity <= 5;
                    return (
                      <tr key={p.id} className="hover:bg-white/[0.04] transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {p.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-4 h-4 text-purple-400/40" />
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-white block">{p.name}</span>
                              <span className="text-[11px] text-purple-300/60 line-clamp-1">{p.description}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-purple-200 font-semibold text-[10px]">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-white">
                          {formatCurrency(p.price)}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                              p.stock_quantity === 0
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : isLow
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {p.stock_quantity} un.
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 text-purple-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors"
                              title="Desativar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ABA 2: HISTÓRICO DE PEDIDOS */}
          {activeTab === 'pedidos' && (
            <div className="divide-y divide-white/[0.06]">
              {orders.length === 0 ? (
                <div className="p-12 text-center text-purple-300/60">
                  <ShoppingBag className="w-10 h-10 mx-auto stroke-1 mb-2 opacity-50" />
                  <p className="text-sm font-semibold">Nenhum pedido registrado ainda.</p>
                </div>
              ) : (
                orders.map((ord) => (
                  <div key={ord.id} className="p-4 sm:p-5 hover:bg-white/[0.03] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-sm">#{ord.id}</span>
                        <span className="text-xs text-purple-300/40">•</span>
                        <span className="text-xs font-bold text-purple-200">{ord.customer_name}</span>
                        <span className="text-xs text-purple-300/50">({formatPhone(ord.customer_phone)})</span>
                      </div>
                      <p className="text-xs text-purple-300/70">
                        {ord.street}, Nº {ord.number} - {ord.neighborhood}
                        {ord.complement ? ` (${ord.complement})` : ''}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-purple-300/60">
                        <span>Forma: <strong className="text-white">{ord.payment_method}</strong></span>
                        {ord.installments > 1 && <span>({ord.installments}x)</span>}
                        <span>•</span>
                        <span>{ord.items.length} itens</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-[10px] text-purple-300/60 block">Valor Total</span>
                        <span className="text-base font-black text-white">
                          {formatCurrency(ord.total_price)}
                        </span>
                      </div>

                      {ord.whatsapp_url && (
                        <a
                          href={ord.whatsapp_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-400/30 rounded-xl text-xs font-bold transition-all active:scale-95"
                          title="Abrir no WhatsApp"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal Liquid Glass de Criação / Edição de Produto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="liquid-glass-sheet w-full max-w-lg rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border-white/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white">
                {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto no-scrollbar">
              {formError && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-200 rounded-xl text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-purple-300/80 block mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Perfume Essencial Natura 100ml"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-purple-300/40 text-sm focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-purple-300/80 block mb-1">Descrição Detalhada *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Notas olfativas, volume, benefícios..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-purple-300/40 text-sm focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-purple-300/80 block mb-1">Preço (R$) *</label>
                  <input
                    type="text"
                    required
                    placeholder="189.90"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-purple-300/40 text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-purple-300/80 block mb-1">Quantidade em Estoque *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="15"
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-purple-300/40 text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-purple-300/80 block mb-1">Categoria *</label>
                <input
                  type="text"
                  required
                  placeholder="Perfumes, Hidratantes, Maquiagem..."
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-purple-300/40 text-sm focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Upload de Imagem ou URL */}
              <div>
                <label className="text-xs font-bold text-purple-300/80 block mb-1">Foto do Produto</label>
                <div className="flex items-center gap-2 mb-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-semibold rounded-xl border border-purple-400/30 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-purple-300" />
                    <span>{uploadingImage ? 'Enviando...' : 'Fazer Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !token) return;
                        try {
                          setUploadingImage(true);
                          const res = await uploadProductImage(file, token);
                          setProductForm((prev) => ({ ...prev, image_url: res.url }));
                        } catch (err: unknown) {
                          if (err instanceof Error) setFormError(err.message);
                        } finally {
                          setUploadingImage(false);
                        }
                      }}
                    />
                  </label>
                  <span className="text-[11px] text-purple-300/50">ou informe o link direto:</span>
                </div>
                <input
                  type="url"
                  placeholder="https://exemplo.com/foto.jpg"
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder:text-purple-300/40 text-sm focus:outline-none focus:border-purple-400"
                />
                {productForm.image_url && (
                  <div className="mt-2.5 flex items-center gap-3 p-2 bg-white/[0.04] rounded-xl border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={productForm.image_url}
                      alt="Prévia"
                      className="w-10 h-10 object-cover rounded-lg bg-black/40 border border-white/10"
                    />
                    <span className="text-xs text-purple-200/70 truncate flex-1">{productForm.image_url}</span>
                    <button
                      type="button"
                      onClick={() => setProductForm({ ...productForm, image_url: '' })}
                      className="text-xs text-rose-400 hover:underline font-semibold px-2"
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-purple-300/70 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-purple-600/30 border border-white/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {savingProduct ? 'Salvando...' : 'Salvar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
