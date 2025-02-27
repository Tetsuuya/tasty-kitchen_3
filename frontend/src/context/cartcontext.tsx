// CartContext.tsx - Context provider for cart functionality
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product, CartItem, CartContextType } from "../api/cart";

const API_BASE_URL = "http://localhost:8000/api";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(localStorage.getItem("user"));

  // Fetch cart data when user changes
  useEffect(() => {
    if (!user) {
      setCart([]);
      return;
    }
    
    fetchCart();
  }, [user]);

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    };
  };

  // Transform API data to our Cart format
  const transformCartData = (apiData: any[]): CartItem[] => {
    return Array.isArray(apiData) 
      ? apiData.map(item => ({
          product_id: item.product,
          id: item.id,
          name: item.product_name || "Product",
          description: item.product_description || "No description available",
          price: item.product_price,
          image_url: item.product_image,
          category: item.category,
          category_display: item.category_display,
          quantity: item.quantity || 1
        }))
      : [];
  };

  // Fetch cart data from API
  const fetchCart = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/cart/`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.status}`);
      }
      
      const data = await response.json();
      const transformedData = transformCartData(data);
      setCart(transformedData);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch cart");
    } finally {
      setIsLoading(false);
    }
  };

  // Add product to cart
  const addToCart = async (product: Product, quantity = 1) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/cart/add/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          product_id: product.product_id, 
          quantity 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to add product: ${response.status}`);
      }
      
      // Refresh cart data after successful addition
      await fetchCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
      setError(error instanceof Error ? error.message : "Failed to add product to cart");
      
      // Optimistic update fallback if API call fails
      const productWithQuantity = { ...product, quantity };
      setCart(prevCart => [...prevCart, productWithQuantity as CartItem]);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove product from cart
  const removeFromCart = async (productId: number) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/cart/remove/${productId}/`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Failed to remove product: ${response.status}`);
      }
      
      // Update local state after successful removal
      setCart(prevCart => prevCart.filter(item => item.product_id !== productId));
    } catch (error) {
      console.error("Error removing from cart:", error);
      setError(error instanceof Error ? error.message : "Failed to remove product from cart");
    } finally {
      setIsLoading(false);
    }
  };

  // Update quantity of a cart item - MODIFIED TO WORK WITH EXISTING API
  const updateQuantity = async (productId: number, quantity: number) => {
    if (!user || quantity < 1) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First remove the item from cart
      await removeFromCart(productId);
      
      // Then add it back with the new quantity
      // Need to find the product in our current cart to get all its details
      const product = cart.find(item => item.product_id === productId);
      
      if (!product) {
        throw new Error(`Product not found in cart`);
      }
      
      // Add it back with new quantity
      const addResponse = await fetch(`${API_BASE_URL}/cart/add/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          product_id: productId, 
          quantity 
        }),
      });
      
      if (!addResponse.ok) {
        throw new Error(`Failed to update quantity: ${addResponse.status}`);
      }
      
      // Refresh the cart to get the updated data
      await fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
      setError(error instanceof Error ? error.message : "Failed to update quantity");
      
      // Optimistically update the UI even if there was an error
      setCart(prevCart => 
        prevCart.map(item => 
          item.product_id === productId ? { ...item, quantity } : item
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Since there's no clear cart endpoint, we'll remove items one by one
      const removePromises = cart.map(item => 
        fetch(`${API_BASE_URL}/cart/remove/${item.product_id}/`, {
          method: "DELETE",
          headers: getAuthHeaders()
        })
      );
      
      await Promise.all(removePromises);
      setCart([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
      setError(error instanceof Error ? error.message : "Failed to clear cart");
    } finally {
      setIsLoading(false);
    }
  };

  // User authentication functions
  const login = (username: string) => {
    setUser(username);
    localStorage.setItem("user", username);
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  };

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        isLoading,
        error,
        addToCart, 
        removeFromCart,
        updateQuantity,
        clearCart,
        user, 
        login, 
        logout 
      }}
    >
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