import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/endpoints/admin';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';
import { 
  FaBox, 
  FaUser, 
  FaStore, 
  FaMoneyBillWave, 
  FaCalendarAlt, 
  FaEye, 
  FaFilter,
  FaShoppingBag
} from 'react-icons/fa';

export const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    loadOrders();
  }, [statusFilter, page]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const result = await adminApi.getAllOrders({
        status: statusFilter || undefined,
        page,
        limit: 10,
      });
      setOrders(result.orders || []);
      setTotalPages(result.pagination?.pages || 1);
      setTotalOrders(result.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statusColors: { [key: string]: string } = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Confirmed: 'bg-blue-100 text-blue-700',
    Processing: 'bg-purple-100 text-purple-700',
    Shipped: 'bg-indigo-100 text-indigo-700',
    Delivered: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black flex items-center gap-2 font-outfit">
          <FaBox className="w-6 h-6 text-[#22c55e]" />
          Orders
        </h1>
        <span className="text-sm text-gray-500 font-outfit">Total: {totalOrders} orders</span>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <FaFilter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent bg-white transition-all duration-200 font-outfit"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <FaShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-outfit">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-outfit">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-outfit">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-outfit">Pharmacy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-outfit">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-outfit">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-outfit">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase font-outfit">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => navigate(`/orders/${order._id}`)}>
                    <td className="px-6 py-4 text-sm font-medium text-black font-outfit">
                      #{order._id?.slice(-6) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-1 font-outfit">
                      <FaUser className="w-3 h-3 text-gray-400" />
                      {order.user?.fullName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-1 font-outfit">
                      <FaStore className="w-3 h-3 text-gray-400" />
                      {order.pharmacy?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-black flex items-center gap-1 font-outfit">
                      <FaMoneyBillWave className="w-3 h-3 text-[#22c55e]" />
                      {formatCurrency(order.totalPrice || 0)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-xs rounded-xl font-medium font-outfit ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                        {order.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 flex items-center gap-1 font-outfit">
                      <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/orders/${order._id}`); }} icon={<FaEye className="w-3 h-3" />}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {orders.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm text-gray-500 font-outfit">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};