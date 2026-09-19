import React from 'react';
import { Link } from 'react-router-dom';
import { Target, ShieldCheck, TrendingUp, Users, Award, ArrowRight } from 'lucide-react';

const TEAM_IMG = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMG1lZXRpbmd8ZW58MHx8fHwxNzg3NDAwODQ4fDA&ixlib=rb-4.1.0&q=85';

const Unternehmen = () => {
  const values = [
    { icon: Target, title: 'Präzision', desc: 'Höchste Genauigkeit in jedem Testschritt.' },
    { icon: ShieldCheck, title: 'Zuverlässigkeit', desc: 'Konsistente, nachvollziehbare Ergebnisse.' },
    { icon: TrendingUp, title: 'Sorgfalt', desc: 'Gründliche Arbeit statt schneller Kompromisse.' },
    { icon: Users, title: 'Partnerschaft', desc: 'Langfristige, verlässliche Zusammenarbeit.' },
  ];

  const milestones = [
    { year: '2024', event: 'Gründung von Tdata Testing' },
    { year: '2025', event: 'Aufbau eines Teams von über 10 Testexperten' },
    { year: '2026', event: 'Mehr als 25 Testexperten und 500+ geprüfte Anwendungen' },
  ];

  return (
    <div className="min-h-screen bg-white font-body text-[#556655]">
      {/* Hero */}
      <section className="bg-[#F4F8F4] border-b border-[#DDE8DD]">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-sage-700 font-semibold mb-3">Über uns</div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#223322] leading-tight mb-6">
                Deutsche Gründlichkeit in der Qualitätssicherung
              </h1>
              <p className="text-lg leading-relaxed mb-8">
                Seit 2024 steht Tdata Testing für sorgfältiges, strukturiertes
                Application Testing. Unser Team aus zertifizierten Experten prüft
                Software mit einem klaren Ziel: verlässliche Qualität.
              </p>
              <div className="flex flex-wrap gap-10">
                {[
                  { v: '2+', l: 'Jahre Erfahrung' },
                  { v: '100+', l: 'Projekte' },
                  { v: '25+', l: 'Experten' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="font-heading text-3xl font-bold text-sage-600">{s.v}</div>
                    <div className="text-sm">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-[#DDE8DD] bg-white p-2 rounded-sm">
              <img src={TEAM_IMG} alt="Team" className="w-full h-[400px] object-cover rounded-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border-l-4 border-sage-500 pl-8 py-2">
              <div className="text-sage-700 font-semibold mb-3">Mission</div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#223322] mb-4">
                Qualität nachvollziehbar machen
              </h2>
              <p className="text-lg leading-relaxed">
                Wir sind überzeugt, dass gute Software auf sorgfältiger Prüfung
                beruht. Durch strukturierte Testing-Prozesse stellen wir sicher,
                dass Anwendungen zuverlässig funktionieren und Vertrauen schaffen.
              </p>
            </div>
            <div className="border-l-4 border-sage-300 pl-8 py-2">
              <div className="text-sage-700 font-semibold mb-3">Vision</div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-[#223322] mb-4">
                Ein verlässlicher Standard für Softwarequalität
              </h2>
              <p className="text-lg leading-relaxed">
                Mit Fachwissen, Sorgfalt und einem klaren Vorgehen möchten wir zu
                einem festen Partner für Unternehmen werden, die auf geprüfte
                Qualität setzen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-[#F4F8F4] border-y border-[#DDE8DD]">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="max-w-2xl mb-12">
            <div className="text-sage-700 font-semibold mb-3">Werte</div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#223322]">Was uns leitet</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <div key={i} className="bg-white border border-[#DDE8DD] p-8 rounded-sm hover:border-sage-400 transition-colors duration-150">
                  <div className="w-12 h-12 bg-sage-50 border border-sage-200 rounded-sm flex items-center justify-center mb-5">
                    <Icon className="text-sage-600" size={24} strokeWidth={1.75} />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[#223322] mb-2">{value.title}</h3>
                  <p>{value.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="max-w-2xl mb-12">
            <div className="text-sage-700 font-semibold mb-3">Geschichte</div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-[#223322]">Unsere Meilensteine</h2>
          </div>
          <div className="space-y-6">
            {milestones.map((item, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8 border-b border-[#DDE8DD] pb-6">
                <div className="font-heading text-2xl font-bold text-sage-600 w-24 flex-shrink-0">{item.year}</div>
                <p className="text-lg">{item.event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications band */}
      <section className="py-16 bg-[#F4F8F4] border-y border-[#DDE8DD]">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Award, t: 'Zertifizierte Tester', d: 'Anerkannte Qualifikationen im gesamten Team.' },
            { icon: Users, t: 'Erfahrenes Team', d: 'Langjährige Praxis in der Qualitätssicherung.' },
            { icon: TrendingUp, t: 'Laufende Weiterbildung', d: 'Aktuelles Wissen zu Testing-Methoden.' },
          ].map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="flex items-start gap-4">
                <Icon className="text-sage-600 flex-shrink-0" size={32} strokeWidth={1.5} />
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#223322] mb-1">{c.t}</h3>
                  <p className="text-sm">{c.d}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-sage-800">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">Teil unseres Teams werden?</h2>
          <p className="text-lg text-[#C7DBC7] mb-8">
            Wir suchen zuverlässige Testerinnen und Tester, die Sorgfalt schätzen.
          </p>
          <Link to="/karriere" data-testid="about-careers-cta" className="inline-flex items-center gap-2 h-12 px-8 bg-white text-sage-800 font-semibold rounded-sm hover:bg-sage-50 transition-colors">
            Offene Stellen <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Unternehmen;
