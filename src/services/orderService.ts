import { api } from '../lib/api';
import type{ Order, OrderStats, OrderStatus } from '../types';

interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function fetchOrders(page = 1, pageSize = 10, status?: OrderStatus): Promise<OrdersResponse> {
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('pageSize', String(pageSize));
  if (status) query.set('status', status);
  return api.get('orders', `?${query.toString()}`);
}

export async function fetchOrderStats(): Promise<OrderStats> {
  return api.get('orders', '/stats');
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<{ order: Order }> {
  return api.patch('orders', `/${id}/status`, { status });
}