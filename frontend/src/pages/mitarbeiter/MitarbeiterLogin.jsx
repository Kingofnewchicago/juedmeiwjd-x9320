import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Briefcase } from 'lucide-react';
import axios from 'axios';
import { TdataLogo } from '../../components/Logo';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MitarbeiterLogin = () => {
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
      const response = await axios.post(`${BACKEND_URL}/api/applications/login`, {
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem('employee_token', response.data.access_token);
      localStorage.setItem('employee_data', JSON.stringify(response.data.applicant));
      localStorage.setItem('employee_login_time', Date.now().toString());

      navigate('/mitarbeiter/dashboard');
    } catch (err) {
      try {
        const employeeResponse = await axios.post(`${BACKEND_URL}/api/employee/login`, {
          email: formData.email,
          password: formData.password,
        });

        localStorage.setItem('employee_token', employeeResponse.data.access_token);
        localStorage.setItem('employee_data', JSON.stringify({
          ...employeeResponse.data.employee,
          status: 'Freigeschaltet'
        }));
        localStorage.setItem('employee_login_time', Date.now().toString());

        navigate('/mitarbeiter/dashboard');
      } catch (err2) {
        setError(err.response?.data?.detail || 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3EDE3] via-white to-[#E3EDE3] flex items-center justify-center px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C7DBC7] opacity-30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#659A65] opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <TdataLogo className="h-14 w-14 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Mitarbeiter Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center w-16 h-16 bg-[#E3EDE3] rounded-xl mx-auto mb-6">
            <Briefcase className="text-[#659A65]" size={32} />
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Willkommen</h2>
            <p className="text-gray-600">Melden Sie sich mit Ihren Bewerbungsdaten an</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-Mail-Adresse
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  data-testid="employee-login-email"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#659A65] focus:ring-2 focus:ring-[#659A65]/20 transition-all"
                  placeholder="ihre@email.de"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Passwort
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  data-testid="employee-login-password"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#659A65] focus:ring-2 focus:ring-[#659A65]/20 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              data-testid="employee-login-submit"
              className="w-full py-3 bg-[#659A65] text-white font-semibold rounded-lg hover:bg-[#507D50] focus:outline-none focus:ring-2 focus:ring-[#659A65] focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#659A65]/30"
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

          {/* Apply Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Noch kein Konto?{' '}
              <Link to="/mitarbeiter/signup" className="text-[#659A65] hover:text-[#507D50] font-medium">
                Konto erstellen
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          © 2026 Tdata Testing. Alle Rechte vorbehalten.
        </p>
      </div>
    </div>
  );
};

export default MitarbeiterLogin;
