import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Briefcase, MapPin, Clock, Users, TrendingUp, Heart, Coffee, GraduationCap,
  Upload, Send, Check, Eye, EyeOff, Lock, X, ExternalLink, Copy, CheckCircle,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';

const Karriere = () => {
  const { refSlug } = useParams();
  const [referralSlug, setReferralSlug] = useState(null);
  const [referralName, setReferralName] = useState('');

  useEffect(() => {
    if (!refSlug) return;
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/referrals/track/${encodeURIComponent(refSlug)}`)
      .then((res) => {
        if (res.data?.valid) {
          setReferralSlug(res.data.slug);
          setReferralName(res.data.name || '');
        }
      })
      .catch(() => {});
  }, [refSlug]);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', passwordConfirm: '', mobilnummer: '',
    geburtsdatum: '', staatsangehoerigkeit: '', strasse: '', postleitzahl: '',
    stadt: '', position: '', cv: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const getLoginUrl = () => `${window.location.origin}/mitarbeiter/login`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Link kopiert!');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData((prev) => ({ ...prev, cv: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      toast.error('Die Passwörter stimmen nicht überein');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Das Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }
    setIsSubmitting(true);
    try {
      const applicationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        mobilnummer: formData.mobilnummer,
        geburtsdatum: formData.geburtsdatum,
        staatsangehoerigkeit: formData.staatsangehoerigkeit,
        strasse: formData.strasse,
        postleitzahl: formData.postleitzahl,
        stadt: formData.stadt,
        position: formData.position,
        cv_filename: formData.cv ? formData.cv.name : null,
        referral_slug: referralSlug || null,
      };
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/applications/submit`, applicationData);
      setSubmittedEmail(formData.email);
      setShowSuccessModal(true);
      setFormData({
        name: '', email: '', password: '', passwordConfirm: '', mobilnummer: '',
        geburtsdatum: '', staatsangehoerigkeit: '', strasse: '', postleitzahl: '',
        stadt: '', position: '', cv: null,
      });
      const fileInput = document.getElementById('cv');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error submitting application:', error);
      const detail = error.response?.data?.detail;
      let errorMsg = 'Bitte versuchen Sie es später erneut.';
      if (typeof detail === 'string') {
        errorMsg = detail;
      } else if (Array.isArray(detail)) {
        errorMsg = detail.map((d) => d?.msg || '').filter(Boolean).join(', ') || errorMsg;
      }
      toast.error('Fehler beim Senden der Bewerbung', { description: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPositions = [
    { title: 'Web Application Tester', location: 'Remote / Homeoffice', type: 'Minijob', description: 'Assistent für Evaluierungen im Homeoffice – Überprüfung von Apps und Software.', requirements: ['Interesse an App- und Software-Testing', 'Zuverlässige und selbstständige Arbeitsweise', 'Gute Deutschkenntnisse', 'PC/Laptop und stabile Internetverbindung'] },
    { title: 'QA Engineer', location: 'Remote / Deutschland', type: 'Vollzeit', description: 'QA Engineer für spannende Testing-Projekte gesucht.', requirements: ['Grundkenntnisse im Software Testing', 'Interesse an Testautomatisierung', 'Teamfähigkeit und Kommunikationsstärke', 'Gute Deutschkenntnisse'] },
    { title: 'Mobile App Tester', location: 'Remote / Deutschland', type: 'Vollzeit / Teilzeit', description: 'Tester für iOS und Android Apps.', requirements: ['Eigenes Smartphone (iOS oder Android)', 'Interesse an mobilen Apps', 'Genaue und strukturierte Arbeitsweise', 'Keine Vorkenntnisse erforderlich'] },
    { title: 'Junior Test Analyst', location: 'Remote / Deutschland', type: 'Vollzeit', description: 'Einstiegsposition für motivierte Testing-Einsteiger.', requirements: ['Keine Berufserfahrung notwendig', 'Lernbereitschaft und Neugier', 'Analytisches Denken', 'Gute Deutschkenntnisse'] },
    { title: 'Werkstudent Testing', location: 'Remote / Deutschland', type: 'Teilzeit', description: 'Idealer Nebenjob für Studierende.', requirements: ['Eingeschriebener Student (m/w/d)', 'Flexible Zeiteinteilung möglich', 'Interesse an Softwarequalität', 'Grundlegende PC-Kenntnisse'] },
  ];

  const benefits = [
    { icon: TrendingUp, title: 'Entwicklung', description: 'Individuelle Weiterbildung und Zertifizierungen' },
    { icon: Users, title: 'Gutes Team', description: 'Zusammenarbeit mit erfahrenen Testexperten' },
    { icon: Coffee, title: 'Work-Life-Balance', description: 'Flexible Arbeitszeiten und Homeoffice' },
    { icon: Heart, title: 'Gesundheit', description: 'Betriebliche Zusatzleistungen' },
    { icon: GraduationCap, title: 'Weiterbildung', description: 'Schulungen zu Testing-Methoden' },
    { icon: Briefcase, title: 'Moderne Tools', description: 'Aktuelle Testing-Technologien' },
  ];

  const inputBase = 'h-12 border-brand-100 focus-visible:ring-brand-500';

  return (
    <div className="bg-white font-body text-ink/70">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-orange-50 via-white to-white text-ink overflow-hidden border-b border-orange-100">
        <div className="absolute inset-0 more-grid-bg opacity-40" />
        <div className="pointer-events-none absolute -top-24 right-1/4 w-[440px] h-[440px] bg-brand-600/30 blur-[130px] rounded-full" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-24 md:py-28">
          <div className="max-w-3xl">
            <p className="text-orange-600 font-semibold mb-4">Karriere bei MORE Applications</p>
            <h1 className="font-heading text-5xl md:text-6xl font-bold leading-[1.05] mb-6">
              Werde Teil unseres <span className="more-gradient-text">Teams.</span>
            </h1>
            <p className="text-lg text-ink/60 leading-relaxed">
              Arbeite mit erfahrenen Testexperten und gestalte Softwarequalität
              mit. Bei MORE Applications erwarten dich strukturierte Testprojekte,
              flache Hierarchien und gute Entwicklungsmöglichkeiten.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="font-heading text-4xl font-bold text-ink mb-3">Warum MORE Applications?</h2>
            <p className="text-lg text-ink/60">Was dich bei uns erwartet.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon;
              return (
                <div key={i} className="bg-white border border-brand-100 p-8 rounded-2xl hover:border-brand-300 transition-colors duration-200">
                  <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="text-brand-600" size={24} strokeWidth={1.75} />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-ink mb-2">{benefit.title}</h3>
                  <p className="text-ink/60">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 md:py-24 bg-brand-50/50 border-y border-brand-100">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="font-heading text-4xl font-bold text-ink mb-3">Offene Stellen</h2>
            <p className="text-lg text-ink/60">Finde deine passende Position in unserem Team.</p>
          </div>
          <div className="space-y-6">
            {openPositions.map((position, i) => (
              <div key={i} className="bg-white border border-brand-100 p-8 rounded-2xl">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="font-heading text-xl font-bold text-ink mb-3">{position.title}</h3>
                    <div className="flex flex-wrap gap-4 mb-4 text-sm">
                      <div className="flex items-center"><MapPin size={16} className="mr-2 text-brand-600" />{position.location}</div>
                      <div className="flex items-center"><Clock size={16} className="mr-2 text-brand-600" />{position.type}</div>
                    </div>
                    <p className="mb-4 text-ink/60">{position.description}</p>
                    <h4 className="font-semibold text-ink mb-2">Anforderungen:</h4>
                    <ul className="space-y-2">
                      {position.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <Check className="text-brand-600 mr-2 flex-shrink-0 mt-0.5" size={16} />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <a href="#bewerbung" className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors whitespace-nowrap">
                      Jetzt bewerben
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="bewerbung" className="py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          <div className="mb-10">
            <h2 className="font-heading text-4xl font-bold text-ink mb-3">Jetzt bewerben</h2>
            <p className="text-lg text-ink/60">Sende uns deine Unterlagen – wir melden uns zeitnah bei dir.</p>
          </div>

          <div className="bg-white border border-brand-100 p-8 md:p-10 rounded-2xl shadow-[0_20px_60px_-30px_rgba(79,70,229,0.35)]">
            {referralSlug && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-brand-50 border border-brand-200 text-sm text-brand-800" data-testid="referral-banner">
                Du bewirbst dich über{referralName ? ` „${referralName}"` : ''} (<span className="font-mono">{referralSlug}</span>)
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Persönliche Daten */}
              <div>
                <h3 className="font-heading text-lg font-bold text-ink mb-4 pb-2 border-b border-brand-100">Persönliche Daten</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Vollständiger Name *</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Max Mustermann" required className={inputBase} data-testid="karriere-name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-Mail *</Label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="ihre@email.de" required className={inputBase} data-testid="karriere-email" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="mobilnummer">Mobilnummer *</Label>
                      <Input id="mobilnummer" name="mobilnummer" type="tel" value={formData.mobilnummer} onChange={handleChange} placeholder="+49 170 1234567" required className={inputBase} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="geburtsdatum">Geburtsdatum *</Label>
                      <Input id="geburtsdatum" name="geburtsdatum" type="date" value={formData.geburtsdatum} onChange={handleChange} required className={inputBase} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="staatsangehoerigkeit">Staatsangehörigkeit *</Label>
                    <Input id="staatsangehoerigkeit" name="staatsangehoerigkeit" value={formData.staatsangehoerigkeit} onChange={handleChange} placeholder="z. B. Deutsch" required className={inputBase} />
                  </div>
                </div>
              </div>

              {/* Zugangsdaten */}
              <div>
                <h3 className="font-heading text-lg font-bold text-ink mb-4 pb-2 border-b border-brand-100 flex items-center gap-2">
                  <Lock className="text-brand-600" size={18} /> Zugangsdaten
                </h3>
                <p className="text-sm mb-4 text-ink/60">Mit diesen Daten kannst du dich einloggen und den Status deiner Bewerbung verfolgen.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password">Passwort wählen *</Label>
                    <div className="relative">
                      <Input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} placeholder="Mindestens 8 Zeichen" required minLength={8} className={`${inputBase} pr-10`} data-testid="karriere-password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-brand-400 hover:text-brand-600">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordConfirm">Passwort bestätigen *</Label>
                    <Input id="passwordConfirm" name="passwordConfirm" type={showPassword ? 'text' : 'password'} value={formData.passwordConfirm} onChange={handleChange} placeholder="Passwort wiederholen" required minLength={8} className={inputBase} />
                  </div>
                </div>
              </div>

              {/* Anschrift */}
              <div>
                <h3 className="font-heading text-lg font-bold text-ink mb-4 pb-2 border-b border-brand-100">Anschrift</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="strasse">Straße und Hausnummer *</Label>
                    <Input id="strasse" name="strasse" value={formData.strasse} onChange={handleChange} placeholder="Musterstraße 123" required className={inputBase} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="postleitzahl">Postleitzahl *</Label>
                      <Input id="postleitzahl" name="postleitzahl" value={formData.postleitzahl} onChange={handleChange} placeholder="20095" required maxLength={5} className={inputBase} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="stadt">Stadt / Ort *</Label>
                      <Input id="stadt" name="stadt" value={formData.stadt} onChange={handleChange} placeholder="Hamburg" required className={inputBase} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bewerbungsdetails */}
              <div>
                <h3 className="font-heading text-lg font-bold text-ink mb-4 pb-2 border-b border-brand-100">Bewerbungsdetails</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="position">Gewünschte Position *</Label>
                    <Input id="position" name="position" value={formData.position} onChange={handleChange} placeholder="z. B. QA Engineer" required className={inputBase} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cv">Lebenslauf / CV *</Label>
                    <div className="relative">
                      <Input id="cv" name="cv" type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" required className={`${inputBase} cursor-pointer`} />
                      <Upload className="absolute right-3 top-3 text-brand-400 pointer-events-none" size={20} />
                    </div>
                    <p className="text-sm text-ink/45">PDF, DOC oder DOCX (max. 5 MB)</p>
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} data-testid="karriere-submit" className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white text-base font-semibold rounded-full transition-colors">
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> Wird gesendet...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">Bewerbung absenden <Send className="ml-2" size={18} /></span>
                )}
              </Button>
            </form>
          </div>

          <div className="mt-6 text-sm text-center text-ink/60">
            Mit dem Absenden deiner Bewerbung stimmst du unserer{' '}
            <Link to="/datenschutz" className="text-brand-700 underline">Datenschutzerklärung</Link> zu.
          </div>
        </div>
      </section>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-brand-100">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 more-grid-bg opacity-30" />
              <button onClick={() => setShowSuccessModal(false)} className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors z-10">
                <X size={20} />
              </button>
              <div className="relative w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={30} className="text-white" />
              </div>
              <h3 className="relative font-heading text-2xl font-bold">Bewerbung erfolgreich!</h3>
              <p className="relative text-white/70 mt-2">Vielen Dank für dein Interesse an MORE Applications</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
                <h4 className="font-semibold text-ink mb-2 flex items-center gap-2">
                  <CheckCircle className="text-brand-600" size={18} /> Nächster Schritt
                </h4>
                <p className="text-sm text-ink/60">Du kannst dich ab sofort in deinem persönlichen Bewerberportal einloggen, um den Status deiner Bewerbung zu verfolgen.</p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-ink">Deine Login-Daten:</h4>
                <div className="bg-brand-50/60 border border-brand-100 rounded-xl p-4 space-y-3">
                  <div><span className="text-sm text-ink/45">E-Mail:</span><p className="font-medium text-ink">{submittedEmail}</p></div>
                  <div><span className="text-sm text-ink/45">Passwort:</span><p className="font-medium text-ink">Das von dir gewählte Passwort</p></div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-ink">Login-Adresse:</h4>
                <div className="flex items-center gap-2 bg-brand-50/60 border border-brand-100 rounded-xl p-3">
                  <code className="flex-1 text-sm text-brand-700 break-all">{getLoginUrl()}</code>
                  <button onClick={() => copyToClipboard(getLoginUrl())} className="p-2 hover:bg-brand-100 rounded-lg transition-colors flex-shrink-0" title="Link kopieren">
                    <Copy size={18} className="text-ink/60" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a href={getLoginUrl()} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors">
                  <ExternalLink size={18} /> Zum Login
                </a>
                <button onClick={() => setShowSuccessModal(false)} className="flex-1 px-6 py-3 border border-brand-100 text-ink rounded-full font-semibold hover:bg-brand-50 transition-colors">
                  Schließen
                </button>
              </div>
              <p className="text-xs text-ink/45 text-center">Eine Bestätigungs-E-Mail mit allen Informationen wurde an {submittedEmail} gesendet.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Karriere;
