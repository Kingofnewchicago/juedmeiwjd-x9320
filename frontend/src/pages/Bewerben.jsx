import React, { useState } from 'react';
import axios from 'axios';
import {
  CheckCircle, Euro, Palmtree, Gift, Home as HomeIcon, ShieldCheck,
  Send, Upload, ArrowRight, Laptop, GraduationCap, TrendingUp, Ticket,
} from 'lucide-react';
import { MoreLogo } from '../components/Logo';

const POSITION = 'Remote Application Tester';

const perks = [
  { icon: Euro, title: '2.200 € netto / Monat', desc: 'Attraktives Festgehalt' },
  { icon: Palmtree, title: '30 Urlaubstage', desc: 'Für echte Erholung' },
  { icon: Gift, title: 'Weihnachts- & Geburtstagsgeld', desc: 'Jeweils doppelter Monatslohn' },
  { icon: HomeIcon, title: '100 % Homeoffice', desc: 'Arbeite von überall' },
  { icon: Laptop, title: 'Firmenlaptop', desc: 'Moderne Ausstattung inklusive' },
  { icon: GraduationCap, title: 'Weiterbildung', desc: 'Schulungen & Zertifizierungen' },
  { icon: TrendingUp, title: 'Karrierechancen', desc: 'Entwickle dich weiter bei uns' },
  { icon: Ticket, title: 'Deutschlandticket', desc: 'Von uns bezahlt' },
];

const Bewerben = () => {
  const [form, setForm] = useState({ name: '', mobilnummer: '', geburtsdatum: '', email: '', cv: null });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };
  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) setForm((p) => ({ ...p, cv: f }));
  };

  const genPassword = () =>
    'A1a!' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/applications/submit`, {
        name: form.name,
        email: form.email,
        mobilnummer: form.mobilnummer,
        geburtsdatum: form.geburtsdatum,
        staatsangehoerigkeit: '',
        strasse: '',
        postleitzahl: '',
        stadt: '',
        position: POSITION,
        message: 'Schnellbewerbung über /signup (Kampagne)',
        password: genPassword(),
        cv_filename: form.cv ? form.cv.name : null,
        referral_slug: null,
      });
      setDone(true);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string' && detail.toLowerCase().includes('existiert')) {
        setError('Für diese E-Mail liegt bereits eine Bewerbung vor.');
      } else {
        setError('Etwas ist schiefgelaufen. Bitte versuche es erneut.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 border border-orange-100 rounded-xl bg-white text-ink placeholder:text-ink/35 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-colors';

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white font-body text-ink/70">
      <div className="absolute inset-x-0 top-0 h-[420px] more-grid-bg opacity-60 pointer-events-none" />
      <div className="pointer-events-none absolute -top-24 -left-20 w-[460px] h-[460px] bg-orange-200/40 blur-[130px] rounded-full" />

      <div className="relative max-w-6xl mx-auto px-6 py-10 md:py-14">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <MoreLogo className="h-11 w-11" />
          <span className="font-heading font-bold text-lg">
            <span className="text-ink">MORE</span><span className="text-orange-600">Applications</span>
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Pitch */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-1.5 text-xs font-semibold text-orange-600 mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> Jetzt bewerben · Remote
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-ink leading-[1.05] mb-5">
              Werde <span className="more-gradient-text">Remote Application Tester</span>
            </h1>
            <p className="text-lg text-ink/60 mb-8 max-w-lg">
              Teste Software bequem von zu Hause – flexibel, sicher und gut bezahlt.
              Kein Vorwissen nötig. Bewirb dich in unter 60 Sekunden.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {perks.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.title} className="flex items-start gap-3 rounded-2xl border border-orange-100 bg-white p-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="text-orange-600" size={20} />
                    </div>
                    <div>
                      <p className="font-heading font-bold text-ink text-sm leading-tight">{p.title}</p>
                      <p className="text-xs text-ink/55 mt-1">{p.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-sm text-ink/55">
              <ShieldCheck size={16} className="text-orange-600" /> MORE Applications GmbH · Heinrich-Hertz-Str. 133, 22083 Hamburg
            </div>
          </div>

          {/* Right: Form */}
          <div className="relative">
            <div className="absolute -inset-3 bg-gradient-to-tr from-orange-300/40 to-amber-200/40 blur-2xl rounded-3xl" />
            <div className="relative bg-white border border-orange-100 rounded-2xl shadow-[0_25px_70px_-30px_rgba(249,115,22,0.45)] p-7 md:p-8">
              {done ? (
                <div className="text-center py-8" data-testid="signup-success">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="text-white" size={34} />
                  </div>
                  <h2 className="font-heading text-2xl font-bold text-ink mb-2">Bewerbung erhalten!</h2>
                  <p className="text-ink/60 mb-6">
                    Vielen Dank für deine Bewerbung als {POSITION}. Wir melden uns
                    in Kürze per E-Mail bei dir.
                  </p>
                  <a href="/karriere" className="inline-flex items-center gap-2 h-12 px-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-colors">
                    Mehr über den Job <ArrowRight size={17} />
                  </a>
                </div>
              ) : (
                <>
                  <h2 className="font-heading text-2xl font-bold text-ink mb-6">Jetzt in 60 Sekunden bewerben</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-ink mb-1.5">Name *</label>
                      <input name="name" value={form.name} onChange={handleChange} required placeholder="Max Mustermann" className={inputClass} data-testid="signup-name" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ink mb-1.5">Telefonnummer *</label>
                      <input name="mobilnummer" type="tel" value={form.mobilnummer} onChange={handleChange} required placeholder="+49 170 1234567" className={inputClass} data-testid="signup-phone" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ink mb-1.5">Geburtsdatum *</label>
                      <input name="geburtsdatum" type="date" value={form.geburtsdatum} onChange={handleChange} required className={inputClass} data-testid="signup-birthdate" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ink mb-1.5">E-Mail *</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="deine@email.de" className={inputClass} data-testid="signup-email" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ink mb-1.5">Lebenslauf <span className="text-ink/40 font-normal">(optional)</span></label>
                      <div className="relative">
                        <input name="cv" type="file" onChange={handleFile} accept=".pdf,.doc,.docx" className={`${inputClass} cursor-pointer`} data-testid="signup-cv" />
                        <Upload className="absolute right-3 top-3.5 text-orange-400 pointer-events-none" size={18} />
                      </div>
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2" data-testid="signup-error">{error}</p>}

                    <button type="submit" disabled={submitting} data-testid="signup-submit" className="w-full h-13 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-colors disabled:opacity-60 shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2">
                      {submitting ? 'Wird gesendet...' : (<>Jetzt bewerben <Send size={17} /></>)}
                    </button>
                    <p className="text-xs text-ink/45 text-center">
                      Mit dem Absenden stimmst du unserer <a href="/datenschutz" className="text-orange-600 underline">Datenschutzerklärung</a> zu.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bewerben;
