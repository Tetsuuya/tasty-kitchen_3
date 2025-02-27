import { createContext, useState, useEffect, ReactNode, useContext } from "react";

// Define the Product type (matches your backend)
interface Product {
  id: number;
  product_id?: number;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category: string;
  category_display: string;
  available: boolean;
}

// Define the Category type
interface Category {
  value: string;
  label: string;
}

// Define the CartItem type
interface CartItem {
  product: Product;
  quantity: number;
}

// Define context type
interface MenuContextType {
  products: Product[];
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  isLoggedIn: boolean;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is logged in (by checking token in localStorage)
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);

    // Fetch categories from API
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/categories/");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products when selected category changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/products/category/${selectedCategory}/`);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        // Ensure all products have product_id property
        const processedData = data.map((product: Product) => ({
          ...product,
          product_id: product.product_id || product.id
        }));
        setProducts(processedData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const addToCart = async (product: Product) => {
    if (!isLoggedIn) {
      alert("Please log in to add items to your cart.");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("http://127.0.0.1:8000/api/cart/add/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          product_id: product.product_id || product.id, 
          quantity: 1 
        }),
      });

      if (!response.ok) throw new Error("Failed to add item to cart.");

      // Update cart state
      setCart((prevCart) => {
        const existingItem = prevCart.find(
          (item) => (item.product.product_id || item.product.id) === (product.product_id || product.id)
        );
        if (existingItem) {
          return prevCart.map((item) =>
            (item.product.product_id || item.product.id) === (product.product_id || product.id)
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
    <MenuContext.Provider 
      value={{ 
        products, 
        categories, 
        selectedCategory, 
        setSelectedCategory, 
        cart, 
        addToCart, 
        isLoggedIn 
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
};

export { MenuContext };