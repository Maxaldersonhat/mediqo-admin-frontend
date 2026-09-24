import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { Product } from '../types';

interface Props {
  products: Product[];
  onDelete?: (id: number) => void;
}

const stockStyles: Record<string, string> = {
  IN_STOCK: 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
  LOW_STOCK: 'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  OUT_OF_STOCK: 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
};

const stockLabels: Record<string, string> = {
  IN_STOCK: 'In stock',
  LOW_STOCK: 'Low stock',
  OUT_OF_STOCK: 'Out of stock',
};

export default function ProductsTable({ products, onDelete }: Props) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-blue-50/80 dark:bg-gray-800/80">
          <tr>
            {['Product', 'SKU', 'Category', 'Price', 'Stock', 'Actions'].map((h) => (
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
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-blue-50/30 dark:hover:bg-gray-700/30 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                <Link to={`/products/${product.id}/edit`} className="flex items-center gap-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {product.imageUrl ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}${product.imageUrl}`}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-lg object-cover border border-gray-100 dark:border-gray-700 shadow-sm"
                    />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-300 dark:bg-gray-700 dark:text-gray-500">
                      IMG
                    </span>
                  )}
                  {product.name}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400">{product.sku}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400">
                {product.category?.name ?? '—'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700 dark:text-gray-300">
                {product.price != null ? `KES ${product.price.toLocaleString()}` : '—'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-lg shadow-sm ${stockStyles[product.stockStatus] ?? 'bg-gray-100 text-gray-800'
                    }`}
                >
                  {stockLabels[product.stockStatus] ?? product.stockStatus} ({product.stockCount})
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                <button
                  className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors dark:hover:bg-gray-700"
                  aria-label="Actions"
                  onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                >
                  🚩
                </button>
                {openMenuId === product.id && (
                  <div className="absolute right-6 top-8 z-10 w-32 rounded-md border border-gray-200 bg-white shadow-lg">
                    <Link
                      to={`/products/${product.id}/edit`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </Link>
                    {onDelete && (
                      <button
                        className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setOpenMenuId(null);
                          onDelete(product.id);
                        }}
                      >
                        Delete
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