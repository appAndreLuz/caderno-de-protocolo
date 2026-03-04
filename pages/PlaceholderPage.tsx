
import React from 'react';
import { Construction } from 'lucide-react';
import { MENU_ITEMS } from '../constants';

interface PlaceholderPageProps {
  id: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ id }) => {
  const item = MENU_ITEMS.find(i => i.id === id);
  const Icon = item?.icon || Construction;

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-500">
      <div className="w-24 h-24 bg-white shadow-xl rounded-3xl flex items-center justify-center text-[#066699] mb-8 animate-bounce">
        <Icon size={48} />
      </div>
      <h2 className="text-3xl font-bold text-[#02416D] mb-4">Módulo: {item?.label}</h2>
      <p className="text-gray-500 max-w-md text-lg">
        Este módulo está atualmente em fase de desenvolvimento. 
        Em breve você terá acesso a todas as funcionalidades de <strong>{item?.label}</strong>.
      </p>
      <div className="mt-10 flex gap-4">
        <div className="h-1.5 w-12 bg-[#AEDD2B] rounded-full" />
        <div className="h-1.5 w-12 bg-[#066699] rounded-full" />
        <div className="h-1.5 w-12 bg-[#0A5483] rounded-full" />
      </div>
    </div>
  );
};

export default PlaceholderPage;
