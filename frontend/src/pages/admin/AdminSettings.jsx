import React, { useState, useEffect } from 'react';
import { Settings, FileText, Save, Eye, Pencil } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const TYPE_LABELS = {
  vollzeit: 'Vollzeit (DE)',
  teilzeit: 'Teilzeit (DE)',
  minijob: 'Minijob (DE)',
  vollzeit_at: 'Vollzeit (AT)',
  teilzeit_at: 'Teilzeit (AT)',
  minijob_at: 'Werkvertrag (AT)',
  freiberufler_at: 'Freiberufler (AT)',
};
const TYPE_ORDER = ['vollzeit', 'teilzeit', 'minijob', 'vollzeit_at', 'teilzeit_at', 'minijob_at', 'freiberufler_at'];

const AdminSettings = () => {
  const [activeTab] = useState('contracts');
  const [templates, setTemplates] = useState({});
  const [selected, setSelected] = useState('vollzeit');
  const [draft, setDraft] = useState(null);
  const [mode, setMode] = useState('preview'); // 'preview' | 'edit'
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${BACKEND_URL}/api/applications/contract-templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const map = {};
      res.data.forEach((t) => { map[t.type] = t; });
      setTemplates(map);
    } catch (e) {
      toast.error('Verträge konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  useEffect(() => {
    const t = templates[selected];
    if (t) setDraft({ title: t.title, subtitle: t.subtitle, position: t.position, body_html: t.body_html });
    setMode('preview');
  }, [selected, templates]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.put(
        `${BACKEND_URL}/api/applications/contract-templates/${selected}`,
        draft,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTemplates((prev) => ({ ...prev, [selected]: res.data }));
      toast.success('Vertrag gespeichert – gilt ab sofort für alle neuen Bewerber');
      setMode('preview');
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  };

  const previewHtml = (draft?.body_html || '').replace(/\{\{START_DATE\}\}/g, '[Startdatum]');

  return (
    <div className="space-y-6" data-testid="admin-settings-page">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#7aa2f7]/15 flex items-center justify-center">
          <Settings className="text-[#7aa2f7]" size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#c0caf5]">Einstellungen</h1>
          <p className="text-[#9aa5ce] text-sm">Interner Bereich – nur für Administratoren</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-[#292e42]" data-testid="settings-tabs">
        <button
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'contracts' ? 'border-[#7aa2f7] text-[#c0caf5]' : 'border-transparent text-[#9aa5ce]'
          }`}
          data-testid="tab-contracts"
        >
          <FileText size={16} /> Arbeitsverträge
        </button>
      </div>

      {loading ? (
        <p className="text-[#9aa5ce]">Lädt…</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" data-testid="contracts-reader">
          {/* Type list */}
          <div className="lg:col-span-1 space-y-2">
            <p className="text-xs uppercase tracking-wide text-[#565f89] mb-2 px-1">Vertragstyp</p>
            {TYPE_ORDER.map((type) => (
              <button
                key={type}
                onClick={() => setSelected(type)}
                className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                  selected === type
                    ? 'bg-[#7aa2f7]/15 border-[#7aa2f7] text-[#c0caf5]'
                    : 'bg-[#1a1b26] border-[#292e42] text-[#9aa5ce] hover:border-[#565f89]'
                }`}
                data-testid={`contract-type-${type}`}
              >
                <span className="font-medium block">{TYPE_LABELS[type]}</span>
                <span className="text-xs text-[#565f89]">{templates[type]?.subtitle}</span>
              </button>
            ))}
          </div>

          {/* Editor / Preview */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('preview')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${mode === 'preview' ? 'bg-[#7aa2f7] text-white' : 'bg-[#1a1b26] text-[#9aa5ce] border border-[#292e42]'}`}
                  data-testid="mode-preview"
                >
                  <Eye size={14} /> Vorschau
                </button>
                <button
                  onClick={() => setMode('edit')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${mode === 'edit' ? 'bg-[#7aa2f7] text-white' : 'bg-[#1a1b26] text-[#9aa5ce] border border-[#292e42]'}`}
                  data-testid="mode-edit"
                >
                  <Pencil size={14} /> Bearbeiten
                </button>
              </div>
              {mode === 'edit' && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-1.5 bg-[#9ece6a] text-[#1a1b26] font-semibold rounded-lg hover:bg-[#9ece6a]/80 disabled:opacity-50 text-sm"
                  data-testid="save-contract-btn"
                >
                  <Save size={15} /> {saving ? 'Speichert…' : 'Speichern'}
                </button>
              )}
            </div>

            {mode === 'edit' ? (
              <div className="space-y-3" data-testid="contract-editor">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-[#9aa5ce] mb-1">Titel</label>
                    <input value={draft?.title || ''} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1a1b26] border border-[#292e42] rounded-lg text-[#c0caf5] text-sm" data-testid="edit-title" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#9aa5ce] mb-1">Untertitel</label>
                    <input value={draft?.subtitle || ''} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1a1b26] border border-[#292e42] rounded-lg text-[#c0caf5] text-sm" data-testid="edit-subtitle" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#9aa5ce] mb-1">Position</label>
                    <input value={draft?.position || ''} onChange={(e) => setDraft({ ...draft, position: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1a1b26] border border-[#292e42] rounded-lg text-[#c0caf5] text-sm" data-testid="edit-position" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[#9aa5ce] mb-1">
                    Vertragstext (HTML). Platzhalter <code className="text-[#e0af68]">{'{{START_DATE}}'}</code> wird durch das Startdatum des Bewerbers ersetzt.
                  </label>
                  <textarea
                    value={draft?.body_html || ''}
                    onChange={(e) => setDraft({ ...draft, body_html: e.target.value })}
                    rows={22}
                    className="w-full px-3 py-2 bg-[#1a1b26] border border-[#292e42] rounded-lg text-[#c0caf5] text-xs font-mono leading-relaxed"
                    data-testid="edit-body-html"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-[#0A0A0A] max-h-[70vh] overflow-y-auto" data-testid="contract-document">
                <div className="text-center border-b border-gray-200 pb-6 mb-6">
                  <h2 className="text-2xl font-bold tracking-wide">{draft?.title}</h2>
                  <p className="text-gray-600 mt-1">{draft?.subtitle}</p>
                  <p className="text-sm text-gray-500 mt-2">Position: {draft?.position}</p>
                </div>
                <div
                  className="text-sm leading-relaxed [&_h3]:font-bold [&_h3]:mt-5 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mt-1 [&_p]:mt-1"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
