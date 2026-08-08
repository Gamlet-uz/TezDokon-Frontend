import React, { useEffect, useState } from 'react';
import { ArrowLeft, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { getAllStores } from '../api/backend';

export default function StoresList({ onBack, onSelectStore }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      if (getAllStores) {
        const res = await getAllStores();
        if (res.success) {
          setStores(res.stores || []);
        }
      }
    } catch (err) {
      console.error("Do'konlarni yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  // Faqat to'liq to'ldirilgan va sozlab bo'lingan do'konlarni saralab olamiz
  const validStores = stores.filter((store) => {
    const storeName = store.name || store.store_name;
    // Nomi bo'sh bo'lmasligi va standart boshlang'ich nomda qolmagan bo'lishi kerak
    return storeName && storeName.trim() !== '' && storeName !== "Mening Do'konim";
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Yuqori qism (Header) */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <button 
          onClick={onBack}
          className="p-2 bg-gray-100 text-gray-700 rounded-xl active:scale-95 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-gray-800">Mavjud do'konlar</h2>
      </div>

      {/* Do'konlar ro'yxati */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : validStores.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            Hozircha hech qanday do'kon mavjud emas.
          </div>
        ) : (
          validStores.map((store) => {
            const storeName = store.name || store.store_name;
            const storeImage = store.logo || store.image_url;

            return (
              <div 
                key={store.id || store.store_id} 
                onClick={() => onSelectStore && onSelectStore(store)}
                className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
              >
                {/* Chap taraf: 1x1 Rasm (1/4 qismi) */}
                <div className="w-[25%] aspect-square bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {storeImage ? (
                    <img 
                      src={storeImage} 
                      alt={storeName} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <ImageIcon size={24} className="text-gray-300" />
                  )}
                </div>

                {/* O'ng taraf: Ma'lumotlar */}
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="font-bold text-gray-800 text-base line-clamp-1">
                    {storeName}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {store.description || store.specialty || "Do'kon tavsifi kiritilmagan"}
                  </p>
                </div>

                {/* Strelka */}
                <div className="text-gray-300 pr-1">
                  <ChevronRight size={20} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
