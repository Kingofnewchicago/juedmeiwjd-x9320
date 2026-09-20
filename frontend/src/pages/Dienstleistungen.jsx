import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Smartphone, Cloud, Palette, Boxes, LineChart, ArrowUpRight, Check } from 'lucide-react';

const services = [
  { icon: Code2, title: 'Web-Applikationen', desc: 'Individuelle Web-Apps, Portale und SaaS-Produkte – performant, sicher und wartbar.', points: ['React & Next.js', 'Dashboards & Portale', 'SaaS-Plattformen'] },
  { icon: Smartphone, title: 'Mobile Apps', desc: 'Native und plattformübergreifende Apps mit exzellenter User Experience.', points: ['iOS & Android', 'Flutter / React Native', 'App-Store Deployment'] },
  { icon: Cloud, title: 'Cloud & Backend', desc: 'Skalierbare Architekturen, APIs und Infrastruktur, die mitwachsen.', points: ['REST & GraphQL APIs', 'Microservices', 'AWS / GCP / Azure'] },
  { icon: Palette, title: 'UI/UX Design', desc: 'Nutzerzentriertes Design von der Recherche bis zum fertigen Interface.', points: ['User Research', 'Prototyping', 'Design Systeme'] },
  { icon: Boxes, title: 'MVP & Produkt', desc: 'Von der Idee zum marktreifen Produkt – schnell, fokussiert, validiert.', points: ['Product Discovery', 'Rapid Prototyping', 'Go-to-Market'] },
  { icon: LineChart, title: 'Wartung & Scale', desc: 'Betrieb, Monitoring und Weiterentwicklung bestehender Anwendungen.', points: ['Monitoring & Support', 'Performance-Optimierung', 'Feature-Entwicklung'] },
];

const Dienstleistungen = () => {
  return (
    <div className="bg-white font-body text-ink/70">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-orange-50 via-white to-white text-ink overflow-hidden border-b border-orange-100">
        <div className="absolute inset-0 more-grid-bg opacity-40" />
        <div className="pointer-events-none absolute -top-24 left-1/3 w-[480px] h-[480px] bg-brand-600/25 blur-[130px] rounded-full" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-24 md:py-28">
          <div className="max-w-3xl">
            <p className="text-orange-600 font-semibold mb-4">Leistungen</p>
            <h1 className="font-heading text-5xl md:text-6xl font-bold leading-[1.05] mb-6">Alles für Ihr <span className="more-gradient-text">digitales Produkt.</span></h1>
            <p className="text-lg text-ink/60 leading-relaxed">Ein vollständiges Spektrum moderner Software-Entwicklung – abgestimmt auf Ihre Ziele, Ihr Budget und Ihre Nutzer.</p>
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
                <div key={s.title} className="group rounded-2xl border border-brand-100 bg-white p-8 hover:border-brand-300 hover:shadow-[0_20px_50px_-20px_rgba(79,70,229,0.35)] transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-6 group-hover:bg-brand-600 transition-colors">
                    <Icon className="text-brand-600 group-hover:text-white transition-colors" size={26} />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-ink mb-3">{s.title}</h3>
                  <p className="text-sm text-ink/60 leading-relaxed mb-5">{s.desc}</p>
                  <ul className="space-y-2">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-ink/70"><Check size={15} className="text-brand-600" /> {p}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech band */}
      <section className="py-16 bg-brand-50/50 border-y border-brand-100">
        <div className="max-w-7xl mx-auto px-6 md:px-8 text-center">
          <p className="text-brand-600 font-semibold mb-6">Unser Tech-Stack</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['React','Next.js','TypeScript','Node.js','Python','Flutter','PostgreSQL','MongoDB','AWS','Docker','GraphQL','Tailwind'].map((t) => (
              <span key={t} className="px-4 py-2 rounded-full bg-white border border-brand-100 text-sm font-semibold text-ink/70">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-ink mb-5">Nicht sicher, wo Sie anfangen sollen?</h2>
          <p className="text-lg text-ink/60 mb-9">Lassen Sie uns gemeinsam herausfinden, welche Lösung zu Ihrem Vorhaben passt.</p>
          <Link to="/kontakt" className="inline-flex items-center gap-2 h-13 px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-colors">
            Kostenlos beraten lassen <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Dienstleistungen;
