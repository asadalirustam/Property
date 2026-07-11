import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../redux/authSlice';
import { Mail, Lock, LogIn, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, loading, error, user } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Clear errors when leaving page
  useEffect(() => {
    dispatch(clearError());
    return () => dispatch(clearError());
  }, [dispatch]);

  // Handle redirect if logged in
  const from = location.state?.from?.pathname || '/';
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'agent') navigate('/agent');
      else navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 transition-all">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight dark:text-white">Welcome Back</h2>
          <p className="text-xs text-slate-500">Sign in to contact agents, schedule visits, and save favorites.</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/20 dark:text-red-400 mb-6">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-500" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs focus:border-primary-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:focus:bg-slate-900"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-[10px] font-semibold text-primary-600 hover:underline dark:text-primary-400">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs focus:border-primary-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:focus:bg-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-primary-700 transition disabled:opacity-50 mt-6"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-6 border-t pt-4 dark:border-slate-800">
          <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
            Quick Demo Login
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('customer@property.com');
                setPassword('customer123');
              }}
              className="rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold py-1.5 hover:bg-slate-200 transition text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('agent@property.com');
                setPassword('agent123');
              }}
              className="rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold py-1.5 hover:bg-slate-200 transition text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Agent
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@property.com');
                setPassword('admin123');
              }}
              className="rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold py-1.5 hover:bg-slate-200 transition text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-slate-500 mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-primary-600 hover:underline dark:text-primary-400">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
