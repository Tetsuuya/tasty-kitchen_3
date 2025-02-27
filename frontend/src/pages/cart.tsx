// Cart.tsx - Cart page component with selective checkout and quantity adjustment
import { useCart } from "../context/cartcontext";
import { useEffect, useState } from "react";
import { CartItem } from "../api/cart";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, isLoading, error, user } = useCart();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Reset selection when cart changes
  useEffect(() => {
    setSelectedItems([]);
  }, [cart]);

  // Calculate total for all items in cart
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Calculate total for only selected items
  const selectedTotal = cart
    .filter(item => selectedItems.includes(item.product_id))
    .reduce((total, item) => total + (item.price * item.quantity), 0);

  // Handle item selection
  const toggleItemSelection = (productId: number) => {
    setSelectedItems(prevSelected => 
      prevSelected.includes(productId)
        ? prevSelected.filter(id => id !== productId)
        : [...prevSelected, productId]
    );
  };

  // Select all items
  const toggleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === cart.length
        ? [] // Deselect all
        : cart.map(item => item.product_id) // Select all
    );
  };

  // Remove selected items
  const removeSelectedItems = () => {
    if (selectedItems.length === 0) return;
    
    // Show confirmation if multiple items are selected
    if (selectedItems.length > 1) {
      if (!window.confirm(`Remove ${selectedItems.length} items from cart?`)) {
        return;
      }
    }
    
    // Remove each selected item
    selectedItems.forEach(productId => {
      removeFromCart(productId);
    });
  };
  
  // Handle quantity change
  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  // Proceed to checkout with only selected items
  const proceedToCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to checkout");
      return;
    }
    
    setIsCheckingOut(true);
    
    // In a real app, you would proceed to checkout page with only selected items
    console.log("Proceeding to checkout with items:", 
      cart.filter(item => selectedItems.includes(item.product_id))
    );
    
    // Simulating checkout process
    setTimeout(() => {
      alert(`Checkout completed! Total: ₱${selectedTotal.toFixed(2)}`);
      setIsCheckingOut(false);
      // In a real app, you would redirect to a success page or clear selected items
    }, 1500);
  };

  // Check if all items are selected
  const areAllItemsSelected = cart.length > 0 && selectedItems.length === cart.length;

  // Helper to render empty state
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <p className="text-gray-500 text-lg">Your cart is empty.</p>
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
        Browse Products
      </button>
    </div>
  );

  // Helper to render cart item
  const renderCartItem = (product: CartItem) => (
    <li 
      key={product.id || product.product_id} 
      className={`flex justify-between items-center p-4 rounded transition-colors ${
        selectedItems.includes(product.product_id) 
          ? "bg-blue-50 border border-blue-200" 
          : "bg-gray-100"
      }`}
    >
      <div className="flex items-center w-full">
        <input
          type="checkbox"
          checked={selectedItems.includes(product.product_id)}
          onChange={() => toggleItemSelection(product.product_id)}
          className="mr-3 h-4 w-4"
        />
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-16 h-16 object-cover rounded"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-300 rounded flex items-center justify-center">
            <span className="text-xs text-gray-600">No image</span>
          </div>
        )}
        <div className="ml-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-semibold">{product.name}</span>
              {product.category_display && (
                <span className="ml-2 px-2 py-0.5 bg-gray-200 text-xs rounded-full">
                  {product.category_display}
                </span>
              )}
              <p className="text-sm text-gray-600 mt-1">
                {product.description || "No description"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">₱{parseFloat(product.price.toString()).toFixed(2)}</div>
              <div className="flex items-center mt-2">
                <button
                  onClick={() => handleQuantityChange(product.product_id, product.quantity - 1)}
                  className="w-8 h-8 bg-gray-200 rounded-l flex items-center justify-center hover:bg-gray-300"
                  disabled={product.quantity <= 1}
                >
                  <span>-</span>
                </button>
                <input
                  type="number"
                  min="1"
                  value={product.quantity}
                  onChange={(e) => handleQuantityChange(product.product_id, parseInt(e.target.value) || 1)}
                  className="w-12 h-8 text-center border-t border-b border-gray-300"
                />
                <button
                  onClick={() => handleQuantityChange(product.product_id, product.quantity + 1)}
                  className="w-8 h-8 bg-gray-200 rounded-r flex items-center justify-center hover:bg-gray-300"
                >
                  <span>+</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );

  // Return different views based on state
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto mt-10 px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>
        <p className="text-gray-500">Please log in to view your cart.</p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4 pb-16">
      <h2 className="text-2xl font-bold">Shopping Cart</h2>
      
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-gray-500">Loading your cart...</p>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded border border-red-200">
          <p>Error: {error}</p>
          <button 
            className="mt-2 text-sm underline"
            onClick={() => window.location.reload()}
          >
            Try refreshing the page
          </button>
        </div>
      )}
      
      {!isLoading && !error && (
        <>
          {cart.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              <div className="flex justify-between items-center mt-6 mb-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={areAllItemsSelected}
                    onChange={toggleSelectAll}
                    className="mr-2 h-4 w-4"
                  />
                  <span className="text-sm font-medium">
                    {areAllItemsSelected ? "Deselect All" : "Select All"}
                  </span>
                </div>
                
                <div className="text-sm">
                  <span className="font-medium">{selectedItems.length}</span> of {cart.length} items selected
                </div>
              </div>

              <ul className="mt-4 space-y-4">
                {cart.map(renderCartItem)}
              </ul>
              
              <div className="mt-8 p-4 bg-gray-100 rounded shadow-sm">
                <div className="flex flex-col space-y-2 border-b border-gray-200 pb-4 mb-4">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Cart Total:</span>
                    <span>₱{cartTotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-lg">Selected Items Total:</span>
                    <span className={`text-xl ${selectedItems.length > 0 ? 'text-green-900' : 'text-gray-400'}`}>
                    ₱{selectedTotal.toFixed(2)}
                    </span>
                  </div>
                  
                  {selectedItems.length > 0 && selectedItems.length < cart.length && (
                    <div className="text-sm text-gray-500 italic">
                      Only checking out {selectedItems.length} selected items
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    className={`py-2 rounded text-white ${
                      selectedItems.length > 0 
                        ? "bg-red-900 hover:bg-red-950" 
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                    onClick={removeSelectedItems}
                    disabled={selectedItems.length === 0 || isCheckingOut}
                  >
                    Remove Selected
                  </button>
                  <button 
                    className={`text-white py-2 rounded transition-colors ${
                      selectedItems.length > 0 
                        ? "bg-green-900 hover:bg-green-950" 
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                    onClick={proceedToCheckout}
                    disabled={selectedItems.length === 0 || isCheckingOut}
                  >
                    {isCheckingOut ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      `Checkout Selected (${selectedItems.length})`
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Cart;