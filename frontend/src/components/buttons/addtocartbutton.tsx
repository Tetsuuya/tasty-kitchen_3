import React from 'react';

interface ButtonProps {
  onClick: () => void;
  className?: string;
  size?: 'small' | 'normal'; // Add size prop with default of 'normal'
}

const CartButton: React.FC<ButtonProps> = ({ onClick, className = "", size = "normal" }) => {
  // Define sizes based on the prop
  const buttonSize = size === 'small' ? 'w-10 h-8' : 'w-14 h-10';
  const iconSize = size === 'small' ? 'w-4 h-4' : 'w-5 h-5';
  const badgeSize = size === 'small' ? 'w-3 h-3 -top-0.5 -right-0.5 text-[8px]' : 'w-4 h-4 -top-1 -right-1 text-xs';
  
  return (
    <button
      type="button"
      className={`group relative ${buttonSize} rounded-lg bg-gray-900 border-none outline-none cursor-pointer transition-all duration-300 ease-in-out hover:bg-gray-800 active:scale-95 ${className}`}
      onClick={onClick}
    >
      {/* Main button content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex items-center justify-center w-full h-full">
          {/* Cart icon */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`${iconSize} text-white`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
            />
          </svg>
          
          {/* Plus sign */}
          <div className={`absolute ${badgeSize} rounded-full bg-white flex items-center justify-center shadow-sm text-black font-bold`}>
            +
          </div>
        </div>
      </div>
      
      {/* Subtle highlight effect */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-10 bg-white transition-opacity duration-300"></div>
    </button>
  );
};

export default CartButton;