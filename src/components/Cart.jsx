import React from 'react';

export default function Cart({
  cart,
  isCartOpen,
  setIsCartOpen,
  onAddToCart,
  onRemoveFromCart,
  onCheckout,
  customerPhone,
  setCustomerPhone,
  submitting
}) {
  // Agar savatcha yopiq bo'lsa, hech narsa ko'rsatmaydi
  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto">
        
        {/* Sarlavha va Yopish tugmasi */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Buyurtmangiz</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-gray-400 font-bold text-xl px-2"
          >
            ✕
          </button>
        </div>

        {/* Savatchadagi mahsulotlar ro'yxati */}
        <div className="space-y-3 mb-4">
          {cart.map((item) => {
            // Qoldiqni aniqlaymiz
            const stock = item.stock ?? item.quantity;
            const canAddMoreInCart = stock === null || stock === undefined || item.quantity < stock;

            return (
              <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                <div>
                  <p className="font-medium text-sm text-gray-800">{item.name || item.title}</p>
                  <p className="text-xs text-gray-500">
                    {item.price.toLocaleString('uz-UZ')} x {item.quantity} = {(item.price * item.quantity).toLocaleString('uz-UZ')} so'm
                  </p>
                  {stock !== null && stock !== undefined && (
                    <p className="text-[10px] text-gray-400 mt-0.5">Qoldiq: {stock} ta</p>
                  )}
                </div>
                
                {/* Soni (+/-) tugmalari */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onRemoveFromCart(item.id)}
                    className="w-7 h-7 bg-white border rounded-lg text-gray-600 font-bold flex items-center justify-center shadow-sm active:scale-95 transition"
                  >
                    -
                  </button>
                  <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => {
                      if (canAddMoreInCart) {
                        onAddToCart(item);
                      } else {
                        alert(`Kechirasiz, bazada faqat ${stock} ta mavjud!`);
                      }
                    }}
                    className={`w-7 h-7 border rounded-lg font-bold flex items-center justify-center shadow-sm transition ${
                      canAddMoreInCart ? 'bg-white text-gray-600 active:scale-95' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Telefon raqam kiritish */}
        <div className="border-t border-gray-100 pt-4 mb-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Bog'lanish uchun telefon raqamingiz:
          </label>
          <input
            type="tel"
            placeholder="+998 90 123 45 67"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full border rounded-xl p-3 text-sm outline-none focus:border-blue-600 bg-gray-50"
          />
        </div>

        {/* Tasdiqlash tugmasi */}
        <button
          onClick={onCheckout}
          disabled={submitting || cart.length === 0}
          className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
        >
          {submitting ? "Yuborilmoqda..." : "Buyurtmani tasdiqlash"}
        </button>
      </div>
    </div>
  );
}
