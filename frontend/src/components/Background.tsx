import React from 'react';

interface BackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const Background: React.FC<BackgroundProps> = ({ children, className = '' }) => {
  return (
    <main className={`min-h-screen bg-[#f9f5f0] flex flex-col items-center justify-center text-brown-800 p-4 ${className}`}>
      {children}
    </main>
  );
};

export default Background; 
