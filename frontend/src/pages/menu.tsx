import { useMenu } from "../context/menucontext";
import Button from "../components/buttons/addtocartbutton"; 

const Menu: React.FC = () => {
  const { products, categories, selectedCategory, setSelectedCategory, addToCart } = useMenu();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Menu</h2>

      {/* Category Selection */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === category.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {products.length > 0 ? (
          products.map((product) => (
            <div 
              key={product.id} 
              className="p-4 bg-white shadow rounded-lg flex flex-col sm:flex-row justify-between"
            >
              <div className="flex flex-col sm:flex-row">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full sm:w-24 h-24 object-cover rounded-md mb-4 sm:mb-0 sm:mr-4"
                  />
                )}
                <div>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold">{product.name}</span>
                    <span className="ml-2 px-2 py-1 bg-gray-100 text-xs rounded-full">
                      {product.category_display}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                  <span className="text-xl font-bold">₱{product.price}</span>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 self-end sm:self-center">
                <Button
                  onClick={() => addToCart({
                    ...product,
                    product_id: product.product_id || product.id
                  })}
                />
              </div>
            </div>
          ))
        ) : (
          <p>No products available for this category.</p>
        )}
      </div>
    </div>
  );
};

export default Menu;