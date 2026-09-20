import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Gauge, Smartphone, Users, Cpu, ShieldCheck, ArrowUpRight, Check } from 'lucide-react';

const services = [
  { icon: ClipboardCheck, title: 'Funktionales Testing', desc: 'Strukturierte Prüfung aller Funktionen gegen die Spezifikation.', points: ['Testfall-Design', 'Regressionstests', 'Fehler-Reporting'] },
  { icon: Gauge, title: 'Performance- & Lasttests', desc: 'Wir prüfen Stabilität und Geschwindigkeit unter realer Last.', points: ['Last- & Stresstests', 'Antwortzeiten-Analyse', 'Skalierbarkeit'] },
  { icon: Smartphone, title: 'Mobile App Testing', desc: 'Tests Ihrer iOS- und Android-Apps auf echten Geräten.', points: ['iOS & Android', 'Echte Geräte', 'Store-Vorabprüfung'] },
  { icon: Users, title: 'Usability-/UX-Testing', desc: 'Wir bewerten die Nutzerführung aus Sicht Ihrer Kunden.', points: ['User-Journey-Tests', 'Accessibility', 'Optimierungs-Empfehlungen'] },
  { icon: Cpu, title: 'Testautomatisierung', desc: 'Automatisierte Tests für schnelle, wiederholbare Qualitätssicherung.', points: ['Selenium / Cypress / Playwright', 'CI/CD-Integration', 'Automatisierte Regression'] },
  { icon: ShieldCheck, title: 'Security- & API-Testing', desc: 'Prüfung von Schnittstellen und Schwachstellen Ihrer Anwendung.', points: ['API-Tests', 'Schwachstellenanalyse', 'Ident-Verfahren-Testing'] },
];

const Dienstleistungen = () => {
  return (
    <div className="bg-white font-body text-ink/70">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-orange-50 via-white to-white overflow-hidden border-b border-orange-100">
        <div className="absolute inset-0 more-grid-bg opacity-60" />
        <div className="pointer-events-none absolute -top-24 left-1/3 w-[480px] h-[480px] bg-orange-200/40 blur-[130px] rounded-full" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-24 md:py-28">
          <div className="max-w-3xl">
            <p className="text-orange-600 font-semibold mb-4">Leistungen</p>
            <h1 className="font-heading text-5xl md:text-6xl font-bold leading-[1.05] mb-6 text-ink">Software-Tests, die <span className="more-gradient-text">Sicherheit geben.</span></h1>
            <p className="text-lg text-ink/60 leading-relaxed">Ein vollständiges Spektrum professioneller Qualitätssicherung – abgestimmt auf Ihre Anwendung, Ihr Budget und Ihre Nutzer.</p>
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="group rounded-2xl border border-orange-100 bg-white p-8 hover:border-orange-300 hover:shadow-[0_20px_50px_-20px_rgba(249,115,22,0.35)] transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors">
                    <Icon className="text-orange-600 group-hover:text-white transition-colors" size={26} />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-ink mb-3">{s.title}</h3>
                  <p className="text-sm text-ink/60 leading-relaxed mb-5">{s.desc}</p>
                  <ul className="space-y-2">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-ink/70"><Check size={15} className="text-orange-600" /> {p}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech band */}
      <section className="py-16 bg-orange-50/60 border-y border-orange-100">
        <div className="max-w-7xl mx-auto px-6 md:px-8 text-center">
          <p className="text-orange-600 font-semibold mb-6">Unsere Test-Tools</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Selenium','Cypress','Playwright','Appium','JMeter','Postman','TestRail','Jira','BrowserStack','Charles','Git','Figma'].map((t) => (
              <span key={t} className="px-4 py-2 rounded-full bg-white border border-orange-100 text-sm font-semibold text-ink/70">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-ink mb-5">Nicht sicher, was Sie brauchen?</h2>
          <p className="text-lg text-ink/60 mb-9">Lassen Sie uns gemeinsam herausfinden, welche Tests zu Ihrer Anwendung passen.</p>
          <Link to="/kontakt" className="inline-flex items-center gap-2 h-13 px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-colors shadow-lg shadow-orange-500/25">
            Kostenlos beraten lassen <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Dienstleistungen;
