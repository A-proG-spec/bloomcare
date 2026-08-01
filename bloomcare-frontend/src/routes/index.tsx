import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

// Pages
import { Landing } from '../Pages/Landing';
import { Login } from '../Pages/auth/Login';
import { Register } from '../Pages/auth/Register';
import { VerifyEmail } from '../Pages/auth/VerifyEmail';
import { Pharmacies } from '../Pages/Pharmacies';
import { PharmacyDetails } from '../Pages/pharmacy/PharmacyDetails';
import { Medicines } from '../Pages/medicine/Medicines';
import { Orders } from '../Pages/order/Orders';
import { OrderDetails } from '../Pages/order/OrderDetails';
import { Profile } from '../Pages/profile/Profile';
import { ChangePassword } from '../Pages/profile/ChangePassword';
import { ApplyPharmacy } from '../Pages/pharmacy/ApplyPharmacy';
import { Cart } from '../Pages/cart/Cart';
import { Checkout } from '../Pages/cart/Checkout';  // ✅ Make sure this is imported
import { MyApplication } from '../Pages/pharmacy/MyApplication';
import { MyPharmacy } from '../Pages/pharmacy/MyPharmacy';
import { EditPharmacy } from '../Pages/pharmacy/EditPharmacy';
import { MedicineDetails } from '../Pages/medicine/MedicineDetails';
import { AdminLayout } from '../Pages/admin/AdminLayout';
import { Dashboard } from '../Pages/admin/Dashboard';
import { Users } from '../Pages/admin/Users';
import { AdminPharmacies } from '../Pages/admin/Pharmacies';
import { AdminApplications } from '../Pages/admin/AdminApplications';
import { AdminOrders } from '../Pages/admin/AdminOrders';
import { AdminAnalytics } from '../Pages/admin/Analytics';
import { PharmacyInventory } from '../Pages/pharmacy/PharmacyInventory';

import { PrivateRoute } from './PrivateRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <Layout />
      </ErrorBoundary>
    ),
    children: [
      // ✅ PUBLIC ROUTES (No authentication required)
      { index: true, element: <Landing /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'verify-email', element: <VerifyEmail /> },
      { path: 'pharmacies', element: <Pharmacies /> },
      { path: 'pharmacy/:id', element: <PharmacyDetails /> },
      { path: 'medicines', element: <Medicines /> },
      { path: 'medicines/:id', element: <MedicineDetails /> },
      
      // ✅ Cart is public (anyone can view)
      { path: 'cart', element: <Cart /> },
      
      // ✅ Checkout - MUST be public OR inside PrivateRoute
      // If you want it public (anyone can view, but login required to proceed):
      { path: 'checkout', element: <Checkout /> },
      
      // OR if you want it protected (only logged-in users):
      // Move it inside PrivateRoute below

      // ✅ PROTECTED ROUTES (Authentication required)
      {
        element: <PrivateRoute />,
        children: [
          // Profile routes
          { path: 'profile', element: <Profile /> },
          { path: 'profile/change-password', element: <ChangePassword /> },
          
          // Order routes
          { path: 'orders', element: <Orders /> },
          { path: 'orders/:id', element: <OrderDetails /> },
          
          // Pharmacy owner routes
          { path: 'apply-pharmacy', element: <ApplyPharmacy /> },
          { path: 'my-application', element: <MyApplication /> },
          { path: 'my-pharmacy', element: <MyPharmacy /> },
          { path: 'edit-pharmacy', element: <EditPharmacy /> },
          { path: 'pharmacy-inventory', element: <PharmacyInventory /> },
        ],
      },

      // ✅ ADMIN ROUTES (Authentication + Admin role required)
      {
        element: <PrivateRoute />,
        children: [
          {
            path: 'admin',
            element: <AdminLayout />,
            children: [
              { index: true, element: <Dashboard /> },
              { path: 'users', element: <Users /> },
              { path: 'pharmacies', element: <AdminPharmacies /> },
              { path: 'applications', element: <AdminApplications /> },
              { path: 'orders', element: <AdminOrders /> },
              { path: 'analytics', element: <AdminAnalytics /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
          <p className="text-gray-600">Page not found</p>
        </div>
      </div>
    ),
  },
]);