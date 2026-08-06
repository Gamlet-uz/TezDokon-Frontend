import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../api/backend';
import { Phone, User, PackageOpen, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function Orders({ store }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (store?.store_id) {
      fetchOrders();
    }
  }, [store]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders(store.store_id);
      if (res.success) {
        const sortedOrders = (res.orders || []).sort((a, b) => {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        });
        setOrders(sortedOrders);
      }
    } catch (err) {
      console.error("Buyurtmalarni yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!window.confirm("Buyurtma holatini o'zgartirmoqchimisiz?")) return;

    setUpdatingId(orderId);
    try {
      const res = await updateOrderStatus(store.store_id, orderId, newStatus);
      if (res.success) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
      } else {
        alert("Holatni o'zgartirishda xatolik yuz berdi.");
      }
    } catch (err) {
      console.error(err);
      alert("Server bilan aloqada xatolik.");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.toLocaleDateString('uz-UZ')} ${d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 pb-10">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-gray-800">Buyurtmalar tarixi</h1>
        <p className="text-xs text-gray-500">Jami: {orders.length} ta buyurtma</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm mt-6">
          <PackageOpen size={40} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm font-medium">Hozircha buyurtmalar yo'q</p>
          <p className="text-gray-400 text-xs mt-1">Yangi buyurtmalar shu yerda ko'rinadi</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            // Telefon raqamni har xil joylardan qidirib topish
            const phone = order.customer?.phone || order.phone || order.customer_phone || order.phone_number;
            const customerName = order.customer?.name || order.customer_name || "Noma'lum mijoz";

            return (
              <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col">
                
                {/* Sarlavha qismi: Holati va Vaqti */}
                <div className="flex justify-between items-start border-b pb-3 mb-3">
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium mb-1">
                      {formatDate(order.created_at)}
                    </p>
                    
                    {order.status === 'new' && (
                      <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-md">
                        <Clock size={12} /> Kutilmoqda
                      </span>
                    )}
                    {order.status === 'delivered' && (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded-md">
                        <CheckCircle size={12} /> Yetkazildi
                      </span>
                    )}
                    {order.status === 'cancelled' && (
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-md">
                        <XCircle size={12} /> Bekor qilindi
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-0.5">Jami summa:</p>
                    <p className="text-sm font-bold text-blue-600">
                      {Number(order.total_price || 0).toLocaleString('uz-UZ')} so'm
                    </p>
                  </div>
                </div>

                {/* Mijoz Ma'lumotlari */}
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={14} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-700">
                      {customerName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    {phone ? (
                      <a href={`tel:${phone}`} className="text-xs font-bold text-blue-600 hover:underline">
                        {phone}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">Telefon kiritilmagan</span>
                    )}
                  </div>
                </div>

                {/* Xarid qilingan narsalar */}
                <div className="space-y-1 mb-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Mahsulotlar:</p>
                  {Array.isArray(order.items) && order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-gray-700">
                        {item.name || item.title} <span className="text-gray-400 font-medium">x{item.quantity}</span>
                      </span>
                      <span className="text-gray-800 font-medium">
                        {(item.price * item.quantity).toLocaleString('uz-UZ')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Boshqaruv tugmalari */}
                {order.status === 'new' && (
                  <div className="flex gap-2 mt-auto pt-2">
                    <button
                      onClick={() => handleStatusChange(order.id, 'cancelled')}
                      disabled={updatingId === order.id}
                      className="flex-1 border border-red-200 text-red-500 text-xs font-semibold py-2 rounded-xl hover:bg-red-50 transition"
                    >
                      Bekor qilish
                    </button>
                    <button
                      onClick={() => handleStatusChange(order.id, 'delivered')}
                      disabled={updatingId === order.id}
                      className="flex-1 bg-blue-600 text-white text-xs font-bold py-2 rounded-xl shadow-sm hover:bg-blue-700 transition"
                    >
                      {updatingId === order.id ? '...' : 'Yetkazildi'}
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
