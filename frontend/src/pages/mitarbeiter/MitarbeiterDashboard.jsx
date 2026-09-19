import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, TrendingUp, Wallet } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MitarbeiterDashboard = () => {
  const [stats, setStats] = useState({
    total_tasks: 0,
    open_tasks: 0,
    in_progress: 0,
    completed: 0,
    total_provision: 0,
  });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const employeeData = JSON.parse(localStorage.getItem('employee_data') || '{}');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('employee_token');
      
      // Fetch stats and tasks in parallel
      const [statsRes, tasksRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/employee/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${BACKEND_URL}/api/employee/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setStats(statsRes.data);
      setTasks(tasksRes.data.slice(0, 5)); // Show only 5 latest tasks
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Offene Aufgaben',
      value: stats.open_tasks,
      icon: AlertCircle,
      color: 'emerald',
      bgColor: 'bg-sage-100',
      textColor: 'text-sage-600',
    },
    {
      title: 'In Bearbeitung',
      value: stats.in_progress,
      icon: Clock,
      color: 'blue',
      bgColor: 'bg-sage-100',
      textColor: 'text-sage-600',
    },
    {
      title: 'Abgeschlossen',
      value: stats.completed,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-sage-100',
      textColor: 'text-sage-600',
    },
    {
      title: 'Gesamt',
      value: stats.total_tasks,
      icon: TrendingUp,
      color: 'purple',
      bgColor: 'bg-sage-100',
      textColor: 'text-sage-600',
    },
    {
      title: 'Provision gesamt',
      value: `${Number(stats.total_provision || 0).toFixed(2)} €`,
      icon: Wallet,
      color: 'emerald',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-sage-500 to-sage-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Willkommen zurück, {employeeData.name}!
        </h1>
        <p className="text-sage-100">
          {employeeData.position} • {employeeData.department}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className={stat.textColor} size={24} />
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Aktuelle Aufgaben</h2>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Clock size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Keine Aufgaben zugewiesen</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded-full ${
                        task.status === 'Offen' ? 'bg-sage-100 text-sage-600' :
                        task.status === 'In Bearbeitung' ? 'bg-sage-100 text-sage-600' :
                        'bg-sage-100 text-sage-600'
                      }`}>
                        {task.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full ${
                        task.priority === 'Hoch' ? 'bg-red-100 text-red-600' :
                        task.priority === 'Normal' ? 'bg-gray-100 text-gray-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {task.priority}
                      </span>
                      {task.provision > 0 && (
                        <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                          {Number(task.provision).toFixed(2)} €
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tasks.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <a
              href="/mitarbeiter/auftrage"
              className="text-sage-600 hover:text-sage-700 font-medium text-sm"
            >
              Alle Aufträge ansehen →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default MitarbeiterDashboard;
