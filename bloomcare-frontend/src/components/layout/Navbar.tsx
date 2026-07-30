import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useCartStore } from '../../store/cartStore';
import { useApplicationStore } from '../../store/applicationStore';
import { usePharmacyStore } from '../../store/pharmacyStore';
import { Button } from '../common/Button';
import { NotificationBell } from '../notification/NotificationBell';
import { 
  FaShoppingCart, 
  FaSearch, 
  FaUser, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes, 
  FaStore, 
  FaPills, 
  FaUserMd,
  // ✅ REMOVED: FaHome
} from 'react-icons/fa';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { openSearch } = useUIStore();
  const { getCartCount } = useCartStore();
  const { myApplication, fetchMyApplication } = useApplicationStore();
  const { fetchPharmacy } = usePharmacyStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyApplication();
      fetchPharmacy();
    }
  }, [isAuthenticated, fetchMyApplication, fetchPharmacy]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const cartCount = getCartCount();
  const isAdmin = user?.role === 'admin';
  const isPharmacyOwner = user?.role === 'pharmacy_owner';
  
  const hasPendingApplication = myApplication?.status === 'pending';
  const hasRejectedApplication = myApplication?.status === 'rejected';

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm relative z-50 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
            <span className="text-2xl font-bold text-black font-outfit">Bloom<span className="text-[#22c55e]">Care</span></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/pharmacies" className="text-gray-600 hover:text-[#22c55e] font-medium transition-colors font-outfit">
              Pharmacies
            </Link>
            <Link to="/medicines" className="text-gray-600 hover:text-[#22c55e] font-medium transition-colors font-outfit">
              Medicines
            </Link>
            {isPharmacyOwner && (
              <>
                <Link to="/my-pharmacy" className="text-gray-600 hover:text-[#22c55e] font-medium transition-colors font-outfit">
                  My Pharmacy
                </Link>
                <Link to="/pharmacy-inventory" className="text-gray-600 hover:text-[#22c55e] font-medium transition-colors font-outfit">
                  Inventory
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-gray-600 hover:text-[#22c55e] font-medium transition-colors font-outfit">
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Mobile search icon */}
            <button
              onClick={openSearch}
              className="md:hidden p-2 text-gray-600 hover:text-[#22c55e] hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Search"
            >
              <FaSearch className="w-5 h-5" />
            </button>

            {/* Cart Icon - Only when authenticated */}
            {isAuthenticated && (
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-[#22c55e] hover:bg-gray-100 rounded-xl transition-colors hidden sm:block">
                <FaShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#d1f843] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <NotificationBell />
                <Link to="/profile" className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-[#22c55e] font-medium transition-colors font-outfit">
                  <FaUser className="w-4 h-4" />
                  <span className="text-sm hidden lg:inline">{user?.fullName}</span>
                </Link>
                <Link to="/orders" className="hidden sm:block text-gray-600 hover:text-[#22c55e] font-medium transition-colors font-outfit">
                  Orders
                </Link>
                {!isPharmacyOwner && !isAdmin && (
                  <Link to="/my-application" className="hidden sm:block">
                    {hasPendingApplication ? (
                      <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-xl text-xs font-medium font-outfit">
                        Pending
                      </span>
                    ) : hasRejectedApplication ? (
                      <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-xl text-xs font-medium font-outfit">
                        Rejected
                      </span>
                    ) : (
                      <Button variant="outline" size="sm">
                        Apply
                      </Button>
                    )}
                  </Link>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout} icon={<FaSignOutAlt className="w-4 h-4" />}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/register" className="hidden sm:inline">
                  <Button variant="accent" size="sm">Register</Button>
                </Link>
              </>
            )}

            {/* Hamburger menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-600 hover:text-[#22c55e] hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg absolute top-16 left-0 right-0 z-40">
          <div className="px-4 py-4 space-y-1">
            {isAuthenticated ? (
              <>
                <MobileNavLink to="/pharmacies" icon={<FaStore />} label="Pharmacies" onClick={() => setIsMobileMenuOpen(false)} />
                <MobileNavLink to="/medicines" icon={<FaPills />} label="Medicines" onClick={() => setIsMobileMenuOpen(false)} />
                {isPharmacyOwner && (
                  <>
                    <MobileNavLink to="/my-pharmacy" icon={<FaStore />} label="My Pharmacy" onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileNavLink to="/pharmacy-inventory" icon={<FaPills />} label="Inventory" onClick={() => setIsMobileMenuOpen(false)} />
                  </>
                )}
                {isAdmin && (
                  <MobileNavLink to="/admin" icon={<FaUserMd />} label="Admin Dashboard" onClick={() => setIsMobileMenuOpen(false)} />
                )}
                <MobileNavLink to="/profile" icon={<FaUser />} label="Profile" onClick={() => setIsMobileMenuOpen(false)} />
                <MobileNavLink to="/orders" icon={<FaShoppingCart />} label="Orders" onClick={() => setIsMobileMenuOpen(false)} />
                <MobileNavLink to="/cart" icon={<FaShoppingCart />} label={`Cart ${cartCount > 0 ? `(${cartCount})` : ''}`} onClick={() => setIsMobileMenuOpen(false)} />
                {!isPharmacyOwner && !isAdmin && (
                  <MobileNavLink 
                    to="/my-application" 
                    icon={<FaUserMd />} 
                    label={hasPendingApplication ? 'Application Pending' : hasRejectedApplication ? 'Application Rejected' : 'Apply for Pharmacy'} 
                    onClick={() => setIsMobileMenuOpen(false)} 
                  />
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-outfit"
                >
                  <FaSignOutAlt className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <>
                <MobileNavLink to="/pharmacies" icon={<FaStore />} label="Pharmacies" onClick={() => setIsMobileMenuOpen(false)} />
                <MobileNavLink to="/medicines" icon={<FaPills />} label="Medicines" onClick={() => setIsMobileMenuOpen(false)} />
                <MobileNavLink to="/login" icon={<FaUser />} label="Login" onClick={() => setIsMobileMenuOpen(false)} />
                <MobileNavLink to="/register" icon={<FaUserMd />} label="Register" onClick={() => setIsMobileMenuOpen(false)} />
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

// Mobile Nav Link Helper Component
const MobileNavLink: React.FC<{
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ to, icon, label, onClick }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-[#22c55e] hover:bg-gray-100 rounded-xl transition-colors font-outfit"
    onClick={onClick}
  >
    <span className="text-gray-500">{icon}</span>
    <span className="font-medium">{label}</span>
  </Link>
);