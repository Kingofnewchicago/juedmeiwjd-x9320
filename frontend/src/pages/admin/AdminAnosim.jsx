import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Phone, 
  RefreshCw, 
  User, 
  Search, 
  X, 
  Check, 
  Trash2,
  AlertCircle,
  MessageSquare,
  Users,
  Smartphone,
  Clock,
  Globe
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminAnosim = () => {
  const [purchasedNumbers, setPurchasedNumbers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({ total: 0, assigned: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [numbersRes, employeesRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/anosim/numbers`, { headers }),
        axios.get(`${BACKEND_URL}/api/admin/employees`, { headers })
      ]);
      
      setPurchasedNumbers(numbersRes.data.numbers || []);
      setStats({
        total: numbersRes.data.total_purchased || 0,
        assigned: numbersRes.data.total_assigned || 0
      });
      setEmployees(employeesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const assignNumber = async () => {
    if (!selectedNumber || !selectedEmployee) {
      toast.error('Bitte wählen Sie eine Nummer und einen Mitarbeiter');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(
        `${BACKEND_URL}/api/anosim/assign`,
        {
          employee_id: selectedEmployee.id,
          anosim_number: selectedNumber.phone,
          anosim_booking_id: selectedNumber.id ? String(selectedNumber.id) : null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`${selectedNumber.phone} wurde ${selectedEmployee.name} zugewiesen`);
      setShowAssignModal(false);
      setSelectedNumber(null);
      setSelectedEmployee(null);
      setEmployeeSearchTerm('');
      fetchData();
    } catch (error) {
      console.error('Error assigning number:', error);
      toast.error(error.response?.data?.detail || 'Fehler beim Zuweisen der Nummer');
    } finally {
      setSubmitting(false);
    }
  };

  const removeAssignment = async (phone, employeeName, employeeId) => {
    if (!window.confirm(`Möchten Sie die Nummer ${phone} von ${employeeName} wirklich entfernen?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(
        `${BACKEND_URL}/api/anosim/unassign`,
        { employee_id: employeeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Zuweisung erfolgreich entfernt');
      fetchData();
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast.error('Fehler beim Entfernen der Zuweisung');
    }
  };

  // Get available numbers (not assigned)
  const availableNumbers = purchasedNumbers.filter(n => !n.assigned_to);
  
  // Get employees without assigned numbers
  const availableEmployees = employees.filter(
    emp => !purchasedNumbers.some(n => n.assigned_to?.id === emp.id)
  );

  // Filter available employees by search term in modal
  const filteredAvailableEmployees = availableEmployees.filter(emp =>
    emp.name?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  );

  // Filter numbers by search
  const filteredNumbers = purchasedNumbers.filter(n => 
    n.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.assigned_to?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.assigned_to?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7aa2f7]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-anosim-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#c0caf5]">Anosim Nummernverwaltung</h1>
          <p className="text-[#9aa5ce] mt-1">
            Gekaufte Nummern verwalten und Mitarbeitern zuweisen
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-[#292e42] text-[#c0caf5] rounded-lg hover:bg-[#343b58] transition-colors"
          data-testid="refresh-btn"
        >
          <RefreshCw size={18} />
          <span>Aktualisieren</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#16161e] border border-[#292e42] rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#7aa2f7]/10 rounded-full flex items-center justify-center">
              <Smartphone size={24} className="text-[#7aa2f7]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#c0caf5]">{stats.total}</p>
              <p className="text-sm text-[#9aa5ce]">Gekaufte Nummern</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#16161e] border border-[#292e42] rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#9ece6a]/10 rounded-full flex items-center justify-center">
              <Users size={24} className="text-[#9ece6a]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#c0caf5]">{stats.assigned}</p>
              <p className="text-sm text-[#9aa5ce]">Zugewiesen</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#16161e] border border-[#292e42] rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#e0af68]/10 rounded-full flex items-center justify-center">
              <Phone size={24} className="text-[#e0af68]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#c0caf5]">{stats.total - stats.assigned}</p>
              <p className="text-sm text-[#9aa5ce]">Verfügbar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-[#7aa2f7]/10 border border-[#7aa2f7]/30 rounded-xl p-4 flex items-start gap-3">
        <MessageSquare className="text-[#7aa2f7] flex-shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="font-medium text-[#c0caf5]">So funktioniert's</h3>
          <p className="text-sm text-[#9aa5ce] mt-1">
            Die Nummern werden direkt von Ihrem Anosim-Konto abgerufen. Weisen Sie eine Nummer einem Mitarbeiter zu, 
            damit dieser im Auftragsbereich die eingehenden SMS-Codes sehen kann.
          </p>
        </div>
      </div>

      {/* Search */}
      {purchasedNumbers.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#565f89]" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Suchen nach Nummer, Name oder Land..."
            className="w-full pl-10 pr-4 py-3 bg-[#16161e] border border-[#292e42] rounded-lg text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
            data-testid="search-input"
          />
        </div>
      )}

      {/* Numbers List */}
      <div className="space-y-3" data-testid="numbers-list">
        {filteredNumbers.length === 0 ? (
          <div className="bg-[#16161e] border border-[#292e42] rounded-xl p-12 text-center">
            <Phone size={48} className="mx-auto mb-4 text-[#565f89]" />
            <h3 className="text-lg font-medium text-[#c0caf5] mb-2">
              {searchTerm ? 'Keine Ergebnisse' : 'Keine Nummern vorhanden'}
            </h3>
            <p className="text-[#9aa5ce]">
              {searchTerm 
                ? 'Versuchen Sie einen anderen Suchbegriff.' 
                : 'Kaufen Sie Nummern auf anosim.net um sie hier zu verwalten.'}
            </p>
          </div>
        ) : (
          filteredNumbers.map((num, idx) => (
            <div
              key={`${num.phone}-${idx}`}
              className={`bg-[#16161e] border rounded-xl p-5 transition-colors ${
                num.assigned_to 
                  ? 'border-[#9ece6a]/30 hover:border-[#9ece6a]/50' 
                  : 'border-[#292e42] hover:border-[#343b58]'
              }`}
              data-testid={`number-${idx}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Number Info */}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    num.assigned_to ? 'bg-[#9ece6a]/10' : 'bg-[#292e42]'
                  }`}>
                    <Phone size={24} className={num.assigned_to ? 'text-[#9ece6a]' : 'text-[#565f89]'} />
                  </div>
                  <div>
                    <p className="text-xl font-mono font-bold text-[#c0caf5]">{num.phone}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {num.country && (
                        <span className="flex items-center gap-1 text-xs text-[#9aa5ce]">
                          <Globe size={12} />
                          {num.country}
                        </span>
                      )}
                      {num.product && (
                        <span className="text-xs text-[#565f89]">{num.product}</span>
                      )}
                      {num.expires_at && (
                        <span className="flex items-center gap-1 text-xs text-[#e0af68]">
                          <Clock size={12} />
                          {new Date(num.expires_at).toLocaleDateString('de-DE')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Assignment Status */}
                <div className="flex items-center gap-3">
                  {num.assigned_to ? (
                    <>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#9ece6a]">Zugewiesen an</p>
                        <p className="text-[#c0caf5] font-medium">{num.assigned_to.name}</p>
                        <p className="text-xs text-[#565f89]">{num.assigned_to.email}</p>
                      </div>
                      <button
                        onClick={() => removeAssignment(num.phone, num.assigned_to.name, num.assigned_to.id)}
                        className="p-2 text-[#f7768e] hover:bg-[#f7768e]/10 rounded-lg transition-colors"
                        title="Zuweisung entfernen"
                        data-testid={`remove-${idx}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedNumber(num);
                        setShowAssignModal(true);
                      }}
                      disabled={availableEmployees.length === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-[#7aa2f7] text-white rounded-lg hover:bg-[#7aa2f7]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid={`assign-${idx}`}
                    >
                      <User size={16} />
                      <span>Zuweisen</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* No Available Employees Warning */}
      {availableEmployees.length === 0 && availableNumbers.length > 0 && (
        <div className="bg-[#e0af68]/10 border border-[#e0af68]/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-[#e0af68] flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-medium text-[#e0af68]">Keine Mitarbeiter verfügbar</h3>
            <p className="text-sm text-[#9aa5ce] mt-1">
              Alle Mitarbeiter haben bereits eine Nummer zugewiesen.
            </p>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedNumber && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1b26] border border-[#292e42] rounded-xl w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#292e42]">
              <div>
                <h3 className="text-xl font-bold text-[#c0caf5]">Nummer zuweisen</h3>
                <p className="text-[#9aa5ce] font-mono mt-1">{selectedNumber.phone}</p>
              </div>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedNumber(null);
                  setSelectedEmployee(null);
                  setEmployeeSearchTerm('');
                }}
                className="p-2 text-[#565f89] hover:text-[#c0caf5] hover:bg-[#292e42] rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
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
                    data-testid="employee-search-input"
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
                  filteredAvailableEmployees.map((emp, idx) => (
                    <div
                      key={`emp-${emp.id}-${idx}`}
                      onClick={() => setSelectedEmployee(emp)}
                      className={`p-4 rounded-lg cursor-pointer transition-all border ${
                        selectedEmployee?.id === emp.id
                          ? 'bg-[#7aa2f7]/10 border-[#7aa2f7]'
                          : 'bg-[#16161e] border-[#292e42] hover:border-[#565f89]'
                      }`}
                      data-testid={`select-employee-${emp.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                            selectedEmployee?.id === emp.id
                              ? 'bg-[#7aa2f7] border-[#7aa2f7]'
                              : 'border-[#565f89]'
                          }`}>
                            {selectedEmployee?.id === emp.id && <Check size={14} className="text-white" />}
                          </div>
                          <div>
                            <p className="text-[#c0caf5] font-medium">{emp.name}</p>
                            <p className="text-[#565f89] text-sm">{emp.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#292e42]">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedNumber(null);
                  setSelectedEmployee(null);
                  setEmployeeSearchTerm('');
                }}
                className="px-6 py-2 text-[#9aa5ce] hover:text-[#c0caf5] font-medium transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={assignNumber}
                disabled={!selectedEmployee || submitting}
                className="flex items-center gap-2 px-6 py-2 bg-[#9ece6a] text-[#1a1b26] font-semibold rounded-lg hover:bg-[#9ece6a]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="confirm-assign-btn"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Wird zugewiesen...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Zuweisen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnosim;
