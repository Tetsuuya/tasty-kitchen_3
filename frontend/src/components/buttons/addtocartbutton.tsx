// components/button/Button.tsx
import React from 'react';

interface ButtonProps {
  onClick: () => void;
  label: string;
  className?: string;  // Optional custom styles
}

const Button: React.FC<ButtonProps> = ({ onClick, label, className = "" }) => {
  return (
    <button
      className={`bg-gray-800 text-white font-bold w-50 h-12 rounded ${className}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default Button;
