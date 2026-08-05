import React, { useState, useEffect } from 'react';
import { getProducts, getOrders } from '../api/backend';
import { Store, Package, ShoppingCart, TrendingUp, Clock } from 'lucide-react';

export default function AdminDashboard({ store }) {
  const [stats, setStats] = useState({
    productsCount: 0,
    ordersCount: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (store?.store_id) {
      loadStats();
    }
  }, [store]);

  const loadStats = async () => {
    try {
      setLoading(true);
      // Backend'dan mahsulotlar va buyurtmalarni bir vaqtda yuklab olamiz
      const [productsRes, ordersRes] = await Promise.all([
        getProducts(store.store_id),
        getOrders(store.store_id)
      ]);

      const products = productsRes.success ? productsRes.products : [];
      const orders = ordersRes.success ? ordersRes.orders : [];

      // Yangi (hali yetkazilmagan) buyurtmalarni sanash
      const pending = orders.filter(o => o.status === 'new').length;

      // Faqat yetkazib berilgan ('delivered') buyurtmalar orqali sof daromadni hisoblash
      const revenue = orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, order) => sum + Number(order.total_price || 0), 0);

      setStats({
        productsCount: products.length,
        ordersCount: orders.length,
        pendingOrders: pending,
        totalRevenue: revenue,
      });
    } catch (error) {
      console.error("Statistikani yuklashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Sarlavha qismi */}
      <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
          <Store size={24} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-800">{store?.name || "Mening Do'konim"}</h1>
          <p className="text-sm text-gray-500">Boshqaruv paneli</p>
        </div>
      </div>

      {/* Statistikalar Grid (To'r) tizimi */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Daromad kartochkasi (To'liq eniga) */}
        <div className="col-span-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white p-5 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium mb-1">Umumiy daromad</p>
            <h2 className="text-2xl font-bold">
              {stats.totalRevenue.toLocaleString('uz-UZ')} <span className="text-lg font-normal">so'm</span>
            </h2>
          </div>
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <TrendingUp size={28} className="text-white" />
          </div>
        </div>

        {/* Kutilayotgan buyurtmalar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 flex flex-col items-start">
          <div className="bg-orange-100 text-orange-600 p-2 rounded-lg mb-3">
            <Clock size={20} />
          </div>
          <p className="text-gray-500 text-xs font-medium mb-1">Yangi buyurtmalar</p>
          <h3 className="text-xl font-bold text-gray-800">{stats.pendingOrders} ta</h3>
        </div>

        {/* Jami mahsulotlar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100 flex flex-col items-start">
          <div className="bg-blue-100 text-blue-600 p-2 rounded-lg mb-3">
            <Package size={20} />
          </div>
          <p className="text-gray-500 text-xs font-medium mb-1">Barcha mahsulotlar</p>
          <h3 className="text-xl font-bold text-gray-800">{stats.productsCount} ta</h3>
        </div>

        {/* Jami buyurtmalar (Tarix) */}
        <div className="col-span-2 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-purple-100 text-purple-600 p-3 rounded-xl">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Barcha tushgan buyurtmalar</p>
            <h3 className="text-lg font-bold text-gray-800">{stats.ordersCount} ta</h3>
          </div>
        </div>

      </div>
    </div>
  );
}
