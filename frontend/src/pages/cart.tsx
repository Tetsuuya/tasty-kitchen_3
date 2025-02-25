// Cart.tsx

import { useCart } from "../context/cartcontext";

const Cart = () => {
  const { cart, removeFromCart, user } = useCart();

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold">Shopping Cart</h2>

      {!user ? (
        <p className="text-gray-500">Please log in to view your cart.</p>
      ) : cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {cart.map((product) => (
            <li key={product.product_id} className="flex justify-between items-center bg-gray-100 p-4 rounded">
              <div className="flex items-center">
                <img
                  src={product.image_url || "default-image-url.jpg"} // Provide default image if missing
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="ml-4">
                  <span className="font-semibold">{product.name}</span>
                  <p className="text-sm text-gray-600">{product.description}</p>
                  <span className="text-lg font-bold">${product.price}</span>
                </div>
              </div>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => removeFromCart(product.product_id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Cart;
