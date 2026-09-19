import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ProtectedEmployeeRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('employee_token');
      const loginTime = localStorage.getItem('employee_login_time');

      if (!token || !loginTime) {
        setIsValid(false);
        return;
      }

      // Check if 60 minutes have passed (increased from 30)
      const timeElapsed = Date.now() - parseInt(loginTime);
      const sixtyMinutes = 60 * 60 * 1000;

      if (timeElapsed > sixtyMinutes) {
        localStorage.removeItem('employee_token');
        localStorage.removeItem('employee_data');
        localStorage.removeItem('employee_login_time');
        setIsValid(false);
        return;
      }

      // Try applicant status endpoint first (new flow)
      try {
        const response = await axios.get(`${BACKEND_URL}/api/applications/status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Update local storage with latest status
        localStorage.setItem('employee_data', JSON.stringify(response.data));
        setIsValid(true);
        return;
      } catch (error) {
        // If applicant endpoint fails, try old employee endpoint
        try {
          await axios.get(`${BACKEND_URL}/api/employee/verify`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setIsValid(true);
          return;
        } catch (err2) {
          // Both failed, token is invalid
          localStorage.removeItem('employee_token');
          localStorage.removeItem('employee_data');
          localStorage.removeItem('employee_login_time');
          setIsValid(false);
        }
      }
    };

    verifyToken();
  }, [location]);

  if (isValid === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/mitarbeiter/login" replace />;
  }

  return children;
};

export default ProtectedEmployeeRoute;
