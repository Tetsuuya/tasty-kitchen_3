import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/authcontext';
import { useCart } from '../context/cartcontext';
import Button from '../components/buttons/addtocartbutton';
// Define the Product type
interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  image_url?: string;
}

// Define the User type
interface User {
  username: string;
}

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { user } = useAuth();
  const { addToCart } = useCart();

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('accessToken'); // ✅ Consistent key
        const response = await axios.get<Product[]>('http://127.0.0.1:8000/api/products/', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
        setProducts(response.data); // ✅ Now TypeScript knows it's Product[]
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Add to cart function
  const addProductToCart = async (product: Product) => {
    const token = localStorage.getItem('accessToken'); // ✅ Consistent key
    const productWithImage = {
      ...product,
      image_url: product.image_url || 'default-image-url.jpg',
    };

    try {
      await axios.post(
        'http://127.0.0.1:8000/api/cart/',
        { product_id: productWithImage.product_id, quantity: 1 },
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );
      addToCart(productWithImage);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="p-6 flex justify-between">
      {/* Left Side: User Info */}
      <div className="w-1/2 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-2xl font-semibold">
          {user && typeof user !== 'string' ? `Welcome, ${(user as User).username}!` : 'Welcome, Guest!'}
        </h2>
        <p className="text-gray-600">Enjoy your meal selection!</p>
      </div>

      {/* Right Side: Available Products */}
      <div className="w-1/2 p-4">
        <h2 className="text-2xl font-semibold mb-4">Available Items</h2>
        <div className="grid gap-4">
          {products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.product_id}
                className="p-4 bg-white shadow rounded-lg flex justify-between"
              >
                <div>
                  <img
                    src={product.image_url || 'default-image-url.jpg'}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <span className="text-lg font-semibold">{product.name}</span>
                  <p className="text-gray-600 text-sm">{product.description}</p>
                  <span className="text-xl font-bold">${product.price}</span>
                </div>
                <Button 
                  onClick={() => addProductToCart(product)} 
                  label="Add to Cart"  // Pass the label as a prop
                />

              </div>
            ))
          ) : (
            <p>Loading products...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
