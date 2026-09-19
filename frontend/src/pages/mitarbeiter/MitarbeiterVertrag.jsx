import React, { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { 
  FileText, 
  PenTool, 
  Download, 
  CheckCircle, 
  Clock, 
  RotateCcw,
  AlertTriangle,
  FileSignature,
  Calendar,
  Euro,
  Briefcase,
  X,
  CreditCard,
  ScrollText,
  ChevronDown
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Contract text component - Minijob Arbeitsvertrag
const ContractDocument = ({ contract }) => {
  const today = new Date().toLocaleDateString('de-DE');
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm leading-relaxed">
      {/* Header */}
      <div className="text-center mb-8 pb-4 border-b-2 border-gray-300">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">ARBEITSVERTRAG</h2>
        <p className="text-gray-600 font-medium">(Minijob – geringfügige Beschäftigung)</p>
      </div>

      {/* Parties */}
      <div className="mb-6">
        <p className="font-semibold text-gray-900 mb-2">zwischen</p>
        <p className="text-gray-700 mb-1 font-medium">MO Handel & Service, Inh. Mariusz Otok</p>
        <p className="text-gray-700 mb-1">Darmstädter Landstraße 60</p>
        <p className="text-gray-700 mb-1">65462 Ginsheim-Gustavsburg</p>
        <p className="text-gray-700 mb-1">Deutschland</p>
        <p className="text-gray-600 italic mb-4">– nachfolgend „Arbeitgeber" genannt –</p>
        
        <p className="font-semibold text-gray-900 mb-2">und</p>
        <p className="text-gray-700 mb-1 font-medium">{contract.employee_name}</p>
        <p className="text-gray-700 mb-1">E-Mail: {contract.employee_email}</p>
        <p className="text-gray-600 italic mb-4">– nachfolgend „Arbeitnehmer" genannt –</p>
        
        <p className="text-gray-700">wird folgender Arbeitsvertrag geschlossen:</p>
      </div>

      {/* Contract Terms */}
      <div className="space-y-6">
        <section>
          <h3 className="font-bold text-gray-900 mb-2">§1 Beginn des Arbeitsverhältnisses</h3>
          <p className="text-gray-700">
            Dieses Arbeitsverhältnis beginnt am {today} (Tag der Unterzeichnung durch beide Parteien).
          </p>
        </section>

        <section>
          <h3 className="font-bold text-gray-900 mb-2">§2 Tätigkeit</h3>
          <p className="text-gray-700 mb-2">
            Der Arbeitnehmer wird als <strong>Assistent für Evaluierungen im Homeoffice</strong> bei Tdata Testing eingestellt und insbesondere mit folgenden Aufgaben betraut:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
            <li>Überprüfung von Apps und Software auf Benutzerfreundlichkeit und Mängel</li>
            <li>Durchführung von Video-Identifikationen im Rahmen von Evaluierungen</li>
            <li>Erstellung und fristgerechte Einreichung der dazugehörigen Abschlussberichte</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold text-gray-900 mb-2">§3 Arbeitszeit</h3>
          <p className="text-gray-700 mb-2">
            Die regelmäßige Arbeitszeit beträgt etwa <strong>10 Wochenstunden</strong>, verteilt auf 2 bis 4 Tage pro Woche.
          </p>
          <p className="text-gray-700">
            Die genauen Arbeitszeiten werden in Absprache zwischen Arbeitnehmer und Arbeitgeber unter Berücksichtigung der betrieblichen Erfordernisse sowie der terminlichen Möglichkeiten des Arbeitnehmers festgelegt.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-gray-900 mb-2">§4 Vergütung</h3>
          <p className="text-gray-700 mb-2">
            Der Arbeitnehmer erhält eine Vergütung in Höhe von maximal <strong>603,00 EUR</strong> monatlich.
          </p>
          <p className="text-gray-700 mb-2">
            Die Vergütung ist jeweils am Monatsende des Folgemonats fällig und wird per Überweisung auf das vom Arbeitnehmer benannte Konto gezahlt.
          </p>
          <p className="text-gray-700 mb-2">
            Der Arbeitnehmer wurde darauf hingewiesen, dass er auf Antrag von der Rentenversicherungspflicht befreit werden kann. Der schriftliche Befreiungsantrag ist dem Arbeitgeber zu übergeben (§ 6 Abs. 1b Sozialgesetzbuch Sechstes Buch – SGB VI).
          </p>
          <p className="text-gray-700 mb-2">
            Dem Arbeitnehmer ist bekannt, dass ein entsprechender Verzicht nur mit Wirkung für die Zukunft und bei Ausübung mehrerer geringfügiger Beschäftigungsverhältnisse nur einheitlich erklärt werden kann. Diese Erklärung bindet den Arbeitnehmer für die Dauer der jeweiligen Beschäftigungen.
          </p>
          <p className="text-gray-700">
            Die Tätigkeit erfolgt bei Tdata Testing im Homeoffice.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-gray-900 mb-2">§5 Sonderzuwendungen</h3>
          <p className="text-gray-700">
            Der Arbeitgeber zahlt Sonderzuwendungen (Urlaubsgeld und Weihnachtsgeld) in den Monaten Juni und Dezember in Höhe von jeweils <strong>603,00 EUR</strong>.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-gray-900 mb-2">§6 Urlaubsanspruch</h3>
          <p className="text-gray-700 mb-2">
            Der Arbeitnehmer hat grundsätzlich Anspruch auf einen jährlichen Erholungsurlaub von <strong>28 Arbeitstagen</strong>. Zeitpunkt und Dauer des Urlaubs richten sich nach den betrieblichen Notwendigkeiten unter Berücksichtigung der Wünsche des Arbeitnehmers.
          </p>
          <p className="text-gray-700">
            Im Übrigen gelten ergänzend die Bestimmungen des Bundesurlaubsgesetzes in der jeweils geltenden Fassung.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-gray-900 mb-2">§7 Arbeitsverhinderung</h3>
          <p className="text-gray-700 mb-2">
            Der Arbeitnehmer verpflichtet sich, jede Arbeitsverhinderung unverzüglich – spätestens vor Arbeitsbeginn – dem Arbeitgeber unter Angabe der voraussichtlichen Dauer schriftlich mitzuteilen.
          </p>
          <p className="text-gray-700 mb-2">
            Im Krankheitsfall hat der Arbeitnehmer unverzüglich, spätestens jedoch nach Ablauf des dritten Kalendertages, dem Arbeitgeber eine ärztliche Arbeitsunfähigkeitsbescheinigung vorzulegen, aus der sich die voraussichtliche Dauer der Erkrankung ergibt. Dauert die Krankheit länger als in der Bescheinigung angegeben, ist unverzüglich eine Folgebescheinigung vorzulegen.
          </p>
          <p className="text-gray-700 mb-2">
            Der Arbeitgeber zahlt im Falle einer unverschuldeten Arbeitsunfähigkeit infolge Krankheit für die Dauer von sechs Wochen das regelmäßige Arbeitsentgelt weiter (Entgeltfortzahlung im Krankheitsfall).
          </p>
          <p className="text-gray-700">
            Im Übrigen gelten die jeweils maßgeblichen gesetzlichen Bestimmungen.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-gray-900 mb-2">§8 Einstellungsfragebogen</h3>
          <p className="text-gray-700">
            Der als Anlage beigefügte Einstellungsfragebogen ist Bestandteil dieses Vertrages. Der Arbeitnehmer versichert die Vollständigkeit und Richtigkeit seiner Angaben.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-gray-900 mb-2">§9 Weitere Beschäftigungen</h3>
          <p className="text-gray-700">
            Der Arbeitnehmer verpflichtet sich, die Aufnahme jeder weiteren Beschäftigung dem Arbeitgeber unverzüglich schriftlich mitzuteilen. Dies gilt unabhängig von der Höhe des Verdienstes oder dem zeitlichen Umfang der Tätigkeit.
          </p>
        </section>

        <section>
          <h3 className="font-bold text-gray-900 mb-2">§10 Kündigungsfristen</h3>
          <p className="text-gray-700 mb-2">
            Das Arbeitsverhältnis wird auf unbestimmte Zeit geschlossen. Die ersten <strong>6 Wochen</strong> gelten als Probezeit. Während dieser Zeit kann das Arbeitsverhältnis von beiden Parteien mit einer Frist von zwei Wochen (§ 622 Abs. 3 BGB) gekündigt werden.
          </p>
          <p className="text-gray-700 mb-2">
            Nach Ablauf der Probezeit gelten die gesetzlichen Kündigungsfristen. Verlängert sich die Kündigungsfrist für den Arbeitgeber aus tariflichen oder gesetzlichen Gründen, gilt diese Verlängerung entsprechend auch für den Arbeitnehmer.
          </p>
          <p className="text-gray-700 mb-2">
            Das Recht zur fristlosen Kündigung aus wichtigem Grund bleibt unberührt.
          </p>
          <p className="text-gray-700 mb-2">
            Jede Kündigung bedarf der Schriftform.
          </p>
          <p className="text-gray-700">
            Der Arbeitgeber ist berechtigt, den Arbeitnehmer nach Ausspruch einer Kündigung unter Fortzahlung der Vergütung und unter Anrechnung auf etwaige Resturlaubsansprüche von der Arbeitsleistung freizustellen.
          </p>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <p className="text-gray-600 text-center">
          Ginsheim-Gustavsburg, den {today}
        </p>
      </div>
    </div>
  );
};

const MitarbeiterVertrag = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  const [signing, setSigning] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [iban, setIban] = useState('');
  const sigCanvas = useRef(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem('employee_token');
      const response = await axios.get(`${BACKEND_URL}/api/contracts/my-contracts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContracts(response.data);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      // If no contracts endpoint, show empty state
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      toast.error('Bitte unterschreiben Sie im Zeichenfeld');
      return;
    }

    // Validate IBAN
    const cleanIban = iban.replace(/\s/g, '');
    if (!cleanIban || cleanIban.length < 15 || cleanIban.length > 34) {
      toast.error('Bitte geben Sie eine gültige IBAN ein');
      return;
    }

    setSigning(true);

    try {
      const token = localStorage.getItem('employee_token');
      const signatureData = sigCanvas.current.toDataURL('image/png');

      await axios.post(
        `${BACKEND_URL}/api/contracts/${selectedContract.id}/sign`,
        { 
          signature_data: signatureData,
          iban: cleanIban
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Vertrag erfolgreich unterschrieben!');
      setShowSignModal(false);
      setSelectedContract(null);
      setIban('');
      fetchContracts();
    } catch (error) {
      console.error('Error signing contract:', error);
      toast.error(error.response?.data?.detail || 'Fehler beim Unterschreiben des Vertrags');
    } finally {
      setSigning(false);
    }
  };

  const handleDownload = async (contract) => {
    try {
      const token = localStorage.getItem('employee_token');
      const response = await axios.get(
        `${BACKEND_URL}/api/contracts/${contract.id}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Arbeitsvertrag_${contract.employee_name.replace(' ', '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF heruntergeladen');
    } catch (error) {
      console.error('Error downloading:', error);
      toast.error('Fehler beim Herunterladen');
    }
  };

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'signed') {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-sage-100 text-sage-700 rounded-full text-sm font-medium">
          <CheckCircle size={14} />
          Unterschrieben
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-3 py-1 bg-sage-100 text-sage-700 rounded-full text-sm font-medium">
        <Clock size={14} />
        Ausstehend
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="employee-contract-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Arbeitsvertrag</h1>
        <p className="text-gray-600 mt-1">Ihre Verträge und Dokumente zum Unterschreiben</p>
      </div>

      {/* Contracts List */}
      {contracts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileSignature size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Verträge</h3>
          <p className="text-gray-500">
            Sobald Ihr Arbeitsvertrag erstellt wurde, erscheint er hier zur Unterschrift.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              data-testid={`contract-card-${contract.id}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-sage-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="text-sage-500" size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">Arbeitsvertrag</h3>
                      {getStatusBadge(contract.status)}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Briefcase size={16} className="text-gray-400" />
                        <span>{contract.position}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} className="text-gray-400" />
                        <span>Start: {contract.start_date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Euro size={16} className="text-gray-400" />
                        <span>{contract.salary} €/Monat</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={16} className="text-gray-400" />
                        <span>{contract.working_hours}h/Woche</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {contract.status === 'pending' ? (
                    <Button
                      onClick={() => {
                        setSelectedContract(contract);
                        setShowSignModal(true);
                      }}
                      className="bg-sage-500 hover:bg-sage-600"
                    >
                      <PenTool size={18} className="mr-2" />
                      Jetzt unterschreiben
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleDownload(contract)}
                      variant="outline"
                      className="border-sage-500 text-sage-600 hover:bg-sage-50"
                    >
                      <Download size={18} className="mr-2" />
                      PDF herunterladen
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-sage-50 border border-sage-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="text-sage-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-sage-800">Wichtige Hinweise</h3>
            <ul className="text-sm text-sage-700 mt-2 space-y-1">
              <li>• Lesen Sie den Vertrag sorgfältig durch bevor Sie unterschreiben</li>
              <li>• Ihre digitale Unterschrift ist rechtlich bindend</li>
              <li>• Nach der Unterschrift können Sie den Vertrag als PDF herunterladen</li>
              <li>• Bei Fragen wenden Sie sich an hr@tdata-testing.de</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignModal && selectedContract && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSignModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ScrollText size={24} className="text-sage-500" />
                  Arbeitsvertrag lesen & unterschreiben
                </h2>
                <p className="text-sm text-gray-500 mt-1">Bitte lesen Sie den Vertrag sorgfältig durch</p>
              </div>
              <button
                onClick={() => setShowSignModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Contract Preview */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={20} className="text-sage-500" />
                  <h3 className="font-semibold text-gray-900 text-lg">Vertragsinhalt</h3>
                </div>
                <ContractDocument contract={selectedContract} />
              </div>

              {/* Scroll indicator */}
              <div className="flex items-center justify-center py-4 text-gray-400">
                <ChevronDown size={24} className="animate-bounce" />
              </div>

              {/* Signature Section */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 text-lg mb-6 flex items-center gap-2">
                  <PenTool size={20} className="text-sage-500" />
                  Vertrag unterschreiben
                </h3>

                {/* IBAN Input */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard size={18} className="text-gray-500" />
                    <Label htmlFor="iban" className="font-semibold text-gray-900">
                      Bankverbindung für Gehaltszahlung *
                    </Label>
                  </div>
                  <Input
                    id="iban"
                    type="text"
                    value={iban}
                    onChange={(e) => setIban(e.target.value.toUpperCase())}
                    placeholder="DE00 0000 0000 0000 0000 00"
                    className="h-12 font-mono text-lg bg-white"
                    data-testid="iban-input"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Ihre IBAN wird im Arbeitsvertrag gespeichert und für die Gehaltszahlung verwendet.
                  </p>
                </div>

                {/* Signature Area */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block font-semibold text-gray-900">
                      Ihre Unterschrift *
                    </label>
                    <button
                      onClick={clearSignature}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                    >
                      <RotateCcw size={14} />
                      Löschen
                    </button>
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white">
                    <SignatureCanvas
                      ref={sigCanvas}
                      canvasProps={{
                        className: 'w-full h-48 rounded-xl',
                        style: { width: '100%', height: '200px' }
                      }}
                      backgroundColor="white"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Zeichnen Sie Ihre Unterschrift mit der Maus oder dem Finger
                  </p>
                </div>

                {/* Legal Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Rechtlicher Hinweis:</strong> Mit dem Klick auf "Vertrag unterschreiben" 
                    bestätigen Sie, dass Sie den Vertrag vollständig gelesen haben und mit allen Bedingungen einverstanden sind. 
                    Diese digitale Unterschrift ist rechtlich bindend.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer with buttons */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0 bg-gray-50">
              <Button
                variant="outline"
                onClick={() => setShowSignModal(false)}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleSign}
                disabled={signing}
                className="bg-sage-500 hover:bg-sage-600"
              >
                {signing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Wird unterschrieben...
                  </>
                ) : (
                  <>
                    <PenTool size={18} className="mr-2" />
                    Vertrag unterschreiben
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MitarbeiterVertrag;
