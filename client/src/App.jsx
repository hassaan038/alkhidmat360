import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useTranslation } from 'react-i18next';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Dashboard Pages
import UserDashboard from './pages/dashboard/UserDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';

// Donor Pages
import QurbaniDonation from './pages/donor/QurbaniDonation';
import RationDonation from './pages/donor/RationDonation';
import SkinCollection from './pages/donor/SkinCollection';
import OrphanSponsorship from './pages/donor/OrphanSponsorship';

// Beneficiary Pages
import LoanApplication from './pages/beneficiary/LoanApplication';
import RamadanRationApplication from './pages/beneficiary/RamadanRationApplication';
import OrphanRegistration from './pages/beneficiary/OrphanRegistration';

// Volunteer Pages
import VolunteerTaskRegistration from './pages/volunteer/VolunteerTaskRegistration';

// Admin Pages
import UserManagement from './pages/admin/UserManagement';
import DonationsManagement from './pages/admin/DonationsManagement';
import ApplicationsManagement from './pages/admin/ApplicationsManagement';
import VolunteersManagement from './pages/admin/VolunteersManagement';
import CreateAdmin from './pages/admin/CreateAdmin';
import QurbaniListings from './pages/admin/QurbaniListings';
import QurbaniBookings from './pages/admin/QurbaniBookings';
import QurbaniModuleSettings from './pages/admin/QurbaniModuleSettings';

// Qurbani Module Pages (any authenticated non-admin user)
import QurbaniModule from './pages/qurbani/QurbaniModule';
import MyHissaBookings from './pages/qurbani/MyHissaBookings';
import SkinPickup from './pages/qurbani/SkinPickup';
import QurbaniSkinPickups from './pages/admin/QurbaniSkinPickups';
import Fitrana from './pages/qurbani/Fitrana';
import AdminFitrana from './pages/admin/AdminFitrana';
import ZakatPayment from './pages/zakat/ZakatPayment';
import ZakatApplication from './pages/zakat/ZakatApplication';
import AdminZakatPayments from './pages/admin/AdminZakatPayments';
import AdminZakatApplications from './pages/admin/AdminZakatApplications';
import Sadqa from './pages/donor/Sadqa';
import DisasterRelief from './pages/donor/DisasterRelief';
import AdminSadqa from './pages/admin/AdminSadqa';
import AdminDisasterRelief from './pages/admin/AdminDisasterRelief';
import Settings from './pages/settings/Settings';

// Protected Route Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleBasedRoute from './components/auth/RoleBasedRoute';

// Chatbot widget — visible on every page
import ChatbotWidget from './components/chatbot/ChatbotWidget';

function App() {
  const { i18n } = useTranslation();
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language === 'ur' ? 'ur' : 'en';
  }, [i18n.language]);

  return (
    <>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes - User Dashboard */}
          <Route
            path="/dashboard/user"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['DONOR', 'BENEFICIARY', 'VOLUNTEER']}>
                  <UserDashboard />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          {/* Donor Routes */}
          <Route
            path="/dashboard/user/qurbani"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['DONOR']}>
                  <QurbaniDonation />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/user/ration"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['DONOR']}>
                  <RationDonation />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/user/skin-collection"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['DONOR']}>
                  <SkinCollection />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/user/orphan-sponsorship"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['DONOR']}>
                  <OrphanSponsorship />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          {/* Beneficiary Routes */}
          <Route
            path="/dashboard/user/loan"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['BENEFICIARY']}>
                  <LoanApplication />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/user/ramadan-ration"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['BENEFICIARY']}>
                  <RamadanRationApplication />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/user/orphan"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['BENEFICIARY']}>
                  <OrphanRegistration />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          {/* Volunteer Routes */}
          <Route
            path="/dashboard/user/volunteer-task"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['VOLUNTEER']}>
                  <VolunteerTaskRegistration />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          {/* Qurbani Module (shared: donor, beneficiary, volunteer) */}
          <Route
            path="/dashboard/user/qurbani-module"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['DONOR', 'BENEFICIARY', 'VOLUNTEER']}>
                  <QurbaniModule />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/user/qurbani-bookings"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['DONOR', 'BENEFICIARY', 'VOLUNTEER']}>
                  <MyHissaBookings />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/user/qurbani-skin-pickup"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['DONOR', 'BENEFICIARY', 'VOLUNTEER']}>
                  <SkinPickup />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/user/fitrana"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['DONOR', 'BENEFICIARY', 'VOLUNTEER']}>
                  <Fitrana />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          {/* Zakat — separate pages for donor (pay) vs beneficiary (apply) */}
          <Route
            path="/dashboard/user/zakat-pay"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['DONOR']}>
                  <ZakatPayment />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/user/sadqa"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['DONOR']}>
                  <Sadqa />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/user/disaster-relief"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['DONOR']}>
                  <DisasterRelief />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/user/zakat-apply"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['BENEFICIARY']}>
                  <ZakatApplication />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Admin Dashboard */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          {/* Admin Management Routes */}
          <Route
            path="/dashboard/admin/users"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['ADMIN']}>
                  <UserManagement />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/donations"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['ADMIN']}>
                  <DonationsManagement />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/applications"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['ADMIN']}>
                  <ApplicationsManagement />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/volunteers"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['ADMIN']}>
                  <VolunteersManagement />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/create-admin"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['ADMIN']}>
                  <CreateAdmin />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          {/* Admin Qurbani Module routes */}
          <Route
            path="/dashboard/admin/qurbani-listings"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['ADMIN']}>
                  <QurbaniListings />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/qurbani-bookings"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['ADMIN']}>
                  <QurbaniBookings />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/qurbani-settings"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['ADMIN']}>
                  <QurbaniModuleSettings />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/qurbani-skin-pickups"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['ADMIN']}>
                  <QurbaniSkinPickups />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/fitrana"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['ADMIN']}>
                  <AdminFitrana />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/zakat-payments"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['ADMIN']}>
                  <AdminZakatPayments />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/zakat-applications"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['ADMIN']}>
                  <AdminZakatApplications />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/sadqa"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['ADMIN']}>
                  <AdminSadqa />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/disaster-relief"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['ADMIN']}>
                  <AdminDisasterRelief />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          {/* Settings — universal across all 4 user types */}
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['DONOR', 'BENEFICIARY', 'VOLUNTEER', 'ADMIN']}>
                  <Settings />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          />

          {/* 404 - Not Found */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-900">404</h1>
                  <p className="text-xl text-gray-600 mt-4">Page not found</p>
                  <a
                    href="/login"
                    className="mt-6 inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Go to Login
                  </a>
                </div>
              </div>
            }
          />
        </Routes>

        {/* Chatbot widget — visible on every route, including login/signup */}
        <ChatbotWidget />
      </BrowserRouter>

      {/* Toast Notifications */}
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
