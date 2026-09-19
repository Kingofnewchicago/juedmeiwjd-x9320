import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { TdataLogo } from '../../components/Logo';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/admin/login`, {
        email: formData.email,
        password: formData.password,
      });

      // Store token and admin data
      localStorage.setItem('admin_token', response.data.access_token);
      localStorage.setItem('admin_data', JSON.stringify(response.data.admin));
      localStorage.setItem('login_time', Date.now().toString());

      // Redirect to admin dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1b26] flex items-center justify-center px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7aa2f7] opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#bb9af7] opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <TdataLogo className="w-16 h-16" />
            <div className="text-left">
              <h1 className="text-2xl font-bold text-[#c0caf5]">
                Tdata Testing
              </h1>
              <p className="text-sm text-[#565f89]">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#16161e] border border-[#292e42] rounded-2xl shadow-2xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#c0caf5] mb-2">Willkommen zurück</h2>
            <p className="text-[#9aa5ce]">Melden Sie sich bei Ihrem Admin-Konto an</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-[#f7768e]/10 border border-[#f7768e]/30 rounded-lg flex items-start space-x-3">
              <AlertCircle className="text-[#f7768e] flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-[#f7768e]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#c0caf5] mb-2">
                E-Mail-Adresse
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#565f89]" size={20} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  data-testid="admin-login-email"
                  className="w-full pl-11 pr-4 py-3 bg-[#1a1b26] border border-[#292e42] rounded-lg text-[#c0caf5] placeholder-[#565f89] focus:outline-none focus:border-[#7aa2f7] focus:ring-2 focus:ring-[#7aa2f7]/20 transition-all"
                  placeholder=""
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#c0caf5] mb-2">
                Passwort
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#565f89]" size={20} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  data-testid="admin-login-password"
                  className="w-full pl-11 pr-4 py-3 bg-[#1a1b26] border border-[#292e42] rounded-lg text-[#c0caf5] placeholder-[#565f89] focus:outline-none focus:border-[#7aa2f7] focus:ring-2 focus:ring-[#7aa2f7]/20 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              data-testid="admin-login-submit"
              className="w-full py-3 bg-gradient-to-r from-[#7aa2f7] to-[#7dcfff] text-white font-semibold rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#7aa2f7] focus:ring-offset-2 focus:ring-offset-[#16161e] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Anmeldung läuft...
                </span>
              ) : (
                'Anmelden'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-[#565f89] mt-6">
          © 2026 Tdata Testing. Alle Rechte vorbehalten.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
