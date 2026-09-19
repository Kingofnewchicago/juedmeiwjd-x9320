import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Gauge, Users, Workflow, Smartphone, Monitor, Globe, ArrowRight, Check } from 'lucide-react';

const SERVICE_IMG = 'https://images.unsplash.com/photo-1560264280-88b68371db39?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzV8MHwxfHNlYXJjaHwzfHxzb2Z0d2FyZSUyMHRlc3RpbmclMjBvZmZpY2V8ZW58MHx8fHwxNzg3NDAwODQ4fDA&ixlib=rb-4.1.0&q=85';

const Dienstleistungen = () => {
  const services = [
    { icon: ShieldCheck, title: 'Funktionales Testing', description: 'Umfassende Überprüfung aller Funktionen Ihrer Anwendung – jeder Ablauf und jede Eingabe wird sorgfältig geprüft.', features: ['Unit Testing', 'Integrationstests', 'End-to-End Testing', 'Regressionstests'] },
    { icon: Gauge, title: 'Performance Testing', description: 'Analyse von Geschwindigkeit, Stabilität und Skalierbarkeit – damit Ihre Anwendung auch unter Last zuverlässig bleibt.', features: ['Lasttests', 'Stresstests', 'Antwortzeit-Analyse', 'Ressourcen-Monitoring'] },
    { icon: Users, title: 'Usability Testing', description: 'Bewertung der Benutzerfreundlichkeit aus Sicht Ihrer Anwender – für eine klare und verständliche Bedienung.', features: ['UX-Analyse', 'A/B-Tests', 'Barrierefreiheit', 'Interface-Review'] },
    { icon: Workflow, title: 'Testautomatisierung', description: 'Wiederholbare, automatisierte Testabläufe für dauerhaft gleichbleibende Qualität und schnelle Rückmeldungen.', features: ['Selenium', 'Cypress', 'Appium', 'CI/CD-Integration'] },
  ];

  const platforms = [
    { icon: Smartphone, title: 'Mobile Apps', desc: 'iOS & Android' },
    { icon: Monitor, title: 'Web-Anwendungen', desc: 'Browser & Desktop' },
    { icon: Globe, title: 'Cloud-Anwendungen', desc: 'SaaS & API' },
  ];

  const process = [
    { step: '01', title: 'Analyse', desc: 'Anforderungen verstehen' },
    { step: '02', title: 'Strategie', desc: 'Testplan erstellen' },
    { step: '03', title: 'Durchführung', desc: 'Tests durchführen' },
    { step: '04', title: 'Bericht', desc: 'Ergebnisse dokumentieren' },
  ];

  return (
    <div className="min-h-screen bg-white font-body text-[#556655]">
      {/* Hero */}
      <section className="bg-[#F4F8F4] border-b border-[#DDE8DD]">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-xl">
              <div className="text-sage-700 font-semibold mb-3">Leistungen</div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#223322] leading-tight mb-6">
                Testing-Leistungen, die überzeugen
              </h1>
              <p className="text-lg leading-relaxed">
                Von funktionalen Tests bis zur Performance-Optimierung – wir bieten
                das komplette Spektrum professioneller Qualitätssicherung,
                zugeschnitten auf Ihr Projekt.
              </p>
            </div>
            <div className="border border-[#DDE8DD] bg-white p-2 rounded-sm">
              <img src={SERVICE_IMG} alt="Software Testing" className="w-full h-[340px] object-cover rounded-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <div key={i} className="bg-white border border-[#DDE8DD] p-8 rounded-sm hover:border-sage-400 transition-colors duration-150">
                  <div className="w-12 h-12 bg-sage-50 border border-sage-200 rounded-sm flex items-center justify-center mb-5">
                    <Icon className="text-sage-600" size={24} strokeWidth={1.75} />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-[#223322] mb-3">{service.title}</h3>
                  <p className="mb-5 leading-relaxed">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check size={16} className="text-sage-600 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-16 md:py-24 bg-[#F4F8F4] border-y border-[#DDE8DD]">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="max-w-2xl mb-12">
            <div className="text-sage-700 font-semibold mb-3">Plattformen</div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#223322]">Alle Plattformen, ein Partner</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {platforms.map((platform, i) => {
              const Icon = platform.icon;
              return (
                <div key={i} className="bg-white border border-[#DDE8DD] p-8 rounded-sm text-center">
                  <div className="w-14 h-14 bg-sage-50 border border-sage-200 rounded-sm flex items-center justify-center mx-auto mb-5">
                    <Icon className="text-sage-600" size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[#223322] mb-1">{platform.title}</h3>
                  <p>{platform.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="max-w-2xl mb-12">
            <div className="text-sage-700 font-semibold mb-3">Vorgehen</div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#223322]">Strukturiert zum Ergebnis</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((item, i) => (
              <div key={i} className="border-t-2 border-sage-500 pt-5">
                <div className="font-heading text-3xl font-bold text-sage-600 mb-2">{item.step}</div>
                <h3 className="font-heading text-lg font-bold text-[#223322] mb-1">{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-sage-800">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">Projekt besprechen?</h2>
          <p className="text-lg text-[#C7DBC7] mb-8">
            Gemeinsam entwickeln wir die passende Testing-Strategie für Ihr Vorhaben.
          </p>
          <Link to="/kontakt" data-testid="services-contact-cta" className="inline-flex items-center gap-2 h-12 px-8 bg-white text-sage-800 font-semibold rounded-sm hover:bg-sage-50 transition-colors">
            Kontakt aufnehmen <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Dienstleistungen;
