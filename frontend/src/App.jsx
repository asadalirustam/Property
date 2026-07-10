import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loadUser } from './redux/authSlice';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import PropertySearch from './pages/PropertySearch';
import PropertyDetails from './pages/PropertyDetails';
import CompareProperties from './pages/CompareProperties';
import BlogList from './pages/BlogList';
import BlogDetails from './pages/BlogDetails';
import CMSPage from './pages/CMSPage';
import Contact from './pages/Contact';
import Profile from './pages/Profile';

// Dashboards
import CustomerDashboard from './pages/Customer/CustomerDashboard';
import AgentDashboard from './pages/Agent/AgentDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(loadUser());
    }
  }, [dispatch]);

  return (
    <Router>
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public paths */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/properties" element={<PropertySearch />} />
            <Route path="/properties/:id" element={<PropertyDetails />} />
            <Route path="/compare" element={<CompareProperties />} />
            <Route path="/blogs" element={<BlogList />} />
            <Route path="/blogs/:slug" element={<BlogDetails />} />
            <Route path="/about" element={<CMSPage />} />
            <Route path="/terms" element={<CMSPage />} />
            <Route path="/privacy" element={<CMSPage />} />
            <Route path="/faq" element={<CMSPage />} />
            <Route path="/contact" element={<Contact />} />

            {/* Protected paths */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/*"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agent/*"
              element={
                <ProtectedRoute allowedRoles={['agent', 'admin']}>
                  <AgentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
