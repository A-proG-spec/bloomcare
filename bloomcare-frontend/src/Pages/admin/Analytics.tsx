import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/endpoints/admin';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';
import { 
  FaChartLine, 
  FaMoneyBillWave, 
  FaBox, 
  FaUsers, 
  FaStore, 
  FaPills, 
  FaClock,
  FaCalendarAlt
} from 'react-icons/fa';

export const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const result = await adminApi.getAnalytics(period);
      setAnalytics(result);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!analytics) {
    return <div className="text-center py-12 text-gray-500 font-outfit">Failed to load analytics</div>;
  }

  const revenueData = analytics.revenue?.data || [];
  const totalRevenue = analytics.revenue?.total || 0;
  const userGrowth = analytics.userGrowth || [];
  const topPharmacies = analytics.topPharmacies || [];
  const topMedicines = analytics.topMedicines || [];
  const orderStatus = analytics.orderStatus || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black flex items-center gap-2 font-outfit">
          <FaChartLine className="w-6 h-6 text-[#22c55e]" />
          Analytics
        </h1>
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="w-4 h-4 text-gray-400" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent bg-white transition-all duration-200 font-outfit"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-500 flex items-center gap-1 font-outfit">
            <FaMoneyBillWave className="w-4 h-4 text-[#22c55e]" />
            Total Revenue
          </p>
          <p className="text-3xl font-bold text-black font-outfit">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-500 flex items-center gap-1 font-outfit">
            <FaBox className="w-4 h-4 text-blue-500" />
            Orders
          </p>
          <p className="text-3xl font-bold text-black font-outfit">
            {revenueData.reduce((sum: number, d: any) => sum + (d.count || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-500 flex items-center gap-1 font-outfit">
            <FaUsers className="w-4 h-4 text-purple-500" />
            User Growth
          </p>
          <p className="text-3xl font-bold text-black font-outfit">
            {userGrowth.reduce((sum: number, d: any) => sum + (d.count || 0), 0)}
          </p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="font-semibold text-black mb-4 flex items-center gap-2 font-outfit">
          <FaChartLine className="w-4 h-4 text-[#22c55e]" />
          Revenue Trend
        </h2>
        {revenueData.length === 0 ? (
          <p className="text-gray-500 text-sm font-outfit">No revenue data available</p>
        ) : (
          <div className="space-y-2">
            {revenueData.slice(0, 10).map((item: any, index: number) => {
              const total = item.total || 0;
              const maxTotal = revenueData[0]?.total || 1;
              const percentage = Math.min((total / maxTotal) * 100, 100);
              const label = item._id?.year || 'N/A';
              const month = item._id?.month || '';
              const displayLabel = month ? `${label}-${month}` : label;

              return (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 w-20 font-outfit">{displayLabel}</span>
                  <div className="flex items-center gap-4 flex-1 ml-4">
                    <div
                      className="h-6 bg-[#d1f843] rounded-lg transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-black w-24 text-right font-outfit">{formatCurrency(total)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Pharmacies */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="font-semibold text-black mb-4 flex items-center gap-2 font-outfit">
          <FaStore className="w-4 h-4 text-[#22c55e]" />
          Top Pharmacies
        </h2>
        {topPharmacies.length === 0 ? (
          <p className="text-gray-500 text-sm font-outfit">No data available</p>
        ) : (
          <div className="space-y-3">
            {topPharmacies.map((pharmacy: any, index: number) => (
              <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-200 last:border-0">
                <div>
                  <span className="text-sm font-medium text-black font-outfit">
                    #{index + 1} {pharmacy.name}
                  </span>
                  <p className="text-xs text-gray-500 font-outfit">{pharmacy.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-black font-outfit">{formatCurrency(pharmacy.totalRevenue)}</p>
                  <p className="text-xs text-gray-500 font-outfit">{pharmacy.totalOrders} orders</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Medicines */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="font-semibold text-black mb-4 flex items-center gap-2 font-outfit">
          <FaPills className="w-4 h-4 text-[#22c55e]" />
          Top Medicines
        </h2>
        {topMedicines.length === 0 ? (
          <p className="text-gray-500 text-sm font-outfit">No data available</p>
        ) : (
          <div className="space-y-3">
            {topMedicines.map((medicine: any, index: number) => (
              <div key={index} className="flex justify-between items-center pb-2 border-b border-gray-200 last:border-0">
                <div>
                  <span className="text-sm font-medium text-black font-outfit">
                    #{index + 1} {medicine.name}
                  </span>
                  <p className="text-xs text-gray-500 font-outfit">{medicine.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-black font-outfit">{medicine.totalQuantity} sold</p>
                  <p className="text-xs text-gray-500 font-outfit">{formatCurrency(medicine.totalRevenue)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Status Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="font-semibold text-black mb-4 flex items-center gap-2 font-outfit">
          <FaClock className="w-4 h-4 text-[#22c55e]" />
          Order Status Distribution
        </h2>
        {orderStatus.length === 0 ? (
          <p className="text-gray-500 text-sm font-outfit">No data available</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {orderStatus.map((status: any, index: number) => (
              <div key={index} className="flex-1 min-w-[100px] bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
                <p className="text-2xl font-bold text-black font-outfit">{status.count}</p>
                <p className="text-sm text-gray-500 capitalize font-outfit">{status._id}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};