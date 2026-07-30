import React from 'react';
import { Link } from 'react-router-dom';
import type { Order } from '../../api/types';
import { Badge } from '../common/Badge';
import { formatDistanceToNow } from 'date-fns';
import { FaBox, FaStore, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';

interface OrderCardProps {
  order: Order;
}

const statusColors: { [key: string]: 'success' | 'warning' | 'danger' | 'info' } = {
  'Pending': 'warning',
  'Confirmed': 'info',
  'Processing': 'info',
  'Shipped': 'info',
  'Delivered': 'success',
  'Cancelled': 'danger',
};

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  return (
    <Link to={`/orders/${order._id}`} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:border-[#22c55e]/30 transition-all duration-200">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-black flex items-center gap-2 font-outfit">
              <FaBox className="w-4 h-4 text-[#22c55e]" />
              Order #{order._id.slice(-6)}
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1 font-outfit">
              <FaStore className="w-3 h-3" />
              {order.pharmacy?.name || 'Pharmacy'}
            </p>
          </div>
          <Badge variant={statusColors[order.status] || 'default'}>
            {order.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-outfit">Items:</span>
            <span className="font-medium text-black font-outfit">{order.items?.length || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-outfit">Total:</span>
            <span className="font-bold text-black font-outfit flex items-center gap-1">
              <FaMoneyBillWave className="w-3 h-3 text-[#22c55e]" />
              ${order.totalPrice?.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-outfit flex items-center gap-1">
              <FaCalendarAlt className="w-3 h-3" />
              Date:
            </span>
            <span className="text-gray-700 font-outfit">
              {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};