import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem } from '@/types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (product: Product, quantity = 1) => {
        const { items } = get();
        const existing = items.find((item) => item.product.id === product.id);

        if (existing) {
          const newQty = Math.min(
            existing.quantity + quantity,
            product.stock_quantity
          );
          set({
            items: items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: newQty }
                : item
            ),
          });
        } else {
          const initialQty = Math.min(quantity, product.stock_quantity);
          if (initialQty > 0) {
            set({ items: [...items, { product, quantity: initialQty }] });
          }
        }
      },

      removeItem: (productId: number) => {
        set({
          items: get().items.filter((item) => item.product.id !== productId),
        });
      },

      updateQuantity: (productId: number, quantity: number) => {
        const { items } = get();
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: items.map((item) => {
            if (item.product.id === productId) {
              const safeQty = Math.min(quantity, item.product.stock_quantity);
              return { ...item, quantity: safeQty };
            }
            return item;
          }),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'catalogo-carrinho-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

