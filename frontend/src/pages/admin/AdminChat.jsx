import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Send, Search, ArrowLeft, Image, X } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AVATAR_COLORS = [
  'bg-sky-500', 'bg-blue-500', 'bg-purple-500', 'bg-rose-500',
  'bg-amber-500', 'bg-sky-500', 'bg-indigo-500', 'bg-pink-500',
];

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const getColor = (name) => {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const Avatar = ({ name, size = 'w-10 h-10 text-sm' }) => (
  <div className={`${size} ${getColor(name)} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
    {getInitials(name)}
  </div>
);

const AdminChat = () => {
  const [employees, setEmployees] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollRef = useRef(null);

  const token = localStorage.getItem('admin_token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchEmployees = useCallback(async () => {
    try {
      const [empRes, convoRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/admin/employees`, { headers }),
        axios.get(`${BACKEND_URL}/api/chat/conversations`, { headers })
      ]);
      setEmployees(empRes.data || []);
      setConversations(convoRes.data.conversations || []);
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const fetchMessages = useCallback(async (partnerId) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/chat/messages/${partnerId}`, { headers });
      setMessages(res.data.messages || []);
    } catch (e) {
      console.error('Error:', e);
    }
  }, []);

  useEffect(() => {
    if (selectedPartner) {
      fetchMessages(selectedPartner.id);
      pollRef.current = setInterval(() => fetchMessages(selectedPartner.id), 5000);
      return () => clearInterval(pollRef.current);
    }
  }, [selectedPartner, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if ((!newMessage.trim() && !imageFile) || !selectedPartner) return;
    setSending(true);
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('recipient_id', selectedPartner.id);
        await axios.post(`${BACKEND_URL}/api/chat/send-image`, formData, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' }
        });
        setImageFile(null);
        setImagePreview(null);
      }
      if (newMessage.trim()) {
        await axios.post(`${BACKEND_URL}/api/chat/send`, {
          recipient_id: selectedPartner.id,
          message: newMessage.trim()
        }, { headers });
      }
      setNewMessage('');
      fetchMessages(selectedPartner.id);
      fetchEmployees();
    } catch (e) {
      console.error('Error sending:', e);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const openChat = (emp) => {
    setSelectedPartner(emp);
    setMessages([]);
    setImageFile(null);
    setImagePreview(null);
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Heute';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Gestern';
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  };

  const getConvoForEmployee = (empId) => conversations.find(c => c.partner?.id === empId);

  const filteredEmployees = employees.filter(e =>
    e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const ca = getConvoForEmployee(a.id);
    const cb = getConvoForEmployee(b.id);
    if (ca && !cb) return -1;
    if (!ca && cb) return 1;
    if (ca && cb) return new Date(cb.last_time) - new Date(ca.last_time);
    return 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7aa2f7]"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-2xl overflow-hidden border border-[#292e42]" data-testid="admin-chat-page">
      {/* Contact List */}
      <div className={`${selectedPartner ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex-shrink-0`}>
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
            <MessageCircle size={20} className="text-sky-500" />
            Nachrichten
          </h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Mitarbeiter suchen..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-sky-500"
              data-testid="chat-search-input"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sortedEmployees.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Keine Mitarbeiter gefunden</div>
          ) : (
            sortedEmployees.map((emp) => {
              const convo = getConvoForEmployee(emp.id);
              return (
                <div
                  key={emp.id}
                  onClick={() => openChat(emp)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 transition-colors ${
                    selectedPartner?.id === emp.id ? 'bg-sky-50' : 'hover:bg-gray-50'
                  }`}
                  data-testid={`chat-contact-${emp.id}`}
                >
                  <Avatar name={emp.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 text-sm truncate">{emp.name}</p>
                      {convo && <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatDate(convo.last_time)}</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 truncate">
                        {convo ? `${convo.last_sender_role === 'admin' ? 'Du: ' : ''}${convo.last_message || 'Bild'}` : emp.position || emp.email}
                      </p>
                      {convo?.unread > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 bg-sky-500 text-white text-xs rounded-full min-w-[20px] text-center flex-shrink-0">{convo.unread}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${selectedPartner ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-white`}>
        {selectedPartner ? (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
              <button onClick={() => { setSelectedPartner(null); fetchEmployees(); }} className="md:hidden p-1 text-gray-500 hover:text-gray-900">
                <ArrowLeft size={20} />
              </button>
              <Avatar name={selectedPartner.name} />
              <div>
                <p className="font-semibold text-gray-900">{selectedPartner.name}</p>
                <p className="text-xs text-gray-500">{selectedPartner.position || selectedPartner.email}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageCircle size={40} className="mb-2 text-gray-300" />
                  <p className="text-sm">Noch keine Nachrichten</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.sender_role === 'admin';
                  return (
                    <div key={i} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {!isMe && <Avatar name={msg.sender_name} size="w-7 h-7 text-xs" />}
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                        isMe ? 'bg-sky-500 text-white rounded-br-md' : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                      }`}>
                        {msg.image && (
                          <img
                            src={`${BACKEND_URL}/api/chat/image/${msg.image}`}
                            alt="Bild"
                            className="rounded-lg max-w-full max-h-64 mb-1 cursor-pointer"
                            onClick={() => window.open(`${BACKEND_URL}/api/chat/image/${msg.image}`, '_blank')}
                          />
                        )}
                        {msg.message && <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>}
                        <p className={`text-xs mt-1 ${isMe ? 'text-sky-100' : 'text-gray-400'}`}>{formatTime(msg.created_at)}</p>
                      </div>
                      {isMe && <Avatar name="Admin" size="w-7 h-7 text-xs" />}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="px-4 pt-3 bg-white border-t border-gray-100">
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="h-20 rounded-lg border border-gray-200" />
                  <button
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}

            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-2">
                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileSelect} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 text-gray-400 hover:text-sky-500 hover:bg-gray-50 rounded-full transition-colors"
                  data-testid="chat-image-btn"
                >
                  <Image size={20} />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Nachricht schreiben..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-900 focus:outline-none focus:border-sky-500"
                  data-testid="chat-message-input"
                />
                <button
                  onClick={handleSend}
                  disabled={(!newMessage.trim() && !imageFile) || sending}
                  className="p-2.5 bg-sky-500 text-white rounded-full hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  data-testid="chat-send-btn"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageCircle size={56} className="mb-4 text-gray-200" />
            <p className="text-lg font-medium text-gray-500">Wählen Sie einen Mitarbeiter</p>
            <p className="text-sm">um eine Unterhaltung zu starten</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
