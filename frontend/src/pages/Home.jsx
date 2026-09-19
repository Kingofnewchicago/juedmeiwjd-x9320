import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Gauge, Users, Workflow, Check, ArrowRight } from 'lucide-react';

const HERO_IMG = 'https://images.unsplash.com/photo-1624213012413-fda54df1810f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MTN8MHwxfHNlYXJjaHwyfHxjb3Jwb3JhdGUlMjBvZmZpY2UlMjBidWlsZGluZyUyMGFyY2hpdGVjdHVyZXxlbnwwfHx8fDE3ODc0MDA4NDh8MA&ixlib=rb-4.1.0&q=85';

const services = [
  { icon: ShieldCheck, title: 'Funktionales Testing', desc: 'Sorgfältige Prüfung aller Funktionen – jeder Ablauf, jede Eingabe, jedes Ergebnis wird nachvollziehbar dokumentiert.' },
  { icon: Gauge, title: 'Performance Testing', desc: 'Belastungs- und Stabilitätstests, damit Ihre Anwendung auch unter hoher Last zuverlässig arbeitet.' },
  { icon: Users, title: 'Usability Testing', desc: 'Bewertung der Benutzerfreundlichkeit durch strukturierte Tests aus Sicht Ihrer Anwender.' },
  { icon: Workflow, title: 'Testautomatisierung', desc: 'Wiederholbare, automatisierte Testabläufe für dauerhaft gleichbleibende Qualität.' },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-white font-body text-[#556655]">
      {/* Hero */}
      <section className="bg-[#F4F8F4] border-b border-[#DDE8DD]">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="tdata-reveal">
              <div className="inline-block mb-6 px-3 py-1 border border-sage-300 bg-white text-sage-700 text-sm font-semibold rounded-sm">
                Qualitätssicherung aus Deutschland
              </div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#223322] leading-tight mb-6">
                Software, auf die man sich verlassen kann.
              </h1>
              <p className="text-lg leading-relaxed mb-8 max-w-xl">
                Tdata Testing prüft Ihre Anwendungen mit Sorgfalt und Struktur.
                Wir finden Fehler, bevor Ihre Nutzer es tun – zuverlässig,
                gründlich und transparent dokumentiert.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/kontakt"
                  data-testid="hero-cta-primary"
                  className="inline-flex items-center gap-2 h-12 px-7 bg-sage-600 text-white font-semibold rounded-sm hover:bg-sage-700 transition-colors duration-150"
                >
                  Projekt anfragen <ArrowRight size={18} />
                </Link>
                <Link
                  to="/dienstleistungen"
                  data-testid="hero-cta-secondary"
                  className="inline-flex items-center h-12 px-7 border border-sage-400 text-sage-700 font-semibold rounded-sm hover:bg-sage-50 transition-colors duration-150"
                >
                  Unsere Leistungen
                </Link>
              </div>
            </div>
            <div className="tdata-reveal">
              <div className="border border-[#DDE8DD] bg-white p-2 rounded-sm">
                <img src={HERO_IMG} alt="Tdata Testing Büro" className="w-full h-[360px] object-cover rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust stats */}
      <section className="border-b border-[#DDE8DD]">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { v: '500+', l: 'Geprüfte Anwendungen' },
              { v: '98 %', l: 'Erfolgsquote' },
              { v: '24 Std.', l: 'Reaktionszeit' },
              { v: '25+', l: 'Testexperten' },
            ].map((s, i) => (
              <div key={i} className="text-center md:text-left">
                <div className="font-heading text-3xl md:text-4xl font-bold text-sage-600">{s.v}</div>
                <div className="mt-1 text-sm">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#223322] mb-4">Unsere Leistungen</h2>
            <p className="text-lg">
              Ein vollständiges Spektrum professioneller Qualitätssicherung –
              abgestimmt auf die Anforderungen Ihres Projekts.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white border border-[#DDE8DD] p-8 rounded-sm hover:border-sage-400 transition-colors duration-150" data-testid={`service-card-${i}`}>
                  <div className="w-12 h-12 bg-sage-50 border border-sage-200 rounded-sm flex items-center justify-center mb-5">
                    <Icon className="text-sage-600" size={24} strokeWidth={1.75} />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-[#223322] mb-3">{s.title}</h3>
                  <p className="leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-16 md:py-24 bg-[#F4F8F4] border-y border-[#DDE8DD]">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#223322] mb-6">Warum Tdata Testing</h2>
              <p className="text-lg mb-8 max-w-lg">
                Wir verbinden deutsche Gründlichkeit mit einem klaren, strukturierten
                Vorgehen. Unser Anspruch ist eine Qualitätssicherung, die
                nachvollziehbar und verlässlich ist.
              </p>
              <ul className="space-y-5">
                {[
                  { t: 'Sorgfältig dokumentiert', d: 'Jeder Test wird transparent festgehalten.' },
                  { t: '100 % Remote', d: 'Flexibel und ortsunabhängig für Ihr Team.' },
                  { t: 'Zertifizierte Tester', d: 'Erfahrene Fachkräfte mit anerkannten Qualifikationen.' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 flex-shrink-0 bg-sage-600 rounded-sm flex items-center justify-center">
                      <Check size={18} className="text-white" />
                    </div>
                    <div>
                      <div className="font-heading font-bold text-[#223322]">{item.t}</div>
                      <div className="text-sm">{item.d}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <Link to="/unternehmen" className="mt-8 inline-flex items-center gap-2 text-sage-700 font-semibold hover:gap-3 transition-all" data-testid="home-about-link">
                Mehr über uns <ArrowRight size={18} />
              </Link>
            </div>
            <div className="border border-[#DDE8DD] bg-white p-2 rounded-sm">
              <img
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMG1lZXRpbmd8ZW58MHx8fHwxNzg3NDAwODQ4fDA&ixlib=rb-4.1.0&q=85"
                alt="Team bei der Arbeit"
                className="w-full h-[380px] object-cover rounded-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-sage-800">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">Sprechen wir über Ihr Projekt</h2>
          <p className="text-lg text-[#C7DBC7] mb-8 max-w-2xl mx-auto">
            Kontaktieren Sie uns für eine unverbindliche Erstberatung. Wir
            analysieren Ihre Anforderungen und schlagen ein passendes Vorgehen vor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/kontakt" data-testid="cta-contact" className="inline-flex items-center justify-center h-12 px-8 bg-white text-sage-800 font-semibold rounded-sm hover:bg-sage-50 transition-colors">
              Kontakt aufnehmen
            </Link>
            <Link to="/karriere" data-testid="cta-careers" className="inline-flex items-center justify-center h-12 px-8 border border-white/40 text-white font-semibold rounded-sm hover:bg-white/10 transition-colors">
              Karriere bei uns
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
