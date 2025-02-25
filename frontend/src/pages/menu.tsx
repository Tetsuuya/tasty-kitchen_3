import { useContext } from "react";
import { MenuContext } from "../context/menucontext";
import Button from "../components/buttons/addtocartbutton"; 

const Menu: React.FC = () => {
  const menuContext = useContext(MenuContext);

  if (!menuContext) {
    return <p>Error: MenuContext not available.</p>;
  }

  const { products, addToCart } = menuContext;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Menu</h2>

      <div className="grid gap-4">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.product_id} className="p-4 bg-white shadow rounded-lg flex justify-between">
              <div>
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-md mb-4"
                  />
                )}
                <span className="text-lg font-semibold">{product.name}</span>
                <p className="text-gray-600 text-sm">{product.description}</p>
                <span className="text-xl font-bold">${product.price}</span>
              </div>
              <Button
                onClick={() => addToCart(product)} 
                label="Add to Cart"  // Pass the label as a prop
              />
            </div>
          ))
        ) : (
          <p>No products available.</p>
        )}
      </div>
    </div>
  );
};

export default Menu;
