import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Globe, ArrowLeft } from 'lucide-react';

const Section = ({ title, children }) => (
  <div className="border-b border-[#DDE8DD] pb-8">
    <h2 className="font-heading text-xl md:text-2xl font-bold text-[#223322] mb-4">{title}</h2>
    <div className="space-y-3 leading-relaxed">{children}</div>
  </div>
);

const Impressum = () => {
  return (
    <div className="min-h-screen bg-white font-body text-[#556655]">
      {/* Hero */}
      <section className="bg-[#F4F8F4] border-b border-[#DDE8DD]">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-16 md:py-20">
          <div className="text-sage-700 font-semibold mb-3">Rechtliches</div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#223322] mb-3">Impressum</h1>
          <p className="text-lg">Angaben gemäß § 5 TMG</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-8 space-y-8">
          <div className="bg-sage-50 border border-sage-200 p-6 rounded-sm" data-testid="impressum-company-box">
            <p className="text-[#223322]">
              <span className="font-bold">Tdata Testing</span> ist ein Angebot von{' '}
              <span className="font-bold">MO Handel &amp; Service, Inh. Mariusz Jerzy Otok</span>.
            </p>
          </div>

          <Section title="Firmeninformationen">
            <p className="font-semibold text-[#223322]">MO Handel &amp; Service, Inh. Mariusz Jerzy Otok</p>
            <p>Darmstädter Landstraße 60</p>
            <p>65462 Ginsheim-Gustavsburg</p>
            <p>Deutschland</p>
          </Section>

          <Section title="Kontakt">
            <div className="flex items-center gap-3">
              <Mail className="text-sage-600 flex-shrink-0" size={18} />
              <span>E-Mail: info@tdata-testing.de</span>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="text-sage-600 flex-shrink-0" size={18} />
              <span>Internet: www.tdata-testing.de</span>
            </div>
          </Section>

          <Section title="Vertretungsberechtigte Person">
            <p>Mariusz Otok</p>
          </Section>

          <Section title="Umsatzsteuer-Identifikationsnummer">
            <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:</p>
            <p className="font-semibold text-[#223322]">DE368527526</p>
          </Section>

          <Section title="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
            <p>Mariusz Otok</p>
            <p>Darmstädter Landstraße 60</p>
            <p>65462 Ginsheim-Gustavsburg</p>
          </Section>

          <Section title="Streitschlichtung">
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-sage-700 underline">
                https://ec.europa.eu/consumers/odr/
              </a>
            </p>
            <p>Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>
            <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
          </Section>

          <Section title="Haftung für Inhalte">
            <p className="text-sm">
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen
              Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet,
              übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf
              eine rechtswidrige Tätigkeit hinweisen.
            </p>
            <p className="text-sm">
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen
              bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer
              konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese
              Inhalte umgehend entfernen.
            </p>
          </Section>

          <div className="pb-2">
            <h2 className="font-heading text-xl md:text-2xl font-bold text-[#223322] mb-4">Urheberrecht</h2>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
                Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
                Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
              </p>
              <p>
                Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter
                beachtet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen
                entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend
                entfernen.
              </p>
            </div>
          </div>

          <Link to="/" className="inline-flex items-center gap-2 text-sage-700 font-semibold hover:gap-3 transition-all">
            <ArrowLeft size={18} /> Zurück zur Startseite
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Impressum;
