import { createContext, useState, useEffect, ReactNode } from "react";

// Define the Product type (matches your backend)
interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  image_url?: string;
}

// Define the CartItem type
interface CartItem {
  product: Product;
  quantity: number;
}

// Define context type
interface MenuContextType {
  products: Product[];
  cart: CartItem[];
  addToCart: (product: Product) => void;
  isLoggedIn: boolean;
}

export const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is logged in (by checking token in localStorage)
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Fetch products from API
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/products/");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = async (product: Product) => {
    if (!isLoggedIn) {
      alert("Please log in to add items to your cart.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/cart/add/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: product.product_id, quantity: 1 }),
      });

      if (!response.ok) throw new Error("Failed to add item to cart.");

      // Update cart state
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.product.product_id === product.product_id);
        if (existingItem) {
          return prevCart.map((item) =>
            item.product.product_id === product.product_id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          return [...prevCart, { product, quantity: 1 }];
        }
      });

      alert("Item added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Could not add item to cart. Please try again.");
    }
  };

  return (
    <MenuContext.Provider value={{ products, cart, addToCart, isLoggedIn }}>
      {children}
    </MenuContext.Provider>
  );
};
