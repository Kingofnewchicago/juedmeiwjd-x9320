import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ProtectedRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('admin_token');
      const loginTime = localStorage.getItem('login_time');

      if (!token || !loginTime) {
        setIsValid(false);
        return;
      }

      // Server-side JWT controls lifetime (7 days). Client just verifies token validity.
      try {
        // Verify token with backend
        await axios.get(`${BACKEND_URL}/api/admin/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsValid(true);
      } catch (error) {
        // Token invalid or expired
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_data');
        localStorage.removeItem('login_time');
        setIsValid(false);
      }
    };

    verifyToken();
  }, [location]);

  if (isValid === null) {
    // Loading state
    return (
      <div className="min-h-screen bg-[#1a1b26] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7aa2f7]"></div>
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
