import React, { useState, useEffect, useCallback } from 'react';
import { Mail, RefreshCw, Copy, CheckCircle, Clock, AlertCircle, User } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const EmailPanel = () => {
  const [emails, setEmails] = useState([]);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const token = localStorage.getItem('employee_token');

  const fetchEmails = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    
    try {
      const res = await axios.get(`${BACKEND_URL}/api/email-inbox/my-codes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEmails(res.data.codes || []);
      setEmail(res.data.email || '');
      setMessage(res.data.message || '');
    } catch (error) {
      console.error('Error fetching emails:', error);
      setMessage('Fehler beim Laden der E-Mails');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEmails();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchEmails(), 30000);
    return () => clearInterval(interval);
  }, [fetchEmails]);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Code kopiert!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  const formatSender = (sender) => {
    // Extract email or name from sender string
    const match = sender.match(/<(.+)>/) || sender.match(/^([^\s<]+@[^\s>]+)$/);
    if (match) return match[1];
    return sender.split('<')[0].trim() || sender;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#659A65] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Mail className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-white font-semibold">E-Mail Codes</h3>
              {email && (
                <p className="text-white/70 text-sm font-mono">{email}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => fetchEmails(true)}
            disabled={refreshing}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <RefreshCw 
              className={`text-white ${refreshing ? 'animate-spin' : ''}`} 
              size={18} 
            />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {emails.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Mail className="text-slate-400" size={24} />
            </div>
            <p className="text-slate-500 text-sm">{message || 'Keine Verifizierungs-E-Mails gefunden'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {emails.map((emailItem, idx) => (
              <div 
                key={idx}
                className="bg-slate-50 rounded-lg p-4 border border-slate-100"
              >
                {/* Sender & Time */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User className="text-slate-400" size={14} />
                    <span className="text-sm text-slate-600 truncate max-w-[200px]">
                      {formatSender(emailItem.sender)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock size={12} />
                    <span className="text-xs">{formatTime(emailItem.received_at)}</span>
                  </div>
                </div>

                {/* Subject */}
                <p className="text-sm text-slate-700 mb-3 line-clamp-2">
                  {emailItem.subject}
                </p>

                {/* Codes */}
                <div className="flex flex-wrap gap-2">
                  {emailItem.codes.map((code, codeIdx) => (
                    <button
                      key={codeIdx}
                      onClick={() => copyCode(code)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold transition-all ${
                        copiedCode === code
                          ? 'bg-[#659A65] text-white'
                          : 'bg-[#7C3AED]/10 text-[#7C3AED] hover:bg-[#7C3AED]/20'
                      }`}
                    >
                      {copiedCode === code ? (
                        <>
                          <CheckCircle size={16} />
                          Kopiert!
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          {code}
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-start gap-2 text-xs text-slate-400">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <p>E-Mails werden automatisch alle 30 Sekunden aktualisiert. Nur Verifizierungs-E-Mails werden angezeigt.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailPanel;
