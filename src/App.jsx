import React, { useEffect, useState } from 'react';
import { initStore, getStore } from './api/backend';
import StoreFront from './pages/StoreFront';
import AdminDashboard from './pages/AdminDashboard';
import ManageProducts from './pages/ManageProducts';
import Orders from './pages/Orders';
import { Store, PackageSearch, ClipboardList, BarChart3, ArrowLeft } from 'lucide-react';

// Komponentlarni chaqiramiz
import WelcomeScreen from './components/WelcomeScreen'; 
import StoresList from './components/StoresList';        
import ProfileSetup from './components/ProfileSetup'; // <-- YANGI PROFIL OYNASI QO'SHILDI

// Brauzerda ochilganda avtomatik Telegram muhitini va Test foydalanuvchini yaratish
if (typeof window !== 'undefined') {
  if (!window.Telegram) {
    window.Telegram = {};
  }
  if (!window.Telegram.WebApp) {
    window.Telegram.WebApp = {};
  }
  
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

  // Ekranni boshqarish uchun state'lar
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [selectedStore, setSelectedStore] = useState(null);
  const [initializingStore, setInitializingStore] = useState(false);

  // <-- YANGI QO'SHILGAN STATE (Foydalanuvchi profili uchun) -->
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    async function setupApp() {
      try {
        const tg = window.Telegram?.WebApp;
        if (tg?.ready) tg.ready();
        if (tg?.expand) tg.expand();

        // Xotiradan profilni qidiramiz
        const savedProfile = localStorage.getItem('user_profile');
        if (savedProfile) {
          setUserProfile(JSON.parse(savedProfile));
        }

        const queryParams = new URLSearchParams(window.location.search);
        const urlStoreId = queryParams.get('store_id');

        const tgUser = tg?.initDataUnsafe?.user;
        setUser(tgUser);

        if (urlStoreId) {
          // Agar foydalanuvchi do'konning maxsus havolasi orqali kelsa
          const res = await getStore(urlStoreId);
          if (res.success) {
            setStore(res.store);
            setIsAdmin(tgUser && String(tgUser.id) === String(res.store.owner_id));
            setCurrentScreen('main'); 
          } else {
            setError("Do'kon topilmadi");
          }
        } else if (!tgUser?.id) {
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

  // "Yangi do'kon yaratish" tugmasi bosilganda
  const handleCreateStore = async () => {
    if (!user) {
      alert("Telegram foydalanuvchi ma'lumotlari topilmadi!");
      return;
    }
    
    setInitializingStore(true);
    try {
      const res = await initStore(user.id, {
        first_name: user.first_name,
        username: user.username,
      });

      if (res.success) {
        setStore(res.store);
        setIsAdmin(true);
        setCurrentScreen('main'); 
      } else {
        alert("Do'konga ulanishda xatolik yuz berdi");
      }
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi.");
    } finally {
      setInitializingStore(false);
    }
  };

  if (loading || initializingStore) {
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

  // ==========================================
  // ENG BIRINCHI OYNA: PROFILNI SOZLASh
  // Agar userProfile bo'lmasa, dastur shu yerda to'xtab ProfileSetup ni ochadi
  // ==========================================
  if (!userProfile) {
    return <ProfileSetup onComplete={(data) => setUserProfile(data)} />;
  }

  const navItems = [
    { id: 'products', label: 'Vitrina', icon: Store },
    { id: 'manage_products', label: 'Mahsulotlar', icon: PackageSearch },
    { id: 'orders', label: 'Buyurtmalar', icon: ClipboardList },
    { id: 'admin', label: 'Statistika', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50"> 
      
      {/* 1. XUSH KELIBSZ EKRANI (Do'kon yaratish / Ko'rish) */}
      {currentScreen === 'welcome' && (
        <WelcomeScreen 
          onNavigate={(action) => {
            if (action === 'create_store') handleCreateStore();
            if (action === 'view_stores') setCurrentScreen('view_stores');
          }} 
        />
      )}

      {/* 2. DO'KONLAR RO'YXATI EKRANI */}
      {currentScreen === 'view_stores' && (
        <StoresList 
          onBack={() => setCurrentScreen('welcome')} 
          onSelectStore={(selected) => {
            setSelectedStore(selected);
            setCurrentScreen('store_front');
          }}
        />
      )}

      {/* 3. XARIDOR SIFATIDA BOSHQA DO'KONNI KO'RISH EKRANI */}
      {currentScreen === 'store_front' && selectedStore && (
        <div className="pb-10">
          <div className="bg-white px-4 py-3 border-b shadow-sm sticky top-0 z-50">
             <button 
                onClick={() => setCurrentScreen('view_stores')} 
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg active:scale-95 transition"
             >
                <ArrowLeft size={16} /> Ortga qaytish
             </button>
          </div>
          {/* userProfile ni vitrinaga uzatamiz */}
          <StoreFront store={selectedStore} isAdmin={false} userProfile={userProfile} />
        </div>
      )}

      {/* 4. ASOSIY ADMIN VA DO'KON EKRANI */}
      {currentScreen === 'main' && (
        <div className="pb-20">
          <main>
            {/* userProfile ni vitrinaga uzatamiz */}
            {currentTab === 'products' && <StoreFront store={store} isAdmin={isAdmin} userProfile={userProfile} />}
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
      )}

    </div>
  );
}
