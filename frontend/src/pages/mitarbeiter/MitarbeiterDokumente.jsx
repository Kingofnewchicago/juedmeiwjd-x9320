import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  File, 
  FileImage,
  FilePlus,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MitarbeiterDokumente = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const token = localStorage.getItem('employee_token');
      const response = await axios.get(`${BACKEND_URL}/api/employee/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDocuments(response.data);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Fehler beim Laden der Dokumente');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Nur PDF, JPEG und PNG Dateien erlaubt');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Datei zu groß (max. 10 MB)');
      return;
    }

    setUploading(true);
    
    try {
      const token = localStorage.getItem('employee_token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'Sonstige');
      
      const response = await axios.post(`${BACKEND_URL}/api/employee/documents/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Reload documents
      await loadDocuments();
      toast.success('Dokument hochgeladen');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Fehler beim Hochladen');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Möchten Sie dieses Dokument wirklich löschen?')) {
      return;
    }

    try {
      const token = localStorage.getItem('employee_token');
      await axios.delete(`${BACKEND_URL}/api/employee/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDocuments(prev => prev.filter(d => d.id !== docId));
      toast.success('Dokument gelöscht');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Fehler beim Löschen');
    }
  };

  const handleDownload = async (doc) => {
    try {
      const token = localStorage.getItem('employee_token');
      const response = await axios.get(`${BACKEND_URL}/api/employee/documents/${doc.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      // Create download link
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
          <span className="flex items-center gap-1 px-2 py-1 bg-sage-100 text-sage-700 rounded-full text-xs font-medium">
            <CheckCircle size={12} />
            Bestätigt
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-sage-100 text-sage-700 rounded-full text-xs font-medium">
            <Clock size={12} />
            In Prüfung
          </span>
        );
      default:
        return null;
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'contract':
        return <FileText className="text-sage-500" size={24} />;
      case 'payslip':
        return <FileText className="text-sage-500" size={24} />;
      case 'tax':
        return <FileText className="text-sage-500" size={24} />;
      case 'insurance':
        return <FileText className="text-cyan-500" size={24} />;
      default:
        return <File className="text-gray-500" size={24} />;
    }
  };

  const categoriesFromDocs = ['all', ...new Set(documents.map(d => d.category))];
  const categories = categoriesFromDocs.length > 1 ? categoriesFromDocs : ['all', 'Verträge', 'Sonstige'];
  
  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : documents.filter(d => d.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="employee-documents-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dokumente</h1>
          <p className="text-gray-600 mt-1">{documents.length} Dokument(e) gespeichert</p>
        </div>
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          <div className={`flex items-center gap-2 px-4 py-2 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors ${uploading ? 'opacity-50' : ''}`}>
            {uploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Hochladen...</span>
              </>
            ) : (
              <>
                <Upload size={18} />
                <span>Dokument hochladen</span>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-sage-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat === 'all' ? 'Alle' : cat}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Dokumente</h3>
            <p className="text-gray-500">Laden Sie Ihr erstes Dokument hoch.</p>
          </div>
        ) : (
          filteredDocuments.map(doc => (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow"
              data-testid={`document-card-${doc.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  {getFileIcon(doc.type)}
                </div>
                {getStatusBadge(doc.status)}
              </div>

              <h3 className="font-semibold text-gray-900 mb-1 truncate" title={doc.name}>
                {doc.name}
              </h3>
              
              <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                <span>{doc.size}</span>
                <span>•</span>
                <span>{doc.uploadedAt}</span>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                >
                  <Eye size={16} />
                  Ansehen
                </button>
                <button
                  onClick={() => handleDownload(doc)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sage-600 hover:bg-sage-50 rounded-lg transition-colors text-sm"
                >
                  <Download size={16} />
                  Download
                </button>
                {doc.status !== 'approved' && !doc.is_contract && (
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Required Documents Info */}
      <div className="bg-sage-50 border border-sage-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="text-sage-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-sage-800">Benötigte Dokumente</h3>
            <p className="text-sm text-sage-700 mt-1 mb-3">
              Bitte laden Sie folgende Dokumente hoch, falls noch nicht vorhanden:
            </p>
            <ul className="text-sm text-sage-700 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-sage-500" /> Steuer-ID Bescheinigung
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={14} className="text-sage-500" /> Krankenkassen-Nachweis
              </li>
              <li className="flex items-center gap-2">
                <Clock size={14} className="text-sage-500" /> Bankverbindung (optional)
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{previewDoc.name}</h3>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8 text-center">
              <FileText size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-4">Dokumentenvorschau nicht verfügbar</p>
              <Button className="bg-sage-500 hover:bg-sage-600">
                <Download size={18} className="mr-2" />
                Herunterladen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MitarbeiterDokumente;
