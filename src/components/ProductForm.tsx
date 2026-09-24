import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product, ProductCategory2 } from '../types';
import { fetchProductCategories, createProduct, updateProduct } from '../services/productService';

interface Props {
  initialProduct?: Product;
}

export default function ProductForm({ initialProduct }: Props) {
  const navigate = useNavigate();
  const isEdit = !!initialProduct;

  const [name, setName] = useState(initialProduct?.name ?? '');
  const [sku, setSku] = useState(initialProduct?.sku ?? '');
  const [brand, setBrand] = useState(initialProduct?.brand ?? '');
  const [productClass, setProductClass] = useState(initialProduct?.class ?? '');
  const [description, setDescription] = useState(initialProduct?.description ?? '');
  const [categoryId, setCategoryId] = useState<number | null>(initialProduct?.category?.id ?? null);
  const [price, setPrice] = useState(initialProduct?.price != null ? String(initialProduct.price) : '');
  const [stockCount, setStockCount] = useState(String(initialProduct?.stockCount ?? 0));
  const [lowStockThreshold, setLowStockThreshold] = useState(String(initialProduct?.lowStockThreshold ?? 0));

  const [categories, setCategories] = useState<ProductCategory2[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialProduct?.imageUrl ? `${import.meta.env.VITE_API_URL}${initialProduct.imageUrl}` : null
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProductCategories()
      .then((res) => setCategories(res.categories))
      .catch(() => setCategories([]));
  }, []);

  const handleImagePick = (file: File | null) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError('Product name is required');
    if (!sku.trim()) return setError('SKU is required');

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        sku: sku.trim(),
        brand: brand.trim() || null,
        class: productClass.trim() || null,
        description: description.trim() || null,
        categoryId,
        price: price === '' ? null : parseFloat(price),
        stockCount: parseInt(stockCount, 10) || 0,
        lowStockThreshold: parseInt(lowStockThreshold, 10) || 0,
      };

      if (isEdit && initialProduct) {
        await updateProduct(initialProduct.id, payload, imageFile);
      } else {
        await createProduct(payload, imageFile);
      }
      navigate('/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500 dark:focus:bg-gray-800 transition-all";
  const labelClass = "mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300";

  return (
    <div className="mx-auto max-w-4xl p-6 sm:p-8">
      <button
        onClick={() => navigate('/products')}
        className="mb-6 flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Inventory
      </button>

      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
        {isEdit ? 'Edit Medical Product' : 'Add New Product'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-2xl border border-blue-50 bg-white p-6 sm:p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">Product Image</h2>
          <label
            htmlFor="product-image-input"
            className="flex h-48 w-48 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 text-center hover:border-blue-400 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700/50 dark:hover:border-blue-500 transition-colors"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-blue-500 dark:text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="px-2 text-sm font-semibold">Click to upload</span>
              </div>
            )}
            <input
              id="product-image-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImagePick(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-6 rounded-2xl border border-blue-50 bg-white p-6 sm:p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <h2 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">Product Details</h2>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="e.g. Digital Thermometer"
            />
          </div>

          <div>
            <label className={labelClass}>SKU</label>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className={inputClass}
              placeholder="e.g. THERM-001"
            />
          </div>

          <div>
            <label className={labelClass}>Category</label>
            <select
              value={categoryId ?? ''}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
              className={inputClass}
            >
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Brand</label>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className={inputClass}
              placeholder="e.g. Omron"
            />
          </div>

          <div>
            <label className={labelClass}>Class</label>
            <input
              value={productClass}
              onChange={(e) => setProductClass(e.target.value)}
              className={inputClass}
              placeholder="e.g. Class IIa"
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder="Detailed medical specifications..."
            />
          </div>

          <div className="sm:col-span-2 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h2 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">Pricing & Inventory</h2>
          </div>

          <div>
            <label className={labelClass}>Price (KES)</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputClass}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className={labelClass}>Current Stock Count</label>
            <input
              type="number"
              value={stockCount}
              onChange={(e) => setStockCount(e.target.value)}
              className={inputClass}
              placeholder="0"
            />
          </div>

          <div>
            <label className={labelClass}>Low Stock Threshold</label>
            <input
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              className={inputClass}
              placeholder="0"
            />
          </div>

          {error && <p className="sm:col-span-2 text-sm font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-lg">{error}</p>}

          <div className="sm:col-span-2 flex items-center gap-4 pt-6 mt-2 border-t border-gray-100 dark:border-gray-700">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving Changes…' : isEdit ? 'Save Changes' : 'Create Product'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="rounded-xl border border-gray-200 bg-white px-8 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}