import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/endpoints/admin';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';
import { 
  FaUsers, 
  FaStore, 
  FaBox, 
  FaStar, 
  FaPills, 
  FaClipboardList, 
  FaCalendarDay, 
  FaMoneyBillWave,
  FaArrowRight,
  FaUser,
  FaEnvelope,
  FaPhone
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

interface DashboardStats {
  stats: {
    totalUsers: number;
    totalPharmacies: number;
    totalOrders: number;
    totalReviews: number;
    totalMedicines: number;
    pendingApplications: number;
    todayOrders: number;
    totalRevenue: number;
  };
  recent: {
    orders: any[];
    users: any[];
    applications: any[];
  };
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await adminApi.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-12 text-gray-500 font-outfit">Failed to load dashboard</div>;
  }

  const { stats: s, recent } = stats;

  const statCards = [
    { label: 'Total Users', value: s.totalUsers, icon: FaUsers, color: 'bg-blue-100 text-blue-600' },
    { label: 'Pharmacies', value: s.totalPharmacies, icon: FaStore, color: 'bg-green-100 text-green-600' },
    { label: 'Total Orders', value: s.totalOrders, icon: FaBox, color: 'bg-purple-100 text-purple-600' },
    { label: 'Reviews', value: s.totalReviews, icon: FaStar, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Medicines', value: s.totalMedicines, icon: FaPills, color: 'bg-red-100 text-red-600' },
    { label: 'Pending Applications', value: s.pendingApplications, icon: FaClipboardList, color: 'bg-orange-100 text-orange-600' },
    { label: "Today's Orders", value: s.todayOrders, icon: FaCalendarDay, color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Total Revenue', value: formatCurrency(s.totalRevenue), icon: FaMoneyBillWave, color: 'bg-emerald-100 text-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-black font-outfit">Dashboard</h1>
        <span className="text-xs bg-[#d1f843] text-black px-3 py-1 rounded-xl font-medium font-outfit">
          Overview
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:border-[#22c55e]/30 transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-outfit">{card.label}</p>
                  <p className="text-2xl font-bold text-black font-outfit">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-black flex items-center gap-2 font-outfit">
              <FaBox className="w-4 h-4 text-[#22c55e]" />
              Recent Orders
            </h2>
            <Link to="/admin/orders" className="text-xs text-[#22c55e] hover:text-[#16a34a] font-medium flex items-center gap-1 font-outfit">
              View All <FaArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recent.orders.length === 0 ? (
            <p className="text-gray-500 text-sm font-outfit">No recent orders</p>
          ) : (
            <div className="space-y-3">
              {recent.orders.map((order) => (
                <div key={order._id} className="flex justify-between items-center pb-2 border-b border-gray-200 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-black font-outfit">
                      #{order._id.slice(-6)} - {order.user?.fullName}
                    </p>
                    <p className="text-xs text-gray-500 font-outfit">
                      {order.pharmacy?.name || 'Unknown pharmacy'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-black font-outfit">
                      {formatCurrency(order.totalPrice)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-xl font-medium font-outfit ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-black flex items-center gap-2 font-outfit">
              <FaUsers className="w-4 h-4 text-[#22c55e]" />
              Recent Users
            </h2>
            <Link to="/admin/users" className="text-xs text-[#22c55e] hover:text-[#16a34a] font-medium flex items-center gap-1 font-outfit">
              View All <FaArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recent.users.length === 0 ? (
            <p className="text-gray-500 text-sm font-outfit">No recent users</p>
          ) : (
            <div className="space-y-3">
              {recent.users.map((user) => (
                <div key={user._id} className="flex items-center gap-3 pb-2 border-b border-gray-200 last:border-0">
                  <img
                    src={user.image || 'https://via.placeholder.com/40'}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-black font-outfit">{user.fullName}</p>
                    <p className="text-xs text-gray-500 font-outfit">{user.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-xl font-medium font-outfit ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'pharmacy_owner' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-black flex items-center gap-2 font-outfit">
            <FaClipboardList className="w-4 h-4 text-[#22c55e]" />
            Pending Applications
          </h2>
          <Link to="/admin/applications" className="text-xs text-[#22c55e] hover:text-[#16a34a] font-medium flex items-center gap-1 font-outfit">
            View All <FaArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recent.applications.length === 0 ? (
          <p className="text-gray-500 text-sm font-outfit">No pending applications</p>
        ) : (
          <div className="space-y-3">
            {recent.applications.map((app) => (
              <div key={app._id} className="flex justify-between items-center pb-2 border-b border-gray-200 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <FaUser className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black font-outfit">{app.pharmacyName}</p>
                    <p className="text-xs text-gray-500 font-outfit">{app.user?.fullName}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-xl bg-yellow-100 text-yellow-700 font-medium font-outfit">
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};