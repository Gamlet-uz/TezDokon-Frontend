import React, { useEffect, useState } from 'react';
import { getProducts, createOrder } from '../api/backend';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart'; // <-- Yangi Cart komponentini uladik

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

      {/* Alohida ajratilgan Cart (Savatcha) komponentini chaqiramiz */}
      <Cart 
        cart={cart}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onCheckout={handleCheckout}
        customerPhone={customerPhone}
        setCustomerPhone={setCustomerPhone}
        submitting={submitting}
      />
    </div>
  );
}
