import { useEffect, useState } from 'react';
import { fetchArticles } from '../services/articleService';
import { fetchStats } from '../services/statsService';
import type { Article, Stats } from '../types';
import ArticlesTable from '../components/ArticlesTable';
import Pagination from '../components/Pagination';
import StatsCards from '../components/StatsCard';

export default function DashboardPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 5;

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [articlesData, statsData] = await Promise.all([
          fetchArticles(currentPage, pageSize),
          fetchStats(),
        ]);
        setArticles(articlesData.data);
        setTotalPages(articlesData.totalPages);
        setTotalItems(articlesData.total);
        setStats(statsData);
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
      {/* Lively Hero Section */}
      <div className="px-6 py-8 sm:px-8 bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-3xl shadow-sm dark:from-blue-900/20 dark:to-gray-900 dark:border-blue-900/30 mx-4 sm:mx-0">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
          Store & Health Hub
        </h1>
        <p className="mt-2 text-sm text-blue-900/70 dark:text-blue-200/70 font-medium">
          Manage your pharmacy orders, products, and health-related articles all in one place.
        </p>
      </div>

      <div className="mt-8 px-4 sm:px-0">
        <StatsCards stats={stats || { totalArticles: 0, published: 0, drafts: 0, categories: 0, authors: 0 }} loading={loading} />

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-1">
          {loading ? (
            <div className="text-center py-16">
               <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
               <p className="mt-4 text-blue-600 font-medium">Loading store data…</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600 font-medium bg-red-50 rounded-xl m-4">{error}</div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Articles</h2>
              </div>
              <ArticlesTable articles={articles} />
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-2xl">
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