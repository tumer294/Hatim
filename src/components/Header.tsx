import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Book, Home, BarChart3, User } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Book className="h-8 w-8 text-primary-900 mr-2" />
            <h1 className="text-2xl font-bold text-primary-900">Kuran Okuma Takibi</h1>
          </div>
          
          <nav className="flex space-x-1 sm:space-x-4">
            <NavLink to="/" icon={<Home size={18} />} label="Ana Sayfa" isActive={location.pathname === '/'} />
            <NavLink to="/progress" icon={<BarChart3 size={18} />} label="İlerleme" isActive={location.pathname === '/progress'} />
            <NavLink to="/admin" icon={<User size={18} />} label="Yönetici" isActive={location.pathname === '/admin'} />
          </nav>
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, isActive }) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
        isActive
          ? 'bg-primary-100 text-primary-900'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className="mr-1.5">{icon}</span>
      {label}
    </Link>
  );
};

export default Header;