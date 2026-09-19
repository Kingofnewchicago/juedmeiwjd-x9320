import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ClipboardList,
  Shield,
  Phone,
  Mail,
  MessageCircle,
  Timer,
  Share2,
} from 'lucide-react';
import { TdataLogo } from '../../components/Logo';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [appCount, setAppCount] = useState(0);
  const [unreadChat, setUnreadChat] = useState(0);

  const adminData = JSON.parse(localStorage.getItem('admin_data') || '{}');

  // Fetch application count + unread chat
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const headers = { Authorization: `Bearer ${token}` };
        const [appRes, chatRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_BACKEND_URL}/api/applications/`, { headers }),
          fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/unread`, { headers })
        ]);
        const appData = await appRes.json();
        setAppCount(appData.length);
        const chatData = await chatRes.json();
        setUnreadChat(chatData.unread || 0);
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 15000);
    return () => clearInterval(interval);
  }, [location]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: FileText, label: 'Bewerbungen', path: '/admin/applications', badge: appCount > 0 ? String(appCount) : null },
    { icon: Shield, label: 'Verifikationen', path: '/admin/verifications' },
    { icon: ClipboardList, label: 'Aufgaben', path: '/admin/tasks' },
    { icon: Phone, label: 'Anosim Nummern', path: '/admin/anosim' },
    { icon: Mail, label: 'E-Mail Postfächer', path: '/admin/email-inbox' },
    { icon: MessageCircle, label: 'Chat', path: '/admin/chat', badge: unreadChat > 0 ? String(unreadChat) : null, badgeColor: 'bg-red-500' },
    { icon: Timer, label: 'Test-Sitzungen', path: '/admin/test-sessions' },
    { icon: Share2, label: 'Referral-Links', path: '/admin/referrals' },
    { icon: Settings, label: 'Einstellungen', path: '/admin/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    localStorage.removeItem('login_time');
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#1a1b26] flex">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:flex flex-col bg-[#16161e] border-r border-[#292e42] transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo & Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#292e42]">
          {isSidebarOpen && (
            <div className="flex items-center space-x-2">
              <TdataLogo className="w-8 h-8" />
              <span className="text-lg font-bold text-[#c0caf5]">
                Admin
              </span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-[#292e42] text-[#9aa5ce] transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu Items */}
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
                    ? 'bg-[#7aa2f7]/10 text-[#7aa2f7]'
                    : 'text-[#9aa5ce] hover:bg-[#292e42] hover:text-[#c0caf5]'
                }`}
              >
                <Icon size={20} />
                {isSidebarOpen && (
                  <>
                    <span className="flex-1 font-medium">{item.label}</span>
                    {item.badge && (
                      <span className={`px-2 py-0.5 ${item.badgeColor || 'bg-[#7aa2f7]'} text-white text-xs font-semibold rounded-full`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-[#292e42]">
          {isSidebarOpen ? (
            <div className="mb-3">
              <p className="text-sm font-medium text-[#c0caf5]">{adminData.name}</p>
              <p className="text-xs text-[#565f89]">{adminData.email}</p>
            </div>
          ) : null}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-[#f7768e] hover:bg-[#f7768e]/10 transition-all"
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
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-[#16161e] border-r border-[#292e42] z-50 flex flex-col">
            {/* Same content as desktop sidebar */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-[#292e42]">
              <div className="flex items-center space-x-2">
                <TdataLogo className="w-8 h-8" />
                <span className="text-lg font-bold text-[#c0caf5]">Admin</span>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-[#292e42] text-[#9aa5ce]"
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
                        ? 'bg-[#7aa2f7]/10 text-[#7aa2f7]'
                        : 'text-[#9aa5ce] hover:bg-[#292e42] hover:text-[#c0caf5]'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="flex-1 font-medium">{item.label}</span>
                    {item.badge && (
                      <span className={`px-2 py-0.5 ${item.badgeColor || 'bg-[#7aa2f7]'} text-white text-xs font-semibold rounded-full`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-[#292e42]">
              <div className="mb-3">
                <p className="text-sm font-medium text-[#c0caf5]">{adminData.name}</p>
                <p className="text-xs text-[#565f89]">{adminData.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-[#f7768e] hover:bg-[#f7768e]/10 transition-all"
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
        {/* Top Bar */}
        <header className="h-16 bg-[#16161e] border-b border-[#292e42] flex items-center justify-between px-4 lg:px-6">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-[#292e42] text-[#9aa5ce]"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center space-x-2 text-sm text-[#565f89]">
            <span>Admin</span>
            <ChevronRight size={16} />
            <span className="text-[#c0caf5]">
              {menuItems.find((item) => isActive(item.path))?.label || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-[#c0caf5]">{adminData.name}</p>
              <p className="text-xs text-[#565f89]">Administrator</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
