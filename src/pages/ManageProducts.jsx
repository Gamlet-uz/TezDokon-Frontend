import React, { useState, useEffect } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../api/backend';
import { Plus, Trash2, Edit3, Package, Image as ImageIcon, X, UploadCloud } from 'lucide-react';

export default function ManageProducts({ store }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    image_url: '',
    description: '',
    stock: '' // Mahsulot soni
  });

  useEffect(() => {
    if (store?.store_id) {
      fetchProducts();
    }
  }, [store]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts(store.store_id);
      if (res.success) {
        setProducts(res.products || []);
      }
    } catch (err) {
      console.error("Mahsulotlarni olishda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.name || product.title || '',
        price: product.price || '',
        image_url: product.image_url || '',
        description: product.description || '',
        stock: product.stock !== null && product.stock !== undefined ? product.stock : ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ title: '', price: '', image_url: '', description: '', stock: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (uploadingImage) return; // Rasm yuklanayotganda yopilmasin
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ title: '', price: '', image_url: '', description: '', stock: '' });
  };

  // ImgBB ga rasmni yuklash
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      // Sizning ImgBB API tokeningiz
      const API_KEY = 'b2d8a186f54db4ca35a446925ec3ebdf';
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
        method: 'POST',
        body: uploadData
      });
      
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, image_url: data.data.display_url }));
      } else {
        alert("Rasmni yuklashda xatolik yuz berdi!");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Internet bilan aloqada xatolik yuz berdi.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price) {
      alert("Iltimos, mahsulot nomi va narxini kiriting!");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        name: formData.title,
        price: Number(formData.price),
        image_url: formData.image_url,
        description: formData.description,
        // Agar stock bo'sh bo'lsa null yuboramiz (bu cheksiz degani)
        stock: formData.stock !== '' ? Number(formData.stock) : null 
      };

      if (editingProduct) {
        const res = await updateProduct(store.store_id, editingProduct.id, payload);
        if (res.success) {
          fetchProducts();
          handleCloseModal();
        } else {
          alert("Tahrirlashda xatolik yuz berdi.");
        }
      } else {
        const res = await addProduct(store.store_id, payload);
        if (res.success) {
          fetchProducts();
          handleCloseModal();
        } else {
          alert("Mahsulot qo'shishda xatolik yuz berdi.");
        }
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      alert("Xatolik sababi: " + errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Haqiqatan ham ushbu mahsulotni o'chirmoqchimisiz?")) return;

    try {
      const res = await deleteProduct(store.store_id, productId);
      if (res.success) {
        setProducts(products.filter(p => p.id !== productId));
      } else {
        alert("O'chirishda xatolik yuz berdi.");
      }
    } catch (err) {
      console.error(err);
      alert("Server bilan aloqada xatolik.");
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
    <div className="max-w-md mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Mahsulotlar boshqaruvi</h1>
          <p className="text-xs text-gray-500">Jami: {products.length} ta mahsulot</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 shadow hover:bg-blue-700 transition active:scale-95"
        >
          <Plus size={16} /> Qo'shish
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm my-6">
          <Package size={40} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm font-medium">Hozircha mahsulot yo'q</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 justify-between"
            >
              <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
                {product.image_url ? (
                  // object-cover: Rasmni kartochkaga chiroyli qilib qirqib joylaydi
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={20} className="text-gray-300" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm truncate">{product.name || product.title}</h3>
                <p className="text-blue-600 font-bold text-xs mt-0.5">
                  {Number(product.price).toLocaleString('uz-UZ')} so'm
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Qoldiq: {product.stock !== null && product.stock !== undefined ? `${product.stock} ta` : 'Cheksiz'}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenModal(product)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  <Edit3 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Qo'shish / Tahrirlash Modali */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl relative max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-base font-bold text-gray-800">
                {editingProduct ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-1.5 rounded-full">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Rasm yuklash qismi */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mahsulot rasmi</label>
                
                {formData.image_url ? (
                  <div className="relative w-full h-40 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden group">
                    {/* object-contain: Rasm ramkadan chiqib ketmaydi va to'liq ko'rinadi */}
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="w-full h-full object-contain p-2"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <label className="cursor-pointer bg-white text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                        Boshqa tanlash
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition ${uploadingImage ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploadingImage ? (
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                      ) : (
                        <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                      )}
                      <p className="text-xs text-gray-500 font-medium">
                        {uploadingImage ? "Yuklanmoqda..." : "Galereyadan rasm tanlash"}
                      </p>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Mahsulot nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Pepsi 1.5L"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded-xl p-3 text-sm outline-none focus:border-blue-600 bg-gray-50 focus:bg-white transition"
                />
              </div>

              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Narxi (so'm) *</label>
                  <input
                    type="number"
                    required
                    placeholder="12000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full border rounded-xl p-3 text-sm outline-none focus:border-blue-600 bg-gray-50 focus:bg-white transition"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Soni (Zaxira)</label>
                  <input
                    type="number"
                    placeholder="Cheksiz"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full border rounded-xl p-3 text-sm outline-none focus:border-blue-600 bg-gray-50 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tavsifi (Ixtiyoriy)</label>
                <textarea
                  rows="2"
                  placeholder="Mahsulot haqida qisqacha ma'lumot..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-xl p-3 text-sm outline-none focus:border-blue-600 bg-gray-50 focus:bg-white resize-none transition"
                ></textarea>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={uploadingImage || submitting}
                  className="w-1/2 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl text-sm hover:bg-gray-200 transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage || submitting}
                  className="w-1/2 bg-blue-600 text-white font-semibold py-3 rounded-xl text-sm shadow hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
