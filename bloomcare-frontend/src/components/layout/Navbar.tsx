// src/components/layout/Navbar.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../common/Button';
import { NotificationBell } from '../notification/NotificationBell';
import { 
  FaBars, FaTimes, FaStore, FaPills, FaShoppingCart, 
  FaUser, FaSignOutAlt, FaBox, FaClipboardList, FaUserShield 
} from 'react-icons/fa';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout, isAdmin, isPharmacyOwner, isUser } = useAuthStore();
  const { getCartCount } = useCartStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartCount = getCartCount();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const showAdminLinks = isAdmin();
  const showPharmacyLinks = isPharmacyOwner() || isAdmin();
  const showApplyPharmacy = isUser();

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
                
                {showPharmacyLinks && (
                  <>
                    <Link to="/my-pharmacy" className="text-gray-600 hover:text-[#22c55e] font-medium transition-colors">
                      My Pharmacy
                    </Link>
                    <Link to="/inventory" className="text-gray-600 hover:text-[#22c55e] font-medium transition-colors">
                      Inventory
                    </Link>
                  </>
                )}
                
                {showApplyPharmacy && (
                  <Link to="/apply-pharmacy" className="text-gray-600 hover:text-[#22c55e] font-medium transition-colors">
                    Apply Pharmacy
                  </Link>
                )}
                
                {showAdminLinks && (
                  <Link to="/admin" className="text-gray-600 hover:text-[#22c55e] font-medium transition-colors flex items-center gap-1">
                    <FaUserShield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated && (
              <Link to="/cart" aria-label="Shopping Cart" className="relative p-2 text-gray-600 hover:text-[#22c55e] hover:bg-gray-100 rounded-xl transition-colors">
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
                <Link to="/profile" className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-[#22c55e] font-medium transition-colors ml-1">
                  <FaUser className="w-4 h-4" />
                  <span className="text-sm hidden lg:inline">{user?.fullName}</span>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout} icon={<FaSignOutAlt className="w-4 h-4" />} className="hidden sm:inline-flex">
                  Logout
                </Button>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="accent" size="sm">Register</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-[#22c55e] hover:bg-gray-100 rounded-xl transition-colors ml-1"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg absolute top-16 left-0 right-0 z-40">
          <div className="px-4 py-4 space-y-1">
            <MobileNavLink to="/pharmacies" icon={<FaStore className="w-5 h-5" />} label="Pharmacies" onClick={closeMobileMenu} />
            <MobileNavLink to="/medicines" icon={<FaPills className="w-5 h-5" />} label="Medicines" onClick={closeMobileMenu} />
            
            {isAuthenticated ? (
              <>
                <MobileNavLink to="/orders" icon={<FaBox className="w-5 h-5" />} label="Orders" onClick={closeMobileMenu} />
                <MobileNavLink to="/profile" icon={<FaUser className="w-5 h-5" />} label="Profile" onClick={closeMobileMenu} />
                
                {showPharmacyLinks && (
                  <>
                    <MobileNavLink to="/my-pharmacy" icon={<FaStore className="w-5 h-5" />} label="My Pharmacy" onClick={closeMobileMenu} />
                    <MobileNavLink to="/inventory" icon={<FaPills className="w-5 h-5" />} label="Inventory" onClick={closeMobileMenu} />
                  </>
                )}
                
                {showApplyPharmacy && (
                  <MobileNavLink to="/apply-pharmacy" icon={<FaClipboardList className="w-5 h-5" />} label="Apply Pharmacy" onClick={closeMobileMenu} />
                )}
                
                {showAdminLinks && (
                  <MobileNavLink to="/admin" icon={<FaUserShield className="w-5 h-5" />} label="Admin Panel" onClick={closeMobileMenu} />
                )}
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                >
                  <FaSignOutAlt className="w-5 h-5" />
                  Logout
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