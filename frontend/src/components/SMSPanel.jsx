import React, { useState, useEffect, useCallback } from 'react';
import { Phone, MessageSquare, RefreshCw, Copy, Check, AlertCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SMSPanel = ({ isActive = false }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messages, setMessages] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchSMS = useCallback(async (showRefreshing = true) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const token = localStorage.getItem('employee_token');
      const response = await axios.get(`${BACKEND_URL}/api/anosim/my-sms?limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setHasNumber(true);
      setPhoneNumber(response.data.phone_number);
      setMessages(response.data.messages || []);
    } catch (error) {
      if (error.response?.status === 404) {
        // No number assigned
        setHasNumber(false);
        setPhoneNumber('');
        setMessages([]);
      } else {
        console.error('Error fetching SMS:', error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Check if employee has a number
  useEffect(() => {
    const checkNumber = async () => {
      try {
        const token = localStorage.getItem('employee_token');
        const response = await axios.get(`${BACKEND_URL}/api/anosim/my-number`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.has_number) {
          setHasNumber(true);
          setPhoneNumber(response.data.anosim_number);
          // Only fetch SMS if active
          if (isActive) {
            await fetchSMS(false);
          }
        } else {
          setHasNumber(false);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking number:', error);
        setLoading(false);
      }
    };
    
    checkNumber();
  }, [isActive, fetchSMS]);

  // Auto-refresh when active
  useEffect(() => {
    let interval;
    if (isActive && hasNumber && autoRefresh) {
      interval = setInterval(() => fetchSMS(false), 10000); // Every 10 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, hasNumber, autoRefresh, fetchSMS]);

  const copyToClipboard = async (text, codeId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(codeId);
      toast.success('Code kopiert!');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      toast.error('Fehler beim Kopieren');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-sky-50 to-sky-50 border border-sky-200 rounded-xl p-6">
        <div className="flex items-center justify-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
        </div>
      </div>
    );
  }

  if (!hasNumber) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Phone size={20} className="text-gray-400" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-700">SMS Verifizierung</h4>
            <p className="text-sm text-gray-500">Keine Nummer zugewiesen</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 bg-gray-100 p-3 rounded-lg">
          Ihnen wurde noch keine Testnummer zugewiesen. Bitte wenden Sie sich an Ihren Administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-sky-50 to-sky-50 border border-sky-200 rounded-xl p-6" data-testid="sms-panel">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
            <Phone size={20} className="text-sky-600" />
          </div>
          <div>
            <h4 className="font-semibold text-sky-800">SMS Verifizierung</h4>
            <p className="text-sm text-sky-600 font-mono">{phoneNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 text-xs rounded-lg flex items-center gap-1 transition-colors ${
              autoRefresh 
                ? 'bg-sky-500 text-white' 
                : 'bg-white text-sky-600 border border-sky-300 hover:bg-sky-50'
            }`}
            title={autoRefresh ? "Auto-Refresh aktiv" : "Auto-Refresh aktivieren"}
          >
            <Clock size={12} />
            <span>Auto</span>
          </button>
          <button
            onClick={() => fetchSMS()}
            disabled={refreshing}
            className="p-2 bg-white text-sky-600 rounded-lg border border-sky-300 hover:bg-sky-50 transition-colors disabled:opacity-50"
            data-testid="refresh-sms-btn"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Messages */}
      {messages.length === 0 ? (
        <div className="text-center py-8 bg-white/50 rounded-lg">
          <MessageSquare size={32} className="mx-auto mb-2 text-sky-300" />
          <p className="text-sm text-sky-600">Keine SMS vorhanden</p>
          <p className="text-xs text-sky-500 mt-1">Warten auf eingehende Codes...</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {messages.map((msg, idx) => {
            // Support Anosim API field names
            const sender = msg.messageSender || msg.from || msg.sender || 'Unbekannt';
            const time = msg.messageDate || msg.received_at || msg.timestamp || msg.date;
            const code = msg.extracted_code;
            
            // Clean up sender name for display
            const displaySender = sender.replace(/^\+\d+$/, 'SMS').replace(/^\+/, '');
            
            return (
              <div 
                key={idx} 
                className="bg-white p-4 rounded-lg border border-sky-100 shadow-sm"
                data-testid={`sms-message-${idx}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    {code ? (
                      <p className="text-base text-gray-800">
                        Ihr <span className="font-semibold text-sky-700">{displaySender}</span> Test Code ist - <span className="font-bold font-mono text-sky-600">{code}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">SMS von {displaySender}</p>
                    )}
                    {time && (
                      <p className="text-xs text-gray-400 mt-1">{formatTime(time)}</p>
                    )}
                  </div>
                  
                  {/* Copy Code Button */}
                  {code && (
                    <button
                      onClick={() => copyToClipboard(code, idx)}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg font-mono font-bold text-lg transition-all ${
                        copiedCode === idx
                          ? 'bg-sky-500 text-white'
                          : 'bg-sky-100 text-sky-700 hover:bg-sky-200'
                      }`}
                      data-testid={`copy-code-${idx}`}
                      title="Code kopieren"
                    >
                      {copiedCode === idx ? (
                        <span className="flex items-center gap-1">
                          <Check size={16} />
                          Kopiert
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Copy size={14} />
                          Kopieren
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info */}
      <div className="mt-4 pt-3 border-t border-sky-200">
        <p className="text-xs text-sky-600 flex items-center gap-1">
          <AlertCircle size={12} />
          SMS werden automatisch erkannt und Codes extrahiert
        </p>
      </div>
    </div>
  );
};

export default SMSPanel;
