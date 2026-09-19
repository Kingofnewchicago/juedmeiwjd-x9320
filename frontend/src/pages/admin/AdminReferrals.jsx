import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Copy, Link as LinkIcon, BarChart3, Power, PowerOff, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const SITE_URL = window.location.origin;

const AdminReferrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ slug: '', name: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}` });

  const fetchAll = useCallback(async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/referrals/`, { headers: headers() });
      setReferrals(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setReferrals([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.slug.trim()) {
      toast.error('Slug ist erforderlich');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${BACKEND_URL}/api/referrals/`, form, { headers: headers() });
      toast.success('Referral-Link erstellt');
      setShowForm(false);
      setForm({ slug: '', name: '', notes: '' });
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Fehler beim Erstellen');
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = (slug) => {
    const link = `${SITE_URL}/bewerbungen/${slug}`;
    navigator.clipboard.writeText(link);
    toast.success('Link kopiert');
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Referral-Link "${name || id}" wirklich löschen?`)) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/referrals/${id}`, { headers: headers() });
      toast.success('Gelöscht');
      fetchAll();
    } catch (e) {
      toast.error('Fehler beim Löschen');
    }
  };

  const handleToggle = async (id) => {
    try {
      await axios.patch(`${BACKEND_URL}/api/referrals/${id}/toggle`, {}, { headers: headers() });
      fetchAll();
    } catch (e) {
      toast.error('Fehler');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" data-testid="admin-referrals-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#c0caf5]">Referral-Links</h1>
          <p className="text-sm text-[#565f89] mt-1">Erstelle individuelle Bewerbungs-Links und tracke wie viele sich darüber bewerben</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAll} className="p-2 text-[#9aa5ce] hover:bg-[#16161e] rounded-lg" title="Aktualisieren" data-testid="ref-refresh-btn">
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#7aa2f7] text-[#1a1b26] rounded-lg font-medium hover:bg-[#89b4fa]"
            data-testid="new-referral-btn"
          >
            <Plus size={18} /> Neuer Link
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-[#565f89] py-10">Lade...</div>
      ) : referrals.length === 0 ? (
        <div className="text-center text-[#565f89] py-16 bg-[#16161e] rounded-xl border border-[#292e42]">
          Noch keine Referral-Links erstellt.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {referrals.map((ref) => {
            const link = `${SITE_URL}/bewerbungen/${ref.slug}`;
            const breakdown = ref.status_breakdown || {};
            return (
              <div
                key={ref.id}
                className={`bg-[#16161e] border rounded-xl p-5 space-y-4 ${ref.active ? 'border-[#292e42]' : 'border-red-900/40 opacity-60'}`}
                data-testid={`ref-card-${ref.slug}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-[#c0caf5] truncate">
                        {ref.name || ref.slug}
                      </h3>
                      {!ref.active && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/30 text-red-300">Inaktiv</span>
                      )}
                    </div>
                    {ref.notes && <p className="text-sm text-[#565f89] mt-1">{ref.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleToggle(ref.id)} className="p-2 hover:bg-[#1a1b26] rounded-lg text-[#9aa5ce]" title={ref.active ? 'Deaktivieren' : 'Aktivieren'}>
                      {ref.active ? <Power size={16} /> : <PowerOff size={16} />}
                    </button>
                    <button onClick={() => handleDelete(ref.id, ref.name || ref.slug)} className="p-2 hover:bg-red-900/20 rounded-lg text-red-400" title="Löschen">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-[#1a1b26] rounded-lg p-3 border border-[#292e42]">
                  <LinkIcon size={16} className="text-[#7aa2f7] flex-shrink-0" />
                  <code className="text-xs sm:text-sm text-[#9aa5ce] truncate flex-1">{link}</code>
                  <button
                    onClick={() => copyLink(ref.slug)}
                    className="p-1.5 text-[#7aa2f7] hover:bg-[#16161e] rounded"
                    data-testid={`copy-ref-${ref.slug}`}
                    title="Link kopieren"
                  >
                    <Copy size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#1a1b26] rounded-lg p-3">
                    <p className="text-xs text-[#565f89]">Klicks</p>
                    <p className="text-2xl font-bold text-[#7aa2f7]">{ref.clicks || 0}</p>
                  </div>
                  <div className="bg-[#1a1b26] rounded-lg p-3">
                    <p className="text-xs text-[#565f89]">Bewerbungen</p>
                    <p className="text-2xl font-bold text-sky-400">{ref.applications || 0}</p>
                  </div>
                  <div className="bg-[#1a1b26] rounded-lg p-3">
                    <p className="text-xs text-[#565f89]">Quote</p>
                    <p className="text-2xl font-bold text-[#bb9af7]">
                      {ref.clicks ? Math.round(((ref.applications || 0) / ref.clicks) * 100) : 0}%
                    </p>
                  </div>
                </div>

                {Object.keys(breakdown).length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#292e42]">
                    <BarChart3 size={14} className="text-[#565f89]" />
                    {Object.entries(breakdown).map(([status, count]) => (
                      <span key={status} className="text-xs px-2 py-1 rounded-full bg-[#1a1b26] text-[#9aa5ce] border border-[#292e42]">
                        {status}: <strong className="text-[#c0caf5]">{count}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1b26] border border-[#292e42] rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-[#292e42]">
              <h2 className="text-xl font-bold text-[#c0caf5]">Neuer Referral-Link</h2>
              <p className="text-sm text-[#565f89] mt-1">Erstelle einen individuellen Bewerbungs-Link</p>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#9aa5ce] mb-2">Slug (URL-Endung) *</label>
                <div className="flex items-center bg-[#16161e] border border-[#292e42] rounded-lg overflow-hidden focus-within:border-[#7aa2f7]">
                  <span className="px-3 text-sm text-[#565f89] border-r border-[#292e42] whitespace-nowrap">/bewerbungen/</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                    placeholder="z.B. instagram-feb"
                    className="flex-1 px-3 py-2 bg-transparent text-[#c0caf5] focus:outline-none"
                    required
                    minLength={3}
                    maxLength={40}
                    data-testid="ref-slug-input"
                  />
                </div>
                <p className="text-xs text-[#565f89] mt-1">3-40 Zeichen, nur a-z, 0-9, _ und -</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9aa5ce] mb-2">Name (optional)</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="z.B. Instagram Februar 2026"
                  className="w-full px-4 py-3 bg-[#16161e] border border-[#292e42] rounded-lg text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                  data-testid="ref-name-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9aa5ce] mb-2">Notiz (optional)</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Interne Notiz..."
                  className="w-full px-4 py-3 bg-[#16161e] border border-[#292e42] rounded-lg text-[#c0caf5] focus:outline-none focus:border-[#7aa2f7]"
                  data-testid="ref-notes-input"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setForm({ slug: '', name: '', notes: '' }); }}
                  className="flex-1 px-4 py-3 bg-[#16161e] border border-[#292e42] text-[#9aa5ce] rounded-lg hover:bg-[#292e42]"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-[#7aa2f7] text-[#1a1b26] rounded-lg font-medium hover:bg-[#89b4fa] disabled:opacity-50"
                  data-testid="save-ref-btn"
                >
                  {submitting ? 'Speichern...' : 'Erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReferrals;
