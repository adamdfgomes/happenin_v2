import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => (
  <header className="py-6 text-center">
    <h1 className="text-3xl font-bold">{title}</h1>
    {subtitle && <p className="text-gray-300 mt-2">{subtitle}</p>}
  </header>
);

export default Header;
