import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../utils/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Verification token is missing.');
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        setSuccess(res.data.message);
      } catch (err) {
        setError(err.response?.data?.message || 'Verification link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [token]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900 transition-all">
        {loading ? (
          <div className="space-y-4 py-8">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-500" />
            <h3 className="text-lg font-bold dark:text-white">Verifying Account</h3>
            <p className="text-xs text-slate-500">Checking your verification tokens, please wait...</p>
          </div>
        ) : error ? (
          <div className="space-y-4 py-8">
            <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
            <h3 className="text-xl font-bold dark:text-white">Verification Failed</h3>
            <p className="text-xs text-red-500 leading-relaxed">{error}</p>
            <div className="pt-4">
              <Link to="/login" className="rounded-xl bg-primary-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-primary-700 transition">
                Go to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-8">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 animate-bounce" />
            <h3 className="text-xl font-bold dark:text-white">Verified Successfully!</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{success}</p>
            <div className="pt-4">
              <Link to="/login" className="rounded-xl bg-primary-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-primary-700 transition">
                Sign In Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
