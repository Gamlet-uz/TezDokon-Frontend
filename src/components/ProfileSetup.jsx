import React, { useState, useEffect } from 'react';
import { User, Phone, ArrowRight, Store } from 'lucide-react';
import { registerUser } from '../api/backend';

export default function ProfileSetup({ onComplete }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const tg = window.Telegram?.WebApp;
      const tgUser = tg?.initDataUnsafe?.user;
      
      if (tgUser) {
        const fullName = `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim();
        if (fullName) setName(fullName);
      }
    } catch (err) {
      console.log("Telegram obyekti topilmadi (Brauzer rejimi)");
    }
  }, []);

  const handleSetPhone = (e) => {
    let val = e.target.value;
    let numbers = val.replace(/[^\d]/g, '');
    
    if (numbers === '' || numbers === '998') {
      setPhone('+998 ');
      return;
    }
    
    if (!numbers.startsWith('998')) {
      numbers = '998' + numbers;
    }
    
    numbers = numbers.slice(0, 12);
    
    let formatted = '+998';
    if (numbers.length > 3) formatted += ' ' + numbers.slice(3, 5);
    if (numbers.length > 5) formatted += ' ' + numbers.slice(5, 8);
    if (numbers.length > 8) formatted += ' ' + numbers.slice(8, 10);
    if (numbers.length > 10) formatted += ' ' + numbers.slice(10, 12);

    setPhone(formatted);
    setError('');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Iltimos, ismingizni kiriting!");
      return;
    }

    if (phone.replace(/[^\d]/g, '').length !== 12) {
      setError("Telefon raqamni to'liq kiriting!");
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const tg = window.Telegram?.WebApp;
      const tgUser = tg?.initDataUnsafe?.user;

      const userData = {
        telegram_id: tgUser?.id ? String(tgUser.id) : `web_${Date.now()}`,
        name: name.trim(),
        phone: phone,
        username: tgUser?.username || ''
      };

      // 1. Birinchi navbatda LocalStorage'ga saqlaymiz (Zaxira)
      localStorage.setItem('user_profile', JSON.stringify(userData));

      // 2. Backend'ga so'rov yuboramiz
      const response = await registerUser(userData);

      // Backend muvaffaqiyatli bo'lsa ham, 404 yoki boshqa xatolik bersa ham 
      // foydalanuvchini ushlab turmasdan keyingi sahifaga o'tkazamiz
      if (response && response.success !== false) {
        onComplete(userData);
      } else {
        console.warn("Backend'da saqlashda xatolik yuz berdi, lekin profil lokal saqlandi:", response?.message);
        onComplete(userData); 
      }
    } catch (err) {
      console.error("Saqlashda kutilmagan xatolik:", err);
      // Xatolik bo'lgan taqdirda ham foydalanuvchini o'tkazib yuborish
      const fallbackData = {
        telegram_id: `web_${Date.now()}`,
        name: name.trim(),
        phone: phone,
        username: ''
      };
      localStorage.setItem('user_profile', JSON.stringify(fallbackData));
      onComplete(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-purple-100 rounded-full blur-3xl opacity-60"></div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="flex flex-col items-center mb-10 text-center animate-slide-up">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mb-5 shadow-lg shadow-blue-200 transform rotate-3">
            <Store size={40} className="-rotate-3" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Xush kelibsiz!</h1>
          <p className="text-gray-500 text-sm px-4">
            Do'kondan xarid qilishni boshlash uchun o'zingizni tanishtiring.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5 animate-slide-up">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block ml-1">
              Ism va Familiya
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-gray-400">
                <User size={20} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="Masalan: Alisher Valiyev"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-10 pr-4 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block ml-1">
              Telefon raqami
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-gray-400">
                <Phone size={20} />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={handleSetPhone}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-10 pr-4 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-800 font-medium tracking-wide"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm font-medium text-center animate-fade-in">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 mt-2 shadow-lg shadow-blue-200 active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Boshlash <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
