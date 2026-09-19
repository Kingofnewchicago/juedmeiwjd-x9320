import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Trash2, 
  RefreshCw,
  User,
  Clock,
  FileImage,
  AlertTriangle,
  Unlock
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminVerifications = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);
  const [imageData, setImageData] = useState({ front: null, back: null });
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${BACKEND_URL}/api/applications/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter to only show verifications (status: Verifiziert or Freigeschaltet with images)
      const filtered = response.data.filter(app => 
        app.status === 'Verifiziert' || 
        (app.verification_front && app.verification_back)
      );
      
      setVerifications(filtered);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error('Fehler beim Laden der Verifikationen');
    } finally {
      setLoading(false);
    }
  };

  const loadImages = async (applicationId) => {
    setLoadingImages(true);
    setImageData({ front: null, back: null });
    
    try {
      const token = localStorage.getItem('admin_token');
      
      const [frontRes, backRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/applications/verification/${applicationId}/front`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_URL}/api/applications/verification/${applicationId}/back`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setImageData({
        front: frontRes.data.image,
        back: backRes.data.image
      });
    } catch (error) {
      console.error('Error loading images:', error);
      toast.error('Fehler beim Laden der Bilder');
    } finally {
      setLoadingImages(false);
    }
  };

  const handleViewVerification = async (verification) => {
    setSelectedVerification(verification);
    await loadImages(verification.id);
  };

  const handleUnlock = async (applicationId) => {
    if (!window.confirm('Möchten Sie diesen Mitarbeiter freischalten?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(`${BACKEND_URL}/api/applications/${applicationId}/unlock`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Mitarbeiter freigeschaltet');
      setSelectedVerification(null);
      fetchVerifications();
    } catch (error) {
      toast.error('Fehler beim Freischalten');
    }
  };

  const handleDeleteDocuments = async (applicationId) => {
    if (!window.confirm('Möchten Sie die Ausweisdokumente löschen? Dies kann nicht rückgängig gemacht werden.')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${BACKEND_URL}/api/applications/verification/${applicationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Dokumente gelöscht');
      setSelectedVerification(null);
      setImageData({ front: null, back: null });
      fetchVerifications();
    } catch (error) {
      toast.error('Fehler beim Löschen');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verifiziert':
        return (
          <span className="px-2 py-1 bg-[#7dcfff]/20 text-[#7dcfff] rounded-full text-xs font-medium flex items-center gap-1">
            <Clock size={12} />
            Wartet auf Freischaltung
          </span>
        );
      case 'Freigeschaltet':
        return (
          <span className="px-2 py-1 bg-[#9ece6a]/20 text-[#9ece6a] rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle size={12} />
            Freigeschaltet
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7aa2f7]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-verifications-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#c0caf5] flex items-center gap-3">
            <Shield className="text-[#7aa2f7]" size={28} />
            Verifikationen
          </h1>
          <p className="text-[#9aa5ce] mt-1">
            {verifications.filter(v => v.status === 'Verifiziert').length} ausstehende Prüfungen
          </p>
        </div>
        <button
          onClick={fetchVerifications}
          className="flex items-center gap-2 px-4 py-2 bg-[#292e42] text-[#c0caf5] rounded-lg hover:bg-[#343b58] transition-colors"
        >
          <RefreshCw size={18} />
          <span>Aktualisieren</span>
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-[#7aa2f7]/10 border border-[#7aa2f7]/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-[#7aa2f7] flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-[#c0caf5]">
            <strong>DSGVO-Hinweis:</strong> Die Ausweisbilder werden nur zur Identitätsprüfung angezeigt 
            und können nicht heruntergeladen werden. Bitte löschen Sie die Dokumente nach erfolgreicher Prüfung.
          </div>
        </div>
      </div>

      {/* Verifications List */}
      <div className="space-y-4">
        {verifications.length === 0 ? (
          <div className="bg-[#16161e] border border-[#292e42] rounded-xl p-12 text-center">
            <Shield size={48} className="mx-auto mb-4 text-[#565f89]" />
            <h3 className="text-lg font-medium text-[#c0caf5] mb-2">Keine Verifikationen</h3>
            <p className="text-[#9aa5ce]">Es gibt derzeit keine ausstehenden Verifikationen.</p>
          </div>
        ) : (
          verifications.map((verification) => (
            <div
              key={verification.id}
              className="bg-[#16161e] border border-[#292e42] rounded-xl p-4 sm:p-5"
              data-testid={`verification-card-${verification.id}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#7aa2f7]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="text-[#7aa2f7]" size={24} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-[#c0caf5]">{verification.name}</h3>
                    <p className="text-sm text-[#9aa5ce] truncate">{verification.email}</p>
                    <p className="text-xs text-[#565f89] mt-1">
                      Position: {verification.position}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 ml-16 sm:ml-0">
                  {getStatusBadge(verification.status)}
                  
                  <button
                    onClick={() => handleViewVerification(verification)}
                    className="p-2 text-[#7dcfff] hover:bg-[#7dcfff]/10 rounded-lg transition-colors"
                    title="Dokumente anzeigen"
                  >
                    <Eye size={20} />
                  </button>
                  
                  {verification.status === 'Verifiziert' && (
                    <button
                      onClick={() => handleUnlock(verification.id)}
                      className="px-3 sm:px-4 py-2 bg-[#9ece6a] text-white rounded-lg hover:bg-[#9ece6a]/80 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Unlock size={16} />
                      <span className="hidden sm:inline">Freischalten</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Modal */}
      {selectedVerification && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setSelectedVerification(null);
            setImageData({ front: null, back: null });
          }}
        >
          <div
            className="bg-[#16161e] border border-[#292e42] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#292e42] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#c0caf5]">Verifizierung prüfen</h2>
                <p className="text-sm text-[#9aa5ce] mt-1">{selectedVerification.name}</p>
              </div>
              {getStatusBadge(selectedVerification.status)}
            </div>

            <div className="p-6">
              {loadingImages ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7aa2f7]"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Front */}
                  <div>
                    <h3 className="text-sm font-medium text-[#9aa5ce] mb-3 flex items-center gap-2">
                      <FileImage size={16} />
                      Vorderseite
                    </h3>
                    {imageData.front ? (
                      <div className="bg-[#1a1b26] rounded-lg p-4">
                        <img 
                          src={imageData.front} 
                          alt="Ausweis Vorderseite" 
                          className="w-full rounded-lg"
                          style={{ maxHeight: '300px', objectFit: 'contain' }}
                        />
                      </div>
                    ) : (
                      <div className="bg-[#1a1b26] rounded-lg p-12 text-center text-[#565f89]">
                        Nicht verfügbar
                      </div>
                    )}
                  </div>

                  {/* Back */}
                  <div>
                    <h3 className="text-sm font-medium text-[#9aa5ce] mb-3 flex items-center gap-2">
                      <FileImage size={16} />
                      Rückseite
                    </h3>
                    {imageData.back ? (
                      <div className="bg-[#1a1b26] rounded-lg p-4">
                        <img 
                          src={imageData.back} 
                          alt="Ausweis Rückseite" 
                          className="w-full rounded-lg"
                          style={{ maxHeight: '300px', objectFit: 'contain' }}
                        />
                      </div>
                    ) : (
                      <div className="bg-[#1a1b26] rounded-lg p-12 text-center text-[#565f89]">
                        Nicht verfügbar
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Applicant Info */}
              <div className="mt-6 bg-[#1a1b26] rounded-lg p-4">
                <h3 className="text-sm font-medium text-[#9aa5ce] mb-3">Bewerberdaten</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-[#565f89]">Name</p>
                    <p className="text-[#c0caf5]">{selectedVerification.name}</p>
                  </div>
                  <div>
                    <p className="text-[#565f89]">E-Mail</p>
                    <p className="text-[#c0caf5]">{selectedVerification.email}</p>
                  </div>
                  <div>
                    <p className="text-[#565f89]">Geburtsdatum</p>
                    <p className="text-[#c0caf5]">{selectedVerification.geburtsdatum}</p>
                  </div>
                  <div>
                    <p className="text-[#565f89]">Staatsangehörigkeit</p>
                    <p className="text-[#c0caf5]">{selectedVerification.staatsangehoerigkeit}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-[#292e42] flex flex-col sm:flex-row justify-between gap-3">
              <button
                onClick={() => handleDeleteDocuments(selectedVerification.id)}
                className="px-4 py-2 bg-[#f7768e]/20 text-[#f7768e] rounded-lg hover:bg-[#f7768e]/30 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Dokumente löschen
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedVerification(null);
                    setImageData({ front: null, back: null });
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 bg-[#292e42] text-[#c0caf5] rounded-lg hover:bg-[#343b58] transition-colors"
                >
                  Schließen
                </button>
                
                {selectedVerification.status === 'Verifiziert' && (
                  <button
                    onClick={() => handleUnlock(selectedVerification.id)}
                    className="flex-1 sm:flex-none px-6 py-2 bg-[#9ece6a] text-white rounded-lg hover:bg-[#9ece6a]/80 transition-colors flex items-center justify-center gap-2"
                  >
                    <Unlock size={16} />
                    Freischalten
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerifications;
