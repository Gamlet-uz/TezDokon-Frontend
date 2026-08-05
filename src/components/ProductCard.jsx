import React from 'react';

export default function ProductCard({ product, onAddToCart, cartQuantity }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between p-3">
      {/* Mahsulot Rasmi */}
      <div className="w-full h-36 bg-gray-100 rounded-xl overflow-hidden mb-3 relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name || product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            Rasm yo'q
          </div>
        )}
        
        {/* Agar savatchaga qo'shilgan bo'lsa, sonini rasm ustida ko'rsatish */}
        {cartQuantity > 0 && (
          <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
            {cartQuantity} ta
          </span>
        )}
      </div>

      {/* Mahsulot Ma'lumotlari */}
      <div className="flex-1">
        {/* Nomi (name yoki title ni tekshiramiz) */}
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-tight mb-1">
          {product.name || product.title}
        </h3>

        {/* Tavsifi */}
        {product.description && (
          <p className="text-gray-500 text-xs mb-2 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Narxi */}
        <p className="text-blue-600 font-bold text-base mb-3">
          {Number(product.price).toLocaleString('uz-UZ')} so'm
        </p>
      </div>

      {/* Qo'shish Tugmasi */}
      <button
        onClick={() => onAddToCart(product)}
        className="w-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-medium py-2 rounded-xl text-xs transition-colors duration-200 flex items-center justify-center gap-1 active:scale-95"
      >
        <span>+ Qo'shish</span>
      </button>
    </div>
  );
}
