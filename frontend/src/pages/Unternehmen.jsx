import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Heart, Lightbulb, Handshake, ArrowUpRight, MapPin } from 'lucide-react';

const values = [
  { icon: Target, title: 'Gründlich', desc: 'Wir prüfen sorgfältig und übersehen keine Details.' },
  { icon: Lightbulb, title: 'Neugierig', desc: 'Wir bleiben am Puls neuer Test-Methoden und Tools.' },
  { icon: Handshake, title: 'Partnerschaftlich', desc: 'Offen, ehrlich und auf Augenhöhe – langfristig gedacht.' },
  { icon: Heart, title: 'Mit Sorgfalt', desc: 'Jeder Testbericht ist nachvollziehbar und verlässlich.' },
];

const Unternehmen = () => {
  return (
    <div className="bg-white font-body text-ink/70">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-orange-50 via-white to-white overflow-hidden border-b border-orange-100">
        <div className="absolute inset-0 more-grid-bg opacity-60" />
        <div className="pointer-events-none absolute -top-24 right-10 w-[460px] h-[460px] bg-orange-200/40 blur-[130px] rounded-full" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-24 md:py-28">
          <div className="max-w-3xl">
            <p className="text-orange-600 font-semibold mb-4">Unternehmen</p>
            <h1 className="font-heading text-5xl md:text-6xl font-bold leading-[1.05] mb-6 text-ink">
              Ihr Partner für <span className="more-gradient-text">Softwarequalität.</span>
            </h1>
            <p className="text-lg text-ink/60 leading-relaxed">
              MORE Applications GmbH ist eine Application-Testing-Agentur aus Hamburg.
              Wir prüfen Web- und Mobile-Anwendungen auf Funktion, Performance und
              Benutzerfreundlichkeit – damit Ihre Software hält, was sie verspricht.
            </p>
          </div>
        </div>
      </section>

      {/* Story + image */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -inset-4 bg-gradient-to-tr from-orange-200/60 to-amber-200/50 blur-2xl rounded-3xl" />
            <img src="https://images.pexels.com/photos/7988742/pexels-photo-7988742.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Team von MORE Applications" className="relative rounded-2xl border border-orange-100 shadow-xl w-full h-[440px] object-cover" />
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-orange-600 font-semibold mb-3">Unsere Geschichte</p>
            <h2 className="font-heading text-4xl font-bold text-ink mb-6">Testen ist unsere Leidenschaft.</h2>
            <div className="space-y-4 text-ink/60 text-lg leading-relaxed">
              <p>Wir sind ein eingespieltes Team aus erfahrenen Testexperten und QA-Spezialisten. Was uns antreibt, ist der Anspruch, jeden Fehler zu finden, bevor er zum Problem wird.</p>
              <p>Vom einzelnen Testzyklus bis zur kontinuierlichen Qualitätssicherung begleiten wir unsere Kunden über den gesamten Lebenszyklus ihrer Software – gründlich und transparent.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28 bg-orange-50/60 border-y border-orange-100">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="max-w-2xl mb-14">
            <p className="text-orange-600 font-semibold mb-3">Was uns ausmacht</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-ink">Werte, die wir wirklich leben.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="rounded-2xl bg-white border border-orange-100 p-7">
                  <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center mb-5"><Icon className="text-white" size={22} /></div>
                  <h3 className="font-heading text-lg font-bold text-ink mb-2">{v.title}</h3>
                  <p className="text-sm text-ink/60 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-orange-600 font-semibold mb-3 inline-flex items-center gap-2"><MapPin size={16} /> Standort</p>
            <h2 className="font-heading text-4xl font-bold text-ink mb-5">Zuhause in Hamburg.</h2>
            <p className="text-lg text-ink/60 mb-4">Unser Team arbeitet aus dem Herzen Hamburgs – und remote für Kunden in ganz Deutschland und Europa.</p>
            <p className="text-ink/70 font-medium">Heinrich-Hertz-Str. 133<br />22083 Hamburg, Deutschland</p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 text-white p-10 relative overflow-hidden">
            <div className="pointer-events-none absolute -top-16 -right-10 w-[260px] h-[260px] bg-white/15 blur-[90px] rounded-full" />
            <div className="relative">
              <h3 className="font-heading text-2xl font-bold mb-3">Lust auf Zusammenarbeit?</h3>
              <p className="text-white/80 mb-7">Ob Testprojekt oder Bewerbung – wir freuen uns, von Ihnen zu hören.</p>
              <div className="flex flex-wrap gap-3">
                <Link to="/kontakt" className="inline-flex items-center gap-2 h-12 px-6 bg-white text-orange-600 hover:bg-orange-50 rounded-full font-semibold transition-colors">Kontakt <ArrowUpRight size={16} /></Link>
                <Link to="/karriere" className="inline-flex items-center gap-2 h-12 px-6 border border-white/40 hover:bg-white/10 rounded-full font-semibold transition-colors">Karriere</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Unternehmen;
