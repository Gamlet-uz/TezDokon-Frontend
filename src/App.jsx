import React, { useEffect, useState } from 'react';
import { initStore, getStore } from './api/backend';
import StoreFront from './pages/StoreFront';
import AdminDashboard from './pages/AdminDashboard';
import ManageProducts from './pages/ManageProducts';
import Orders from './pages/Orders';

// 👇 MANA SHU YERGA QO'SHILDI: Brauzerda test qilish uchun vaqtincha Telegram "aldamchi" kodi
if (!window.Telegram?.WebApp?.initDataUnsafe?.user) {
  window.Telegram = window.Telegram || {};
  window.Telegram.WebApp = {
    initDataUnsafe: {
      user: {
        id: 123456789, // O'zingizning haqiqiy ID raqamingizni yozishingiz ham mumkin
        first_name: "Test Mijoz",
        username: "test_user"
      }
    },
    ready: () => {},
    expand: () => {},
    close: () => {},
    MainButton: { show: () => {}, hide: () => {}, setText: () => {}, onClick: () => {} }
  };
}
// 👆 -------------------------------------------------------------------------

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [store, setStore] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentTab, setCurrentTab] = useState('products'); // 'products', 'admin', 'manage_products', 'orders'

  useEffect(() => {
    async function setupApp() {
      try {
        const tg = window.Telegram?.WebApp;
        if (tg) {
          tg.ready();
          tg.expand(); // Web App oynasini to'liq ekranga yoyish
        }

        // URL parametrlaridan store_id ni olish (Xaridor havola orqali kirganda)
        const queryParams = new URLSearchParams(window.location.search);
        const urlStoreId = queryParams.get('store_id');

        // Telegram foydalanuvchi ma'lumotlarini olish
        const tgUser = tg?.initDataUnsafe?.user;
        setUser(tgUser);

        if (urlStoreId) {
          // 1. Xaridor rejimi: URL da store_id bo'lsa, shu do'kon ma'lumotlarini yuklaymiz
          const res = await getStore(urlStoreId);
          if (res.success) {
            setStore(res.store);
            setIsAdmin(tgUser && String(tgUser.id) === String(res.store.owner_id));
          } else {
            setError("Do'kon topilmadi");
          }
        } else if (tgUser?.id) {
          // 2. Admin rejimi: Telegram ID orqali do'konni ochish yoki yangi yaratish
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
          // Kompyuter brauzerida test uchun vaqtincha demo do'kon
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
          <div className="w-12 h-12 bg-red-100 text-red-50 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl">!</div>
          <h2 className="text-lg font-bold text-gray-800 mb-1">Xatolik</h2>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Admin Panel Navigatsiyasi (Agar foydalanuvchi do'kon egasi bo'lsa) */}
      {isAdmin && (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 py-2 flex justify-around">
          <button
            onClick={() => setCurrentTab('products')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${currentTab === 'products' ? 'bg-blue-600 text-white' : 'text-gray-600 bg-gray-100'}`}
          >
            Vitrina
          </button>
          <button
            onClick={() => setCurrentTab('manage_products')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${currentTab === 'manage_products' ? 'bg-blue-600 text-white' : 'text-gray-600 bg-gray-100'}`}
          >
            Mahsulotlar
          </button>
          <button
            onClick={() => setCurrentTab('orders')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${currentTab === 'orders' ? 'bg-blue-600 text-white' : 'text-gray-600 bg-gray-100'}`}
          >
            Buyurtmalar
          </button>
          <button
            onClick={() => setCurrentTab('admin')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${currentTab === 'admin' ? 'bg-blue-600 text-white' : 'text-gray-600 bg-gray-100'}`}
          >
            Statistika
          </button>
        </div>
      )}

      {/* Sahifalarni ko'rsatish */}
      {currentTab === 'products' && <StoreFront store={store} isAdmin={isAdmin} />}
      {currentTab === 'admin' && <AdminDashboard store={store} />}
      {currentTab === 'manage_products' && <ManageProducts store={store} />}
      {currentTab === 'orders' && <Orders store={store} />}
    </div>
  );
}
