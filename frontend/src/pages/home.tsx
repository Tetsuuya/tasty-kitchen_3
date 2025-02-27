
import axios from 'axios';
import { useAuth } from '../context/authcontext';
import { useCart } from '../context/cartcontext';
import { useMenu } from '../context/menucontext';
import Button from '../components/buttons/addtocartbutton';

// Define the Product type
interface Product {
  id: number;
  product_id?: number;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category: string;
  category_display: string;
}

// Define the User type
interface User {
  username: string;
}

const Home = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { products, categories, selectedCategory, setSelectedCategory } = useMenu();

  // Add to cart function
  const addProductToCart = async (product: Product) => {
    const token = localStorage.getItem('accessToken');
    const productWithImage = {
      ...product,
      product_id: product.product_id || product.id,
      image_url: product.image_url || 'default-image-url.jpg',
    };

    try {
      await axios.post(
        'http://127.0.0.1:8000/api/cart/add/',
        { product_id: productWithImage.product_id, quantity: 1 },
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );
      addToCart(productWithImage);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="p-6">
      {/* Category Selection */}
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between">
        {/* Left Side: User Info */}
        <div className="w-full md:w-1/3 p-4 bg-gray-100 rounded-lg mb-4 md:mb-0">
          <h2 className="text-2xl font-semibold">
            {user && typeof user !== 'string' ? `Welcome, ${(user as User).username}!` : 'Welcome, Guest!'}
          </h2>
          <p className="text-gray-600">Enjoy your meal selection!</p>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium">Today's Special</h3>
            <p className="text-gray-600">
              Check out our seasonal offerings and chef's recommendations.
            </p>
          </div>
        </div>

        {/* Right Side: Available Products */}
        <div className="w-full md:w-2/3 md:pl-6">
          <h2 className="text-2xl font-semibold mb-4">
            {selectedCategory === 'ALL' 
              ? 'Popular Dining Items'
              : `${categories.find(c => c.value === selectedCategory)?.label || selectedCategory} Items`}
          </h2>
          <div className="grid gap-4">
            {products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product.id}
                  className="p-4 bg-white shadow rounded-lg flex justify-between"
                >
                  <div className="flex">
                    <img
                      src={product.image_url || 'default-image-url.jpg'}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded mr-4"
                    />
                    <div>
                      <span className="text-lg font-semibold">{product.name}</span>
                      <p className="text-gray-600 text-sm">{product.description}</p>
                      <span className="text-xl font-bold">₱{product.price}</span>
                      <div className="text-xs text-gray-500 mt-1">{product.category_display}</div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => addProductToCart(product)}  // Pass the label as a prop
                  />

                </div>
              ))
            ) : (
              <p>Loading products...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;