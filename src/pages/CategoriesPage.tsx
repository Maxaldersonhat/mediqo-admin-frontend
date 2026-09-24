import { useEffect, useState, type FormEvent } from 'react';
import { fetchProductCategories, createProductCategory } from '../services/productService';
import type { ProductCategory2 } from '../types';
import { api } from '../lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory2[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchProductCategories();
      setCategories(res.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createProductCategory(name.trim());
      setName('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.del('productCategories', `/${id}`);
      load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  return (
    <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Pharmacy Categories</h1>
        <p className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400">
          Organize your medical products and store inventory.
        </p>
      </div>

      <form onSubmit={handleCreate} className="mt-6 flex gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name (e.g., Vitamins, First Aid)"
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-white shadow-sm"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60 shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
        >
          {saving ? 'Adding…' : 'Add Category'}
        </button>
      </form>
      {error && <p className="mt-3 text-sm font-medium text-red-600 bg-red-50 p-2.5 rounded-lg">{error}</p>}

      <div className="mt-8 overflow-hidden rounded-2xl border border-blue-50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="p-8 text-center text-sm font-medium text-blue-500 animate-pulse">Loading categories…</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No categories added yet.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-5 hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{c.name}</p>
                  <p className="mt-1 text-xs font-medium text-blue-600/70 dark:text-blue-400/70">{c.productCount ?? 0} listed product(s)</p>
                </div>
                <button onClick={() => handleDelete(c.id)} className="text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}