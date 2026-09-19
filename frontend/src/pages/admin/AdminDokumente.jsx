import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Clock,
  RefreshCw,
  Search,
  X,
  User,
  Eye
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminDokumente = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${BACKEND_URL}/api/admin/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Fehler beim Laden der Dokumente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleApprove = async (docId) => {
    setProcessingId(docId);
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(`${BACKEND_URL}/api/admin/documents/${docId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Dokument bestätigt');
      fetchDocuments();
    } catch (error) {
      toast.error('Fehler beim Bestätigen');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (docId) => {
    if (!window.confirm('Dokument wirklich ablehnen?')) return;
    
    setProcessingId(docId);
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(`${BACKEND_URL}/api/admin/documents/${docId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Dokument abgelehnt');
      fetchDocuments();
    } catch (error) {
      toast.error('Fehler beim Ablehnen');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Dokument wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${BACKEND_URL}/api/admin/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Dokument gelöscht');
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (error) {
      toast.error('Fehler beim Löschen');
    }
  };

  const handleDownload = async (doc) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${BACKEND_URL}/api/admin/documents/${doc.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Fehler beim Download');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-[#9ece6a]/20 text-[#9ece6a] rounded-full text-xs font-medium">
            <CheckCircle size={12} />
            Bestätigt
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-[#f7768e]/20 text-[#f7768e] rounded-full text-xs font-medium">
            <XCircle size={12} />
            Abgelehnt
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-[#e0af68]/20 text-[#e0af68] rounded-full text-xs font-medium">
            <Clock size={12} />
            Ausstehend
          </span>
        );
    }
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchQuery === '' ||
      doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.employee_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = documents.filter(d => d.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7aa2f7]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-documents-page">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#c0caf5]">Mitarbeiter-Dokumente</h1>
          <p className="text-[#9aa5ce] mt-1">
            {filteredDocuments.length} von {documents.length} Dokument(en)
            {pendingCount > 0 && (
              <span className="ml-2 text-[#e0af68]">
                ({pendingCount} ausstehend)
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchDocuments}
          className="flex items-center space-x-2 px-4 py-2 bg-[#7aa2f7] text-white rounded-lg hover:bg-[#7aa2f7]/80 transition-colors"
          data-testid="refresh-documents-btn"
        >
          <RefreshCw size={18} />
          <span>Aktualisieren</span>
        </button>
      </div>

      {/* Pending Alert */}
      {pendingCount > 0 && (
        <div className="bg-[#e0af68]/10 border border-[#e0af68]/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-[#e0af68]" />
            <span className="text-[#c0caf5]">
              <strong>{pendingCount}</strong> Dokument(e) warten auf Prüfung.
            </span>
          </div>
          <button
            onClick={() => setStatusFilter('pending')}
            className="px-4 py-2 bg-[#e0af68] text-[#1a1b26] rounded-lg hover:bg-[#e0af68]/80 transition-colors text-sm font-medium"
          >
            Ausstehende anzeigen
          </button>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#565f89]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nach Dateiname, Mitarbeiter oder Kategorie suchen..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#1a1b26] border border-[#292e42] rounded-lg text-[#c0caf5] placeholder-[#565f89] focus:outline-none focus:border-[#7aa2f7]"
            data-testid="search-documents-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#565f89] hover:text-[#c0caf5]"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-[#1a1b26] border border-[#292e42] rounded-lg text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
          data-testid="status-filter-select"
        >
          <option value="all">Alle Status</option>
          <option value="pending">Ausstehend</option>
          <option value="approved">Bestätigt</option>
          <option value="rejected">Abgelehnt</option>
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-[#16161e] border border-[#292e42] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1a1b26] border-b border-[#292e42]">
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#c0caf5]">Dokument</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#c0caf5]">Mitarbeiter</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#c0caf5]">Kategorie</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#c0caf5]">Hochgeladen</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#c0caf5]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#c0caf5]">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-[#565f89]">
                    {searchQuery || statusFilter !== 'all' 
                      ? 'Keine Dokumente gefunden' 
                      : 'Noch keine Dokumente vorhanden'}
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-b border-[#292e42] hover:bg-[#1a1b26] transition-colors"
                    data-testid={`document-row-${doc.id}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#292e42] rounded-lg flex items-center justify-center">
                          <FileText size={20} className="text-[#7aa2f7]" />
                        </div>
                        <div>
                          <p className="text-[#c0caf5] font-medium truncate max-w-[200px]" title={doc.name}>
                            {doc.name}
                          </p>
                          <p className="text-xs text-[#565f89]">{doc.size}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-[#565f89]" />
                        <div>
                          <p className="text-[#c0caf5]">{doc.employee_name}</p>
                          <p className="text-xs text-[#565f89]">{doc.employee_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-[#bb9af7]/10 text-[#bb9af7] rounded-full text-sm">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#9aa5ce] text-sm">
                      {doc.uploaded_at}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-2 text-[#7dcfff] hover:bg-[#7dcfff]/10 rounded-lg transition-colors"
                          title="Herunterladen"
                        >
                          <Download size={18} />
                        </button>
                        
                        {doc.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(doc.id)}
                              disabled={processingId === doc.id}
                              className="p-2 text-[#9ece6a] hover:bg-[#9ece6a]/10 rounded-lg transition-colors disabled:opacity-50"
                              title="Bestätigen"
                            >
                              {processingId === doc.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#9ece6a]"></div>
                              ) : (
                                <CheckCircle size={18} />
                              )}
                            </button>
                            <button
                              onClick={() => handleReject(doc.id)}
                              disabled={processingId === doc.id}
                              className="p-2 text-[#e0af68] hover:bg-[#e0af68]/10 rounded-lg transition-colors disabled:opacity-50"
                              title="Ablehnen"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-2 text-[#f7768e] hover:bg-[#f7768e]/10 rounded-lg transition-colors"
                          title="Löschen"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredDocuments.length === 0 ? (
          <div className="bg-[#16161e] border border-[#292e42] rounded-xl p-8 text-center text-[#565f89]">
            {searchQuery || statusFilter !== 'all' 
              ? 'Keine Dokumente gefunden' 
              : 'Noch keine Dokumente vorhanden'}
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <div key={doc.id} className="bg-[#16161e] border border-[#292e42] rounded-xl p-4" data-testid={`document-card-${doc.id}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-[#292e42] rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={20} className="text-[#7aa2f7]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#c0caf5] font-medium truncate" title={doc.name}>{doc.name}</p>
                    <p className="text-xs text-[#565f89]">{doc.size}</p>
                  </div>
                </div>
                {getStatusBadge(doc.status)}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#9aa5ce] mb-2">
                <User size={14} className="text-[#565f89] flex-shrink-0" />
                <span className="truncate">{doc.employee_name}</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#292e42]">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-[#bb9af7]/10 text-[#bb9af7] rounded-full text-xs">{doc.category}</span>
                  <span className="text-xs text-[#565f89]">{doc.uploaded_at}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleDownload(doc)} className="p-2 text-[#7dcfff] hover:bg-[#7dcfff]/10 rounded-lg"><Download size={16} /></button>
                  {doc.status === 'pending' && (
                    <>
                      <button onClick={() => handleApprove(doc.id)} disabled={processingId === doc.id} className="p-2 text-[#9ece6a] hover:bg-[#9ece6a]/10 rounded-lg disabled:opacity-50">
                        {processingId === doc.id ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#9ece6a]"></div> : <CheckCircle size={16} />}
                      </button>
                      <button onClick={() => handleReject(doc.id)} disabled={processingId === doc.id} className="p-2 text-[#e0af68] hover:bg-[#e0af68]/10 rounded-lg disabled:opacity-50"><XCircle size={16} /></button>
                    </>
                  )}
                  <button onClick={() => handleDelete(doc.id)} className="p-2 text-[#f7768e] hover:bg-[#f7768e]/10 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDokumente;
