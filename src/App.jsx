import React, { useEffect, useState } from 'react';
import { initStore, getStore } from './api/backend';
import StoreFront from './pages/StoreFront';
import AdminDashboard from './pages/AdminDashboard';
import ManageProducts from './pages/ManageProducts';
import Orders from './pages/Orders';
import { Store, PackageSearch, ClipboardList, BarChart3 } from 'lucide-react'; // Ikonkalarni chaqiramiz

// Brauzerda ochilganda avtomatik Telegram muhitini va Test foydalanuvchini yaratish
if (typeof window !== 'undefined') {
  if (!window.Telegram) {
    window.Telegram = {};
  }
  if (!window.Telegram.WebApp) {
    window.Telegram.WebApp = {};
  }
  
  // Agar foydalanuvchi ma'lumotlari bo'lmasa, majburiy test obyektini joylaymiz
  if (!window.Telegram.WebApp.initDataUnsafe?.user) {
    window.Telegram.WebApp.ready = () => {};
    window.Telegram.WebApp.expand = () => {};
    window.Telegram.WebApp.close = () => {};
    window.Telegram.WebApp.initDataUnsafe = {
      user: {
        id: 123456789,
        first_name: "Test Mijoz",
        username: "test_user"
      }
    };
  }
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [store, setStore] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentTab, setCurrentTab] = useState('products');

  useEffect(() => {
    async function setupApp() {
      try {
        const tg = window.Telegram?.WebApp;
        if (tg?.ready) tg.ready();
        if (tg?.expand) tg.expand();

        const queryParams = new URLSearchParams(window.location.search);
        const urlStoreId = queryParams.get('store_id');

        const tgUser = tg?.initDataUnsafe?.user;
        setUser(tgUser);

        if (urlStoreId) {
          const res = await getStore(urlStoreId);
          if (res.success) {
            setStore(res.store);
            setIsAdmin(tgUser && String(tgUser.id) === String(res.store.owner_id));
          } else {
            setError("Do'kon topilmadi");
          }
        } else if (tgUser?.id) {
          const res = await initStore(tgUser.id, {
            first_name: tgUser.first_name,
            username: tgUser.username,
          });

          if (res.success) {
            setStore(res.store);
            setIsAdmin(true);
          } else {
            setError("Do'konga ulanishda xatolik yuz berdi");
          }
        } else {
          setError("Iltimos, ushbu ilovani Telegram orqali oching.");
        }
      } catch (err) {
        console.error("App init error:", err);
        setError("Tizimga ulanishda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    }

    setupApp();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 font-medium">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm text-center max-w-sm">
          <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl">!</div>
          <h2 className="text-lg font-bold text-gray-800 mb-1">Xatolik</h2>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
        </div>
      </div>
    );
  }

  // Menyu ro'yxati (Faqat admin uchun mo'ljallangan qismlar)
  const navItems = [
    { id: 'products', label: 'Vitrina', icon: Store },
    { id: 'manage_products', label: 'Mahsulotlar', icon: PackageSearch },
    { id: 'orders', label: 'Buyurtmalar', icon: ClipboardList },
    { id: 'admin', label: 'Statistika', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20"> 
      {/* pb-20 juda muhim. Bu kontentni ekranning eng pastigacha yopishib qolmasligini ta'minlaydi */}

      {/* Asosiy Ekran Qismi */}
      <main>
        {currentTab === 'products' && <StoreFront store={store} isAdmin={isAdmin} />}
        {currentTab === 'admin' && <AdminDashboard store={store} />}
        {currentTab === 'manage_products' && <ManageProducts store={store} />}
        {currentTab === 'orders' && <Orders store={store} />}
      </main>

      {/* Zamonaviy Pastki Navigatsiya (Faqat Admin bo'lsa ko'rinadi) */}
      {isAdmin && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
          <div className="flex justify-around items-center h-16 max-w-md mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
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
      )}
    </div>
  );
}
