import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RestaurantsPage from './pages/RestaurantsPage';
import SellersPage from './pages/SellersPage';
import DeliveryAgentsPage from './pages/DeliveryAgentsPage';
import BoostRequestsPage from './pages/BoostRequestsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import ServiceRequestsPage from './pages/ServiceRequestsPage';
import WorkersPage from './pages/WorkersPage';
import BidsPage from './pages/BidsPage';
import ServiceReviewsPage from './pages/ServiceReviewsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import ProductsPage from './pages/ProductsPage';
import PropertiesPage from './pages/PropertiesPage';
import UsersPage from './pages/UsersPage';
import ReviewsPage from './pages/ReviewsPage';
import CategoriesPage from './pages/CategoriesPage';
import AdsPage from './pages/AdsPage';
import PaymentsPage from './pages/PaymentsPage';
import SettingsPage from './pages/SettingsPage';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<PrivateRoute />}>
        <Route path="" element={<DashboardPage />} />
        <Route path="restaurants" element={<RestaurantsPage />} />
        <Route path="sellers" element={<SellersPage />} />
        <Route path="delivery-agents" element={<DeliveryAgentsPage />} />
        <Route path="boost-requests" element={<BoostRequestsPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="service-requests" element={<ServiceRequestsPage />} />
        <Route path="workers" element={<WorkersPage />} />
        <Route path="bids" element={<BidsPage />} />
        <Route path="service-reviews" element={<ServiceReviewsPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="properties" element={<PropertiesPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="ads" element={<AdsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
