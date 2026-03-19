import React from 'react';
import { GiraAvatar } from '../components/GiraAvatar';

export const GiraHelperButton: React.FC = () => {
  return (
    <button 
      className="fixed bottom-4 left-4 z-50 group transition-transform hover:scale-110"
      aria-label="Ajuda da Gira"
      onClick={() => alert('Olá! Eu sou a Gira. Em breve poderei ajudar você com dúvidas!')}
    >
      <div className="relative">
        <div className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full border-2 border-white"></div>
        <div className="bg-white p-1 rounded-full shadow-lg border-2 border-pink-500">
          <GiraAvatar emotion="waving" size="sm" />
        </div>
      </div>
      <div className="absolute left-full ml-2 bottom-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Precisa de ajuda?
      </div>
    </button>
  );
};