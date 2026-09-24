import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Article } from '../types';
import { fetchArticles, deleteArticle } from '../services/articleService';

export default function ArticlesPage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchArticles(page, 9, {
        status: statusFilter || undefined,
        q: searchQuery || undefined,
      });
      setArticles(res.data);
      setTotalPages(res.totalPages);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load health articles');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchQuery]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleDelete = async (id: number, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await deleteArticle(id);
      await loadArticles();
    } catch (err: any) {
      alert(err.message || 'Failed to delete article');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-800 dark:text-gray-100 pb-20">
      {/* Header Banner */}
      <header className="border-b border-slate-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 dark:bg-blue-900/40 dark:text-blue-300 rounded-full mb-2">
              Health & Wellness Insights
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Health Articles
            </h1>
            <p className="mt-1 text-sm sm:text-base text-slate-600 dark:text-gray-400">
              Manage and review published articles, drafts, and health guides.
            </p>
          </div>

          <Link
            to="/posts/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create New Article
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="max-w-6xl mx-auto mt-8 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search articles by title..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published Only</option>
            <option value="DRAFT">Drafts Only</option>
          </select>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 overflow-hidden shadow-xs h-96"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-8">
            <p className="text-red-500 font-semibold mb-2">{error}</p>
            <button
              onClick={loadArticles}
              className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-wider"
            >
              Try Reloading
            </button>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No health articles found</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
              Try adjusting your search criteria or create a new post.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="group flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-slate-200/90 dark:border-gray-800 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Article Featured Image */}
                  <Link
                    to={`/posts/${article.slug}`}
                    className="block relative aspect-video overflow-hidden bg-slate-100 dark:bg-gray-800"
                  >
                    {article.featuredImage ? (
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-indigo-500/20 text-blue-600 dark:text-blue-400">
                        <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Status Pill */}
                    <span
                      className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-md shadow-xs ${
                        article.status === 'PUBLISHED'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {article.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                    </span>
                  </Link>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-gray-400 mb-2">
                        <span>
                          {article.publishedAt
                            ? new Date(article.publishedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Unpublished'}
                        </span>
                        {article.category && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              {article.category.name}
                            </span>
                          </>
                        )}
                      </div>

                      <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        <Link to={`/posts/${article.slug}`}>{article.title}</Link>
                      </h2>

                      <p className="mt-3 text-sm text-slate-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                        {article.excerpt || 'Click to view full health article insights...'}
                      </p>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-gray-800 flex items-center justify-between">
                      <Link
                        to={`/posts/${article.slug}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
                      >
                        Read Post
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>

                      {/* Edit and Delete Buttons (Bottom Right) */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/posts/${article.id}/edit`)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg text-blue-600 bg-blue-50 dark:bg-blue-900/40 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => handleDelete(article.id, article.title, e)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-3">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-600 dark:text-gray-400 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}