import React, { useState } from 'react';
import { Edit3, X, Save, Store as StoreIcon, BarChart3, TrendingUp, Users } from 'lucide-react';
import { updateStore } from '../api/backend';

export default function AdminDashboard({ store }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Do'kon ma'lumotlari uchun state
  const [formData, setFormData] = useState({
    name: store?.name || '',
    description: store?.description || store?.specialty || '',
    logo: store?.logo || store?.image_url || ''
  });

  const handleSave = async () => {
    if (!formData.name) {
      alert("Do'kon nomini kiritish majburiy!");
      return;
    }
    
    setLoading(true);
    try {
      const res = await updateStore(store.id || store.store_id, formData);
      if (res.success) {
        alert("Do'kon ma'lumotlari muvaffaqiyatli saqlandi!");
        setIsEditing(false);
        // Ilovani yangilash orqali yangi ma'lumotlarni ekranga chiqaramiz
        window.location.reload();
      } else {
        alert("Xatolik yuz berdi: " + (res.message || "Noma'lum xato"));
      }
    } catch (err) {
      alert("Internet yoki server bilan muammo yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-24 bg-gray-50 min-h-screen">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Statistika va Boshqaruv</h2>

      {/* Tahrirlash mumkin bo'lgan "Mening Do'konim" qismi */}
      <div 
        onClick={() => setIsEditing(true)}
        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer active:scale-95 transition-transform mb-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 border border-blue-100">
            {formData.logo ? (
              <img src={formData.logo} alt="Store Logo" className="w-full h-full object-cover" />
            ) : (
              <StoreIcon size={24} className="text-blue-500" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg leading-tight">
              {formData.name || "Mening do'konim"}
            </h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
              {formData.description || "Do'kon tavsifi va ixtisosligi kiritilmagan"}
            </p>
          </div>
        </div>
        <div className="bg-gray-50 p-2 rounded-full">
          <Edit3 size={20} className="text-gray-400" />
        </div>
      </div>

      {/* Asosiy Statistika Kartochkalari (Namuna) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <TrendingUp size={18} className="text-green-500" />
            <span className="text-sm font-medium">Savdo</span>
          </div>
          <p className="text-xl font-bold text-gray-800">0 so'm</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Users size={18} className="text-blue-500" />
            <span className="text-sm font-medium">Mijozlar</span>
          </div>
          <p className="text-xl font-bold text-gray-800">0 ta</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 col-span-2">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <BarChart3 size={18} className="text-purple-500" />
            <span className="text-sm font-medium">Jami Buyurtmalar</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">0 ta</p>
        </div>
      </div>

      {/* Do'konni tahrirlash oynasi (Modal) */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex flex-col justify-end sm:justify-center items-center">
          {/* Modal orqasi bosilganda yopilishi uchun */}
          <div className="absolute inset-0" onClick={() => setIsEditing(false)}></div>
          
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 relative z-[61] animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Do'konni tahrirlash</h3>
              <button 
                onClick={() => setIsEditing(false)} 
                className="p-2 bg-gray-100 text-gray-600 rounded-full active:scale-95 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Do'kon nomi
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  placeholder="Do'koningiz nomini kiriting..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Do'kon tavsifi (Ixtisosligi)
                </label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition resize-none"
                  rows="3"
                  placeholder="Masalan: Maishiy texnika va elektronika mahsulotlari..."
                ></textarea>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Do'kon rasmi (URL havola)
                </label>
                <input 
                  type="text" 
                  value={formData.logo}
                  onChange={(e) => setFormData({...formData, logo: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  placeholder="https://... rasm manzili"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  Telegram yoki boshqa tarmoqdan rasmning manzilini nusxalab bu yerga tashlang.
                </p>
              </div>

              <button 
                onClick={handleSave} 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 mt-2 shadow-md active:scale-[0.98] transition-all disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={20} /> Saqlash
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
