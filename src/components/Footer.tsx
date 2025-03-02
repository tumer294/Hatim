import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 text-sm">
              &copy; {currentYear} Kuran Okuma Takibi. Tüm hakları saklıdır.
            </p>
          </div>
          
          <div className="flex items-center">
            <p className="text-gray-600 text-sm flex items-center">
              <span className="mr-1">Ramazan ruhuyla</span>
              <Heart className="h-4 w-4 text-accent-700 mx-1" />
              <span>hazırlanmıştır</span>
            </p>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-gray-500 text-xs">
            Bu uygulama, Kuran-ı Kerim okuma ilerlemesini takip etmek için tasarlanmıştır.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;