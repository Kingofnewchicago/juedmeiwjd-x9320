import React, { useState } from 'react';
import { Upload, Shield, AlertTriangle, CheckCircle, FileImage, Loader2, Download } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import { TdataLogo } from '../../components/Logo';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MitarbeiterVerification = ({ applicant, onVerificationComplete }) => {
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e, side) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Nur JPEG, PNG oder WebP Bilder erlaubt');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Datei zu groß (max. 5 MB)');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (side === 'front') {
        setFrontImage(file);
        setFrontPreview(reader.result);
      } else {
        setBackImage(file);
        setBackPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!frontImage || !backImage) {
      toast.error('Bitte laden Sie beide Seiten des Ausweises hoch');
      return;
    }

    setIsUploading(true);

    try {
      const token = localStorage.getItem('employee_token');
      const formData = new FormData();
      formData.append('front', frontImage);
      formData.append('back', backImage);

      await axios.post(`${BACKEND_URL}/api/applications/verification/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Dokumente erfolgreich hochgeladen');
      if (onVerificationComplete) {
        onVerificationComplete();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Fehler beim Hochladen der Dokumente');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F1F6F1] via-white to-[#E3EDE3] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <TdataLogo className="h-14 w-14 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-[#0A0A0A] mb-2">Identitätsverifizierung</h1>
          <p className="text-slate-600">
            Willkommen, {applicant?.full_name || applicant?.name}! Bitte laden Sie Ihren Ausweis hoch.
          </p>
        </div>

        {/* Contract Download */}
        <div className="bg-sage-50 border border-sage-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-sage-600 flex-shrink-0" />
            <span className="text-sm text-sage-800 font-medium">Arbeitsvertrag wurde unterschrieben</span>
          </div>
          <button
            onClick={() => {
              const token = localStorage.getItem('employee_token');
              window.open(`${BACKEND_URL}/api/applications/download-contract?token=${token}`, '_blank');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors text-sm font-medium"
            data-testid="download-contract-btn"
          >
            <Download size={16} />
            Vertrag herunterladen
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#659A65] text-white flex items-center justify-center text-sm font-bold">
              <CheckCircle size={16} />
            </div>
            <span className="text-sm text-[#659A65] font-medium">Bewerbung akzeptiert</span>
          </div>
          <div className="w-8 h-px bg-[#659A65]"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#659A65] text-white flex items-center justify-center text-sm font-bold">
              <CheckCircle size={16} />
            </div>
            <span className="text-sm text-[#659A65] font-medium">Vertrag unterschrieben</span>
          </div>
          <div className="w-8 h-px bg-[#659A65]"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#659A65] text-white flex items-center justify-center text-sm font-bold">3</div>
            <span className="text-sm text-[#0A0A0A] font-medium">ID-Verifizierung</span>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-amber-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-amber-800 mb-2">
                Hinweis gemäß Geldwäschegesetz (GwG)
              </h3>
              <p className="text-sm text-amber-700">
                Wegen des Geldwäschegesetzes müssen sich alle Mitarbeiter online ausweisen. 
                Bitte laden Sie folgende Dokumente hoch:
              </p>
              <ul className="text-sm text-amber-700 mt-2 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} /> Ausweisbild Vorderseite
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} /> Ausweisbild Rückseite
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* GDPR Notice */}
        <div className="bg-sage-50 border border-sage-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Shield className="text-sage-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-sage-800 mb-2">
                Datenschutz (DSGVO)
              </h3>
              <p className="text-sm text-sage-700">
                Ihre Daten werden DSGVO-konform behandelt. Die Ausweisbilder werden ausschließlich 
                zur Identitätsprüfung verwendet und nach erfolgreicher Verifizierung gelöscht.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <h2 className="text-lg font-semibold text-[#0A0A0A] mb-6 flex items-center gap-2">
            <FileImage className="text-[#659A65]" size={20} />
            Ausweisdokumente hochladen
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Front */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Vorderseite
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                  frontPreview 
                    ? 'border-[#659A65] bg-[#F1F6F1]' 
                    : 'border-slate-300 hover:border-[#659A65] hover:bg-slate-50'
                }`}
                onClick={() => document.getElementById('front-upload').click()}
              >
                {frontPreview ? (
                  <div className="space-y-2">
                    <img
                      src={frontPreview}
                      alt="Vorderseite"
                      className="max-h-32 mx-auto rounded-lg shadow-md"
                    />
                    <p className="text-sm text-[#659A65] font-medium flex items-center justify-center gap-1">
                      <CheckCircle size={16} /> Hochgeladen
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto text-slate-400" size={32} />
                    <p className="text-sm text-slate-600">Klicken zum Hochladen</p>
                    <p className="text-xs text-slate-400">JPEG, PNG oder WebP (max. 5MB)</p>
                  </div>
                )}
                <input
                  id="front-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'front')}
                  data-testid="verification-front-upload"
                />
              </div>
            </div>

            {/* Back */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rückseite
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                  backPreview 
                    ? 'border-[#659A65] bg-[#F1F6F1]' 
                    : 'border-slate-300 hover:border-[#659A65] hover:bg-slate-50'
                }`}
                onClick={() => document.getElementById('back-upload').click()}
              >
                {backPreview ? (
                  <div className="space-y-2">
                    <img
                      src={backPreview}
                      alt="Rückseite"
                      className="max-h-32 mx-auto rounded-lg shadow-md"
                    />
                    <p className="text-sm text-[#659A65] font-medium flex items-center justify-center gap-1">
                      <CheckCircle size={16} /> Hochgeladen
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto text-slate-400" size={32} />
                    <p className="text-sm text-slate-600">Klicken zum Hochladen</p>
                    <p className="text-xs text-slate-400">JPEG, PNG oder WebP (max. 5MB)</p>
                  </div>
                )}
                <input
                  id="back-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'back')}
                  data-testid="verification-back-upload"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!frontImage || !backImage || isUploading}
            className="w-full h-14 bg-[#659A65] hover:bg-[#507D50] text-white text-lg font-semibold rounded-xl"
            data-testid="verification-submit-btn"
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                Wird hochgeladen...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Shield size={20} />
                Verifizierung abschließen
              </span>
            )}
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          © 2026 Tdata Testing. Alle Rechte vorbehalten.
        </p>
      </div>
    </div>
  );
};

export default MitarbeiterVerification;
