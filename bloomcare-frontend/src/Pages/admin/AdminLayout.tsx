import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  FaHome, 
  FaUsers, 
  FaStore, 
  FaClipboardList, 
  FaBox, 
  FaChartLine, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from 'react-icons/fa';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: FaHome },
  { path: '/admin/users', label: 'Users', icon: FaUsers },
  { path: '/admin/pharmacies', label: 'Pharmacies', icon: FaStore },
  { path: '/admin/applications', label: 'Applications', icon: FaClipboardList },
  { path: '/admin/orders', label: 'Orders', icon: FaBox },
  { path: '/admin/analytics', label: 'Analytics', icon: FaChartLine },
];

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0 md:w-20'
        } bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 fixed md:relative h-screen z-30 overflow-hidden shadow-sm`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h1 className={`font-bold text-black font-outfit ${!isSidebarOpen && 'hidden md:hidden'}`}>
            Bloom<span className="text-[#22c55e]">Care</span> Admin
          </h1>
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            {isSidebarOpen ? <FaTimes className="w-4 h-4" /> : <FaBars className="w-4 h-4" />}
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-outfit ${
                    isActive
                      ? 'bg-[#22c55e] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-[#22c55e]'
                  } ${!isSidebarOpen && 'justify-center'}`
                }
              >
                <Icon className={`${isSidebarOpen ? 'w-5 h-5' : 'w-6 h-6'}`} />
                <span className={`${!isSidebarOpen && 'hidden'} font-medium`}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <img
              src={user?.image || 'https://via.placeholder.com/40'}
              alt={user?.fullName}
              className="w-10 h-10 rounded-xl object-cover"
            />
            <div className={`flex-1 ${!isSidebarOpen && 'hidden'}`}>
              <p className="text-sm font-medium text-black font-outfit">{user?.fullName}</p>
              <p className="text-xs text-gray-500 font-outfit">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 py-2 rounded-xl transition-colors font-outfit"
          >
            <FaSignOutAlt className="w-4 h-4" />
            <span className={!isSidebarOpen ? 'hidden' : ''}>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 p-4 md:hidden sticky top-0 z-20 flex items-center gap-3 shadow-sm">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <FaBars className="w-5 h-5" />
          </button>
          <span className="font-bold text-black font-outfit">Bloom<span className="text-[#22c55e]">Care</span> Admin</span>
        </header>

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};