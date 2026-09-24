import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, fetchProductStats, deleteProduct } from '../services/productService';
import type { Product, ProductStats } from '../types';
import ProductsTable from '../components/ProductsTable';
import ProductStatsCards from '../components/ProductStatsCards';
import Pagination from '../components/Pagination';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 5;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsData, statsData] = await Promise.all([
        fetchProducts({ page: currentPage, pageSize }),
        fetchProductStats(),
      ]);
      setProducts(productsData.products);
      setTotalPages(productsData.totalPages);
      setTotalItems(productsData.total);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load pharmacy products. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this product? This also removes its images.')) return;
    try {
      await deleteProduct(id);
      loadData();
    } catch (err) {
      console.error(err);
      window.alert('Failed to delete product.');
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between px-4 sm:px-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Pharmacy Inventory</h1>
          <p className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400">
            Manage your medical storefront catalog and stock levels.
          </p>
        </div>
        <Link
          to="/products/new"
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Product
        </Link>
      </div>

      <div className="mt-6">
        <ProductStatsCards
          stats={stats || { totalProducts: 0, inStock: 0, lowStock: 0, outOfStock: 0, fillRate: 0 }}
          loading={loading}
        />

        <div className="mt-8 rounded-2xl border border-blue-50 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <div className="mt-4 text-sm font-bold text-blue-500">Loading products…</div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 m-4 rounded-xl">
              {error}
            </div>
          ) : (
            <>
              <ProductsTable products={products} onDelete={handleDelete} />
              <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-4 sm:px-6 bg-gray-50 dark:bg-gray-800/50">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={totalItems}
                  pageSize={pageSize}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}