import React, { useState } from 'react';
import { Mail, MapPin, Send, Clock, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

const Kontakt = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', company: '', phone: '', subject: '', message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success('Nachricht gesendet!', { description: 'Wir melden uns in Kürze bei Ihnen.' });
      setFormData({ name: '', email: '', company: '', phone: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1200);
  };

  const inputClass = 'w-full px-4 py-3 border border-brand-100 rounded-xl bg-white text-ink focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-colors';

  return (
    <div className="bg-white font-body text-ink/70">
      {/* Hero */}
      <section className="relative bg-ink text-white overflow-hidden">
        <div className="absolute inset-0 more-grid-bg opacity-40" />
        <div className="pointer-events-none absolute -top-24 right-1/4 w-[440px] h-[440px] bg-brand-600/30 blur-[130px] rounded-full" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-24 md:py-28">
          <div className="max-w-3xl">
            <p className="text-brand-200 font-semibold mb-4">Kontakt</p>
            <h1 className="font-heading text-5xl md:text-6xl font-bold leading-[1.05] mb-6">Lassen Sie uns <span className="more-gradient-text">sprechen.</span></h1>
            <p className="text-lg text-white/60">Haben Sie ein Projekt oder eine Frage? Wir freuen uns auf Ihre Nachricht.</p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-5 gap-14">
          {/* Form */}
          <div className="lg:col-span-3">
            <h2 className="font-heading text-2xl font-bold text-ink mb-8">Nachricht senden</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Name *</label>
                  <input name="name" value={formData.name} onChange={handleChange} required placeholder="Max Mustermann" className={inputClass} data-testid="contact-name" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">E-Mail *</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="ihre@email.de" className={inputClass} data-testid="contact-email" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Unternehmen</label>
                  <input name="company" value={formData.company} onChange={handleChange} placeholder="Ihr Unternehmen" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Telefon</label>
                  <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+49 ..." className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Betreff *</label>
                <input name="subject" value={formData.subject} onChange={handleChange} required placeholder="Worum geht es?" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Nachricht *</label>
                <textarea name="message" value={formData.message} onChange={handleChange} required rows={5} placeholder="Erzählen Sie uns von Ihrem Vorhaben ..." className={inputClass} />
              </div>
              <button type="submit" disabled={isSubmitting} data-testid="contact-submit" className="inline-flex items-center justify-center gap-2 h-13 px-8 py-3.5 bg-ink hover:bg-brand-600 text-white font-semibold rounded-full transition-colors disabled:opacity-60">
                {isSubmitting ? 'Wird gesendet...' : (<>Nachricht senden <Send size={17} /></>)}
              </button>
            </form>
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-5">
            <a href="mailto:info@more-applications.de" className="flex items-start gap-4 rounded-2xl border border-brand-100 p-6 hover:border-brand-300 transition-colors group" data-testid="contact-email-link">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center group-hover:bg-brand-600 transition-colors"><Mail className="text-brand-600 group-hover:text-white transition-colors" size={22} /></div>
              <div>
                <p className="font-heading font-bold text-ink">E-Mail</p>
                <p className="text-sm text-ink/60 mt-1">info@more-applications.de</p>
              </div>
            </a>
            <div className="flex items-start gap-4 rounded-2xl border border-brand-100 p-6">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center"><MapPin className="text-brand-600" size={22} /></div>
              <div>
                <p className="font-heading font-bold text-ink">Adresse</p>
                <p className="text-sm text-ink/60 mt-1">Heinrich-Hertz-Str. 133<br />22083 Hamburg, Deutschland</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-brand-100 p-6">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center"><Clock className="text-brand-600" size={22} /></div>
              <div>
                <p className="font-heading font-bold text-ink">Reaktionszeit</p>
                <p className="text-sm text-ink/60 mt-1">Wir antworten in der Regel innerhalb von 24 Stunden.</p>
              </div>
            </div>
            <div className="rounded-2xl bg-ink text-white p-6 relative overflow-hidden">
              <div className="absolute inset-0 more-grid-bg opacity-30" />
              <div className="relative">
                <p className="font-heading font-bold text-lg mb-2">Sie möchten bei uns arbeiten?</p>
                <p className="text-white/60 text-sm mb-4">Schauen Sie sich unsere offenen Stellen an.</p>
                <a href="/karriere" className="inline-flex items-center gap-1.5 text-brand-300 font-semibold hover:text-white transition-colors">Zur Karriereseite <ArrowUpRight size={15} /></a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Kontakt;
