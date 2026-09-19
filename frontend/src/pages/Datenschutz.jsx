import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const Datenschutz = () => {
  const sections = [
    {
      title: '1. Datenschutz auf einen Blick',
      content: [
        { subtitle: 'Allgemeine Hinweise', text: 'Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.' },
      ],
    },
    {
      title: '2. Datenerfassung auf dieser Website',
      content: [
        { subtitle: 'Wer ist verantwortlich für die Datenerfassung auf dieser Website?', text: 'Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Abschnitt „Verantwortliche Stelle" in dieser Datenschutzerklärung entnehmen.' },
        { subtitle: 'Wie erfassen wir Ihre Daten?', text: 'Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben. Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme erfasst (z. B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).' },
        { subtitle: 'Wofür nutzen wir Ihre Daten?', text: 'Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.' },
      ],
    },
    {
      title: '3. Ihre Rechte',
      content: [
        { subtitle: 'Welche Rechte haben Sie bezüglich Ihrer Daten?', text: 'Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese Einwilligung jederzeit für die Zukunft widerrufen.' },
      ],
    },
    {
      title: '4. Hosting',
      content: [
        { subtitle: 'Externes Hosting', text: 'Diese Website wird bei einem externen Dienstleister gehostet (Hoster). Die personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert. Hierbei kann es sich v. a. um IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten, Kontaktdaten und Namen handeln.' },
      ],
    },
    {
      title: '5. Cookies',
      content: [
        { subtitle: 'Cookies', text: 'Unsere Internetseiten verwenden so genannte „Cookies". Cookies sind kleine Datenpakete und richten auf Ihrem Endgerät keinen Schaden an. Sie werden entweder vorübergehend für die Dauer einer Sitzung (Session-Cookies) oder dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert.' },
      ],
    },
    {
      title: '6. Kontaktformular',
      content: [
        { subtitle: 'Anfragen per Kontaktformular', text: 'Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.' },
      ],
    },
  ];

  const rights = [
    { t: 'Recht auf Auskunft', d: 'Bestätigung darüber, ob Sie betreffende Daten verarbeitet werden.' },
    { t: 'Recht auf Berichtigung', d: 'Berichtigung unrichtiger oder Vervollständigung unvollständiger Daten.' },
    { t: 'Recht auf Löschung', d: 'Löschung Ihrer personenbezogenen Daten verlangen.' },
    { t: 'Recht auf Einschränkung', d: 'Einschränkung der Verarbeitung verlangen.' },
    { t: 'Recht auf Datenübertragbarkeit', d: 'Daten in einem gängigen, maschinenlesbaren Format erhalten.' },
    { t: 'Widerspruchsrecht', d: 'Der Verarbeitung Ihrer Daten widersprechen.' },
  ];

  return (
    <div className="min-h-screen bg-white font-body text-[#556655]">
      {/* Hero */}
      <section className="bg-[#F4F8F4] border-b border-[#DDE8DD]">
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-16 md:py-20">
          <div className="text-sage-700 font-semibold mb-3">Rechtliches</div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#223322] mb-3">Datenschutzerklärung</h1>
          <p className="text-lg">Wir nehmen den Schutz Ihrer persönlichen Daten ernst.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-8 space-y-10">
          <p className="leading-relaxed">
            Wir freuen uns über Ihr Interesse an unserer Website. Nachstehend informieren wir Sie über den Umgang mit
            Ihren Daten. <strong className="text-[#223322]">Stand: Juni 2026</strong>
          </p>

          {/* Verantwortliche Stelle */}
          <div className="border-b border-[#DDE8DD] pb-8">
            <h2 className="font-heading text-2xl font-bold text-[#223322] mb-4">Verantwortliche Stelle</h2>
            <p className="mb-4">Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
            <div className="bg-[#F4F8F4] border border-[#DDE8DD] p-6 rounded-sm space-y-1">
              <p className="font-semibold text-[#223322]">MO Handel &amp; Service, Inh. Mariusz Otok</p>
              <p>Darmstädter Landstraße 60</p>
              <p>65462 Ginsheim-Gustavsburg</p>
              <p>Deutschland</p>
              <p className="pt-2">E-Mail: datenschutz@tdata-testing.de</p>
            </div>
          </div>

          {sections.map((section, i) => (
            <div key={i} className="border-b border-[#DDE8DD] pb-8">
              <h2 className="font-heading text-2xl font-bold text-[#223322] mb-4">{section.title}</h2>
              <div className="space-y-5">
                {section.content.map((item, idx) => (
                  <div key={idx}>
                    {item.subtitle && <h3 className="font-heading text-lg font-semibold text-[#223322] mb-2">{item.subtitle}</h3>}
                    <p className="leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* GDPR Rights */}
          <div className="bg-[#F4F8F4] border border-[#DDE8DD] p-8 rounded-sm">
            <h2 className="font-heading text-2xl font-bold text-[#223322] mb-6">Ihre Rechte nach DSGVO</h2>
            <div className="space-y-4">
              {rights.map((r, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-sage-600 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={14} className="text-white" />
                  </div>
                  <p><strong className="text-[#223322]">{r.t}:</strong> {r.d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="border-t border-[#DDE8DD] pt-8">
            <h2 className="font-heading text-2xl font-bold text-[#223322] mb-4">Kontakt in Datenschutzfragen</h2>
            <p className="mb-4">Für Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte wenden Sie sich bitte an:</p>
            <div className="bg-sage-50 border border-sage-200 p-6 rounded-sm">
              <p className="font-semibold text-[#223322] mb-1">Datenschutz</p>
              <p>MO Handel &amp; Service, Inh. Mariusz Otok</p>
              <p>E-Mail: datenschutz@tdata-testing.de</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/" className="text-sage-700 font-semibold hover:underline">← Zurück zur Startseite</Link>
            <Link to="/impressum" className="text-sage-700 font-semibold hover:underline">Zum Impressum →</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Datenschutz;
