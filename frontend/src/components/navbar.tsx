import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authcontext";
import { useCart } from "../context/cartcontext";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();

  useEffect(() => {
    console.log(user); // Check user on each update
  }, [user]); // Re-run when user changes

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <div className="flex gap-4">
        <Link to="/" className="hover:text-gray-300">Home</Link>
        <Link to="/menu" className="hover:text-gray-300">📜</Link>
        <Link to="/cart" className="hover:text-gray-300">🛒 ({cart.length})</Link>
      </div>
      <div>
        {user ? (
          <button className="bg-red-400 px-4 py-2 rounded" onClick={logout}>
            Logout
          </button>
        ) : (
          <Link to="/auth" className="bg-black-500 opacity-70 px-4 py-2 rounded">
            Login / Sign Up
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
