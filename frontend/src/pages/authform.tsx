// src/pages/AuthForm.tsx
import { useState } from "react";
import { useAuth } from "../context/authcontext";
import { useNavigate } from "react-router-dom";

const AuthForm = () => {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (isLogin) {
        await login(email, password);
        navigate("/"); // After login, redirect to home or protected page
      } else {
        await signup(username, email, password);
        alert("Sign up successful. Please log in.");
        setIsLogin(true);
        // Optionally, clear the form fields:
        setUsername("");
        setEmail("");
        setPassword("");
      }
    } catch (err: any) {
      alert(err.message || "Authentication failed, please try again.");
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setUsername("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-center mb-4">
        {isLogin ? "Login" : "Sign Up"}
      </h2>
      
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Enter username"
            className="border p-2 w-full mt-4"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}
        
        <input
          type="email"
          placeholder="Enter email"
          className="border p-2 w-full mt-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <input
          type="password"
          placeholder="Enter password"
          className="border p-2 w-full mt-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="bg-blue-500 px-4 py-2 mt-4 rounded text-white w-full">
          {isLogin ? "Login" : "Sign Up"}
        </button>
      </form>

      <p className="text-center mt-4">
        {isLogin ? "Don't have an account?" : "Already have an account?"} {" "}
        <button onClick={toggleAuthMode} className="text-blue-500 underline">
          {isLogin ? "Sign Up" : "Login"}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;
