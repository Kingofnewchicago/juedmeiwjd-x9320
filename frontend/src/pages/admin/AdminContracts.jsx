import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  FileSignature, 
  Plus, 
  CheckCircle, 
  Clock, 
  Download,
  RefreshCw,
  User,
  Briefcase,
  Calendar,
  Euro,
  Eye,
  X,
  Search
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const dropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    employee_name: '',
    employee_email: '',
    position: '',
    start_date: '',
    salary: '',
    working_hours: '40'
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [contractsRes, employeesRes, applicationsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/contracts/`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${BACKEND_URL}/api/admin/employees`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${BACKEND_URL}/api/applications/`, { headers }).catch(() => ({ data: [] }))
      ]);

      setContracts(contractsRes.data);
      
      // Combine employees and accepted applicants for contract creation
      const allEmployees = [
        ...employeesRes.data.map(e => ({
          id: e.id,
          name: e.name,
          email: e.email,
          position: e.position
        })),
        ...applicationsRes.data
          .filter(a => a.status === 'Freigeschaltet' || a.status === 'Verifiziert')
          .map(a => ({
            id: a.id,
            name: a.name,
            email: a.email,
            position: a.position
          }))
      ];
      
      setEmployees(allEmployees);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter employees based on search query
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setSearchQuery(employee.name);
    setShowDropdown(false);
    setFormData({
      ...formData,
      employee_id: employee.id,
      employee_name: employee.name,
      employee_email: employee.email,
      position: employee.position || ''
    });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowDropdown(true);
    
    // Reset selection if user types something different
    if (selectedEmployee && value !== selectedEmployee.name) {
      setSelectedEmployee(null);
      setFormData({
        ...formData,
        employee_id: '',
        employee_name: '',
        employee_email: ''
      });
    }
  };

  const handleCreateContract = async (e) => {
    e.preventDefault();
    
    if (!formData.employee_id || !formData.position || !formData.start_date || !formData.salary) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    setCreating(true);

    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(`${BACKEND_URL}/api/contracts/create`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Vertrag erstellt und an Mitarbeiter gesendet');
      setShowCreateModal(false);
      setSearchQuery('');
      setSelectedEmployee(null);
      setFormData({
        employee_id: '',
        employee_name: '',
        employee_email: '',
        position: '',
        start_date: '',
        salary: '',
        working_hours: '40'
      });
      fetchData();
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error('Fehler beim Erstellen des Vertrags');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (contract) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(
        `${BACKEND_URL}/api/contracts/${contract.id}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Arbeitsvertrag_${contract.employee_name.replace(' ', '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('PDF heruntergeladen');
    } catch (error) {
      toast.error('Fehler beim Herunterladen');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'signed') {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-[#9ece6a]/20 text-[#9ece6a] rounded-full text-xs font-medium">
          <CheckCircle size={12} />
          Unterschrieben
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-1 bg-[#f7768e]/20 text-[#f7768e] rounded-full text-xs font-medium">
        <Clock size={12} />
        Ausstehend
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7aa2f7]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-contracts-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#c0caf5] flex items-center gap-3">
            <FileSignature className="text-[#7aa2f7]" size={28} />
            Arbeitsverträge
          </h1>
          <p className="text-[#9aa5ce] mt-1">
            {contracts.filter(c => c.status === 'pending').length} ausstehende Unterschriften
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-[#292e42] text-[#c0caf5] rounded-lg hover:bg-[#343b58] transition-colors"
          >
            <RefreshCw size={18} />
            <span className="hidden sm:inline">Aktualisieren</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7aa2f7] text-white rounded-lg hover:bg-[#6b93e8] transition-colors"
          >
            <Plus size={18} />
            <span>Neuer Vertrag</span>
          </button>
        </div>
      </div>

      {/* Contracts List */}
      {contracts.length === 0 ? (
        <div className="bg-[#16161e] border border-[#292e42] rounded-xl p-12 text-center">
          <FileSignature size={48} className="mx-auto mb-4 text-[#565f89]" />
          <h3 className="text-lg font-medium text-[#c0caf5] mb-2">Keine Verträge</h3>
          <p className="text-[#9aa5ce]">Erstellen Sie Ihren ersten Arbeitsvertrag.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-[#16161e] border border-[#292e42] rounded-xl p-5"
              data-testid={`contract-card-${contract.id}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#7aa2f7]/20 rounded-full flex items-center justify-center">
                    <User className="text-[#7aa2f7]" size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-[#c0caf5]">{contract.employee_name}</h3>
                      {getStatusBadge(contract.status)}
                    </div>
                    <p className="text-sm text-[#9aa5ce] mb-2">{contract.employee_email}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#565f89]">
                      <span className="flex items-center gap-1">
                        <Briefcase size={14} />
                        {contract.position}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Start: {contract.start_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Euro size={14} />
                        {contract.salary} €/Monat
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {contract.status === 'signed' && (
                    <button
                      onClick={() => handleDownload(contract)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#9ece6a] text-white rounded-lg hover:bg-[#9ece6a]/80 transition-colors"
                    >
                      <Download size={16} />
                      PDF
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Contract Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-[#16161e] border border-[#292e42] rounded-2xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#292e42] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#c0caf5]">Neuen Arbeitsvertrag erstellen</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-[#565f89] hover:text-[#c0caf5] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="p-6 space-y-4">
              {/* Employee Search */}
              <div className="space-y-2" ref={dropdownRef}>
                <Label className="text-[#9aa5ce]">Mitarbeiter suchen *</Label>
                <div className="relative">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#565f89]" />
                    <Input
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={() => setShowDropdown(true)}
                      className="bg-[#1a1b26] border-[#292e42] text-[#c0caf5] pl-10"
                      placeholder="Name des Mitarbeiters eingeben..."
                      data-testid="employee-search-input"
                    />
                  </div>
                  
                  {/* Dropdown with filtered results */}
                  {showDropdown && searchQuery && (
                    <div className="absolute z-50 w-full mt-1 bg-[#1a1b26] border border-[#292e42] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredEmployees.length === 0 ? (
                        <div className="p-3 text-center text-[#565f89]">
                          Keine Mitarbeiter gefunden
                        </div>
                      ) : (
                        filteredEmployees.map((emp) => (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => handleEmployeeSelect(emp)}
                            className={`w-full px-4 py-3 text-left hover:bg-[#292e42] transition-colors flex items-center gap-3 ${
                              selectedEmployee?.id === emp.id ? 'bg-[#7aa2f7]/20' : ''
                            }`}
                            data-testid={`employee-option-${emp.id}`}
                          >
                            <div className="w-8 h-8 bg-[#7aa2f7]/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <User size={16} className="text-[#7aa2f7]" />
                            </div>
                            <div>
                              <p className="text-[#c0caf5] font-medium">{emp.name}</p>
                              <p className="text-xs text-[#565f89]">{emp.email}</p>
                            </div>
                            {selectedEmployee?.id === emp.id && (
                              <CheckCircle size={16} className="ml-auto text-[#9ece6a]" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                
                {/* Show selected employee */}
                {selectedEmployee && (
                  <div className="mt-2 p-3 bg-[#7aa2f7]/10 border border-[#7aa2f7]/30 rounded-lg flex items-center gap-3">
                    <User size={18} className="text-[#7aa2f7]" />
                    <div className="flex-1">
                      <p className="text-[#c0caf5] font-medium">{selectedEmployee.name}</p>
                      <p className="text-xs text-[#9aa5ce]">{selectedEmployee.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEmployee(null);
                        setSearchQuery('');
                        setFormData({
                          ...formData,
                          employee_id: '',
                          employee_name: '',
                          employee_email: ''
                        });
                      }}
                      className="p-1 text-[#565f89] hover:text-[#f7768e] transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Position */}
              <div className="space-y-2">
                <Label className="text-[#9aa5ce]">Position *</Label>
                <Input
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="bg-[#1a1b26] border-[#292e42] text-[#c0caf5]"
                  placeholder="z.B. QA Tester"
                  required
                />
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label className="text-[#9aa5ce]">Startdatum *</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="bg-[#1a1b26] border-[#292e42] text-[#c0caf5]"
                  required
                />
              </div>

              {/* Salary */}
              <div className="space-y-2">
                <Label className="text-[#9aa5ce]">Monatliches Bruttogehalt (€) *</Label>
                <Input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="bg-[#1a1b26] border-[#292e42] text-[#c0caf5]"
                  placeholder="z.B. 3500"
                  required
                />
              </div>

              {/* Working Hours */}
              <div className="space-y-2">
                <Label className="text-[#9aa5ce]">Wöchentliche Arbeitszeit (Stunden)</Label>
                <Input
                  type="number"
                  value={formData.working_hours}
                  onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
                  className="bg-[#1a1b26] border-[#292e42] text-[#c0caf5]"
                  placeholder="40"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="border-[#292e42] text-[#9aa5ce]"
                >
                  Abbrechen
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="bg-[#7aa2f7] hover:bg-[#6b93e8]"
                >
                  {creating ? 'Wird erstellt...' : 'Vertrag erstellen'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContracts;
