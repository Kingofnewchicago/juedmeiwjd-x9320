import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h3 className="font-heading text-xl font-bold text-ink mb-3">{title}</h3>
    <div className="space-y-3 text-ink/70 leading-relaxed">{children}</div>
  </div>
);

const Datenschutz = () => {
  return (
    <div className="bg-white font-body text-ink/70">
      <section className="relative bg-gradient-to-b from-orange-50 via-white to-white text-ink overflow-hidden border-b border-orange-100">
        <div className="absolute inset-0 more-grid-bg opacity-40" />
        <div className="relative max-w-4xl mx-auto px-6 md:px-8 py-20 md:py-24">
          <p className="text-orange-600 font-semibold mb-4">Rechtliches</p>
          <h1 className="font-heading text-5xl md:text-6xl font-bold">Datenschutz</h1>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <Section title="1. Verantwortlicher">
            <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
            <p className="text-ink font-medium">MORE Applications GmbH<br />Heinrich-Hertz-Str. 133, 22083 Hamburg, Deutschland<br />E-Mail: <a href="mailto:team@more-apps.de" className="text-brand-600 hover:underline">team@more-apps.de</a></p>
          </Section>
          <Section title="2. Erhebung und Speicherung personenbezogener Daten">
            <p>Wir erheben personenbezogene Daten, wenn Sie uns diese im Rahmen einer Kontaktanfrage, Bewerbung oder Projektanfrage freiwillig mitteilen. Dazu gehören insbesondere Name, E-Mail-Adresse, Telefonnummer sowie die von Ihnen übermittelten Inhalte.</p>
          </Section>
          <Section title="3. Zweck der Verarbeitung">
            <p>Ihre Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage, zur Kommunikation mit Ihnen sowie zur Durchführung vorvertraglicher bzw. vertraglicher Maßnahmen verwendet (Art. 6 Abs. 1 lit. b DSGVO).</p>
          </Section>
          <Section title="4. Bewerberdaten">
            <p>Im Rahmen von Bewerbungen verarbeiten wir die von Ihnen übermittelten Daten (u. a. Kontaktdaten, Lebenslauf, Anschrift) zum Zweck des Bewerbungsverfahrens. Die Daten werden vertraulich behandelt und nach Abschluss des Verfahrens gemäß den gesetzlichen Fristen gelöscht, sofern Sie keiner längeren Speicherung zustimmen.</p>
          </Section>
          <Section title="5. Weitergabe von Daten">
            <p>Eine Übermittlung Ihrer Daten an Dritte erfolgt nur, sofern dies zur Vertragserfüllung erforderlich ist, Sie eingewilligt haben oder wir gesetzlich dazu verpflichtet sind.</p>
          </Section>
          <Section title="6. Ihre Rechte">
            <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie Widerspruch gegen die Verarbeitung Ihrer personenbezogenen Daten. Zudem können Sie sich bei einer Aufsichtsbehörde beschweren.</p>
          </Section>
          <Section title="7. Speicherdauer">
            <p>Wir speichern personenbezogene Daten nur so lange, wie es für die genannten Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen dies vorsehen.</p>
          </Section>
          <Section title="8. Kontakt zum Datenschutz">
            <p>Bei Fragen zum Datenschutz erreichen Sie uns unter <a href="mailto:team@more-apps.de" className="text-brand-600 hover:underline">team@more-apps.de</a>.</p>
          </Section>
        </div>
      </section>
    </div>
  );
};

export default Datenschutz;
