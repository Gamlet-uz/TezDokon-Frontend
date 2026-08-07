import React from 'react';
import { Home, Package, ShoppingBag, Settings } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  // Navigatsiya menyulari ro'yxati
  const navItems = [
    { id: 'store', label: "Do'kon", icon: Home },
    { id: 'products', label: 'Mahsulotlar', icon: Package },
    { id: 'orders', label: 'Buyurtmalar', icon: ShoppingBag },
    { id: 'settings', label: 'Sozlamalar', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 ${
                isActive ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon 
                size={22} 
                className={`${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} 
              />
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
