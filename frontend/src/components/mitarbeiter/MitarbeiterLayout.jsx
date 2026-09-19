import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { TdataLogo } from '../Logo';
import MitarbeiterPending from '../../pages/mitarbeiter/MitarbeiterPending';
import MitarbeiterContractSign from '../../pages/mitarbeiter/MitarbeiterContractSign';
import MitarbeiterVerification from '../../pages/mitarbeiter/MitarbeiterVerification';
import MitarbeiterAwaitingApproval from '../../pages/mitarbeiter/MitarbeiterAwaitingApproval';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MitarbeiterLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [applicantStatus, setApplicantStatus] = useState(null);
  const [applicantData, setApplicantData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkApplicantStatus();
  }, []);

  const checkApplicantStatus = async () => {
    try {
      const token = localStorage.getItem('employee_token');
      const storedData = JSON.parse(localStorage.getItem('employee_data') || '{}');
      
      // If old employee (has employee_number), they're fully verified
      if (storedData.employee_number) {
        setApplicantStatus('Freigeschaltet');
        setApplicantData(storedData);
        setLoading(false);
        return;
      }

      // Get current status from server
      const response = await axios.get(`${BACKEND_URL}/api/applications/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setApplicantStatus(response.data.status);
      setApplicantData(response.data);
      
      // Update local storage
      localStorage.setItem('employee_data', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error checking status:', error);
      // If error, redirect to login
      navigate('/mitarbeiter/login');
    } finally {
      setLoading(false);
    }
  };

  const employeeData = applicantData || JSON.parse(localStorage.getItem('employee_data') || '{}');
  const [unreadChat, setUnreadChat] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem('employee_token');
        if (!token) return;
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/unread`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setUnreadChat(data.unread || 0);
      } catch (e) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [location]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Main', path: '/mitarbeiter/dashboard' },
    { icon: ClipboardList, label: 'Aufträge', path: '/mitarbeiter/auftrage' },
    { icon: MessageCircle, label: 'Chat', path: '/mitarbeiter/chat', badge: unreadChat > 0 ? String(unreadChat) : null, badgeColor: 'bg-red-500' },
    { icon: Settings, label: 'Einstellungen', path: '/mitarbeiter/einstellungen' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('employee_token');
    localStorage.removeItem('employee_data');
    localStorage.removeItem('employee_login_time');
    navigate('/mitarbeiter/login');
  };

  const isActive = (path) => location.pathname === path;

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-500"></div>
      </div>
    );
  }

  // Show different views based on status
  if (applicantStatus === 'Neu') {
    return <MitarbeiterPending applicant={applicantData} />;
  }

  if (applicantStatus === 'Akzeptiert') {
    return (
      <MitarbeiterContractSign 
        applicant={applicantData} 
        onContractSigned={checkApplicantStatus}
      />
    );
  }

  if (applicantStatus === 'Vertrag unterschrieben') {
    return (
      <MitarbeiterVerification 
        applicant={applicantData} 
        onVerificationComplete={checkApplicantStatus}
      />
    );
  }

  if (applicantStatus === 'Verifiziert') {
    return <MitarbeiterAwaitingApproval applicant={applicantData} />;
  }

  // Status: Freigeschaltet - show full dashboard
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {isSidebarOpen && (
            <div className="flex items-center space-x-2">
              <TdataLogo className="w-8 h-8" />
              <span className="text-lg font-bold text-gray-900">
                Tdata Testing
              </span>
            </div>
          )}
          {!isSidebarOpen && (
            <TdataLogo className="w-8 h-8 mx-auto" />
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all group ${
                  active
                    ? 'bg-sage-50 text-sage-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                {isSidebarOpen && (
                  <>
                    <span className="flex-1 font-medium">{item.label}</span>
                    {item.badge && (
                      <span className={`px-2 py-0.5 ${item.badgeColor || 'bg-sage-500'} text-white text-xs font-semibold rounded-full`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          {isSidebarOpen ? (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900">{employeeData.name}</p>
              <p className="text-xs text-gray-500">{employeeData.position}</p>
            </div>
          ) : null}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sage-600 hover:bg-sage-50 transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Abmelden</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 flex flex-col">
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <TdataLogo className="w-8 h-8" />
                <span className="text-lg font-bold text-gray-900">
                  Tdata Testing
                </span>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all ${
                      active
                        ? 'bg-sage-50 text-sage-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="flex-1 font-medium">{item.label}</span>
                    {item.badge && (
                      <span className={`px-2 py-0.5 ${item.badgeColor || 'bg-sage-500'} text-white text-xs font-semibold rounded-full`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-200">
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-900">{employeeData.name}</p>
                <p className="text-xs text-gray-500">{employeeData.position}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sage-600 hover:bg-sage-50 transition-all"
              >
                <LogOut size={20} />
                <span className="font-medium">Abmelden</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Mitarbeiter</span>
            <ChevronRight size={16} />
            <span className="text-gray-900 font-medium">
              {menuItems.find((item) => isActive(item.path))?.label || 'Dashboard'}
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{employeeData.name}</p>
              <p className="text-xs text-gray-500">{employeeData.employee_number || employeeData.id}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MitarbeiterLayout;
