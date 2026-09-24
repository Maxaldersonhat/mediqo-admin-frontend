import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { Article } from '../types';

interface Props {
  articles: Article[];
  onDelete?: (id: number) => void;
}

const statusStyles: Record<string, string> = {
  PUBLISHED: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  DRAFT: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  SCHEDULED: 'bg-blue-100 text-blue-800 border border-blue-200',
  ARCHIVED: 'bg-gray-100 text-gray-600 border border-gray-200',
};

const statusLabels: Record<string, string> = {
  PUBLISHED: 'Published',
  DRAFT: 'Draft',
  SCHEDULED: 'Scheduled',
  ARCHIVED: 'Archived',
};

export default function ArticlesTable({ articles, onDelete }: Props) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-blue-50/80 dark:bg-gray-800/80">
          <tr>
            {['Title', 'Status', 'Category', 'Author', 'Published', 'Actions'].map((h) => (
              <th
                key={h}
                className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-800 dark:divide-gray-700">
          {articles.map((article) => (
            <tr key={article.id} className="hover:bg-blue-50/30 dark:hover:bg-gray-700/30 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                <Link to={`/posts/${article.id}/edit`} className="text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 transition-colors">
                  {article.title}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-lg shadow-sm ${
                    statusStyles[article.status] ?? 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {statusLabels[article.status] ?? article.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-300">
                {article.category?.name ?? '—'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-300">
                {article.author?.name ?? '—'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400">
                {article.publishedAt
                  ? new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                  : '--'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                <button
                  className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors dark:hover:bg-gray-700"
                  aria-label="Actions"
                  onClick={() => setOpenMenuId(openMenuId === article.id ? null : article.id)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                </button>
                {openMenuId === article.id && (
                  <div className="absolute right-6 top-10 z-10 w-36 rounded-xl border border-gray-100 bg-white shadow-xl shadow-blue-900/5 dark:bg-gray-800 dark:border-gray-600 overflow-hidden">
                    <Link
                      to={`/posts/${article.id}/edit`}
                      className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      Edit Article
                    </Link>
                    {onDelete && (
                      <button
                        className="block w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => {
                          setOpenMenuId(null);
                          onDelete(article.id);
                        }}
                      >
                        Delete Article
                      </button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}