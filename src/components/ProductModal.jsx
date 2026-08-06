import React from 'react';

export default function ProductModal({ product, onClose, cartQuantity, onAddToCart, onRemoveFromCart }) {
  if (!product) return null;

  return (
    // Qora orqa fon (bosilganda yopiladi)
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-50 transition-opacity" onClick={onClose}>
      
      {/* Oq oyna */}
      <div 
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 pb-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Ichkariga bosganda yopilib ketmasligi uchun
      >
        {/* Yopish tugmasi (X) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-100 text-gray-500 hover:text-gray-800 rounded-full w-8 h-8 flex items-center justify-center font-bold z-10"
        >
          ✕
        </button>

        {/* 1. Rasm */}
        <div className="w-full h-64 bg-gray-100 rounded-2xl overflow-hidden mb-5">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name || product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">Rasm yo'q</div>
          )}
        </div>

        {/* 2. Nomi */}
        <h2 className="text-xl font-bold text-gray-800 mb-2 leading-tight">
          {product.name || product.title}
        </h2>

        {/* 3. Narxi va Savatga qo'shish qismi (Yonma-yon) */}
        <div className="flex items-center justify-between mb-5 pb-5 border-b border-gray-100">
          <p className="text-2xl text-blue-600 font-bold">
            {Number(product.price).toLocaleString('uz-UZ')} so'm
          </p>

          <div className="w-32">
            {cartQuantity > 0 ? (
              <div className="flex items-center justify-between bg-gray-100 rounded-xl p-1 shadow-inner">
                <button 
                  onClick={() => onRemoveFromCart(product.id)}
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-red-500 font-bold text-xl active:scale-90"
                >-</button>
                <span className="font-bold text-lg text-gray-800">{cartQuantity}</span>
                <button 
                  onClick={() => onAddToCart(product)}
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm text-blue-600 font-bold text-xl active:scale-90"
                >+</button>
              </div>
            ) : (
              <button
                onClick={() => onAddToCart(product)}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl text-sm transition-transform active:scale-95 shadow-md"
              >
                + Qo'shish
              </button>
            )}
          </div>
        </div>

        {/* 4. Tavsif */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Mahsulot haqida:</h3>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
            {product.description || "Ushbu mahsulot uchun batafsil tavsif kiritilmagan."}
          </p>
        </div>

      </div>
    </div>
  );
}
