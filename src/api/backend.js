import axios from 'axios';

// Railway'dagi backend serveringizning to'liq URL manzili
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

// BARCHA DO'KONLARNI OLISH (REAL BACKEND)
export const getAllStores = async () => {
  try {
    // Avval /stores so'rovi yuboriladi
    const response = await api.get('/stores');
    return response.data;
  } catch (error) {
    // Agar /stores 404 bersa, zaxira sifatida /store/all ga so'rov yuboramiz
    try {
      const fallbackResponse = await api.get('/store/all');
      return fallbackResponse.data;
    } catch (fallbackError) {
      console.error("Barcha do'konlarni olishda xatolik:", fallbackError);
      return { success: false, stores: [] };
    }
  }
};

// Do'kon ma'lumotlarini (nomi, tavsifi, rasmi) yangilash
export const updateStore = async (storeId, updateData) => {
  try {
    const response = await api.put(`/store/${storeId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Do'konni yangilashda xatolik:", error);
    return { success: false, message: "Do'konni saqlashda xatolik yuz berdi" };
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
