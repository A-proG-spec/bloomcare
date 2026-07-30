import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ ADD THIS IMPORT
import { useOrderStore } from '../../store/orderStore';
import { OrderCard } from '../../components/order/OrderCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { FaBox, FaFilter, FaShoppingBag } from 'react-icons/fa';

export const Orders: React.FC = () => {
  const navigate = useNavigate(); // ✅ ADD THIS LINE
  const { orders, isLoading, fetchUserOrders } = useOrderStore();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchUserOrders({
      status: status || undefined,
      page,
      limit: 10,
    });
  }, [status, page, fetchUserOrders]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
    setPage(1);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold text-[rgb(0,88,64)] flex items-center gap-3">
          <FaShoppingBag className="w-7 h-7" />
          My Orders
        </h1>
        <span className="text-xs bg-[rgb(209,248,67)] text-[rgb(0,88,64)] px-3 py-1 rounded-xl font-medium">
          {orders.length} orders
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[rgb(236,240,239)] p-4 mb-6">
        <div className="flex items-center gap-2">
          <FaFilter className="w-4 h-4 text-gray-400" />
          <select
            value={status}
            onChange={handleStatusChange}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(0,88,64)] focus:border-transparent bg-white transition-all duration-200 flex-1"
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

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-[rgb(236,240,239)]">
          <FaBox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No orders yet.</p>
          <Button onClick={() => navigate('/pharmacies')} className="mt-4">
            Browse Pharmacies
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-6">
        <Button
          variant="outline"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="px-4 py-2 text-center font-medium text-gray-600">Page {page}</span>
        <Button
          variant="outline"
          onClick={() => setPage(page + 1)}
          disabled={orders.length < 10}
        >
          Next
        </Button>
      </div>
    </div>
  );
};