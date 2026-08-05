import React, { useState, useEffect } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../api/backend';
import { Plus, Trash2, Edit3, Package, Image as ImageIcon, X } from 'lucide-react';

export default function ManageProducts({ store }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    image_url: '',
    description: ''
  });

  useEffect(() => {
    if (store?.id) {
      fetchProducts();
    }
  }, [store]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts(store.id);
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
        title: product.title || '',
        price: product.price || '',
        image_url: product.image_url || '',
        description: product.description || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ title: '', price: '', image_url: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ title: '', price: '', image_url: '', description: '' });
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
        price: Number(formData.price),
        image_url: formData.image_url,
        description: formData.description
      };

      if (editingProduct) {
        // Tahrirlash
        const res = await updateProduct(store.id, editingProduct.id, payload);
        if (res.success) {
          fetchProducts();
          handleCloseModal();
        } else {
          alert("Tahrirlashda xatolik yuz berdi.");
        }
      } else {
        // Yangi qo'shish
        const res = await addProduct(store.id, payload);
        if (res.success) {
          fetchProducts();
          handleCloseModal();
        } else {
          alert("Mahsulot qo'shishda xatolik yuz berdi.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Server bilan aloqada xatolik.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Haqiqatan ham ushbu mahsulotni o'chirmoqchimisiz?")) {
      return;
    }

    try {
      const res = await deleteProduct(store.id, productId);
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
      {/* Sarlavha va Qo'shish Tugmasi */}
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

      {/* Mahsulotlar Ro'yxati */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm my-6">
          <Package size={40} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm font-medium">Hozircha mahsulot yo'q</p>
          <p className="text-gray-400 text-xs mt-1 mb-4">Yangi mahsulot qo'shish uchun yuqoridagi tugmani bosing</p>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-50 text-blue-600 font-semibold text-xs px-4 py-2 rounded-xl"
          >
            Mahsulot qo'shish
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 justify-between"
            >
              <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon size={20} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm truncate">{product.title}</h3>
                <p className="text-blue-600 font-bold text-xs mt-0.5">
                  {Number(product.price).toLocaleString('uz-UZ')} so'm
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-base font-bold text-gray-800">
                {editingProduct ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Mahsulot nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Pepsi 1.5L"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border rounded-xl p-2.5 text-sm outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Narxi (so'mda) *</label>
                <input
                  type="number"
                  required
                  placeholder="Masalan: 12000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border rounded-xl p-2.5 text-sm outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Rasm havolasi (URL)</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full border rounded-xl p-2.5 text-sm outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Tavsifi (Ixtiyoriy)</label>
                <textarea
                  rows="2"
                  placeholder="Mahsulot haqida qisqacha ma'lumot..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-xl p-2.5 text-sm outline-none focus:border-blue-600 resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-1/2 bg-gray-100 text-gray-600 font-semibold py-2.5 rounded-xl text-sm"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-sm shadow hover:bg-blue-700 disabled:opacity-50"
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
