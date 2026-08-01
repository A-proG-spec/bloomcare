// bloomcare-frontend/src/components/layout/Navbar.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../common/Button';
import { NotificationBell } from '../notification/NotificationBell';
import { 
  FaBars, 
  FaTimes, 
  FaStore, 
  FaPills, 
  FaShoppingCart, 
  FaUser, 
  FaSignOutAlt,
  FaBox,
  FaClipboardList
} from 'react-icons/fa';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { getCartCount } = useCartStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartCount = getCartCount();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm relative z-50 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link to={isAuthenticated ? '/medicines' : '/'} className="flex items-center gap-2" onClick={closeMobileMenu}>
            <span className="text-2xl font-bold text-black">
              Bloom<span className="text-[#22c55e]">Care</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/pharmacies" className="text-gray-600 hover:text-[#22c55e] font-medium transition-colors">
              Pharmacies
            </Link>
            <Link to="/medicines" className="text-gray-600 hover:text-[#22c55e] font-medium transition-colors">
              Medicines
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/orders" className="text-gray-600 hover:text-[#22c55e] font-medium transition-colors">
                  Orders
                </Link>
                {user?.role === 'pharmacy_owner' && (
                  <>
                    <Link to="/my-pharmacy" className="text-gray-600 hover:text-[#22c55e] font-medium transition-colors">
                      My Pharmacy
                    </Link>
                    <Link to="/inventory" className="text-gray-600 hover:text-[#22c55e] font-medium transition-colors">
                      Inventory
                    </Link>
                  </>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-gray-600 hover:text-[#22c55e] font-medium transition-colors">
                    Admin
                  </Link>
                )}
                {user?.role === 'user' && (
                  <Link to="/apply-pharmacy" className="text-gray-600 hover:text-[#22c55e] font-medium transition-colors">
                    Apply Pharmacy
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
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
                <Link to="/profile" className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-[#22c55e] font-medium transition-colors">
                  <FaUser className="w-4 h-4" />
                  <span className="text-sm hidden lg:inline">{user?.fullName}</span>
                </Link>
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

            {/* Hamburger Menu Button - Mobile */}
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
            <MobileNavLink to="/pharmacies" icon={<FaStore className="w-5 h-5" />} label="Pharmacies" onClick={closeMobileMenu} />
            <MobileNavLink to="/medicines" icon={<FaPills className="w-5 h-5" />} label="Medicines" onClick={closeMobileMenu} />
            
            {isAuthenticated ? (
              <>
                <MobileNavLink to="/orders" icon={<FaBox className="w-5 h-5" />} label="Orders" onClick={closeMobileMenu} />
                <MobileNavLink to="/cart" icon={<FaShoppingCart className="w-5 h-5" />} label={`Cart (${cartCount})`} onClick={closeMobileMenu} />
                <MobileNavLink to="/profile" icon={<FaUser className="w-5 h-5" />} label="Profile" onClick={closeMobileMenu} />
                
                {user?.role === 'pharmacy_owner' && (
                  <>
                    <MobileNavLink to="/my-pharmacy" icon={<FaStore className="w-5 h-5" />} label="My Pharmacy" onClick={closeMobileMenu} />
                    <MobileNavLink to="/inventory" icon={<FaPills className="w-5 h-5" />} label="Inventory" onClick={closeMobileMenu} />
                  </>
                )}
                {user?.role === 'admin' && (
                  <MobileNavLink to="/admin" icon={<FaUser className="w-5 h-5" />} label="Admin Panel" onClick={closeMobileMenu} />
                )}
                {user?.role === 'user' && (
                  <MobileNavLink to="/apply-pharmacy" icon={<FaClipboardList className="w-5 h-5" />} label="Apply Pharmacy" onClick={closeMobileMenu} />
                )}
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <FaSignOutAlt className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <>
                <MobileNavLink to="/login" icon={<FaUser className="w-5 h-5" />} label="Login" onClick={closeMobileMenu} />
                <MobileNavLink to="/register" icon={<FaUser className="w-5 h-5" />} label="Register" onClick={closeMobileMenu} />
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
    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-[#22c55e] hover:bg-gray-100 rounded-xl transition-colors"
    onClick={onClick}
  >
    <span className="text-gray-500">{icon}</span>
    <span className="font-medium">{label}</span>
  </Link>
);