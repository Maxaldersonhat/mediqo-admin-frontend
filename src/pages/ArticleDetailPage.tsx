import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Article } from '../types';
import { fetchArticleBySlug } from '../services/articleService';

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    fetchArticleBySlug(slug)
      .then((data) => {
        setArticle(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Article not found');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 py-16 px-4 flex justify-center items-center">
        <div className="animate-pulse space-y-6 max-w-3xl w-full">
          <div className="h-8 bg-slate-200 dark:bg-gray-800 rounded-md w-1/4" />
          <div className="h-12 bg-slate-200 dark:bg-gray-800 rounded-md w-3/4" />
          <div className="h-80 bg-slate-200 dark:bg-gray-800 rounded-2xl w-full" />
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-gray-800 rounded-md" />
            <div className="h-4 bg-slate-200 dark:bg-gray-800 rounded-md" />
            <div className="h-4 bg-slate-200 dark:bg-gray-800 rounded-md w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-slate-200 dark:border-gray-800 max-w-md w-full text-center shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Article Not Found</h2>
          <p className="text-slate-600 dark:text-gray-400 text-sm mb-6">
            The health article you are looking for does not exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/posts')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Health Articles
          </button>
        </div>
      </div>
    );
  }

  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Published recently';

  return (
    <article className="min-h-screen bg-white dark:bg-gray-950 text-slate-800 dark:text-gray-100 pb-24">
      {/* Top Floating Navigation Header */}
      <nav className="sticky top-0 z-20 border-b border-slate-100 dark:border-gray-800/80 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md px-4 sm:px-8 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/posts')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Health Articles
          </button>

          <div className="flex items-center gap-3">
            {article.category && (
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-full">
                {article.category.name}
              </span>
            )}
            <button
              onClick={() => navigate(`/posts/${article.id}/edit`)}
              className="px-3 py-1 text-xs font-semibold rounded-lg text-blue-600 bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 transition-colors"
            >
              Edit Article
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="mt-4 text-lg sm:text-xl text-slate-600 dark:text-gray-300 leading-relaxed font-normal">
              {article.excerpt}
            </p>
          )}

          <div className="mt-6 flex items-center gap-4 pt-6 border-t border-slate-100 dark:border-gray-800">
            <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
              {article.author?.name ? article.author.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                {article.author?.name || 'Medical Editorial Team'}
              </div>
              <div className="text-xs text-slate-500 dark:text-gray-400">{publishedDate}</div>
            </div>
          </div>
        </header>

        {/* Featured Banner Image */}
        {article.featuredImage && (
          <div className="mb-10 overflow-hidden rounded-2xl shadow-lg border border-slate-200/50 dark:border-gray-800">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-auto max-h-[480px] object-cover"
            />
          </div>
        )}

        {/* Rendered Body Content */}
        <div
          className="prose prose-slate dark:prose-invert prose-lg max-w-none 
            prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white 
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline 
            prose-img:rounded-xl prose-img:shadow-md 
            [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:bg-blue-50/50 dark:[&_blockquote]:bg-blue-950/30 [&_blockquote]:px-5 [&_blockquote]:py-3 [&_blockquote]:rounded-r-lg"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </article>
  );
}