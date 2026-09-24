import { useEffect, useState } from 'react';
import { fetchOrders, fetchOrderStats, updateOrderStatus } from '../services/orderService';
import type { Order, OrderStats, OrderStatus } from '../types';
import Pagination from '../components/Pagination';

const statusStyles: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  ONGOING: 'bg-blue-100 text-blue-800 border border-blue-200',
  COMPLETED: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const pageSize = 10;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersData, statsData] = await Promise.all([
        fetchOrders(currentPage, pageSize, statusFilter || undefined),
        fetchOrderStats(),
      ]);
      setOrders(ordersData.orders);
      setTotalPages(ordersData.totalPages);
      setTotalItems(ordersData.total);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load orders. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, statusFilter]);

  const handleStatusChange = async (id: number, status: OrderStatus) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, status);
      loadData();
    } catch (err) {
      console.error(err);
      window.alert('Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Pharmacy Orders</h1>
        <p className="mt-2 text-sm text-blue-600 dark:text-blue-400 font-medium">Manage and fulfill incoming patient requests.</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 px-4 sm:grid-cols-4 sm:px-0">
        {[
          { label: 'Pending Review', value: stats?.pending ?? 0 },
          { label: 'In Progress', value: stats?.ongoing ?? 0 },
          { label: 'Fulfilled', value: stats?.completed ?? 0 },
          { label: 'Total Orders', value: stats?.total ?? 0 },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl bg-white p-5 shadow-sm border border-blue-50 dark:bg-gray-800 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-shadow">
            <dt className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{card.label}</dt>
            <dd className="mt-2 text-3xl font-extrabold text-blue-700 dark:text-blue-400">{card.value}</dd>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3 px-4 sm:px-0">
        {(['', 'PENDING', 'ONGOING', 'COMPLETED'] as const).map((s) => (
          <button
            key={s || 'ALL'}
            onClick={() => {
              setStatusFilter(s);
              setCurrentPage(1);
            }}
            className={`rounded-xl px-5 py-2 text-sm font-bold transition-all shadow-sm ${
              statusFilter === s 
                ? 'bg-blue-600 text-white shadow-blue-500/30' 
                : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
            }`}
          >
            {s ? s.charAt(0) + s.slice(1).toLowerCase() : 'All Orders'}
          </button>
        ))}
      </div>

      <div className="mt-6 sm:px-0 px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-blue-50 dark:border-gray-700">
             <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
             <p className="mt-4 text-blue-600 font-medium">Loading orders…</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600 bg-red-50 rounded-2xl font-medium">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">No orders found matching this criteria.</div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-blue-50/50 dark:bg-gray-800/80">
                  <tr>
                    {['Ref', 'Patient Details', 'Prescription/Items', 'Total', 'Status', 'Date', 'Action'].map((h) => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-blue-50/30 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">#{order.ref}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        <div className="font-medium text-gray-900 dark:text-white">{order.customerName}</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{order.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                        <div className="line-clamp-2">
                            {order.items.map((i) => <span key={i.name} className="inline-block mr-2"><span className="font-semibold text-gray-900 dark:text-white">{i.quantity}x</span> {i.name}</span>)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                        KES {order.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-lg ${statusStyles[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {order.status !== 'COMPLETED' ? (
                          <button
                            disabled={updatingId === order.id}
                            onClick={() => handleStatusChange(order.id, order.status === 'PENDING' ? 'ONGOING' : 'COMPLETED')}
                            className={`rounded-lg px-4 py-2 text-xs font-bold text-white shadow-sm transition-all disabled:opacity-50 active:scale-95 ${
                                order.status === 'PENDING' 
                                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' 
                                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                            }`}
                          >
                            {order.status === 'PENDING' ? 'Process Order' : 'Mark Fulfilled'}
                          </button>
                        ) : (
                          <button
                            disabled={updatingId === order.id}
                            onClick={() => handleStatusChange(order.id, 'ONGOING')}
                            className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            Reopen
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50/50 dark:bg-gray-800/50 p-4 border-t border-gray-100 dark:border-gray-700">
                <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={totalItems}
                pageSize={pageSize}
                />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}