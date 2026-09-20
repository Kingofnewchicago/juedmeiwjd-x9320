import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Code2, Smartphone, Cloud, Palette,
  Check, Search, PenTool, Rocket, Zap, Star,
} from 'lucide-react';

const HERO_IMG = 'https://images.pexels.com/photos/31177056/pexels-photo-31177056.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';

const services = [
  { icon: Code2, title: 'Web-Applikationen', desc: 'Performante Web-Apps und Portale mit React, Next.js und modernen APIs.' },
  { icon: Smartphone, title: 'Mobile Apps', desc: 'Native und plattformübergreifende Apps für iOS und Android.' },
  { icon: Cloud, title: 'Cloud & APIs', desc: 'Skalierbare Backends, Microservices und Cloud-Infrastruktur.' },
  { icon: Palette, title: 'UI/UX Design', desc: 'Durchdachte Interfaces, die Nutzer lieben und Ziele erreichen.' },
];

const steps = [
  { icon: Search, title: 'Discovery', desc: 'Wir verstehen Ihr Produkt, Ihre Nutzer und Ihre Ziele.' },
  { icon: PenTool, title: 'Design', desc: 'Prototypen und UI-Design, die vor dem ersten Code überzeugen.' },
  { icon: Code2, title: 'Development', desc: 'Sauberer Code in kurzen, transparenten Iterationen.' },
  { icon: Rocket, title: 'Launch & Scale', desc: 'Deployment, Monitoring und kontinuierliche Weiterentwicklung.' },
];

const Home = () => {
  return (
    <div className="bg-white font-body text-ink/70">
      {/* HERO */}
      <section className="relative bg-gradient-to-b from-orange-50 via-white to-white overflow-hidden border-b border-orange-100">
        <div className="absolute inset-0 more-grid-bg opacity-60" />
        <div className="pointer-events-none absolute -top-32 -left-24 w-[520px] h-[520px] bg-orange-200/40 blur-[130px] rounded-full" />
        <div className="pointer-events-none absolute top-24 right-0 w-[420px] h-[420px] bg-amber-200/40 blur-[130px] rounded-full" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-8 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="grid lg:grid-cols-12 gap-14 items-center">
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-1.5 text-xs font-semibold tracking-wide text-orange-600 mb-7 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                Software-Studio aus Hamburg
              </div>
              <h1 className="font-heading text-5xl md:text-6xl xl:text-7xl font-bold leading-[1.02] tracking-tight mb-6 text-ink">
                Wir bauen Software,<br />die <span className="more-gradient-text">mehr bewegt.</span>
              </h1>
              <p className="text-lg text-ink/60 leading-relaxed max-w-xl mb-9">
                MORE Applications entwickelt Web- und Mobile-Applikationen – von der
                ersten Idee bis zum skalierbaren Produkt. Durchdacht, zuverlässig
                und termintreu.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/kontakt" className="inline-flex items-center gap-2 h-13 px-7 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-colors shadow-lg shadow-orange-500/25">
                  Projekt anfragen <ArrowUpRight size={18} />
                </Link>
                <Link to="/dienstleistungen" className="inline-flex items-center gap-2 h-13 px-7 py-3.5 border border-orange-200 hover:bg-orange-50 text-ink font-semibold rounded-full transition-colors">
                  Unsere Leistungen
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-tr from-orange-300/50 to-amber-200/50 blur-2xl rounded-3xl" />
                <div className="relative rounded-2xl overflow-hidden border border-orange-100 shadow-2xl">
                  <img src={HERO_IMG} alt="Software Entwicklung bei MORE Applications" className="w-full h-[380px] object-cover" />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white text-ink rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3 animate-more-float border border-orange-100">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center"><Zap className="text-orange-600" size={20} /></div>
                  <div>
                    <p className="font-heading font-bold text-lg leading-none">120+</p>
                    <p className="text-xs text-ink/50 mt-1">Projekte ausgeliefert</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[['120+','Projekte'],['15+','Entwickler & Designer'],['98%','Weiterempfehlung'],['24 Std.','Reaktionszeit']].map(([n,l]) => (
            <div key={l}>
              <p className="font-heading text-4xl font-bold text-orange-600">{n}</p>
              <p className="text-sm text-ink/55 mt-1">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="max-w-2xl mb-14">
            <p className="text-orange-600 font-semibold mb-3">Was wir tun</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-ink mb-4">Ein Team. Ihr komplettes Produkt.</h2>
            <p className="text-lg text-ink/60">Von Strategie über Design bis zur Entwicklung – alles aus einer Hand.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="group rounded-2xl border border-orange-100 bg-white p-7 hover:border-orange-300 hover:shadow-[0_20px_50px_-20px_rgba(249,115,22,0.35)] transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors">
                    <Icon className="text-orange-600 group-hover:text-white transition-colors" size={24} />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-ink mb-2">{s.title}</h3>
                  <p className="text-sm text-ink/60 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-20 md:py-28 bg-orange-50/60 border-y border-orange-100">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="max-w-2xl mb-14">
            <p className="text-orange-600 font-semibold mb-3">Unser Prozess</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-ink mb-4">Klar, transparent, in Iterationen.</h2>
            <p className="text-lg text-ink/60">Sie wissen jederzeit, woran wir arbeiten – und warum.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="relative rounded-2xl bg-white border border-orange-100 p-7">
                  <span className="font-heading text-5xl font-bold text-orange-100 absolute top-4 right-5">{i + 1}</span>
                  <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center mb-5"><Icon className="text-white" size={22} /></div>
                  <h3 className="font-heading text-lg font-bold text-ink mb-2">{s.title}</h3>
                  <p className="text-sm text-ink/60 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-orange-600 font-semibold mb-3">Warum MORE Applications</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-ink mb-6">Technologie, die Ihr Geschäft voranbringt.</h2>
            <p className="text-lg text-ink/60 mb-8">Wir denken nicht in Features, sondern in Ergebnissen. Jede Zeile Code dient einem klaren Ziel.</p>
            <ul className="space-y-4">
              {[
                ['Moderner Tech-Stack','React, Next.js, Node, Python, Flutter & Cloud-native.'],
                ['Feste Ansprechpartner','Ein Team, das Ihr Produkt wirklich kennt.'],
                ['Qualität & Sicherheit','Automatisierte Tests und saubere Architektur inklusive.'],
              ].map(([t,d]) => (
                <li key={t} className="flex gap-4">
                  <div className="mt-0.5 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0"><Check size={14} className="text-orange-700" /></div>
                  <div><span className="font-semibold text-ink">{t}</span> <span className="text-ink/60">— {d}</span></div>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-orange-200/60 to-amber-200/50 blur-2xl rounded-3xl" />
            <img src="https://images.pexels.com/photos/13620263/pexels-photo-13620263.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Moderner Arbeitsplatz" className="relative rounded-2xl border border-orange-100 shadow-xl w-full h-[420px] object-cover" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 text-white px-8 py-16 md:px-16 md:py-20">
            <div className="pointer-events-none absolute -bottom-24 right-0 w-[420px] h-[420px] bg-white/15 blur-[120px] rounded-full" />
            <div className="pointer-events-none absolute -top-20 -left-10 w-[300px] h-[300px] bg-amber-300/30 blur-[100px] rounded-full" />
            <div className="relative max-w-2xl">
              <div className="flex gap-1 mb-5 text-amber-200">{[...Array(5)].map((_,i)=>(<Star key={i} size={18} fill="currentColor" />))}</div>
              <h2 className="font-heading text-4xl md:text-5xl font-bold mb-5">Bereit, etwas zu bauen?</h2>
              <p className="text-lg text-white/80 mb-9">Erzählen Sie uns von Ihrem Vorhaben. Wir antworten innerhalb von 24 Stunden mit einer ersten Einschätzung.</p>
              <Link to="/kontakt" className="inline-flex items-center gap-2 h-13 px-8 py-3.5 bg-white text-orange-600 hover:bg-orange-50 font-semibold rounded-full transition-colors">
                Kostenloses Erstgespräch <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
