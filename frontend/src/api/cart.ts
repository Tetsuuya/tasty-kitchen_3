// cart.ts - Types for cart functionality

export interface Product {
  id?: number;
  product_id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  category_display?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CartContextType {
  cart: CartItem[];
  isLoading: boolean;
  error: string | null;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  user: string | null;
  login: (username: string) => void;
  logout: () => void;
}