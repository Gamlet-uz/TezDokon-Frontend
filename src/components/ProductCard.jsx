import React from 'react';
import { Plus, Minus, Image as ImageIcon } from 'lucide-react';

export default function ProductCard({ product, onAddToCart, onRemoveFromCart, cartQuantity, onClick }) {
  // Backend'dan kelayotgan qoldiqni aniqlaymiz
  const stock = product.stock ?? product.quantity;
  
  // Mahsulot tugaganmi?
  const isOutOfStock = stock !== null && stock !== undefined && stock <= 0;
  
  // Yana qo'shish mumkinligini tekshiramiz (Agar qoldiq chekli bo'lsa va savatchadagi son qoldiqqa tenglashib qolsa, plyus tugmasi o'chadi)
  const canAddMore = stock === null || stock === undefined || cartQuantity < stock;

  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col h-full">
      {/* Mahsulot rasmi */}
      <div 
        className="w-full h-32 bg-gray-50 rounded-xl mb-3 flex-shrink-0 flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={() => onClick(product)}
      >
        {product.image_url ? (
          <img src={product.image_url} alt={product.name || product.title} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon size={24} className="text-gray-300" />
        )}
      </div>
      
      {/* Mahsulot ma'lumotlari */}
      <div className="flex-1 cursor-pointer" onClick={() => onClick(product)}>
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
          {product.name || product.title}
        </h3>
        
        {/* Qoldiqni ko'rsatish qismi */}
        <p className="text-[10px] text-gray-500 mt-1">
          Qoldiq: {stock !== null && stock !== undefined ? `${stock} ta` : 'Cheksiz'}
        </p>
        
        <p className="text-blue-600 font-bold text-sm mt-1">
          {Number(product.price).toLocaleString('uz-UZ')} so'm
        </p>
      </div>

      {/* Savatchaga qo'shish tugmalari */}
      <div className="mt-3">
        {isOutOfStock ? (
          <button disabled className="w-full bg-gray-100 text-gray-400 font-semibold py-2 rounded-xl text-xs cursor-not-allowed">
            Tugagan
          </button>
        ) : cartQuantity > 0 ? (
          <div className="flex items-center justify-between bg-blue-50 rounded-xl p-1">
            <button
              onClick={(e) => { e.stopPropagation(); onRemoveFromCart(product.id); }}
              className="w-8 h-8 flex items-center justify-center bg-white text-blue-600 rounded-lg shadow-sm active:scale-95 transition"
            >
              <Minus size={16} />
            </button>
            <span className="font-bold text-sm text-blue-800 w-8 text-center">{cartQuantity}</span>
            <button
              onClick={(e) => { e.stopPropagation(); if (canAddMore) onAddToCart(product); }}
              disabled={!canAddMore}
              className={`w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm transition ${
                canAddMore ? 'text-blue-600 active:scale-95' : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <Plus size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-xl text-xs active:scale-95 transition shadow-sm hover:bg-blue-700"
          >
            Qo'shish
          </button>
        )}
      </div>
    </div>
  );
}
