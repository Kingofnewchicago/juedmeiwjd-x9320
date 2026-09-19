import React, { useState, useRef, useEffect } from 'react';
import { FileSignature, PenTool, RotateCcw, CheckCircle, AlertTriangle, CreditCard, SkipForward } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import { TdataLogo } from '../../components/Logo';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MitarbeiterContractSign = ({ applicant, onContractSigned }) => {
  const [iban, setIban] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [contractData, setContractData] = useState(null);
  const signatureRef = useRef(null);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const token = localStorage.getItem('employee_token');
        const res = await axios.get(`${BACKEND_URL}/api/applications/my-contract`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setContractData(res.data);
      } catch (error) {
        console.error('Error loading contract:', error);
        toast.error('Vertrag konnte nicht geladen werden');
      }
    };
    fetchContract();
  }, []);

  const contractTitle = contractData?.title || 'ARBEITSVERTRAG';
  const contractSubtitle = contractData?.subtitle || '';
  const positionLabel = contractData?.position || '';
  const signedDate = contractData?.start_date || new Date().toLocaleDateString('de-DE');
  const canSkip = contractData?.can_skip || false;
  const isFreelance = contractData?.type === 'freiberufler_at';
  const contractor = (contractData?.contractor || '').trim();
  const signerName = isFreelance && contractor ? contractor.split('\n')[0] : (applicant?.full_name || applicant?.name);

  const handleSkip = async () => {
    setIsSkipping(true);
    try {
      const token = localStorage.getItem('employee_token');
      await axios.post(`${BACKEND_URL}/api/applications/skip-contract`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Vertrag vorerst übersprungen – Sie können später unterschreiben.');
      onContractSigned();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Überspringen nicht möglich');
    } finally {
      setIsSkipping(false);
    }
  };

  const formatIBAN = (value) => {
    const cleaned = value.replace(/\s/g, '').toUpperCase();
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted.slice(0, 27);
  };

  const handleIBANChange = (e) => {
    setIban(formatIBAN(e.target.value));
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  const handleSign = async () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      toast.error('Bitte unterschreiben Sie den Vertrag');
      return;
    }

    const ibanClean = iban.replace(/\s/g, '');
    if (!ibanClean || ibanClean.length < 15) {
      toast.error('Bitte geben Sie eine gültige IBAN ein');
      return;
    }

    setIsSigning(true);

    try {
      const token = localStorage.getItem('employee_token');
      const signatureData = signatureRef.current.toDataURL('image/png');

      await axios.post(
        `${BACKEND_URL}/api/applications/sign-contract`,
        {
          signature_data: signatureData,
          iban: ibanClean,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Vertrag erfolgreich unterschrieben!');
      onContractSigned();
    } catch (error) {
      console.error('Error signing contract:', error);
      toast.error(error.response?.data?.detail || 'Fehler beim Unterschreiben des Vertrags');
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F1F6F1] via-white to-[#E3EDE3] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <TdataLogo className="h-14 w-14 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-[#0A0A0A] mb-2">Arbeitsvertrag unterschreiben</h1>
          <p className="text-slate-600">
            Willkommen, {applicant?.full_name || applicant?.name}! Bitte unterschreiben Sie Ihren Arbeitsvertrag.
          </p>
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
            <div className="w-8 h-8 rounded-full bg-[#659A65] text-white flex items-center justify-center text-sm font-bold">2</div>
            <span className="text-sm text-[#0A0A0A] font-medium">Vertrag unterschreiben</span>
          </div>
          <div className="w-8 h-px bg-slate-300"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold">3</div>
            <span className="text-sm text-slate-500">ID-Verifizierung</span>
          </div>
        </div>

        {/* Contract Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Contract Header */}
          <div className="bg-[#0A0A0A] text-white p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#659A65] flex items-center justify-center">
                <FileSignature size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Arbeitsvertrag</h2>
                <p className="text-slate-400">Tdata Testing · {positionLabel}</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Contract - always visible */}
            <div className="p-6 bg-slate-50 rounded-xl text-sm border border-slate-200">
              {/* Contract Header */}
              <div className="text-center mb-8 pb-4 border-b border-slate-300">
                <h3 className="text-2xl font-bold text-[#0A0A0A] mb-2">{contractTitle}</h3>
                <p className="text-slate-600">{contractSubtitle}</p>
              </div>
              
              <div className="space-y-6 text-slate-700">
                {/* Parties */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4 border-b border-slate-200">
                  <div>
                    <p className="font-semibold text-[#0A0A0A] mb-1">{isFreelance ? 'Auftraggeber:' : 'Arbeitgeber:'}</p>
                    <p>MO Handel & Service, Inh. Mariusz Otok</p>
                    <p>Darmstädter Landstraße 60</p>
                    <p>65462 Ginsheim-Gustavsburg</p>
                    <p className="text-slate-500 mt-1">vertreten durch Mariusz Otok</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#0A0A0A] mb-1">{isFreelance ? 'Auftragnehmer:' : 'Arbeitnehmer:'}</p>
                    {isFreelance && contractor ? (
                      <p className="whitespace-pre-line" data-testid="contract-contractor">{contractor}</p>
                    ) : (
                      <>
                        <p>{applicant?.full_name || applicant?.name}</p>
                        <p>{applicant?.address || 'Adresse wird ergänzt'}</p>
                      </>
                    )}
                  </div>
                </div>

                <p className="italic text-slate-600">Dieser Vertrag wird zwischen den oben genannten Parteien geschlossen und beinhaltet die nachfolgenden Vereinbarungen:</p>

                <div
                  className="contract-html space-y-3 [&_h3]:font-bold [&_h3]:text-[#0A0A0A] [&_h3]:mt-4 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mt-1 [&_p]:mt-1"
                  data-testid="contract-body"
                  dangerouslySetInnerHTML={{ __html: contractData?.body_html || '<p>Vertrag wird geladen…</p>' }}
                />

                {/* Signatures */}
                <div className="pt-6 mt-6 border-t border-slate-300">
                  <p className="text-slate-600 mb-4">Ginsheim-Gustavsburg, {signedDate}</p>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="border-b border-slate-400 pb-1 mb-1"></div>
                      <p className="text-xs text-slate-500">Mariusz Otok</p>
                      <p className="text-xs text-slate-500">{isFreelance ? 'Auftraggeber' : 'Arbeitgeber'}</p>
                    </div>
                    <div>
                      <div className="border-b border-slate-400 pb-1 mb-1"></div>
                      <p className="text-xs text-slate-500">{signerName}</p>
                      <p className="text-xs text-slate-500">{isFreelance ? 'Auftragnehmer' : 'Arbeitnehmer'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* IBAN Input */}
            <div>
              <Label className="text-[#0A0A0A] font-semibold flex items-center gap-2 mb-2">
                <CreditCard size={18} className="text-[#659A65]" />
                IBAN für Gehaltszahlung
              </Label>
              <Input
                type="text"
                value={iban}
                onChange={handleIBANChange}
                placeholder=""
                className="h-12 text-lg font-mono tracking-wider border-slate-200 focus:border-[#659A65] focus:ring-[#659A65]"
                data-testid="contract-iban-input"
              />
              <p className="text-xs text-slate-500 mt-2">Die Vergütung wird auf dieses Konto überwiesen.</p>
            </div>

            {/* Signature */}
            <div>
              <Label className="text-[#0A0A0A] font-semibold flex items-center gap-2 mb-2">
                <PenTool size={18} className="text-[#659A65]" />
                Ihre Unterschrift
              </Label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl bg-white hover:border-[#659A65] transition-colors">
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    className: 'w-full h-40 cursor-crosshair',
                  }}
                  backgroundColor="white"
                />
              </div>
              <button
                onClick={clearSignature}
                className="mt-2 text-sm text-slate-500 hover:text-[#659A65] flex items-center gap-1"
              >
                <RotateCcw size={14} />
                Unterschrift löschen
              </button>
            </div>

            {/* Legal Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Rechtlicher Hinweis</p>
                <p>Mit Ihrer Unterschrift bestätigen Sie, dass Sie den Arbeitsvertrag gelesen und verstanden haben und diesem zustimmen.</p>
              </div>
            </div>

            {/* Sign Button */}
            <Button
              onClick={handleSign}
              disabled={isSigning}
              className="w-full h-14 bg-[#659A65] hover:bg-[#507D50] text-white text-lg font-semibold rounded-xl"
              data-testid="sign-contract-btn"
            >
              {isSigning ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Wird unterschrieben...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <FileSignature size={20} />
                  Vertrag verbindlich unterschreiben
                </span>
              )}
            </Button>

            {canSkip && (
              <div className="pt-2">
                <button
                  onClick={handleSkip}
                  disabled={isSkipping || isSigning}
                  className="w-full h-12 flex items-center justify-center gap-2 text-slate-600 hover:text-[#659A65] border border-slate-200 hover:border-[#659A65] rounded-xl transition-colors disabled:opacity-50"
                  data-testid="skip-contract-btn"
                >
                  <SkipForward size={18} />
                  {isSkipping ? 'Wird übersprungen…' : 'Später unterschreiben'}
                </button>
                <p className="text-xs text-slate-400 text-center mt-2">
                  Sie können den Vertrag jetzt überspringen und später unterschreiben.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          © 2026 Tdata Testing. Alle Rechte vorbehalten.
        </p>
      </div>
    </div>
  );
};

export default MitarbeiterContractSign;
