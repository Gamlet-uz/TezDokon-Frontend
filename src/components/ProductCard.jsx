import React from 'react';

export default function ProductCard({ product, onAddToCart, onRemoveFromCart, cartQuantity, onClick }) {
  return (
    <div 
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between p-3 cursor-pointer transition-transform active:scale-95"
      onClick={() => onClick(product)} // Kartochka bosilganda modal ochiladi
    >
      {/* Mahsulot Rasmi */}
      <div className="w-full h-36 bg-gray-100 rounded-xl overflow-hidden mb-3 relative">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name || product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Rasm yo'q</div>
        )}
      </div>

      {/* Mahsulot Ma'lumotlari */}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-tight mb-1">
          {product.name || product.title}
        </h3>
        {product.description && (
          <p className="text-gray-500 text-xs mb-2 line-clamp-2">
            {product.description}
          </p>
        )}
        <p className="text-blue-600 font-bold text-base mb-3">
          {Number(product.price).toLocaleString('uz-UZ')} so'm
        </p>
      </div>

      {/* Savatcha boshqaruvi (+ / - tugmalari) */}
      <div onClick={(e) => e.stopPropagation()}> {/* Tugma bosilganda oyna ochilib ketmasligini ta'minlaydi */}
        {cartQuantity > 0 ? (
          <div className="flex items-center justify-between bg-gray-100 rounded-xl p-1 shadow-inner">
            <button 
              onClick={() => onRemoveFromCart(product.id)}
              className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-red-500 font-bold text-lg active:scale-90"
            >-</button>
            <span className="font-bold text-sm text-gray-800">{cartQuantity}</span>
            <button 
              onClick={() => onAddToCart(product)}
              className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-blue-600 font-bold text-lg active:scale-90"
            >+</button>
          </div>
        ) : (
          <button
            onClick={() => onAddToCart(product)}
            className="w-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-medium py-2 rounded-xl text-xs transition-colors duration-200 flex items-center justify-center gap-1 active:scale-95"
          >
            <span>+ Qo'shish</span>
          </button>
        )}
      </div>
    </div>
  );
}
