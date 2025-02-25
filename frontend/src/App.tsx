import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Menu from "./pages/menu";
import Cart from "./pages/cart";
import Navbar from "./components/navbar";
import AuthForm from "./pages/authform";
import { CartProvider } from "./context/cartcontext"; 
import { AuthProvider } from "./context/authcontext"; 
import { MenuProvider } from "./context/menucontext"; 

function App() {
  return (
    <Router> {/* Place Router at the top level */}
      <AuthProvider> 
        <MenuProvider>
          <CartProvider>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/auth" element={<AuthForm />} />
            </Routes>
          </CartProvider>
        </MenuProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
