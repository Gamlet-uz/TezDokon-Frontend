import React, { useEffect, useState } from 'react';
import { getProducts, createOrder } from '../api/backend';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart'; 
import ProductModal from '../components/ProductModal'; 

export default function StoreFront({ store }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Boshlang'ich qiymatni +998 qilib belgilaymiz
  const [customerPhone, setCustomerPhone] = useState('+998 ');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (store?.store_id) {
      loadProducts();
    }
  }, [store]);

  const loadProducts = async () => {
    try {
      const res = await getProducts(store.store_id);
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

  // Telefon raqamni formatlaydigan funksiya
  const handleSetPhone = (val) => {
    let str = typeof val === 'string' ? val : (val?.target?.value || '');
    
    // Faqat raqamlarni ajratib olamiz
    let numbers = str.replace(/[^\d]/g, '');
    
    // Agar foydalanuvchi hammasini o'chirib tashlasa, yana +998 qilib qo'yamiz
    if (numbers === '' || numbers === '998') {
      setCustomerPhone('+998 ');
      return;
    }
    
    // 998 bilan boshlanmasa, qo'shib qo'yamiz
    if (!numbers.startsWith('998')) {
      numbers = '998' + numbers;
    }
    
    // Maksimal 12 ta raqam (998 90 123 45 67)
    numbers = numbers.slice(0, 12);
    
    // Formatlash (Bo'sh joylarni qo'shib chiqish)
    let formatted = '+998';
    if (numbers.length > 3) formatted += ' ' + numbers.slice(3, 5);
    if (numbers.length > 5) formatted += ' ' + numbers.slice(5, 8);
    if (numbers.length > 8) formatted += ' ' + numbers.slice(8, 10);
    if (numbers.length > 10) formatted += ' ' + numbers.slice(10, 12);

    setCustomerPhone(formatted);
  };

  const handleCheckout = async () => {
    // Raqam to'liq 12 ta son (998 va 9 ta raqam) ekanligini tekshiramiz
    if (!customerPhone || customerPhone.replace(/[^\d]/g, '').length !== 12) {
      alert("Iltimos, telefon raqamingizni to'liq kiriting! (Masalan: +998 90 123 45 67)");
      return;
    }

    setSubmitting(true);
    try {
      const tg = window.Telegram?.WebApp;
      const tgUser = tg?.initDataUnsafe?.user;

      // Ismni har qanday holatda ham aniqlash (Telegramdan yoki oddiy kiritishdan)
      const customerName = tgUser?.first_name 
        ? `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() 
        : (tgUser?.username ? `@${tgUser.username}` : "Mijoz");

      const orderData = {
        customer: {
          telegram_id: tgUser?.id || 'browser_user',
          name: customerName,
          username: tgUser?.username || 'browser_user',
          phone: customerPhone
        },
        // Backend va Admin panel uchun barcha mumkin bo'lgan kalitlar:
        name: customerName,
        customer_name: customerName,
        phone: customerPhone, 
        phone_number: customerPhone,
        customer_phone: customerPhone,
        
        items: cart.map(item => ({
          id: item.id,
          name: item.name || item.title, 
          title: item.name || item.title,
          price: item.price,
          quantity: item.quantity
        })),
        total_price: totalAmount
      };

      const res = await createOrder(store.store_id, orderData);
      if (res.success) {
        alert("Buyurtmangiz muvaffaqiyatli qabul qilindi! Do'kon egasi tez orada aloqaga chiqadi.");
        setCart([]);
        setIsCartOpen(false);
        if (tg?.close) tg.close();
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
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4 pb-28">
      {/* Do'kon sarlavhasi */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">{store?.name || "Do'kon"}</h1>
        <p className="text-xs text-gray-500">Eng sara mahsulotlar va tezkor yetkazib berish</p>
      </div>

      {/* Mahsulotlar ro'yxati (Grid) */}
      {products.length === 0 ? (
        <div className="text-center py-10 text-gray-400">Hozircha mahsulotlar mavjud emas.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => {
            const cartItem = cart.find((i) => i.id === product.id);
            return (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart} 
                cartQuantity={cartItem ? cartItem.quantity : 0}
                onClick={setSelectedProduct}            
              />
            );
          })}
        </div>
      )}

      {/* Savatcha paneli (z-[50] qilib to'g'irlandi) */}
      {cart.length > 0 && (
        <div className="fixed bottom-[75px] left-4 right-4 max-w-md mx-auto bg-blue-600 text-white rounded-2xl p-4 shadow-xl flex items-center justify-between z-[40]">
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

      {/* Cart (Savatcha) komponenti */}
      <Cart 
        cart={cart}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onCheckout={handleCheckout}
        customerPhone={customerPhone}
        setCustomerPhone={handleSetPhone}
        submitting={submitting}
      />
      
      {/* Mahsulot modal oynasi */}
      <ProductModal 
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        cartQuantity={selectedProduct ? (cart.find(i => i.id === selectedProduct.id)?.quantity || 0) : 0}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
      />
    </div>
  );
}
