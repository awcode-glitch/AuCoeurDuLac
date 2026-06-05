import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApiProduct } from '../services/api';

interface WishlistState {
  items: ApiProduct[];
  toggle: (product: ApiProduct) => void;
  has: (id: string) => boolean;
  clear: () => void;
  setItems: (items: ApiProduct[]) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) => {
        const exists = get().items.some(i => i.id === product.id);
        set({ items: exists ? get().items.filter(i => i.id !== product.id) : [...get().items, product] });
      },
      has: (id) => get().items.some(i => i.id === id),
      clear: () => set({ items: [] }),
      setItems: (items) => set({ items }),
    }),
    { name: 'afromarket-wishlist' }
  )
);
