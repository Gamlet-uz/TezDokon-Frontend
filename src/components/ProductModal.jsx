import React from 'react';

export default function ProductModal({ product, onClose, cartQuantity, onAddToCart, onRemoveFromCart }) {
  if (!product) return null;

  // 1. Backend'dan kelayotgan qoldiqni barcha ehtimoliy nomlar bo'yicha qidiramiz
  const rawStock = 
    product.stock ?? 
    product.quantity ?? 
    product.count ?? 
    product.amount ?? 
    product.balance ?? 
    product.qoldiq ?? 
    product.remains ?? 
    product.in_stock ?? 
    product.total_quantity;

  // Keyin uni raqam turiga o'tkazib olamiz (agar u "15" ko'rinishidagi string bo'lsa ham)
  const stock = (rawStock !== null && rawStock !== undefined && !isNaN(Number(rawStock))) 
    ? Number(rawStock) 
    : null;
  
  // Mahsulot tugaganmi?
  const isOutOfStock = stock !== null && stock <= 0;
  
  // Yana qo'shish mumkinligini tekshiramiz
  const canAddMore = stock === null || cartQuantity < stock;

  return (
    // Qora orqa fon (bosilganda yopiladi) va z-[60] menyu ustiga chiqishi uchun
    <div 
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity" 
      onClick={onClose}
    >
      
      {/* Oq oyna - overscroll-contain orqa fon surilishini to'xtatadi */}
      <div 
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 pb-8 shadow-2xl relative max-h-[90vh] overflow-y-auto overscroll-contain"
        onClick={(e) => e.stopPropagation()} // Ichkariga bosganda yopilib ketmasligi uchun
      >
        {/* Yopish tugmasi (X) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/80 backdrop-blur text-gray-600 hover:text-gray-900 rounded-full w-8 h-8 flex items-center justify-center font-bold z-10 shadow-sm"
        >
          ✕
        </button>

        {/* 1. Rasm */}
        <div className="w-full h-64 bg-gray-50 rounded-2xl overflow-hidden mb-5 flex items-center justify-center">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name || product.title} className="w-full h-full object-contain" />
          ) : (
            <div className="text-gray-400">Rasm yo'q</div>
          )}
        </div>

        {/* 2. Nomi */}
        <h2 className="text-xl font-bold text-gray-800 mb-2 leading-tight">
          {product.name || product.title}
        </h2>

        {/* 3. Narxi, Qoldiq va Savatga qo'shish qismi */}
        <div className="flex items-center justify-between mb-5 pb-5 border-b border-gray-100">
          <div className="flex flex-col">
            <p className="text-2xl text-blue-600 font-bold">
              {Number(product.price || 0).toLocaleString('uz-UZ')} so'm
            </p>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Qoldiq: {stock !== null ? `${stock} ta` : 'Cheksiz'}
            </p>
          </div>

          <div className="w-32 shrink-0">
            {isOutOfStock ? (
              <button disabled className="w-full bg-gray-100 text-gray-400 font-semibold py-3 rounded-xl text-sm cursor-not-allowed">
                Tugagan
              </button>
            ) : cartQuantity > 0 ? (
              <div className="flex items-center justify-between bg-gray-100 rounded-xl p-1 shadow-inner">
                <button 
                  onClick={() => onRemoveFromCart(product.id)}
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-red-500 font-bold text-xl active:scale-90 transition"
                >-</button>
                <span className="font-bold text-lg text-gray-800">{cartQuantity}</span>
                <button 
                  onClick={() => { if(canAddMore) onAddToCart(product); }}
                  disabled={!canAddMore}
                  className={`w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold text-xl transition ${
                    canAddMore ? 'text-blue-600 active:scale-90' : 'text-gray-300 cursor-not-allowed'
                  }`}
                >+</button>
              </div>
            ) : (
              <button
                onClick={() => onAddToCart(product)}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl text-sm transition-transform active:scale-95 shadow-md hover:bg-blue-700"
              >
                + Qo'shish
              </button>
            )}
          </div>
        </div>

        {/* 4. Tavsif */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">Mahsulot haqida:</h3>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
            {product.description || "Ushbu mahsulot uchun batafsil tavsif kiritilmagan."}
          </p>
        </div>

        {/* 5. VAQTINCHA DEBUG BLOKI (Telefonda backend ma'lumotlarini ko'rish uchun) */}
        {/* Qoldiq to'g'ri chiqsa yoki ishlatib bo'lgach, shunchaki quyidagi <details> blokini o'chirib tashlang */}
        <details className="mt-4 pt-3 border-t border-gray-200">
          <summary className="text-xs text-gray-400 cursor-pointer select-none">
            🔍 Backend ma'lumotlarini ko'rish (Debug)
          </summary>
          <pre className="text-[10px] bg-gray-900 text-green-400 p-3 rounded-xl mt-2 overflow-x-auto max-h-40">
            {JSON.stringify(product, null, 2)}
          </pre>
        </details>

      </div>
    </div>
  );
}
