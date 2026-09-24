import type { ProductStats } from '../types';

interface Props {
  stats: ProductStats;
  loading?: boolean;
}

export default function ProductStatsCards({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
            <div className="px-4 py-5 sm:p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="mt-2 h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Total Products', value: stats.totalProducts },
    { label: 'In Stock', value: stats.inStock },
    { label: 'Low Stock', value: stats.lowStock },
    { label: 'Out of Stock', value: stats.outOfStock },
    { label: 'Fill Rate', value: `${stats.fillRate}%` },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">{card.label}</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{card.value}</dd>
          </div>
        </div>
      ))}
    </div>
  );
}