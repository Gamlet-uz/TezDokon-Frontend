import React, { useEffect, useState } from 'react';
import { getProducts, createOrder } from '../api/backend';
import ProductCard from '../components/ProductCard';

export default function StoreFront({ store }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');

  useEffect(() => {
    if (store?.id) {
      loadProducts();
    }
  }, [store]);

  const loadProducts = async () => {
    try {
      const res = await getProducts(store.id);
      if (res.success) {
        setProducts(res.products || []);
      }
    } catch (err) {
      console.error("Mahsulotlarni yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (!customerPhone.trim()) {
      alert("Iltimos, telefon raqamingizni kiriting!");
      return;
    }

    setSubmitting(true);
    try {
      const tg = window.Telegram?.WebApp;
      const tgUser = tg?.initDataUnsafe?.user;

      const orderData = {
        customer: {
          telegram_id: tgUser?.id || 'anon',
          name: tgUser ? `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() : 'Mijoz',
          username: tgUser?.username || '',
          phone: customerPhone
        },
        items: cart.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity
        })),
        total_price: totalAmount
      };

      const res = await createOrder(store.id, orderData);
      if (res.success) {
        alert("Buyurtmangiz muvaffaqiyatli qabul qilindi! Do'kon egasi tez orada aloqaga chiqadi.");
        setCart([]);
        setIsCartOpen(false);
        if (tg) tg.close(); // Buyurtma muvaffaqiyatli bo'lsa, Telegram Web App'ni avtomatik yopadi
      } else {
        alert("Buyurtma yuborishda xatolik yuz berdi.");
      }
    } catch (err) {
      console.error(err);
      alert("Server bilan aloqada xatolik.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-5 text-center text-gray-500">Mahsulotlar yuklanmoqda...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Do'kon sarlavhasi */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">{store?.name || "Do'kon"}</h1>
        <p className="text-xs text-gray-500">Eng sara mahsulotlar va tezkor yetkazib berish</p>
      </div>

      {/* Mahsulotlar ro'yxati (Grid) */}
      {products.length === 0 ? (
        <div className="text-center py-10 text-gray-400">Hozircha mahsulotlar mavjud emas.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-20">
          {products.map((product) => {
            const cartItem = cart.find((i) => i.id === product.id);
            return (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                cartQuantity={cartItem ? cartItem.quantity : 0}
              />
            );
          })}
        </div>
      )}

      {/* Savatcha paneli (Pastda qalqib chiquvchi) */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto bg-blue-600 text-white rounded-2xl p-4 shadow-xl flex items-center justify-between z-30">
          <div>
            <p className="text-xs text-blue-100">{totalItemsCount} ta mahsulot</p>
            <p className="font-bold text-lg">{totalAmount.toLocaleString('uz-UZ')} so'm</p>
          </div>
          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-white text-blue-600 font-bold px-4 py-2 rounded-xl text-sm shadow active:scale-95 transition"
          >
            Savatcha
          </button>
        </div>
      )}

      {/* Savatcha Modali (Oynasi) */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Buyurtmangiz</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-gray-400 font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                  <div>
                    <p className="font-medium text-sm text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-500">
                      {item.price.toLocaleString('uz-UZ')} x {item.quantity} = {(item.price * item.quantity).toLocaleString('uz-UZ')} so'm
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="w-7 h-7 bg-white border rounded-lg text-gray-600 font-bold flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-7 h-7 bg-white border rounded-lg text-gray-600 font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Bog'lanish uchun telefon raqamingiz:
              </label>
              <input
                type="text"
                placeholder="+998 90 123 45 67"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full border rounded-xl p-3 text-sm outline-none focus:border-blue-600"
              />
            </div>

            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition disabled:opacity-50"
            >
              {submitting ? "Yuborilmoqda..." : "Buyurtmani tasdiqlash"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
