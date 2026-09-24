import { useEffect, useState } from 'react';
import type { Category } from '../types';
import { fetchCategories, createCategory } from '../services/articleService';
import { uploadMedia } from '../services/mediaservice';

interface Props {
  categoryId: number | null;
  featuredImage: string | null;
  excerpt: string | null;
  onChange: (patch: { categoryId?: number | null; featuredImage?: string | null; excerpt?: string | null }) => void;
}

export default function DocumentMetaPanel({ categoryId, featuredImage, excerpt, onChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Category Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      const list = await fetchCategories();
      setCategories(list);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleImagePick = async (file: File | null) => {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const { items } = await uploadMedia([file]);
      const uploaded = items[0];
      if (!uploaded) throw new Error('Upload returned no file');
      onChange({ featuredImage: uploaded.url });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setCreatingCategory(true);
    setModalError(null);

    try {
      const newCategory = await createCategory(newCategoryName.trim());
      
      // Reload categories list from backend
      await loadCategories();

      // Automatically select newly created category
      onChange({ categoryId: newCategory.id });

      // Reset and close modal
      setNewCategoryName('');
      setIsModalOpen(false);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed to add category');
    } finally {
      setCreatingCategory(false);
    }
  };

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800/50">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Document Meta
        </h3>

        <div className="space-y-4 text-sm">
          {/* Category Selector */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-gray-600 dark:text-gray-300 font-medium">Category</label>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
              >
                + Add New
              </button>
            </div>
            <select
              value={categoryId ?? ''}
              onChange={(e) => onChange({ categoryId: e.target.value ? Number(e.target.value) : null })}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Featured Image Picker */}
          <div>
            <label className="mb-1 block text-gray-600 dark:text-gray-300 font-medium">Featured Image</label>
            <label
              htmlFor="featured-image-input"
              className={`flex h-28 flex-col items-center justify-center rounded-lg border-2 border-dashed text-center text-gray-400 transition-colors ${
                uploading
                  ? 'cursor-wait border-gray-200 dark:border-gray-700'
                  : 'cursor-pointer border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
              }`}
            >
              {uploading ? (
                <span className="px-2 text-xs">Uploading…</span>
              ) : featuredImage ? (
                <img src={featuredImage} alt="Featured Header" className="h-full w-full rounded-md object-cover" />
              ) : (
                <span className="px-2 text-xs">Click to upload or drag image here</span>
              )}
              <input
                id="featured-image-input"
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => handleImagePick(e.target.files?.[0] ?? null)}
              />
            </label>
            {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
          </div>

          {/* Excerpt */}
          <div>
            <label className="mb-1 block text-gray-600 dark:text-gray-300 font-medium">Excerpt</label>
            <textarea
              value={excerpt ?? ''}
              onChange={(e) => onChange({ excerpt: e.target.value })}
              placeholder="Brief summary for listings…"
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Small Category Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">Create Category</h4>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setModalError(null);
                  setNewCategoryName('');
                }}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Category Name
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Cardiology, Nutrition"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {newCategoryName && (
                  <p className="mt-1.5 text-xs text-gray-400">
                    Slug: <span className="font-mono text-blue-600 dark:text-blue-400">{newCategoryName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}</span>
                  </p>
                )}
              </div>

              {modalError && <p className="text-xs font-medium text-red-500">{modalError}</p>}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setModalError(null);
                    setNewCategoryName('');
                  }}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCategory || !newCategoryName.trim()}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-500/20"
                >
                  {creatingCategory ? 'Saving…' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}