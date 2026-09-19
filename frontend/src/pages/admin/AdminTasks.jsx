import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Plus, 
  Trash2, 
  Clock, 
  User, 
  Globe, 
  ListChecks,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
  Link,
  KeyRound,
  X,
  Save,
  Search,
  Users,
  Check,
  ChevronRight
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedTask, setExpandedTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    ai_app_name: '',
    website: '',
    einleitung: '',
    schritt1: '',
    schritt2: '',
    schritt3: '',
    priority: 'Normal',
    provision: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('bd');
  
  // Multi-assignment state
  const [assigningTask, setAssigningTask] = useState(null);
  const [assignmentStep, setAssignmentStep] = useState(1); // 1 = select employees, 2 = enter credentials
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [employeeCredentials, setEmployeeCredentials] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [tasksRes, employeesRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/admin/tasks`, { headers }),
        axios.get(`${BACKEND_URL}/api/admin/employees`, { headers })
      ]);
      
      setTasks(tasksRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Bitte geben Sie einen Titel ein');
      return;
    }

    if (!formData.category) {
      toast.error('Bitte wählen Sie eine Kategorie (BD oder App Test)');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(`${BACKEND_URL}/api/admin/tasks`, {
        ...formData,
        provision: parseFloat(formData.provision) || 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Aufgabe erfolgreich erstellt');
      setShowForm(false);
      setAiAppName('');
      setFormData({
        title: '',
        category: '',
        ai_app_name: '',
        website: '',
        einleitung: '',
        schritt1: '',
        schritt2: '',
        schritt3: '',
        priority: 'Normal',
        provision: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Fehler beim Erstellen der Aufgabe');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Möchten Sie diese Aufgabe wirklich löschen?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${BACKEND_URL}/api/admin/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Aufgabe gelöscht');
      fetchData();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  // Assign category to a legacy/uncategorized task
  const assignCategory = async (taskId, category) => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(
        `${BACKEND_URL}/api/admin/tasks/${taskId}/category`,
        { category },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(category === 'bd' ? 'Als BD-Aufgabe zugeordnet' : 'Als App-Test zugeordnet');
      fetchData();
    } catch (error) {
      console.error('Error setting category:', error);
      toast.error('Fehler beim Zuordnen der Kategorie');
    }
  };

  // Multi-assignment functions
  const openAssignModal = (task) => {
    setAssigningTask(task);
    setAssignmentStep(1);
    setSearchTerm('');
    // Pre-select currently assigned employees if any
    if (task.assignments && task.assignments.length > 0) {
      const currentIds = task.assignments.map(a => a.employee_id);
      setSelectedEmployees(currentIds);
      // Pre-fill credentials
      const creds = {};
      task.assignments.forEach(a => {
        creds[a.employee_id] = {
          test_ident_link: a.test_ident_link || '',
          test_login_email: a.test_login_email || '',
          test_login_password: a.test_login_password || '',
          test_phone_number: a.test_phone_number || ''
        };
      });
      setEmployeeCredentials(creds);
    } else if (task.assigned_to) {
      // Legacy single assignment
      setSelectedEmployees([task.assigned_to]);
      setEmployeeCredentials({
        [task.assigned_to]: {
          test_ident_link: task.test_ident_link || '',
          test_login_email: task.test_login_email || '',
          test_login_password: task.test_login_password || '',
          test_phone_number: task.test_phone_number || ''
        }
      });
    } else {
      setSelectedEmployees([]);
      setEmployeeCredentials({});
    }
  };

  const closeAssignModal = () => {
    setAssigningTask(null);
    setAssignmentStep(1);
    setSearchTerm('');
    setSelectedEmployees([]);
    setEmployeeCredentials({});
  };

  const toggleEmployeeSelection = (empId) => {
    setSelectedEmployees(prev => {
      if (prev.includes(empId)) {
        // Remove employee and their credentials
        const newCreds = { ...employeeCredentials };
        delete newCreds[empId];
        setEmployeeCredentials(newCreds);
        return prev.filter(id => id !== empId);
      } else {
        // Add employee with empty credentials
        setEmployeeCredentials(prev => ({
          ...prev,
          [empId]: { test_ident_link: '', test_login_email: '', test_login_password: '', test_phone_number: '' }
        }));
        return [...prev, empId];
      }
    });
  };

  const updateEmployeeCredentials = (empId, field, value) => {
    setEmployeeCredentials(prev => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        [field]: value
      }
    }));
  };

  const goToCredentialsStep = () => {
    if (selectedEmployees.length === 0) {
      toast.error('Bitte wählen Sie mindestens einen Mitarbeiter aus');
      return;
    }
    setAssignmentStep(2);
  };

  const saveMultiAssignment = async () => {
    if (selectedEmployees.length === 0) {
      toast.error('Bitte wählen Sie mindestens einen Mitarbeiter aus');
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      
      // Build assignments array
      const assignments = selectedEmployees.map(empId => ({
        employee_id: empId,
        test_ident_link: employeeCredentials[empId]?.test_ident_link || '',
        test_login_email: employeeCredentials[empId]?.test_login_email || '',
        test_login_password: employeeCredentials[empId]?.test_login_password || '',
        test_phone_number: employeeCredentials[empId]?.test_phone_number || ''
      }));

      await axios.put(
        `${BACKEND_URL}/api/admin/tasks/${assigningTask.id}/assign-multiple`,
        { assignments },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`Aufgabe an ${selectedEmployees.length} Mitarbeiter zugewiesen`);
      closeAssignModal();
      fetchData();
    } catch (error) {
      console.error('Error assigning task:', error);
      toast.error('Fehler beim Zuweisen der Aufgabe');
    }
  };

  // Filtered employees based on search
  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return employees;
    const term = searchTerm.toLowerCase();
    return employees.filter(emp => 
      emp.name?.toLowerCase().includes(term) ||
      emp.email?.toLowerCase().includes(term) ||
      emp.position?.toLowerCase().includes(term)
    );
  }, [employees, searchTerm]);

  // Get employee by ID helper
  const getEmployeeById = (empId) => {
    return employees.find(e => e.id === empId);
  };

  // Category-split task lists (admin panel only)
  const uncategorizedTasks = useMemo(
    () => tasks.filter(t => t.category !== 'bd' && t.category !== 'app'),
    [tasks]
  );
  const bdTasks = useMemo(() => tasks.filter(t => t.category === 'bd'), [tasks]);
  const appTasks = useMemo(() => tasks.filter(t => t.category === 'app'), [tasks]);
  const visibleTasks = activeTab === 'bd' ? bdTasks : appTasks;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Offen': return 'bg-orange-500/20 text-orange-400';
      case 'In Bearbeitung': return 'bg-blue-500/20 text-blue-400';
      case 'Abgeschlossen': return 'bg-sky-500/20 text-sky-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Hoch': return 'bg-red-500/20 text-red-400';
      case 'Normal': return 'bg-blue-500/20 text-blue-400';
      case 'Niedrig': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Get assignment display text
  const getAssignmentDisplay = (task) => {
    if (task.assignments && task.assignments.length > 0) {
      if (task.assignments.length === 1) {
        return task.assignments[0].employee_name;
      }
      return `${task.assignments.length} Mitarbeiter`;
    }
    return task.assigned_to_name || 'Nicht zugewiesen';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7aa2f7]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-tasks-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#c0caf5]">Aufgabenverwaltung</h1>
          <p className="text-[#9aa5ce] mt-1">{tasks.length} Aufgabe(n) insgesamt</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-[#292e42] text-[#c0caf5] rounded-lg hover:bg-[#343b58] transition-colors"
            data-testid="refresh-tasks-btn"
          >
            <RefreshCw size={18} />
            <span className="hidden sm:inline">Aktualisieren</span>
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#7aa2f7] text-white rounded-lg hover:bg-[#6b93e8] transition-colors"
            data-testid="create-task-btn"
          >
            <Plus size={18} />
            <span>Neue Aufgabe</span>
          </button>
        </div>
      </div>

      {/* Create Task Form */}
      {showForm && (
        <div className="bg-[#16161e] border border-[#292e42] rounded-xl p-6" data-testid="create-task-form">
          <h2 className="text-lg font-semibold text-[#c0caf5] mb-4">Neue Aufgabe erstellen</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[#9aa5ce] mb-1">
                  Titel *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 bg-[#1a1b26] border border-[#292e42] rounded-lg text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                  placeholder="Aufgabentitel eingeben"
                  data-testid="task-title-input"
                  required
                />
              </div>

              {/* Category (required) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#9aa5ce] mb-1">
                  Kategorie *
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, category: 'bd'})}
                    className={`flex-1 px-4 py-3 rounded-lg border text-left transition-colors ${
                      formData.category === 'bd'
                        ? 'bg-[#7aa2f7]/15 border-[#7aa2f7] text-[#c0caf5]'
                        : 'bg-[#1a1b26] border-[#292e42] text-[#9aa5ce] hover:border-[#565f89]'
                    }`}
                    data-testid="task-category-bd"
                  >
                    <span className="font-semibold block">BD</span>
                    <span className="text-xs text-[#565f89]">Finanz-Tests / KYC</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, category: 'app'})}
                    className={`flex-1 px-4 py-3 rounded-lg border text-left transition-colors ${
                      formData.category === 'app'
                        ? 'bg-[#9ece6a]/15 border-[#9ece6a] text-[#c0caf5]'
                        : 'bg-[#1a1b26] border-[#292e42] text-[#9aa5ce] hover:border-[#565f89]'
                    }`}
                    data-testid="task-category-app"
                  >
                    <span className="font-semibold block">App Test</span>
                    <span className="text-xs text-[#565f89]">Mobile-App-Tests</span>
                  </button>
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-[#9aa5ce] mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full px-4 py-2 bg-[#1a1b26] border border-[#292e42] rounded-lg text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                  placeholder="https://example.com"
                  data-testid="task-website-input"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-[#9aa5ce] mb-1">
                  Priorität
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-4 py-2 bg-[#1a1b26] border border-[#292e42] rounded-lg text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                  data-testid="task-priority-select"
                >
                  <option value="Niedrig">Niedrig</option>
                  <option value="Normal">Normal</option>
                  <option value="Hoch">Hoch</option>
                </select>
              </div>

              {/* Provision */}
              <div>
                <label className="block text-sm font-medium text-[#9aa5ce] mb-1">
                  Provision (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.provision}
                  onChange={(e) => setFormData({...formData, provision: e.target.value})}
                  className="w-full px-4 py-2 bg-[#1a1b26] border border-[#292e42] rounded-lg text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                  placeholder="z. B. 50"
                  data-testid="task-provision-input"
                />
              </div>
            </div>

            {/* Description Section */}
            <div className="border-t border-[#292e42] pt-4 mt-4">
              <h3 className="text-[#c0caf5] font-medium mb-3">Aufgabenbeschreibung</h3>
              
              <div className="space-y-4">
                {/* Einleitung */}
                <div>
                  <label className="block text-sm font-medium text-[#9aa5ce] mb-1">
                    Einleitung
                  </label>
                  <textarea
                    value={formData.einleitung}
                    onChange={(e) => setFormData({...formData, einleitung: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-2 bg-[#1a1b26] border border-[#292e42] rounded-lg text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7] resize-none"
                    placeholder="Allgemeine Einführung zur Aufgabe..."
                    data-testid="task-einleitung-input"
                  />
                </div>

                {/* Schritt 1 */}
                <div>
                  <label className="block text-sm font-medium text-[#9aa5ce] mb-1">
                    Schritt 1
                  </label>
                  <textarea
                    value={formData.schritt1}
                    onChange={(e) => setFormData({...formData, schritt1: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-2 bg-[#1a1b26] border border-[#292e42] rounded-lg text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7] resize-none"
                    placeholder="Erster Schritt der Aufgabe..."
                    data-testid="task-schritt1-input"
                  />
                </div>

                {/* Schritt 2 */}
                <div>
                  <label className="block text-sm font-medium text-[#9aa5ce] mb-1">
                    Schritt 2
                  </label>
                  <textarea
                    value={formData.schritt2}
                    onChange={(e) => setFormData({...formData, schritt2: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-2 bg-[#1a1b26] border border-[#292e42] rounded-lg text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7] resize-none"
                    placeholder="Zweiter Schritt der Aufgabe..."
                    data-testid="task-schritt2-input"
                  />
                </div>

                {/* Schritt 3 */}
                <div>
                  <label className="block text-sm font-medium text-[#9aa5ce] mb-1">
                    Schritt 3
                  </label>
                  <textarea
                    value={formData.schritt3}
                    onChange={(e) => setFormData({...formData, schritt3: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-2 bg-[#1a1b26] border border-[#292e42] rounded-lg text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7] resize-none"
                    placeholder="Dritter Schritt der Aufgabe..."
                    data-testid="task-schritt3-input"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-[#9aa5ce] hover:text-[#c0caf5] transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-[#7aa2f7] text-white rounded-lg hover:bg-[#6b93e8] transition-colors disabled:opacity-50"
                data-testid="submit-task-btn"
              >
                {submitting ? 'Wird erstellt...' : 'Aufgabe erstellen'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* No Employees Warning */}
      {employees.length === 0 && (
        <div className="bg-[#f7768e]/10 border border-[#f7768e]/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-[#f7768e] flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-medium text-[#f7768e]">Keine Mitarbeiter vorhanden</h3>
            <p className="text-sm text-[#9aa5ce] mt-1">
              Es sind noch keine Mitarbeiter im System registriert. Bitte erstellen Sie zuerst einen Test-Mitarbeiter.
            </p>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-[#292e42]" data-testid="task-category-tabs">
        <button
          onClick={() => setActiveTab('bd')}
          className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'bd'
              ? 'border-[#7aa2f7] text-[#c0caf5]'
              : 'border-transparent text-[#9aa5ce] hover:text-[#c0caf5]'
          }`}
          data-testid="tab-bd"
        >
          BD · Finanz / KYC
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-[#7aa2f7]/20 text-[#7aa2f7]">{bdTasks.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('app')}
          className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'app'
              ? 'border-[#9ece6a] text-[#c0caf5]'
              : 'border-transparent text-[#9aa5ce] hover:text-[#c0caf5]'
          }`}
          data-testid="tab-app"
        >
          App Tests
          <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-[#9ece6a]/20 text-[#9ece6a]">{appTasks.length}</span>
        </button>
      </div>

      {/* Uncategorized tasks - require manual assignment */}
      {uncategorizedTasks.length > 0 && (
        <div className="bg-[#e0af68]/10 border border-[#e0af68]/30 rounded-xl p-4" data-testid="uncategorized-tasks">
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="text-[#e0af68] flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-medium text-[#e0af68]">Noch nicht kategorisiert ({uncategorizedTasks.length})</h3>
              <p className="text-sm text-[#9aa5ce] mt-1">Bitte ordnen Sie diese Aufgaben einer Kategorie zu.</p>
            </div>
          </div>
          <div className="space-y-2">
            {uncategorizedTasks.map((task) => (
              <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#16161e] p-3 rounded-lg">
                <span className="text-[#c0caf5] font-medium">{task.title}</span>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => assignCategory(task.id, 'bd')}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#7aa2f7]/15 text-[#7aa2f7] hover:bg-[#7aa2f7]/25 transition-colors"
                    data-testid={`set-bd-${task.id}`}
                  >
                    → BD
                  </button>
                  <button
                    onClick={() => assignCategory(task.id, 'app')}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#9ece6a]/15 text-[#9ece6a] hover:bg-[#9ece6a]/25 transition-colors"
                    data-testid={`set-app-${task.id}`}
                  >
                    → App Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-4" data-testid="tasks-list">
        {visibleTasks.length === 0 ? (
          <div className="bg-[#16161e] border border-[#292e42] rounded-xl p-12 text-center">
            <ListChecks size={48} className="mx-auto mb-4 text-[#565f89]" />
            <h3 className="text-lg font-medium text-[#c0caf5] mb-2">Keine Aufgaben in dieser Kategorie</h3>
            <p className="text-[#9aa5ce]">Erstellen Sie eine Aufgabe mit dem Button oben.</p>
          </div>
        ) : (
          visibleTasks.map((task) => (
            <div
              key={task.id}
              className="bg-[#16161e] border border-[#292e42] rounded-xl overflow-hidden"
              data-testid={`task-card-${task.id}`}
            >
              {/* Task Header */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-base sm:text-lg font-semibold text-[#c0caf5]">{task.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    {task.category && (
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        task.category === 'bd'
                          ? 'bg-[#7aa2f7]/20 text-[#7aa2f7]'
                          : 'bg-[#9ece6a]/20 text-[#9ece6a]'
                      }`}>
                        {task.category === 'bd' ? 'BD' : 'App Test'}
                      </span>
                    )}
                    {task.provision > 0 && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-[#e0af68]/20 text-[#e0af68]">
                        {Number(task.provision).toFixed(2)} €
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-[#9aa5ce]">
                    <div className={`flex items-center gap-1 ${!task.assigned_to && (!task.assignments || task.assignments.length === 0) ? 'text-[#e0af68]' : ''}`}>
                      {task.assignments && task.assignments.length > 1 ? (
                        <Users size={14} />
                      ) : (
                        <User size={14} />
                      )}
                      <span>{getAssignmentDisplay(task)}</span>
                    </div>
                    {task.website && (
                      <a 
                        href={task.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#7aa2f7] hover:underline"
                      >
                        <Globe size={14} />
                        <span>Website</span>
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => openAssignModal(task)}
                    className={`p-2 rounded-lg transition-colors ${
                      task.assigned_to || (task.assignments && task.assignments.length > 0)
                        ? 'text-[#9ece6a] hover:bg-[#9ece6a]/10' 
                        : 'text-[#e0af68] hover:bg-[#e0af68]/10'
                    }`}
                    title={task.assigned_to ? "Zuweisung bearbeiten" : "Aufgabe zuweisen"}
                    data-testid={`assign-task-${task.id}`}
                  >
                    <Users size={18} />
                  </button>
                  <button
                    onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                    className="p-2 text-[#9aa5ce] hover:text-[#c0caf5] hover:bg-[#292e42] rounded-lg transition-colors"
                    data-testid={`expand-task-${task.id}`}
                  >
                    {expandedTask === task.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 text-[#f7768e] hover:bg-[#f7768e]/10 rounded-lg transition-colors"
                    data-testid={`delete-task-${task.id}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedTask === task.id && (
                <div className="border-t border-[#292e42] p-4 bg-[#1a1b26]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {task.einleitung && (
                      <div className="md:col-span-2">
                        <h4 className="text-sm font-medium text-[#bb9af7] mb-1">Einleitung</h4>
                        <p className="text-[#c0caf5] text-sm bg-[#16161e] p-3 rounded-lg">{task.einleitung}</p>
                      </div>
                    )}
                    {task.schritt1 && (
                      <div>
                        <h4 className="text-sm font-medium text-[#7aa2f7] mb-1">Schritt 1</h4>
                        <p className="text-[#c0caf5] text-sm bg-[#16161e] p-3 rounded-lg">{task.schritt1}</p>
                      </div>
                    )}
                    {task.schritt2 && (
                      <div>
                        <h4 className="text-sm font-medium text-[#7dcfff] mb-1">Schritt 2</h4>
                        <p className="text-[#c0caf5] text-sm bg-[#16161e] p-3 rounded-lg">{task.schritt2}</p>
                      </div>
                    )}
                    {task.schritt3 && (
                      <div className="md:col-span-2">
                        <h4 className="text-sm font-medium text-[#9ece6a] mb-1">Schritt 3</h4>
                        <p className="text-[#c0caf5] text-sm bg-[#16161e] p-3 rounded-lg">{task.schritt3}</p>
                      </div>
                    )}
                    
                    {/* Multi-Assignment Display */}
                    {task.assignments && task.assignments.length > 0 && (
                      <div className="md:col-span-2 border-t border-[#292e42] pt-4 mt-2">
                        <h4 className="text-sm font-medium text-[#e0af68] mb-3 flex items-center gap-2">
                          <Users size={14} />
                          Zugewiesene Mitarbeiter ({task.assignments.length})
                        </h4>
                        <div className="space-y-3">
                          {task.assignments.map((assignment, idx) => (
                            <div key={idx} className="bg-[#16161e] p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[#c0caf5] font-medium">{assignment.employee_name}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(assignment.status)}`}>
                                  {assignment.status}
                                </span>
                              </div>
                              {(assignment.test_ident_link || assignment.test_login_email) && (
                                <div className="mt-2 pt-2 border-t border-[#292e42]">
                                  <div className="text-xs text-[#565f89] mb-1 flex items-center gap-1">
                                    <KeyRound size={10} />
                                    Test-Zugangsdaten
                                  </div>
                                  {assignment.test_ident_link && (
                                    <a 
                                      href={assignment.test_ident_link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-[#7aa2f7] hover:underline text-xs flex items-center gap-1"
                                    >
                                      <Link size={10} />
                                      {assignment.test_ident_link.length > 50 
                                        ? assignment.test_ident_link.substring(0, 50) + '...' 
                                        : assignment.test_ident_link}
                                    </a>
                                  )}
                                  {assignment.test_login_email && (
                                    <div className="text-[#9aa5ce] text-xs mt-1">
                                      E-Mail: {assignment.test_login_email}
                                      {assignment.test_login_password && ` | Passwort: ${assignment.test_login_password}`}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Legacy Test Credentials Display (for tasks without assignments array) */}
                    {(!task.assignments || task.assignments.length === 0) && (task.test_ident_link || task.test_login_email) && (
                      <div className="md:col-span-2 border-t border-[#292e42] pt-4 mt-2">
                        <h4 className="text-sm font-medium text-[#e0af68] mb-3 flex items-center gap-2">
                          <KeyRound size={14} />
                          Test-Zugangsdaten
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {task.test_ident_link && (
                            <div className="bg-[#16161e] p-3 rounded-lg">
                              <div className="text-xs text-[#565f89] mb-1">Test Ident Link</div>
                              <a 
                                href={task.test_ident_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[#7aa2f7] hover:underline text-sm flex items-center gap-1"
                              >
                                <Link size={12} />
                                {task.test_ident_link.length > 40 
                                  ? task.test_ident_link.substring(0, 40) + '...' 
                                  : task.test_ident_link}
                              </a>
                            </div>
                          )}
                          {task.test_login_email && (
                            <div className="bg-[#16161e] p-3 rounded-lg">
                              <div className="text-xs text-[#565f89] mb-1">Test Login Daten</div>
                              <div className="text-[#c0caf5] text-sm">
                                <span className="text-[#9aa5ce]">E-Mail:</span> {task.test_login_email}
                              </div>
                              {task.test_login_password && (
                                <div className="text-[#c0caf5] text-sm">
                                  <span className="text-[#9aa5ce]">Passwort:</span> {task.test_login_password}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {!task.einleitung && !task.schritt1 && !task.schritt2 && !task.schritt3 && (
                      <p className="text-[#565f89] italic">Keine Beschreibung vorhanden</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Multi-Assignment Modal */}
      {assigningTask && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1b26] border border-[#292e42] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#292e42] flex-shrink-0">
              <div className="flex items-center gap-3">
                <Users className="text-[#7aa2f7]" size={24} />
                <div>
                  <h3 className="text-xl font-bold text-[#c0caf5]">Aufgabe zuweisen</h3>
                  <p className="text-sm text-[#565f89]">
                    {assignmentStep === 1 ? 'Schritt 1: Mitarbeiter auswählen' : 'Schritt 2: Test-Zugangsdaten eingeben'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeAssignModal}
                className="p-2 text-[#565f89] hover:text-[#c0caf5] hover:bg-[#292e42] rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Task Info */}
            <div className="px-6 pt-4 flex-shrink-0">
              <div className="bg-[#16161e] p-4 rounded-lg">
                <p className="text-[#565f89] text-sm mb-1">Aufgabe:</p>
                <p className="text-[#c0caf5] font-medium">{assigningTask.title}</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {assignmentStep === 1 ? (
                /* Step 1: Employee Selection */
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#565f89]" size={18} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Mitarbeiter suchen..."
                      className="w-full pl-10 pr-4 py-3 bg-[#16161e] border border-[#292e42] rounded-lg text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                      data-testid="employee-search-input"
                    />
                  </div>

                  {/* Selected count */}
                  {selectedEmployees.length > 0 && (
                    <div className="flex items-center gap-2 text-[#9ece6a]">
                      <Check size={16} />
                      <span className="text-sm">{selectedEmployees.length} Mitarbeiter ausgewählt</span>
                    </div>
                  )}

                  {/* Employee List */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {filteredEmployees.length === 0 ? (
                      <p className="text-center text-[#565f89] py-8">
                        {searchTerm ? 'Keine Mitarbeiter gefunden' : 'Keine Mitarbeiter vorhanden'}
                      </p>
                    ) : (
                      filteredEmployees.map((emp) => {
                        const isSelected = selectedEmployees.includes(emp.id);
                        return (
                          <div
                            key={emp.id}
                            onClick={() => toggleEmployeeSelection(emp.id)}
                            className={`p-4 rounded-lg cursor-pointer transition-all border ${
                              isSelected 
                                ? 'bg-[#7aa2f7]/10 border-[#7aa2f7]' 
                                : 'bg-[#16161e] border-[#292e42] hover:border-[#565f89]'
                            }`}
                            data-testid={`employee-option-${emp.id}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                                  isSelected 
                                    ? 'bg-[#7aa2f7] border-[#7aa2f7]' 
                                    : 'border-[#565f89]'
                                }`}>
                                  {isSelected && <Check size={14} className="text-white" />}
                                </div>
                                <div>
                                  <p className="text-[#c0caf5] font-medium">{emp.name}</p>
                                  <p className="text-[#565f89] text-sm">{emp.email}</p>
                                </div>
                              </div>
                              <span className="text-[#9aa5ce] text-sm">{emp.position}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                /* Step 2: Credentials Entry */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <KeyRound size={18} className="text-[#e0af68]" />
                    <h4 className="text-[#c0caf5] font-medium">Test-Zugangsdaten pro Mitarbeiter (Optional)</h4>
                  </div>
                  <p className="text-[#565f89] text-sm mb-4">
                    Diese Daten sind nur für den jeweiligen Mitarbeiter sichtbar.
                  </p>

                  <div className="space-y-6 max-h-[400px] overflow-y-auto">
                    {selectedEmployees.map((empId) => {
                      const emp = getEmployeeById(empId);
                      if (!emp) return null;
                      const creds = employeeCredentials[empId] || {};
                      
                      return (
                        <div key={empId} className="bg-[#16161e] p-4 rounded-lg border border-[#292e42]">
                          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#292e42]">
                            <User size={16} className="text-[#7aa2f7]" />
                            <span className="text-[#c0caf5] font-medium">{emp.name}</span>
                            <span className="text-[#565f89] text-sm">({emp.position})</span>
                          </div>

                          {/* Test Ident Link */}
                          <div className="mb-3">
                            <label className="block text-xs font-medium text-[#9aa5ce] mb-1">
                              Test Ident Link
                            </label>
                            <input
                              type="url"
                              value={creds.test_ident_link || ''}
                              onChange={(e) => updateEmployeeCredentials(empId, 'test_ident_link', e.target.value)}
                              className="w-full px-3 py-2 bg-[#1a1b26] border border-[#292e42] rounded-lg text-[#c0caf5] text-sm focus:outline-none focus:border-[#7aa2f7]"
                              placeholder="https://example.com/test-ident/..."
                            />
                          </div>

                          <p className="text-xs text-[#565f89] mb-2">Oder Login-Daten:</p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-[#9aa5ce] mb-1">
                                Test E-Mail
                              </label>
                              <input
                                type="email"
                                value={creds.test_login_email || ''}
                                onChange={(e) => updateEmployeeCredentials(empId, 'test_login_email', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1a1b26] border border-[#292e42] rounded-lg text-[#c0caf5] text-sm focus:outline-none focus:border-[#7aa2f7]"
                                placeholder="test@example.com"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-[#9aa5ce] mb-1">
                                Test Passwort
                              </label>
                              <input
                                type="text"
                                value={creds.test_login_password || ''}
                                onChange={(e) => updateEmployeeCredentials(empId, 'test_login_password', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1a1b26] border border-[#292e42] rounded-lg text-[#c0caf5] text-sm focus:outline-none focus:border-[#7aa2f7]"
                                placeholder="Passwort"
                              />
                            </div>
                          </div>

                          {/* Test Phone Number */}
                          <div className="mt-3">
                            <label className="block text-xs font-medium text-[#9aa5ce] mb-1">
                              Test Handynummer
                            </label>
                            <input
                              type="tel"
                              value={creds.test_phone_number || ''}
                              onChange={(e) => updateEmployeeCredentials(empId, 'test_phone_number', e.target.value)}
                              className="w-full px-3 py-2 bg-[#1a1b26] border border-[#292e42] rounded-lg text-[#c0caf5] text-sm focus:outline-none focus:border-[#7aa2f7]"
                              placeholder="+49 123 456789"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-3 p-6 border-t border-[#292e42] flex-shrink-0">
              {assignmentStep === 1 ? (
                <>
                  <button
                    onClick={closeAssignModal}
                    className="px-6 py-2 text-[#9aa5ce] hover:text-[#c0caf5] font-medium transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={goToCredentialsStep}
                    disabled={selectedEmployees.length === 0}
                    className="flex items-center gap-2 px-6 py-2 bg-[#7aa2f7] text-white font-semibold rounded-lg hover:bg-[#7aa2f7]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="next-step-btn"
                  >
                    <span>Weiter</span>
                    <ChevronRight size={18} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setAssignmentStep(1)}
                    className="px-6 py-2 text-[#9aa5ce] hover:text-[#c0caf5] font-medium transition-colors"
                  >
                    Zurück
                  </button>
                  <button
                    onClick={saveMultiAssignment}
                    className="flex items-center gap-2 px-6 py-2 bg-[#9ece6a] text-[#1a1b26] font-semibold rounded-lg hover:bg-[#9ece6a]/80 transition-colors"
                    data-testid="save-assignment-btn"
                  >
                    <Save size={18} />
                    <span>Zuweisen ({selectedEmployees.length})</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTasks;
