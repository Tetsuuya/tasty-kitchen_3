  // cartContext.tsx

  import { createContext, useContext, useState, useEffect } from "react";
  import { Product, CartContextType } from "../api/cart";

  const CartContext = createContext<CartContextType | undefined>(undefined);

  export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<Product[]>([]);
    const [user, setUser] = useState<string | null>(localStorage.getItem("user"));

    useEffect(() => {
      if (!user) {
        setCart([]); // Clear cart if no user is logged in
        return;
      }

      const fetchCart = async () => {
        try {
          const response = await fetch(`http://localhost:8000/api/cart/${user}/`);
          if (!response.ok) throw new Error("Failed to fetch cart");
          const data = await response.json();
          setCart(data);
        } catch (error) {
          console.error("Error fetching cart:", error);
        }
      };

      fetchCart();
    }, [user]);

    const addToCart = async (product: Product) => {
      if (!user) return; // Prevent adding if no user is logged in

      try {
        const response = await fetch("http://localhost:8000/api/cart/add/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user, product_id: product.product_id }),
        });
        if (!response.ok) throw new Error("Failed to add product to cart");

        setCart((prevCart) => [...prevCart, product]);
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    };

    const removeFromCart = async (productId: number) => {
      if (!user) return; // Prevent removing if no user is logged in

      try {
        const response = await fetch(`http://localhost:8000/api/cart/remove/${productId}/`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user }),
        });
        if (!response.ok) throw new Error("Failed to remove product from cart");

        setCart((prevCart) => prevCart.filter((product) => product.product_id !== productId));
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    };

    const login = (username: string) => {
      setUser(username);
      localStorage.setItem("user", username);
    };

    const logout = () => {
      setUser(null);
      setCart([]); // Clear cart on logout
      localStorage.removeItem("user");
    };

    return (
      <CartContext.Provider value={{ cart, addToCart, removeFromCart, user, login, logout }}>
        {children}
      </CartContext.Provider>
    );
  };

  export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
      throw new Error("useCart must be used within a CartProvider");
    }
    return context;
  };
