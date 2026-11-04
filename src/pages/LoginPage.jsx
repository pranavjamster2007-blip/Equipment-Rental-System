/**
 * LoginPage.jsx
 * Login screen with controlled inputs, event.preventDefault(), and demo credentials
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AlertBanner from '../components/AlertBanner.jsx';
import { Wrench, Lock, Mail, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, quickSwitchDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Controlled form requirement
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password fields.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setErrorMessage(result.message || 'Invalid credentials.');
    }
  };

  const handleDemoLogin = async (roleType) => {
    setLoading(true);
    setErrorMessage('');
    const result = await quickSwitchDemo(roleType);
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setErrorMessage(result.message || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md mb-3">
            <Wrench className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
          <p className="mt-1 text-xs text-gray-500">
            Equipment Rental System • 2nd Year Internal Project #20
          </p>
        </div>

        <AlertBanner type="error" message={errorMessage} onClose={() => setErrorMessage('')} />

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              College Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@rental.edu"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Fast Logins for Grading & Testing */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider text-center mb-3">
            Quick Demo Login for Viva / Grading
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('Admin')}
              className="px-2 py-2 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition text-center"
            >
              <div className="font-bold">Admin</div>
              <div className="text-[10px] text-purple-600">admin@rental.edu</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('Staff')}
              className="px-2 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition text-center"
            >
              <div className="font-bold">Staff</div>
              <div className="text-[10px] text-blue-600">staff@rental.edu</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('Customer')}
              className="px-2 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition text-center"
            >
              <div className="font-bold">Customer</div>
              <div className="text-[10px] text-emerald-600">customer@rental.edu</div>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
