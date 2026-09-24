import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ArticleEditor from '../components/ArticleEditor';
import { fetchArticle } from '../services/articleService';
import type { Article } from '../types';

export default function EditArticlePage() {
  const { id: idParam } = useParams<{ id: string }>();
  const id = Number(idParam);

  const [article, setArticle] = useState<Article | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'not-found'>('loading');

  useEffect(() => {
    if (!Number.isInteger(id)) {
      setStatus('not-found');
      return;
    }

    let cancelled = false;
    setStatus('loading');

    fetchArticle(id)
      .then((data) => {
        if (cancelled) return;
        setArticle(data);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('not-found');
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === 'loading') {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-white dark:bg-gray-900">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-sm font-bold text-blue-600 dark:text-blue-400">Loading editor workspace…</p>
      </div>
    );
  }

  if (status === 'not-found' || !article) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>
        <p className="text-2xl font-extrabold text-gray-900 dark:text-white">Article Not Found</p>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-sm">The requested health article may have been deleted or the internal reference is incorrect.</p>
      </div>
    );
  }

  return <ArticleEditor initialArticle={article} />;
}