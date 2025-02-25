// cart.ts

export interface Product {
    product_id: number;
    name: string;
    description: string;
    price: number;
    image_url?: string;
  }
  
  export interface CartContextType {
    cart: Product[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: number) => void;
    user: string | null;
    login: (username: string) => void;
    logout: () => void;
  }
  