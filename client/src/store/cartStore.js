import { create } from "zustand";
import cartService from "../services/cartService";

const useCartStore = create((set) => ({
  cart: null,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartService.getCart();
      set({ cart: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  addToCart: async (productId, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartService.addToCart({ productId, quantity });
      set({ cart: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  updateCartItem: async (productId, quantity) => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartService.updateCart({ productId, quantity });
      set({ cart: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  removeFromCart: async (productId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartService.removeFromCart(productId);
      set({ cart: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  clearCart: async () => {
    try {
      const response = await cartService.clearCart();
      set({ cart: response.data });
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  reset: () => set({ cart: null, isLoading: false, error: null }),
}));

export default useCartStore;
