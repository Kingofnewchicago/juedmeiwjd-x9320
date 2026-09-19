import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, RefreshCw, Globe, ChevronDown, ChevronUp, Play, Check } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MitarbeiterAuftrage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedTask, setExpandedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('employee_token');
      const response = await axios.get(`${BACKEND_URL}/api/employee/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Fehler beim Laden der Aufträge');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('employee_token');
      await axios.patch(
        `${BACKEND_URL}/api/employee/tasks/${taskId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Status aktualisiert');
      fetchTasks();
    } catch (error) {
      toast.error('Fehler beim Aktualisieren');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'open') return task.status === 'Offen';
    if (filter === 'in_progress') return task.status === 'In Bearbeitung';
    if (filter === 'completed') return task.status === 'Abgeschlossen';
    return true;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Hoch': return 'bg-red-100 text-red-700 border-red-200';
      case 'Normal': return 'bg-sage-100 text-sage-700 border-sage-200';
      case 'Niedrig': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Offen': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'In Bearbeitung': return 'bg-sage-100 text-sage-700 border-sage-200';
      case 'Abgeschlossen': return 'bg-sage-100 text-sage-700 border-sage-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="employee-tasks-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Meine Aufträge</h1>
          <p className="text-gray-600 mt-1">
            {tasks.length} Aufgabe(n) insgesamt
            <span className="ml-2 font-semibold text-emerald-600" data-testid="auftrage-total-provision">
              · Provision gesamt: {tasks.reduce((s, t) => s + (Number(t.provision) || 0), 0).toFixed(2)} €
            </span>
          </p>
        </div>
        <button
          onClick={fetchTasks}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors"
          data-testid="refresh-btn"
        >
          <RefreshCw size={18} />
          <span>Aktualisieren</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {[
          { key: 'all', label: 'Alle', count: tasks.length },
          { key: 'open', label: 'Offen', count: tasks.filter(t => t.status === 'Offen').length },
          { key: 'in_progress', label: 'In Bearbeitung', count: tasks.filter(t => t.status === 'In Bearbeitung').length },
          { key: 'completed', label: 'Abgeschlossen', count: tasks.filter(t => t.status === 'Abgeschlossen').length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === tab.key
                ? 'bg-sage-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            data-testid={`filter-${tab.key}`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-4" data-testid="tasks-list">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Clock size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Aufträge</h3>
            <p className="text-gray-500">Keine Aufträge in dieser Kategorie vorhanden.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              data-testid={`task-card-${task.id}`}
            >
              {/* Task Header */}
              <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      {task.provision > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold border bg-emerald-100 text-emerald-700 border-emerald-200" data-testid={`task-provision-${task.id}`}>
                          Provision: {Number(task.provision).toFixed(2)} €
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      {task.website && (
                        <a 
                          href={task.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sage-600 hover:text-sage-700 hover:underline"
                        >
                          <Globe size={14} />
                          <span>Website öffnen</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Action Buttons */}
                    {task.status === 'Offen' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'In Bearbeitung')}
                        className="flex items-center gap-2 px-4 py-2 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors text-sm"
                        data-testid={`start-task-${task.id}`}
                      >
                        <Play size={16} />
                        <span>Starten</span>
                      </button>
                    )}
                    {task.status === 'In Bearbeitung' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'Abgeschlossen')}
                        className="flex items-center gap-2 px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors text-sm"
                        data-testid={`complete-task-${task.id}`}
                      >
                        <Check size={16} />
                        <span>Abschließen</span>
                      </button>
                    )}
                    {task.status === 'Abgeschlossen' && (
                      <div className="flex items-center gap-1 text-sage-600">
                        <CheckCircle size={20} />
                        <span className="text-sm font-medium">Erledigt</span>
                      </div>
                    )}
                    
                    <button
                      onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      data-testid={`expand-task-${task.id}`}
                    >
                      {expandedTask === task.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details - 4-Part Description */}
              {expandedTask === task.id && (
                <div className="border-t border-gray-100 bg-gray-50 p-5">
                  <h4 className="font-medium text-gray-900 mb-4">Aufgabenbeschreibung</h4>
                  
                  <div className="space-y-4">
                    {/* Einleitung */}
                    {task.einleitung && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center text-sm font-bold">
                            E
                          </div>
                          <h5 className="font-medium text-sage-700">Einleitung</h5>
                        </div>
                        <p className="text-gray-700 pl-10">{task.einleitung}</p>
                      </div>
                    )}

                    {/* Schritt 1 */}
                    {task.schritt1 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center text-sm font-bold">
                            1
                          </div>
                          <h5 className="font-medium text-sage-700">Schritt 1</h5>
                        </div>
                        <p className="text-gray-700 pl-10">{task.schritt1}</p>
                      </div>
                    )}

                    {/* Schritt 2 */}
                    {task.schritt2 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center text-sm font-bold">
                            2
                          </div>
                          <h5 className="font-medium text-cyan-700">Schritt 2</h5>
                        </div>
                        <p className="text-gray-700 pl-10">{task.schritt2}</p>
                      </div>
                    )}

                    {/* Schritt 3 */}
                    {task.schritt3 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center text-sm font-bold">
                            3
                          </div>
                          <h5 className="font-medium text-sage-700">Schritt 3</h5>
                        </div>
                        <p className="text-gray-700 pl-10">{task.schritt3}</p>
                      </div>
                    )}

                    {/* No Description */}
                    {!task.einleitung && !task.schritt1 && !task.schritt2 && !task.schritt3 && (
                      <div className="text-center py-4">
                        <AlertCircle size={24} className="mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-500 italic">Keine detaillierte Beschreibung vorhanden.</p>
                      </div>
                    )}

                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MitarbeiterAuftrage;
