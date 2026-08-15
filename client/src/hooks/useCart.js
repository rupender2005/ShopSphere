import useCartStore from "../store/cartStore";

const useCart = () => {
  const cart = useCartStore((state) => state.cart);
  const isLoading = useCartStore((state) => state.isLoading);
  const error = useCartStore((state) => state.error);

  return {
    cart,
    isLoading,
    error,
  };
};

export default useCart;
