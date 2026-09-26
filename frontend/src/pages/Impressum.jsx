import React from 'react';

const Row = ({ label, children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-6 py-4 border-b border-brand-100">
    <dt className="text-sm font-semibold text-ink/50">{label}</dt>
    <dd className="sm:col-span-2 text-ink">{children}</dd>
  </div>
);

const Impressum = () => {
  return (
    <div className="bg-white font-body text-ink/70">
      <section className="relative bg-gradient-to-b from-orange-50 via-white to-white text-ink overflow-hidden border-b border-orange-100">
        <div className="absolute inset-0 more-grid-bg opacity-40" />
        <div className="relative max-w-4xl mx-auto px-6 md:px-8 py-20 md:py-24">
          <p className="text-orange-600 font-semibold mb-4">Rechtliches</p>
          <h1 className="font-heading text-5xl md:text-6xl font-bold">Impressum</h1>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <h2 className="font-heading text-2xl font-bold text-ink mb-6">Angaben gemäß § 5 DDG</h2>
          <dl className="mb-14">
            <Row label="Name">MORE Applications GmbH</Row>
            <Row label="Vertreten durch">Geschäftsführer Jens Olaf Brändel</Row>
            <Row label="Anschrift">Heinrich-Hertz-Str. 133<br />22083 Hamburg, Deutschland</Row>
            <Row label="Registergericht">Amtsgericht Hamburg</Row>
            <Row label="Registernummer">HRB 191673</Row>
            <Row label="EUID">DEK1101R.HRB191673</Row>
            <Row label="USt-IdNr.">DE134894775</Row>
            <Row label="E-Mail"><a href="mailto:team@more-apps.de" className="text-brand-600 hover:underline">team@more-apps.de</a></Row>
          </dl>

          <div className="space-y-10 text-ink/70 leading-relaxed">
            <div>
              <h3 className="font-heading text-xl font-bold text-ink mb-3">Umsatzsteuer-Identifikationsnummer</h3>
              <p>Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: DE134894775</p>
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-ink mb-3">Verantwortlich für den Inhalt</h3>
              <p>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:<br />Jens Olaf Brändel, Heinrich-Hertz-Str. 133, 22083 Hamburg</p>
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-ink mb-3">Streitschlichtung</h3>
              <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">https://ec.europa.eu/consumers/odr/</a>. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-ink mb-3">Haftung für Inhalte</h3>
              <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.</p>
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-ink mb-3">Haftung für Links</h3>
              <p>Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.</p>
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-ink mb-3">Urheberrecht</h3>
              <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Impressum;
