import React from 'react';
import { Store, ShoppingBag } from 'lucide-react';

export default function WelcomeScreen({ onNavigate }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-blue-50 to-white">
      {/* Asosiy logotip */}
      <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mb-8 shadow-inner">
        <Store size={64} className="text-blue-600" />
      </div>
      
      <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
        TezDokon Platformasiga Xush Kelibsiz!
      </h1>
      <p className="text-gray-500 text-center mb-10 text-sm">
        O'z onlayn do'koningizni yarating yoki mavjud do'konlardan xarid qiling.
      </p>

      <div className="w-full space-y-4 max-w-sm">
        {/* 1-tugma: Yangi do'kon yaratish */}
        <button
          onClick={() => onNavigate('create_store')}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Store size={20} />
          Yangi Do'kon yaratish
        </button>

        {/* 2-tugma: Do'konlarni ko'rish */}
        <button
          onClick={() => onNavigate('view_stores')}
          className="w-full bg-white text-blue-600 border-2 border-blue-100 font-bold py-4 rounded-2xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-blue-50"
        >
          <ShoppingBag size={20} />
          Do'konlarni ko'rish
        </button>
      </div>
    </div>
  );
}
