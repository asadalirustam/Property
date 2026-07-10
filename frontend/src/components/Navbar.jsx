import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { 
  Sun, Moon, Menu, X, Bell, User as UserIcon, LogOut, LayoutDashboard, HelpCircle, BookOpen, Layers
} from 'lucide-react';
import api from '../utils/api';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { compareList } = useSelector((state) => state.properties);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Set dark class on load
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Fetch in-app notifications
  useEffect(() => {
    if (isAuthenticated) {
      api.get('/notifications')
        .then((res) => setNotifications(res.data.notifications.filter(n => !n.isRead)))
        .catch((err) => console.error(err));
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    dispatch(logout());
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const markAllNotifications = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/customer';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'agent') return '/agent';
    return '/customer';
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white shadow-lg">
                <span className="font-extrabold text-lg">P</span>
              </div>
              <span className="font-sans font-extrabold text-xl tracking-tight text-slate-800 dark:text-white">
                Property<span className="text-primary-600">Finder</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/properties" className="text-sm font-medium text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400">
              Find Properties
            </Link>
            <Link to="/blogs" className="text-sm font-medium text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400">
              Blogs
            </Link>
            <Link to="/about" className="text-sm font-medium text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400">
              Contact
            </Link>
            {compareList.length > 0 && (
              <Link to="/compare" className="relative flex items-center gap-1 rounded-full bg-primary-50 dark:bg-primary-950/40 px-3 py-1 text-xs font-semibold text-primary-600 dark:text-primary-400">
                <Layers className="h-3.5 w-3.5" />
                Compare ({compareList.length})
              </Link>
            )}
          </div>

          {/* Action Buttons / User Section */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {/* Notifications bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-center justify-between border-b pb-2 mb-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Alerts ({notifications.length})</span>
                        {notifications.length > 0 && (
                          <button onClick={markAllNotifications} className="text-[10px] text-primary-600 hover:underline dark:text-primary-400">
                            Clear all
                          </button>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {notifications.length === 0 ? (
                          <p className="text-center text-xs py-4 text-slate-400">No new notifications</p>
                        ) : (
                          notifications.map((notif) => (
                            <Link
                              key={notif._id}
                              to={notif.link || '#'}
                              onClick={() => setShowNotifications(false)}
                              className="block rounded-lg p-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                              <p className="font-semibold text-slate-800 dark:text-slate-100">{notif.title}</p>
                              <p className="text-slate-500 dark:text-slate-400">{notif.message}</p>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <img
                      src={user?.avatar || 'https://cdn-icons-png.flaticon.com/512/147/147144.png'}
                      alt="User avatar"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[100px] truncate">{user?.name}</span>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                      <div className="border-b px-4 py-2 mb-1">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to={getDashboardLink()}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        My Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <UserIcon className="h-4 w-4" />
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                  Log In
                </Link>
                <Link to="/register" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-primary-700 transition">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-2 pb-3 pt-2 shadow-lg dark:border-slate-800 dark:bg-slate-900 transition-all">
          <div className="space-y-1">
            <Link
              to="/properties"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Find Properties
            </Link>
            <Link
              to="/blogs"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Blogs
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Contact
            </Link>
          </div>

          <div className="border-t border-slate-200 pb-1 pt-4 dark:border-slate-800">
            {isAuthenticated ? (
              <div className="space-y-2 px-3">
                <div className="flex items-center gap-3 pb-2">
                  <img
                    src={user?.avatar || 'https://cdn-icons-png.flaticon.com/512/147/147144.png'}
                    alt="avatar"
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>
                <Link
                  to={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg py-2 text-sm text-slate-700 dark:text-slate-300"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-lg py-2 text-sm text-slate-700 dark:text-slate-300"
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left rounded-lg py-2 text-sm font-semibold text-red-600 dark:text-red-400"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center rounded-lg border py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex justify-center rounded-lg bg-primary-600 py-2 text-center text-sm font-medium text-white hover:bg-primary-700"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
