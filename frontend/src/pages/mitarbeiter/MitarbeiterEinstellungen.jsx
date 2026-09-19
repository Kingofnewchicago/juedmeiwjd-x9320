import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Bell, 
  Shield, 
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Download,
  FileSignature
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MitarbeiterEinstellungen = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    phone: '',
    address: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    taskReminders: true,
    payoutNotifications: true,
  });

  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = async () => {
    try {
      const token = localStorage.getItem('employee_token');
      
      // Fetch profile from backend
      const response = await axios.get(`${BACKEND_URL}/api/employee/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data;
      setEmployeeData(data);
      setProfileData({
        phone: data.phone || '',
        address: data.address || '',
      });
      
      if (data.notifications) {
        setNotifications({
          emailNotifications: data.notifications.email_notifications ?? true,
          taskReminders: data.notifications.task_reminders ?? true,
          payoutNotifications: data.notifications.payout_notifications ?? true,
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to localStorage if API fails
      const storedData = JSON.parse(localStorage.getItem('employee_data') || '{}');
      setEmployeeData(storedData);
      setProfileData({
        phone: storedData.phone || '',
        address: storedData.address || '',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('employee_token');
      await axios.put(`${BACKEND_URL}/api/employee/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local storage
      const updatedData = { ...employeeData, ...profileData };
      localStorage.setItem('employee_data', JSON.stringify(updatedData));
      setEmployeeData(updatedData);
      
      toast.success('Profil aktualisiert');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwörter stimmen nicht überein');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('employee_token');
      await axios.post(`${BACKEND_URL}/api/employee/change-password`, {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Passwort geändert');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Fehler beim Ändern des Passworts');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = async (key) => {
    const newSettings = {
      ...notifications,
      [key]: !notifications[key]
    };
    setNotifications(newSettings);
    
    try {
      const token = localStorage.getItem('employee_token');
      await axios.put(`${BACKEND_URL}/api/employee/notifications`, {
        email_notifications: newSettings.emailNotifications,
        task_reminders: newSettings.taskReminders,
        payout_notifications: newSettings.payoutNotifications
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Benachrichtigungseinstellungen gespeichert');
    } catch (error) {
      // Revert on error
      setNotifications(notifications);
      toast.error('Fehler beim Speichern');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl" data-testid="employee-settings-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Einstellungen</h1>
        <p className="text-gray-600 mt-1">Verwalten Sie Ihr Profil und Ihre Einstellungen</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-sage-100 rounded-lg flex items-center justify-center">
            <User className="text-sage-500" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Persönliche Daten</h2>
            <p className="text-sm text-gray-500">Ihre Kontaktinformationen</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-gray-700">Name</Label>
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
              <User size={18} className="text-gray-400" />
              <span className="text-gray-900">{employeeData?.name}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">E-Mail</Label>
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
              <Mail size={18} className="text-gray-400" />
              <span className="text-gray-900">{employeeData?.email}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="pl-10 h-12"
                placeholder="+49 170 1234567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Position</Label>
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
              <CheckCircle size={18} className="text-sage-500" />
              <span className="text-gray-900">{employeeData?.position}</span>
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Adresse</Label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
              <Input
                id="address"
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                className="pl-10 h-12"
                placeholder="Straße, PLZ Stadt"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleProfileSave}
            disabled={saving}
            className="bg-sage-500 hover:bg-sage-600"
          >
            <Save size={18} className="mr-2" />
            {saving ? 'Speichern...' : 'Änderungen speichern'}
          </Button>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-sage-100 rounded-lg flex items-center justify-center">
            <Lock className="text-sage-500" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Passwort ändern</h2>
            <p className="text-sm text-gray-500">Aktualisieren Sie Ihr Passwort regelmäßig</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="h-12 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Neues Passwort</Label>
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="h-12"
              placeholder="Mind. 8 Zeichen"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="h-12"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handlePasswordChange}
            disabled={saving || !passwordData.currentPassword || !passwordData.newPassword}
            variant="outline"
            className="border-sage-500 text-sage-600 hover:bg-sage-50"
          >
            <Lock size={18} className="mr-2" />
            Passwort ändern
          </Button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-sage-100 rounded-lg flex items-center justify-center">
            <Bell className="text-sage-500" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Benachrichtigungen</h2>
            <p className="text-sm text-gray-500">Verwalten Sie Ihre E-Mail-Benachrichtigungen</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'E-Mail-Benachrichtigungen', desc: 'Erhalten Sie wichtige Updates per E-Mail' },
            { key: 'taskReminders', label: 'Aufgaben-Erinnerungen', desc: 'Erinnerungen für anstehende Aufgaben' },
            { key: 'payoutNotifications', label: 'Auszahlungs-Benachrichtigungen', desc: 'Updates zu Ihren Auszahlungen' },
          ].map((item) => (
            <div 
              key={item.key}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <button
                onClick={() => handleNotificationToggle(item.key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifications[item.key] ? 'bg-sage-500' : 'bg-gray-300'
                }`}
              >
                <span 
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications[item.key] ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Contract Download */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-sage-100 rounded-lg flex items-center justify-center">
            <FileSignature className="text-sage-500" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Arbeitsvertrag</h2>
            <p className="text-sm text-gray-500">Ihren unterschriebenen Vertrag herunterladen</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle size={18} className="text-sage-500" />
            <p className="text-gray-900 font-medium">Vertrag unterschrieben</p>
          </div>
          <button
            onClick={() => {
              const token = localStorage.getItem('employee_token');
              window.open(`${BACKEND_URL}/api/applications/download-contract?token=${token}`, '_blank');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors text-sm font-medium"
            data-testid="download-contract-btn"
          >
            <Download size={16} />
            Herunterladen
          </button>
        </div>
      </div>

      {/* Security Info */}
      <div className="bg-sage-50 border border-sage-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Shield className="text-sage-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-sage-800">Datenschutz & Sicherheit</h3>
            <p className="text-sm text-sage-700 mt-1">
              Ihre Daten werden gemäß DSGVO behandelt und sicher gespeichert. 
              Bei Fragen wenden Sie sich an unseren Datenschutzbeauftragten.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MitarbeiterEinstellungen;
