import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Send, Image, X, Shield } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AVATAR_COLORS = [
  'bg-sage-500', 'bg-sage-500', 'bg-sage-500', 'bg-rose-500',
  'bg-amber-500', 'bg-sage-500', 'bg-sage-500', 'bg-pink-500',
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

const MitarbeiterChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [adminId, setAdminId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollRef = useRef(null);

  const token = localStorage.getItem('employee_token');
  const headers = { Authorization: `Bearer ${token}` };
  const employeeData = JSON.parse(localStorage.getItem('employee_data') || '{}');

  const findAdmin = useCallback(async () => {
    try {
      const convoRes = await axios.get(`${BACKEND_URL}/api/chat/conversations`, { headers });
      const convos = convoRes.data.conversations || [];
      if (convos.length > 0) {
        const convoId = convos[0].conversation_id;
        const parts = convoId.split('_');
        const myId = employeeData.id;
        const partnerId = parts[0] === myId ? parts[1] : parts[0];
        setAdminId(partnerId);
        return partnerId;
      }
      setAdminId('admin-001');
      return 'admin-001';
    } catch (e) {
      setAdminId('admin-001');
      return 'admin-001';
    }
  }, []);

  const fetchMessages = useCallback(async (aId) => {
    if (!aId) return;
    try {
      const res = await axios.get(`${BACKEND_URL}/api/chat/messages/${aId}`, { headers });
      setMessages(res.data.messages || []);
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const aId = await findAdmin();
      fetchMessages(aId);
      pollRef.current = setInterval(() => fetchMessages(aId), 5000);
    };
    init();
    return () => clearInterval(pollRef.current);
  }, [findAdmin, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if ((!newMessage.trim() && !imageFile) || !adminId) return;
    setSending(true);
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('recipient_id', adminId);
        await axios.post(`${BACKEND_URL}/api/chat/send-image`, formData, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' }
        });
        setImageFile(null);
        setImagePreview(null);
      }
      if (newMessage.trim()) {
        await axios.post(`${BACKEND_URL}/api/chat/send`, {
          recipient_id: adminId,
          message: newMessage.trim()
        }, { headers });
      }
      setNewMessage('');
      fetchMessages(adminId);
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-500"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden" data-testid="employee-chat-page">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
        <Avatar name="Admin" />
        <div>
          <p className="font-semibold text-gray-900">Tdata Testing Support</p>
          <p className="text-xs text-gray-500">Nachrichten an den Administrator</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageCircle size={40} className="mb-2 text-gray-300" />
            <p className="text-sm">Noch keine Nachrichten</p>
            <p className="text-xs">Schreiben Sie dem Administrator</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender_role !== 'admin';
            return (
              <div key={i} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && <Avatar name="Admin" size="w-7 h-7 text-xs" />}
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMe ? 'bg-sage-500 text-white rounded-br-md' : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
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
                  <p className={`text-xs mt-1 ${isMe ? 'text-sage-100' : 'text-gray-400'}`}>{formatTime(msg.created_at)}</p>
                </div>
                {isMe && <Avatar name={employeeData.name || 'MA'} size="w-7 h-7 text-xs" />}
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

      {/* Input */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileSelect} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-gray-400 hover:text-sage-500 hover:bg-gray-50 rounded-full transition-colors"
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
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-900 focus:outline-none focus:border-sage-500"
            data-testid="chat-message-input"
          />
          <button
            onClick={handleSend}
            disabled={(!newMessage.trim() && !imageFile) || sending}
            className="p-2.5 bg-sage-500 text-white rounded-full hover:bg-sage-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            data-testid="chat-send-btn"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MitarbeiterChat;
