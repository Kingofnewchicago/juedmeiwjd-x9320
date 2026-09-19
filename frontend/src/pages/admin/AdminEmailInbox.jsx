import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mail, Plus, Trash2, UserPlus, X, RefreshCw, CheckCircle, 
  AlertCircle, Search, Users, Inbox, Send
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminEmailInbox = () => {
  const [accounts, setAccounts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({ total: 0, assigned: 0, available: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // New account form
  const [newAccount, setNewAccount] = useState({
    email: '',
    app_password: '',
    description: ''
  });

  const token = localStorage.getItem('admin_token');

  const fetchData = useCallback(async () => {
    try {
      const [accountsRes, employeesRes, statsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/email-inbox/accounts`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_URL}/api/admin/employees`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_URL}/api/email-inbox/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setAccounts(accountsRes.data.accounts || []);
      setEmployees(employeesRes.data || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!newAccount.email || !newAccount.app_password) {
      toast.error('E-Mail und App-Passwort sind erforderlich');
      return;
    }
    
    setSubmitting(true);
    try {
      await axios.post(
        `${BACKEND_URL}/api/email-inbox/accounts`,
        newAccount,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('E-Mail-Konto hinzugefügt');
      setShowAddModal(false);
      setNewAccount({ email: '', app_password: '', description: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Fehler beim Hinzufügen');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm('E-Mail-Konto wirklich löschen?')) return;
    
    try {
      await axios.delete(
        `${BACKEND_URL}/api/email-inbox/accounts/${accountId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('E-Mail-Konto gelöscht');
      fetchData();
    } catch (error) {
      toast.error('Fehler beim Löschen');
    }
  };

  const handleAssign = async () => {
    if (!selectedAccount || !selectedEmployee) return;
    
    setSubmitting(true);
    try {
      await axios.post(
        `${BACKEND_URL}/api/email-inbox/assign`,
        {
          email_account_id: selectedAccount.id,
          employee_id: selectedEmployee.id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`${selectedAccount.email} wurde ${selectedEmployee.name} zugewiesen`);
      setShowAssignModal(false);
      setSelectedAccount(null);
      setSelectedEmployee(null);
      setEmployeeSearchTerm('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Fehler bei der Zuweisung');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassign = async (accountId) => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/email-inbox/unassign/${accountId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Zuweisung entfernt');
      fetchData();
    } catch (error) {
      toast.error('Fehler beim Entfernen der Zuweisung');
    }
  };

  const handleTestAccount = async (accountId) => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/email-inbox/test/${accountId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        toast.success('Verbindung erfolgreich!');
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error('Verbindungstest fehlgeschlagen');
    }
  };

  // Filter accounts by search
  const filteredAccounts = accounts.filter(acc =>
    acc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get available employees (not assigned to any email account)
  const availableEmployees = employees.filter(
    emp => !accounts.some(acc => acc.assigned_to?.id === emp.id)
  );

  // Filter available employees by search
  const filteredAvailableEmployees = availableEmployees.filter(emp =>
    emp.name?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#7aa2f7] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#c0caf5]">E-Mail Postfächer</h1>
          <p className="text-[#565f89] mt-1">E-Mail-Konten verwalten und Mitarbeitern zuweisen</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="p-2 bg-[#1a1b26] hover:bg-[#292e42] text-[#7aa2f7] rounded-lg transition-colors"
          >
            <RefreshCw size={20} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7aa2f7] text-[#1a1b26] rounded-lg font-medium hover:bg-[#89b4fa] transition-colors"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Konto hinzufügen</span>
            <span className="sm:hidden">Hinzufügen</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1a1b26] p-4 rounded-xl border border-[#292e42]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7aa2f7]/10 rounded-lg flex items-center justify-center">
              <Inbox className="text-[#7aa2f7]" size={20} />
            </div>
            <div>
              <p className="text-[#565f89] text-sm">Gesamt</p>
              <p className="text-2xl font-bold text-[#c0caf5]">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a1b26] p-4 rounded-xl border border-[#292e42]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#9ece6a]/10 rounded-lg flex items-center justify-center">
              <Users className="text-[#9ece6a]" size={20} />
            </div>
            <div>
              <p className="text-[#565f89] text-sm">Zugewiesen</p>
              <p className="text-2xl font-bold text-[#9ece6a]">{stats.assigned}</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a1b26] p-4 rounded-xl border border-[#292e42]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#bb9af7]/10 rounded-lg flex items-center justify-center">
              <Mail className="text-[#bb9af7]" size={20} />
            </div>
            <div>
              <p className="text-[#565f89] text-sm">Verfügbar</p>
              <p className="text-2xl font-bold text-[#bb9af7]">{stats.available}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#565f89]" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="E-Mail-Konten durchsuchen..."
          className="w-full pl-12 pr-4 py-3 bg-[#1a1b26] border border-[#292e42] rounded-xl text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
        />
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-[#1a1b26] rounded-xl border border-[#292e42] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#292e42]">
              <th className="text-left p-4 text-[#565f89] font-medium">E-Mail</th>
              <th className="text-left p-4 text-[#565f89] font-medium">Beschreibung</th>
              <th className="text-left p-4 text-[#565f89] font-medium">Zugewiesen an</th>
              <th className="text-left p-4 text-[#565f89] font-medium">Status</th>
              <th className="text-right p-4 text-[#565f89] font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[#565f89]">
                  {searchTerm ? 'Keine E-Mail-Konten gefunden' : 'Noch keine E-Mail-Konten hinzugefügt'}
                </td>
              </tr>
            ) : (
              filteredAccounts.map((account) => (
                <tr key={account.id} className="border-b border-[#292e42] last:border-0 hover:bg-[#16161e]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#7aa2f7]/10 rounded-lg flex items-center justify-center">
                        <Mail className="text-[#7aa2f7]" size={16} />
                      </div>
                      <span className="text-[#c0caf5] font-mono">{account.email}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[#9aa5ce]">{account.description || '-'}</td>
                  <td className="p-4">
                    {account.assigned_to ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[#9ece6a]">{account.assigned_to.name}</span>
                        <button
                          onClick={() => handleUnassign(account.id)}
                          className="p-1 text-[#f7768e] hover:bg-[#f7768e]/10 rounded"
                          title="Zuweisung entfernen"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[#565f89]">Nicht zugewiesen</span>
                    )}
                  </td>
                  <td className="p-4">
                    {account.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#9ece6a]/10 text-[#9ece6a] rounded-full text-xs">
                        <CheckCircle size={12} />
                        Aktiv
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#f7768e]/10 text-[#f7768e] rounded-full text-xs">
                        <AlertCircle size={12} />
                        Inaktiv
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleTestAccount(account.id)}
                        className="p-2 text-[#7aa2f7] hover:bg-[#7aa2f7]/10 rounded-lg transition-colors"
                        title="Verbindung testen"
                      >
                        <Send size={16} />
                      </button>
                      {!account.assigned_to && (
                        <button
                          onClick={() => {
                            setSelectedAccount(account);
                            setShowAssignModal(true);
                          }}
                          className="p-2 text-[#9ece6a] hover:bg-[#9ece6a]/10 rounded-lg transition-colors"
                          title="Zuweisen"
                        >
                          <UserPlus size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="p-2 text-[#f7768e] hover:bg-[#f7768e]/10 rounded-lg transition-colors"
                        title="Löschen"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredAccounts.length === 0 ? (
          <div className="bg-[#1a1b26] border border-[#292e42] rounded-xl p-8 text-center text-[#565f89]">
            {searchTerm ? 'Keine E-Mail-Konten gefunden' : 'Noch keine E-Mail-Konten hinzugefügt'}
          </div>
        ) : (
          filteredAccounts.map((account) => (
            <div key={account.id} className="bg-[#1a1b26] border border-[#292e42] rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-[#7aa2f7]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="text-[#7aa2f7]" size={16} />
                  </div>
                  <span className="text-[#c0caf5] font-mono text-sm truncate">{account.email}</span>
                </div>
                {account.is_active ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#9ece6a]/10 text-[#9ece6a] rounded-full text-xs flex-shrink-0">
                    <CheckCircle size={12} />
                    Aktiv
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#f7768e]/10 text-[#f7768e] rounded-full text-xs flex-shrink-0">
                    <AlertCircle size={12} />
                    Inaktiv
                  </span>
                )}
              </div>
              {account.description && (
                <p className="text-sm text-[#9aa5ce] mb-2">{account.description}</p>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#292e42]">
                <div>
                  {account.assigned_to ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#9ece6a]">{account.assigned_to.name}</span>
                      <button onClick={() => handleUnassign(account.id)} className="p-1 text-[#f7768e] hover:bg-[#f7768e]/10 rounded">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-[#565f89]">Nicht zugewiesen</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleTestAccount(account.id)} className="p-2 text-[#7aa2f7] hover:bg-[#7aa2f7]/10 rounded-lg"><Send size={16} /></button>
                  {!account.assigned_to && (
                    <button onClick={() => { setSelectedAccount(account); setShowAssignModal(true); }} className="p-2 text-[#9ece6a] hover:bg-[#9ece6a]/10 rounded-lg"><UserPlus size={16} /></button>
                  )}
                  <button onClick={() => handleDeleteAccount(account.id)} className="p-2 text-[#f7768e] hover:bg-[#f7768e]/10 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1b26] rounded-2xl w-full max-w-md border border-[#292e42]">
            <div className="flex items-center justify-between p-6 border-b border-[#292e42]">
              <h2 className="text-xl font-bold text-[#c0caf5]">E-Mail-Konto hinzufügen</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-[#565f89] hover:text-[#c0caf5] hover:bg-[#292e42] rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddAccount} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#9aa5ce] mb-2">
                  E-Mail Adresse
                </label>
                <input
                  type="email"
                  value={newAccount.email}
                  onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                  placeholder="beispiel@gmail.com / @gmx.de / @web.de"
                  className="w-full px-4 py-3 bg-[#16161e] border border-[#292e42] rounded-lg text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                  required
                />
                <p className="text-xs text-[#565f89] mt-1">
                  Unterstützt: Gmail, GMX, Web.de
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9aa5ce] mb-2">
                  App-Passwort / Passwort
                </label>
                <input
                  type="password"
                  value={newAccount.app_password}
                  onChange={(e) => setNewAccount({ ...newAccount, app_password: e.target.value })}
                  placeholder="xxxx xxxx xxxx xxxx"
                  className="w-full px-4 py-3 bg-[#16161e] border border-[#292e42] rounded-lg text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                  required
                />
                <p className="text-xs text-[#565f89] mt-1">
                  Gmail: App-Passwort (myaccount.google.com/apppasswords) · GMX/Web.de: normales Passwort (IMAP in Einstellungen aktivieren)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9aa5ce] mb-2">
                  Beschreibung (optional)
                </label>
                <input
                  type="text"
                  value={newAccount.description}
                  onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })}
                  placeholder="z.B. Test-Account 1"
                  className="w-full px-4 py-3 bg-[#16161e] border border-[#292e42] rounded-lg text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 text-[#9aa5ce] hover:text-[#c0caf5] font-medium transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#7aa2f7] text-[#1a1b26] rounded-lg font-medium hover:bg-[#89b4fa] transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Wird hinzugefügt...' : 'Hinzufügen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedAccount && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1b26] rounded-2xl w-full max-w-md border border-[#292e42]">
            <div className="flex items-center justify-between p-6 border-b border-[#292e42]">
              <div>
                <h2 className="text-xl font-bold text-[#c0caf5]">E-Mail zuweisen</h2>
                <p className="text-sm text-[#565f89] mt-1">{selectedAccount.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedAccount(null);
                  setSelectedEmployee(null);
                  setEmployeeSearchTerm('');
                }}
                className="p-2 text-[#565f89] hover:text-[#c0caf5] hover:bg-[#292e42] rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-[#9aa5ce] mb-3">
                Mitarbeiter auswählen
              </label>
              
              {/* Employee Search */}
              {availableEmployees.length > 0 && (
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#565f89]" size={16} />
                  <input
                    type="text"
                    value={employeeSearchTerm}
                    onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                    placeholder="Mitarbeiter suchen..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#16161e] border border-[#292e42] rounded-lg text-[#c0caf5] text-sm focus:outline-none focus:border-[#7aa2f7]"
                    autoFocus
                  />
                  {employeeSearchTerm && (
                    <button
                      onClick={() => setEmployeeSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#565f89] hover:text-[#c0caf5]"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {filteredAvailableEmployees.length === 0 ? (
                  <p className="text-[#565f89] text-center py-4">
                    {employeeSearchTerm ? 'Keine Mitarbeiter gefunden' : 'Keine Mitarbeiter verfügbar'}
                  </p>
                ) : (
                  filteredAvailableEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedEmployee?.id === emp.id
                          ? 'bg-[#7aa2f7]/20 border border-[#7aa2f7]'
                          : 'bg-[#16161e] border border-[#292e42] hover:border-[#7aa2f7]/50'
                      }`}
                    >
                      <p className="text-[#c0caf5] font-medium">{emp.name}</p>
                      <p className="text-[#565f89] text-sm">{emp.email}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-[#292e42]">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedAccount(null);
                  setSelectedEmployee(null);
                  setEmployeeSearchTerm('');
                }}
                className="flex-1 py-3 text-[#9aa5ce] hover:text-[#c0caf5] font-medium transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedEmployee || submitting}
                className="flex-1 py-3 bg-[#7aa2f7] text-[#1a1b26] rounded-lg font-medium hover:bg-[#89b4fa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Wird zugewiesen...' : 'Zuweisen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmailInbox;
