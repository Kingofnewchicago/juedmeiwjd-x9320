import React from 'react';

export const CONTRACT_POSITIONS = {
  vollzeit: 'Mitarbeiter in der Verifikations Testung',
  teilzeit: 'Mitarbeiter/in in der Daten- und Produktprüfung (Teilzeit)',
  minijob: 'Mitarbeiter/in in der Daten- und Produktprüfung (Minijob)',
  minijob_at: 'IT-Applikations-Tester (Werkvertrag)',
  vollzeit_at: 'IT Application Tester (Vollzeit · Österreich)',
  teilzeit_at: 'IT Application Tester (Teilzeit · Österreich)',
  freiberufler_at: 'IT Application Tester (Freiberufler · Österreich)',
};

export const CONTRACT_SUBTITLES = {
  vollzeit: 'für Angestellte und Mitarbeiter',
  teilzeit: 'Teilzeitbeschäftigung (mit Provision)',
  minijob: 'Geringfügige Beschäftigung (Minijob)',
  minijob_at: 'Werkvertrag über IT-Applikations-Testing',
  vollzeit_at: 'Vollzeit (Österreich)',
  teilzeit_at: 'Teilzeit (Österreich)',
  freiberufler_at: 'Selbstständig / Freiberufler (Österreich, ausschließlich Provision)',
};

export const CONTRACT_TITLES = {
  vollzeit: 'ARBEITSVERTRAG',
  teilzeit: 'ARBEITSVERTRAG',
  minijob: 'ARBEITSVERTRAG',
  minijob_at: 'WERKVERTRAG',
  vollzeit_at: 'ARBEITSVERTRAG',
  teilzeit_at: 'ARBEITSVERTRAG',
  freiberufler_at: 'DIENSTLEISTUNGSVERTRAG',
};

const TaskList = () => (
  <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
    <li>Durchführung von Softwaretests, Produkttests und Testläufen unter realen Bedingungen</li>
    <li>Dokumentation und Auswertung der Testergebnisse</li>
    <li>Analyse von Schwachstellen und Erstellung von Verbesserungsvorschlägen</li>
    <li>Zusammenarbeit mit dem Team zur Optimierung von Qualität und Performance</li>
    <li>Unterstützung bei der Weiterentwicklung der Testmethoden</li>
  </ul>
);

const VollzeitBody = ({ signedDate }) => (
  <>
    <div>
      <p className="font-bold text-[#0A0A0A]">§1 Beginn des Arbeitsverhältnisses</p>
      <p>Dieses Arbeitsverhältnis beginnt am {signedDate} (Tag der Unterzeichnung durch beide Parteien).</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§2 Tätigkeit</p>
      <p>Der Arbeitnehmer wird bei Tdata Testing als <strong>Mitarbeiter in der Verifikations Testung</strong> im Homeoffice eingestellt und vor allem mit folgenden Aufgaben beschäftigt:</p>
      <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
        <li>Durchführung von Video-Identifikationsverfahren zur Evaluierung und Testung</li>
        <li>Überprüfung von Apps und Softwares auf Benutzerfreundlichkeit und Mängel</li>
        <li>Erstellung und Einreichung der dazugehörigen Abschlussberichte innerhalb des vorgegebenen Zeitrahmens</li>
      </ul>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§3 Arbeitszeit</p>
      <p>(1) Während des Testmonats (erster Monat) beträgt die regelmäßige Arbeitszeit ca. 15 Wochenstunden.</p>
      <p className="mt-2">(2) Nach Abschluss des Testmonats beträgt die regelmäßige Arbeitszeit ca. 40 Wochenstunden an 5 Tagen der Woche. Die genauen Arbeitszeiten sind in Absprache des Arbeitnehmers und des Arbeitgebers unter Berücksichtigung der betrieblichen Erfordernisse zu treffen.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§4 Vergütung</p>
      <p>(1) <strong>Testmonat (erster Monat):</strong> Der Arbeitnehmer erhält eine monatliche Vergütung in Höhe von 1.200,00 € brutto. Der erste Monat dient als Testmonat zur gegenseitigen Eignungsprüfung.</p>
      <p className="mt-2">(2) <strong>Ab dem zweiten Monat:</strong> Nach erfolgreichem Abschluss des Testmonats erhält der Arbeitnehmer eine monatliche Vergütung in Höhe von 2.900,00 € brutto.</p>
      <p className="mt-2">(3) Die Vergütung ist jeweils am Monatsende fällig und wird per Überweisung an das vom Arbeitnehmer benannte Konto überwiesen.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§5 Testmonat</p>
      <p>(1) Der erste Monat des Arbeitsverhältnisses gilt als Testmonat. In diesem Zeitraum arbeitet der Arbeitnehmer ca. 15 Stunden pro Woche.</p>
      <p className="mt-2">(2) Nach erfolgreichem Abschluss des Testmonats beginnt das reguläre Arbeitsverhältnis mit der in §4 Abs. 2 genannten Vergütung.</p>
      <p className="mt-2">(3) Während des Testmonats kann das Arbeitsverhältnis von beiden Seiten mit einer Frist von einer Woche gekündigt werden.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§6 Urlaubsanspruch</p>
      <p>(1) Der Arbeitnehmer hat einen Anspruch auf einen jährlichen Erholungsurlaub von 28 Arbeitstagen.</p>
      <p className="mt-2">(2) Im Übrigen gelten ergänzend die Bestimmungen des Bundesurlaubsgesetzes.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§7 Arbeitsverhinderung</p>
      <p>(1) Der Arbeitnehmer verpflichtet sich, jede Arbeitsverhinderung unverzüglich dem Arbeitgeber mitzuteilen.</p>
      <p className="mt-2">(2) Im Krankheitsfall hat der Arbeitnehmer spätestens nach Ablauf des dritten Kalendertages eine ärztliche Arbeitsunfähigkeitsbescheinigung vorzulegen.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§8 Kündigungsfristen</p>
      <p>(1) Nach Ablauf des Testmonats gelten die gesetzlichen Kündigungsfristen.</p>
      <p className="mt-2">(2) Jede Kündigung hat schriftlich zu erfolgen.</p>
      <p className="mt-2">(3) Das Recht zur fristlosen Kündigung aus wichtigem Grund bleibt hiervon unberührt.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§9 Sozialversicherung und Versicherungsschutz</p>
      <p>Der Arbeitgeber meldet den Arbeitnehmer ordnungsgemäß bei der zuständigen gesetzlichen Krankenkasse zur Sozialversicherung an. Der Arbeitnehmer ist im Rahmen der gesetzlichen Sozialversicherung kranken-, pflege-, renten- und arbeitslosenversichert. Die Arbeitnehmer- und Arbeitgeberbeiträge werden vom Arbeitgeber einbehalten bzw. abgeführt; die Lohnsteuer wird nach den gesetzlichen Vorschriften an das Finanzamt abgeführt. Auf Wunsch erhält der Arbeitnehmer eine Bestätigung der Anmeldung zur Sozialversicherung.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§10 Sonderzahlungen (13. und 14. Gehalt)</p>
      <p>Ein gesetzlicher Anspruch auf ein 13. oder 14. Monatsgehalt besteht nach deutschem Recht nicht und wird über die in §4 vereinbarte Vergütung hinaus nicht geschuldet. Zusätzliche Sonderzahlungen wie Urlaubs- oder Weihnachtsgeld werden nur gewährt, wenn sie ausdrücklich und schriftlich gesondert vereinbart werden. Werden solche Zahlungen freiwillig geleistet, erfolgt dies ohne Anerkennung einer Rechtspflicht; eine mehrmalige Zahlung begründet keinen Anspruch für die Zukunft (kein Anspruch aus betrieblicher Übung).</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§11 Tarifbindung und Mindestlohn</p>
      <p>Auf dieses Arbeitsverhältnis findet kein Tarifvertrag Anwendung; es gelten die Regelungen dieses Vertrages sowie die einschlägigen gesetzlichen Bestimmungen. Der Arbeitgeber hält den jeweils geltenden gesetzlichen Mindestlohn nach dem Mindestlohngesetz (MiLoG) ein. Sofern zukünftig ein auf das Arbeitsverhältnis anwendbarer Tarifvertrag für allgemeinverbindlich erklärt wird, gelten dessen zwingende Bestimmungen vorrangig.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§12 Vertraulichkeit – konkrete Verstöße und Folgen</p>
      <p>(1) Zur Klarstellung, welches Verhalten einen Verstoß gegen die Vertraulichkeits- und Datenschutzpflichten darstellt, gilt insbesondere Folgendes als Verstoß:</p>
      <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
        <li>die Weitergabe von Test-Zugangsdaten, Ident-Links, Kunden-, Partner- oder Auftraggeberinformationen an Dritte;</li>
        <li>das Anfertigen, Speichern oder Weiterleiten von Screenshots, Foto-, Ton- oder Videoaufnahmen der Test- oder Ident-Verfahren außerhalb der ausdrücklich vorgesehenen Reports;</li>
        <li>die Nutzung überlassener Daten, Ausweisdaten oder Test-Accounts für private oder vertragsfremde Zwecke;</li>
        <li>die Veröffentlichung oder Weitergabe von Informationen über Auftraggeber, Partner, Testinhalte oder Testmethoden gegenüber Dritten oder in sozialen Medien;</li>
        <li>das Unterlassen der fristgerechten Löschung überlassener Daten nach Abschluss des jeweiligen Tests.</li>
      </ul>
      <p className="mt-2">(2) Bei einem Verstoß haftet der Arbeitnehmer nach den gesetzlichen Bestimmungen. Das Recht des Arbeitgebers zur außerordentlichen (fristlosen) Kündigung aus wichtigem Grund sowie zur Geltendmachung von Schadensersatz bleibt ausdrücklich vorbehalten.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§13 Datenschutz, Datensicherheit und ausschließliche Testzwecke</p>
      <p>(1) Der Arbeitgeber verarbeitet personenbezogene Daten der Mitarbeiter sowie im Rahmen der Tätigkeit erhobene oder verarbeitete Daten ausschließlich zur Durchführung des Arbeitsverhältnisses sowie der vereinbarten Test-, Prüf- und Verifizierungsaufgaben. Die Verarbeitung erfolgt unter Beachtung der geltenden datenschutzrechtlichen Vorschriften, insbesondere der Art. 5, 6, 13 und 32 DSGVO.</p>
      <p className="mt-2">(2) Im Rahmen von Test- und Verifizierungsprozessen können, soweit für die jeweilige Testaufgabe erforderlich, insbesondere Identitätsdaten, Daten aus Ausweisdokumenten sowie Foto- oder Videoaufnahmen verarbeitet werden. Diese Daten werden ausschließlich für den jeweiligen Testzweck verwendet, nicht unbefugt an Dritte weitergegeben und nicht länger gespeichert, als es für den jeweiligen Zweck erforderlich ist oder gesetzliche Aufbewahrungspflichten dies vorsehen. Anschließend werden die Daten gelöscht oder, soweit erforderlich, anonymisiert.</p>
      <p className="mt-2">(3) Sämtliche im Rahmen von Test- und Verifizierungsabläufen verwendeten Daten und Identitätsnachweise dienen ausschließlich der Durchführung von Testzwecken. Eine tatsächliche Eröffnung von Bankkonten, Zahlungsverkehrskonten oder sonstigen Finanzkonten auf Grundlage der für Testzwecke bereitgestellten Daten durch den Arbeitgeber erfolgt nicht.</p>
      <p className="mt-2">(4) Der Arbeitgeber trifft gemäß Art. 32 DSGVO geeignete technische und organisatorische Maßnahmen, um personenbezogene Daten vor unbefugter oder unrechtmäßiger Verarbeitung, Verlust, Zerstörung oder unbefugtem Zugriff zu schützen.</p>
      <p className="mt-2">(5) Der Mitarbeiter verpflichtet sich, sämtliche ihm im Rahmen seiner Tätigkeit bekannt werdenden personenbezogenen Daten und vertraulichen Informationen vertraulich zu behandeln, ausschließlich für die vorgesehenen Aufgaben zu verwenden und nicht unbefugt an Dritte weiterzugeben. Diese Verpflichtung besteht auch nach Beendigung des Arbeitsverhältnisses fort, soweit dies gesetzlich erforderlich ist.</p>
    </div>
  </>
);

const TeilzeitBody = ({ signedDate }) => (
  <>
    <div>
      <p className="font-bold text-[#0A0A0A]">§1 Beginn und Dauer</p>
      <p>Das Arbeitsverhältnis beginnt am {signedDate} (Tag der Unterzeichnung durch beide Parteien). Es wird auf unbestimmte Zeit geschlossen. Die Probezeit beträgt drei Monate. Während der Probezeit kann das Arbeitsverhältnis mit einer Frist von zwei Wochen gekündigt werden.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§2 Tätigkeit</p>
      <p>Der Arbeitnehmer wird bei Tdata Testing als <strong>Mitarbeiter/in in der Daten- und Produktprüfung</strong> eingestellt. Die Tätigkeit umfasst insbesondere:</p>
      <TaskList />
      <p className="mt-2">Die Tätigkeit erfolgt 100 % im Homeoffice (mobiles Arbeiten). Der Arbeitnehmer stellt einen geeigneten Arbeitsplatz mit Internetzugang zur Verfügung. Der Arbeitgeber stellt die erforderlichen Testzugänge und Softwarelizenzen bereit.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§3 Arbeitszeit</p>
      <p>(1) Die regelmäßige wöchentliche Arbeitszeit beträgt 20 Stunden.</p>
      <p className="mt-2">(2) Die Lage der Arbeitszeit wird in Abstimmung mit dem Arbeitgeber flexibel festgelegt. Kernarbeitszeiten bestehen nicht, der Arbeitnehmer muss jedoch für Absprachen mit dem Team an Werktagen zwischen 9:00 und 17:00 Uhr grundsätzlich erreichbar sein.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§4 Vergütung</p>
      <p>(1) <strong>Grundvergütung:</strong> Die monatliche Grundvergütung beträgt 2.200,00 € brutto bei einer wöchentlichen Arbeitszeit von 20 Stunden.</p>
      <p className="mt-2">(2) <strong>Provisionsvergütung:</strong> Für erfolgreich abgeschlossene Testaufträge kann zusätzlich eine variable Provision gewährt werden. Ein Anspruch auf eine bestimmte Anzahl von Aufträgen besteht nicht.</p>
      <p className="mt-2">(3) <strong>Auszahlung:</strong> Die Auszahlung der Grundvergütung erfolgt spätestens am letzten Bankarbeitstag des Monats. Eventuelle Provisionen werden nach der Abrechnung im Folgemonat ausgezahlt.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§5 Urlaub</p>
      <p>Der Arbeitnehmer hat Anspruch auf 24 Arbeitstage bezahlten Erholungsurlaub pro Kalenderjahr (bei einer 5-Tage-Woche). Bei abweichender Verteilung der Arbeitstage wird der Urlaubsanspruch anteilig berechnet.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§6 Krankheit, sonstige Verhinderung</p>
      <p>Im Krankheitsfall ist der Arbeitnehmer verpflichtet, dem Arbeitgeber die Arbeitsunfähigkeit unverzüglich (bis spätestens 9:00 Uhr) mitzuteilen. Bei längerer als dreitägiger Arbeitsunfähigkeit ist eine ärztliche Bescheinigung vorzulegen. Die Entgeltfortzahlung erfolgt nach den gesetzlichen Vorschriften.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§7 Kündigung</p>
      <p>Nach Ablauf der Probezeit beträgt die Kündigungsfrist vier Wochen zum 15. oder zum Ende eines Kalendermonats. Die gesetzlichen Fristen nach § 622 BGB bleiben unberührt.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§8 Nebentätigkeiten</p>
      <p>Nebentätigkeiten sind erlaubnispflichtig, soweit sie in Konkurrenz zum Arbeitgeber stehen oder die Leistungsfähigkeit des Arbeitnehmers beeinträchtigen.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§9 Geheimhaltung und Eigentumsrechte</p>
      <p>Der Arbeitnehmer verpflichtet sich, über alle vertraulichen Informationen (insbesondere Testinhalte, Kunden, Ergebnisse) auch über die Beendigung des Arbeitsverhältnisses hinaus Stillschweigen zu bewahren. Alle im Rahmen der Tätigkeit entstandenen Arbeitsergebnisse gehen vollständig in das Eigentum des Arbeitgebers über.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§10 Schriftform</p>
      <p>Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§11 Salvatorische Klausel</p>
      <p>Sollten einzelne Bestimmungen dieses Vertrages unwirksam sein oder werden, wird dadurch die Gültigkeit des übrigen Vertrages nicht berührt. Anstelle der unwirksamen Bestimmung tritt eine wirksame Regelung, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§12 Sozialversicherung und Versicherungsschutz</p>
      <p>Der Arbeitgeber meldet den Arbeitnehmer ordnungsgemäß bei der zuständigen gesetzlichen Krankenkasse zur Sozialversicherung an. Der Arbeitnehmer ist im Rahmen der gesetzlichen Sozialversicherung kranken-, pflege-, renten- und arbeitslosenversichert. Die Arbeitnehmer- und Arbeitgeberbeiträge werden vom Arbeitgeber einbehalten bzw. abgeführt; die Lohnsteuer wird nach den gesetzlichen Vorschriften an das Finanzamt abgeführt. Auf Wunsch erhält der Arbeitnehmer eine Bestätigung der Anmeldung zur Sozialversicherung.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§13 Sonderzahlungen (13. und 14. Gehalt)</p>
      <p>Ein gesetzlicher Anspruch auf ein 13. oder 14. Monatsgehalt besteht nach deutschem Recht nicht und wird über die in §4 vereinbarte Vergütung hinaus nicht geschuldet. Zusätzliche Sonderzahlungen wie Urlaubs- oder Weihnachtsgeld werden nur gewährt, wenn sie ausdrücklich und schriftlich gesondert vereinbart werden. Werden solche Zahlungen freiwillig geleistet, erfolgt dies ohne Anerkennung einer Rechtspflicht; eine mehrmalige Zahlung begründet keinen Anspruch für die Zukunft (kein Anspruch aus betrieblicher Übung).</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§14 Tarifbindung und Mindestlohn</p>
      <p>Auf dieses Arbeitsverhältnis findet kein Tarifvertrag Anwendung; es gelten die Regelungen dieses Vertrages sowie die einschlägigen gesetzlichen Bestimmungen. Der Arbeitgeber hält den jeweils geltenden gesetzlichen Mindestlohn nach dem Mindestlohngesetz (MiLoG) ein. Sofern zukünftig ein auf das Arbeitsverhältnis anwendbarer Tarifvertrag für allgemeinverbindlich erklärt wird, gelten dessen zwingende Bestimmungen vorrangig.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§15 Vertraulichkeit – konkrete Verstöße und Folgen</p>
      <p>(1) Zur Klarstellung, welches Verhalten einen Verstoß gegen die Vertraulichkeits- und Datenschutzpflichten darstellt, gilt insbesondere Folgendes als Verstoß:</p>
      <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
        <li>die Weitergabe von Test-Zugangsdaten, Ident-Links, Kunden-, Partner- oder Auftraggeberinformationen an Dritte;</li>
        <li>das Anfertigen, Speichern oder Weiterleiten von Screenshots, Foto-, Ton- oder Videoaufnahmen der Test- oder Ident-Verfahren außerhalb der ausdrücklich vorgesehenen Reports;</li>
        <li>die Nutzung überlassener Daten, Ausweisdaten oder Test-Accounts für private oder vertragsfremde Zwecke;</li>
        <li>die Veröffentlichung oder Weitergabe von Informationen über Auftraggeber, Partner, Testinhalte oder Testmethoden gegenüber Dritten oder in sozialen Medien;</li>
        <li>das Unterlassen der fristgerechten Löschung überlassener Daten nach Abschluss des jeweiligen Tests.</li>
      </ul>
      <p className="mt-2">(2) Bei einem Verstoß haftet der Arbeitnehmer nach den gesetzlichen Bestimmungen. Das Recht des Arbeitgebers zur außerordentlichen (fristlosen) Kündigung aus wichtigem Grund sowie zur Geltendmachung von Schadensersatz bleibt ausdrücklich vorbehalten.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§16 Datenschutz, Datensicherheit und ausschließliche Testzwecke</p>
      <p>(1) Der Arbeitgeber verarbeitet personenbezogene Daten der Mitarbeiter sowie im Rahmen der Tätigkeit erhobene oder verarbeitete Daten ausschließlich zur Durchführung des Arbeitsverhältnisses sowie der vereinbarten Test-, Prüf- und Verifizierungsaufgaben. Die Verarbeitung erfolgt unter Beachtung der geltenden datenschutzrechtlichen Vorschriften, insbesondere der Art. 5, 6, 13 und 32 DSGVO.</p>
      <p className="mt-2">(2) Im Rahmen von Test- und Verifizierungsprozessen können, soweit für die jeweilige Testaufgabe erforderlich, insbesondere Identitätsdaten, Daten aus Ausweisdokumenten sowie Foto- oder Videoaufnahmen verarbeitet werden. Diese Daten werden ausschließlich für den jeweiligen Testzweck verwendet, nicht unbefugt an Dritte weitergegeben und nicht länger gespeichert, als es für den jeweiligen Zweck erforderlich ist oder gesetzliche Aufbewahrungspflichten dies vorsehen. Anschließend werden die Daten gelöscht oder, soweit erforderlich, anonymisiert.</p>
      <p className="mt-2">(3) Sämtliche im Rahmen von Test- und Verifizierungsabläufen verwendeten Daten und Identitätsnachweise dienen ausschließlich der Durchführung von Testzwecken. Eine tatsächliche Eröffnung von Bankkonten, Zahlungsverkehrskonten oder sonstigen Finanzkonten auf Grundlage der für Testzwecke bereitgestellten Daten durch den Arbeitgeber erfolgt nicht.</p>
      <p className="mt-2">(4) Der Arbeitgeber trifft gemäß Art. 32 DSGVO geeignete technische und organisatorische Maßnahmen, um personenbezogene Daten vor unbefugter oder unrechtmäßiger Verarbeitung, Verlust, Zerstörung oder unbefugtem Zugriff zu schützen.</p>
      <p className="mt-2">(5) Der Mitarbeiter verpflichtet sich, sämtliche ihm im Rahmen seiner Tätigkeit bekannt werdenden personenbezogenen Daten und vertraulichen Informationen vertraulich zu behandeln, ausschließlich für die vorgesehenen Aufgaben zu verwenden und nicht unbefugt an Dritte weiterzugeben. Diese Verpflichtung besteht auch nach Beendigung des Arbeitsverhältnisses fort, soweit dies gesetzlich erforderlich ist.</p>
    </div>
  </>
);

const MinijobBody = ({ signedDate }) => (
  <>
    <div>
      <p className="font-bold text-[#0A0A0A]">§1 Beginn und Dauer</p>
      <p>Das Arbeitsverhältnis beginnt am {signedDate} (Tag der Unterzeichnung durch beide Parteien). Es wird auf unbestimmte Zeit geschlossen. Die Probezeit beträgt einen Monat. Während der Probezeit kann das Arbeitsverhältnis mit einer Frist von zwei Wochen gekündigt werden.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§2 Tätigkeit</p>
      <p>Der Arbeitnehmer wird bei Tdata Testing als <strong>Mitarbeiter/in in der Daten- und Produktprüfung</strong> eingestellt. Die Tätigkeit umfasst insbesondere:</p>
      <TaskList />
      <p className="mt-2">Die Tätigkeit erfolgt 100 % im Homeoffice (mobiles Arbeiten). Der Arbeitnehmer stellt einen geeigneten Arbeitsplatz mit Internetzugang zur Verfügung. Der Arbeitgeber stellt die erforderlichen Testzugänge und Softwarelizenzen bereit.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§3 Arbeitszeit und Vergütung</p>
      <p>(1) <strong>Arbeitszeit:</strong> Die regelmäßige wöchentliche Arbeitszeit beträgt derzeit 4,5 Stunden (entspricht ca. 19,5 Stunden monatlich). Die Lage der Arbeitszeit wird in Abstimmung mit dem Arbeitgeber flexibel festgelegt.</p>
      <p className="mt-2">(2) <strong>Provisionsvergütung:</strong> Für jeden erfolgreich abgeschlossenen Testauftrag erhält der Arbeitnehmer eine Provision in Höhe von 50 bis 300 Euro brutto.</p>
      <p className="mt-2">(3) <strong>Gesamtvergütungsgrenze:</strong> Die Summe aus Provision darf den jeweils geltenden monatlichen Höchstbetrag für eine geringfügige Beschäftigung nicht überschreiten. Für das Jahr 2026 beträgt dieser Höchstbetrag 603,00 €. Überschreitet die Provision die Grenze, wird der übersteigende Teil im Folgemonat ausgezahlt.</p>
      <p className="mt-2">(4) <strong>Auszahlung:</strong> Die Provision wird nach Abrechnung vor dem 15. des Monats im selben Monat ausgezahlt, nach dem 15. im Folgemonat.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§4 Urlaub</p>
      <p>Der Arbeitnehmer hat Anspruch auf bezahlten Erholungsurlaub von 20 Arbeitstagen pro Kalenderjahr (bei einer 5-Tage-Woche). Bei unterjährigem Beginn oder Ausscheiden wird der Urlaub anteilig gewährt.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§5 Krankheit</p>
      <p>Im Krankheitsfall ist der Arbeitnehmer verpflichtet, dem Arbeitgeber die Arbeitsunfähigkeit unverzüglich (bis spätestens 9:00 Uhr) mitzuteilen. Bei längerer Krankheit ist eine Arbeitsunfähigkeitsbescheinigung ab dem dritten Kalendertag vorzulegen. Die Entgeltfortzahlung erfolgt nach den gesetzlichen Bestimmungen.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§6 Beendigung des Arbeitsverhältnisses</p>
      <p>Nach Ablauf der Probezeit beträgt die Kündigungsfrist vier Wochen zum 15. oder zum Ende eines Kalendermonats. Das Recht zur außerordentlichen Kündigung bleibt unberührt.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§7 Nebentätigkeiten</p>
      <p>Nebentätigkeiten bedürfen der vorherigen schriftlichen Zustimmung des Arbeitgebers, soweit sie die Interessen des Arbeitgebers beeinträchtigen (insbesondere bei Wettbewerbsverhältnissen oder Überschreitung der Höchstarbeitszeit).</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§8 Datenschutz und Verschwiegenheit</p>
      <p>Der Arbeitnehmer verpflichtet sich, über alle ihm bei seiner Tätigkeit bekannt gewordenen Betriebs- und Geschäftsgeheimnisse auch über die Beendigung des Arbeitsverhältnisses hinaus Stillschweigen zu bewahren.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§9 Schriftform</p>
      <p>Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform. Dies gilt auch für einen Verzicht auf dieses Schriftformerfordernis.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§10 Salvatorische Klausel</p>
      <p>Sollten einzelne Bestimmungen dieses Vertrages unwirksam sein oder werden, wird dadurch die Gültigkeit des übrigen Vertrages nicht berührt. Anstelle der unwirksamen Bestimmung tritt eine wirksame Regelung, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§11 Sozialversicherung und Versicherungsschutz</p>
      <p>Der Arbeitgeber meldet den Arbeitnehmer bei der Minijob-Zentrale (Deutsche Rentenversicherung Knappschaft-Bahn-See) an und führt die pauschalen Abgaben ab. Der Arbeitnehmer ist in der gesetzlichen Rentenversicherung versicherungspflichtig, kann sich hiervon jedoch auf schriftlichen Antrag befreien lassen. Ein eigenständiger Kranken-, Pflege- oder Arbeitslosenversicherungsschutz entsteht durch die geringfügige Beschäftigung allein nicht; für einen anderweitigen Krankenversicherungsschutz (z. B. Familienversicherung oder anderweitige Pflichtversicherung) ist der Arbeitnehmer selbst verantwortlich. Auf Wunsch erhält der Arbeitnehmer eine Bestätigung der Anmeldung.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§12 Sonderzahlungen (13. und 14. Gehalt)</p>
      <p>Ein gesetzlicher Anspruch auf ein 13. oder 14. Monatsgehalt besteht nach deutschem Recht nicht und wird über die vereinbarte Vergütung hinaus nicht geschuldet. Zu beachten ist zudem die in §3 genannte Verdienstgrenze für geringfügige Beschäftigungen, die durch Sonderzahlungen nicht überschritten werden darf. Etwaige zusätzliche Zahlungen werden nur gewährt, wenn sie ausdrücklich und schriftlich gesondert vereinbart werden; eine mehrmalige freiwillige Zahlung begründet keinen Anspruch für die Zukunft (kein Anspruch aus betrieblicher Übung).</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§13 Tarifbindung und Mindestlohn</p>
      <p>Auf dieses Arbeitsverhältnis findet kein Tarifvertrag Anwendung; es gelten die Regelungen dieses Vertrages sowie die einschlägigen gesetzlichen Bestimmungen. Der Arbeitgeber hält den jeweils geltenden gesetzlichen Mindestlohn nach dem Mindestlohngesetz (MiLoG) ein. Sofern zukünftig ein auf das Arbeitsverhältnis anwendbarer Tarifvertrag für allgemeinverbindlich erklärt wird, gelten dessen zwingende Bestimmungen vorrangig.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§14 Vertraulichkeit – konkrete Verstöße und Folgen</p>
      <p>(1) Zur Klarstellung, welches Verhalten einen Verstoß gegen die Vertraulichkeits- und Datenschutzpflichten darstellt, gilt insbesondere Folgendes als Verstoß:</p>
      <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
        <li>die Weitergabe von Test-Zugangsdaten, Ident-Links, Kunden-, Partner- oder Auftraggeberinformationen an Dritte;</li>
        <li>das Anfertigen, Speichern oder Weiterleiten von Screenshots, Foto-, Ton- oder Videoaufnahmen der Test- oder Ident-Verfahren außerhalb der ausdrücklich vorgesehenen Reports;</li>
        <li>die Nutzung überlassener Daten, Ausweisdaten oder Test-Accounts für private oder vertragsfremde Zwecke;</li>
        <li>die Veröffentlichung oder Weitergabe von Informationen über Auftraggeber, Partner, Testinhalte oder Testmethoden gegenüber Dritten oder in sozialen Medien;</li>
        <li>das Unterlassen der fristgerechten Löschung überlassener Daten nach Abschluss des jeweiligen Tests.</li>
      </ul>
      <p className="mt-2">(2) Bei einem Verstoß haftet der Arbeitnehmer nach den gesetzlichen Bestimmungen. Das Recht des Arbeitgebers zur außerordentlichen (fristlosen) Kündigung aus wichtigem Grund sowie zur Geltendmachung von Schadensersatz bleibt ausdrücklich vorbehalten.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§15 Datenschutz, Datensicherheit und ausschließliche Testzwecke</p>
      <p>(1) Der Arbeitgeber verarbeitet personenbezogene Daten der Mitarbeiter sowie im Rahmen der Tätigkeit erhobene oder verarbeitete Daten ausschließlich zur Durchführung des Arbeitsverhältnisses sowie der vereinbarten Test-, Prüf- und Verifizierungsaufgaben. Die Verarbeitung erfolgt unter Beachtung der geltenden datenschutzrechtlichen Vorschriften, insbesondere der Art. 5, 6, 13 und 32 DSGVO.</p>
      <p className="mt-2">(2) Im Rahmen von Test- und Verifizierungsprozessen können, soweit für die jeweilige Testaufgabe erforderlich, insbesondere Identitätsdaten, Daten aus Ausweisdokumenten sowie Foto- oder Videoaufnahmen verarbeitet werden. Diese Daten werden ausschließlich für den jeweiligen Testzweck verwendet, nicht unbefugt an Dritte weitergegeben und nicht länger gespeichert, als es für den jeweiligen Zweck erforderlich ist oder gesetzliche Aufbewahrungspflichten dies vorsehen. Anschließend werden die Daten gelöscht oder, soweit erforderlich, anonymisiert.</p>
      <p className="mt-2">(3) Sämtliche im Rahmen von Test- und Verifizierungsabläufen verwendeten Daten und Identitätsnachweise dienen ausschließlich der Durchführung von Testzwecken. Eine tatsächliche Eröffnung von Bankkonten, Zahlungsverkehrskonten oder sonstigen Finanzkonten auf Grundlage der für Testzwecke bereitgestellten Daten durch den Arbeitgeber erfolgt nicht.</p>
      <p className="mt-2">(4) Der Arbeitgeber trifft gemäß Art. 32 DSGVO geeignete technische und organisatorische Maßnahmen, um personenbezogene Daten vor unbefugter oder unrechtmäßiger Verarbeitung, Verlust, Zerstörung oder unbefugtem Zugriff zu schützen.</p>
      <p className="mt-2">(5) Der Mitarbeiter verpflichtet sich, sämtliche ihm im Rahmen seiner Tätigkeit bekannt werdenden personenbezogenen Daten und vertraulichen Informationen vertraulich zu behandeln, ausschließlich für die vorgesehenen Aufgaben zu verwenden und nicht unbefugt an Dritte weiterzugeben. Diese Verpflichtung besteht auch nach Beendigung des Arbeitsverhältnisses fort, soweit dies gesetzlich erforderlich ist.</p>
    </div>
  </>
);

const MinijobATBody = ({ signedDate }) => (
  <>
    <div>
      <p className="font-bold text-[#0A0A0A]">§1 Vertragsgegenstand</p>
      <p>(1) Der Auftragnehmer erbringt für den Auftraggeber Dienstleistungen im Bereich der IT-Qualitätssicherung und Applikations-Sicherheit.</p>
      <p className="mt-2">(2) Die Tätigkeit umfasst insbesondere:</p>
      <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
        <li>Durchführung und detaillierte Validierung von Identifizierungsprozessen (u. a. WebID, PostID, IDnow und vergleichbare Systeme)</li>
        <li>Analyse der User Journey bei digitalen Anwendungen, insbesondere im Finanzsektor</li>
        <li>Identifikation technischer Schwachstellen, Usability-Probleme und funktionaler Inkonsistenzen</li>
        <li>Erstellung strukturierter Test-Reports inklusive Screenshots, Ablaufprotokollen und Verbesserungsvorschlägen</li>
      </ul>
      <p className="mt-2">(3) Die Tests erfolgen remote und flexibel. Die konkreten Testaufträge werden dem Auftragnehmer über eine Plattform oder per E-Mail mitgeteilt.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§2 Pflichten des Auftragnehmers</p>
      <p>(1) Der Auftragnehmer verpflichtet sich, die ihm übertragenen Tests gewissenhaft, fachgerecht und termingerecht durchzuführen.</p>
      <p className="mt-2">(2) Er verpflichtet sich, ausschließlich eigene, gültige Ausweisdokumente zu verwenden und keine Test-Accounts oder Daten Dritter zu missbrauchen.</p>
      <p className="mt-2">(3) Der Auftragnehmer arbeitet selbständig und eigenverantwortlich. Weisungen des Auftraggebers sind im Rahmen des Vertragszwecks zu befolgen.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§3 Vergütung</p>
      <p>(1) Die Vergütung erfolgt leistungsorientiert pro erfolgreich abgeschlossenem Test. Die Höhe der Vergütung pro Test wird dem Auftragnehmer vor Auftragsannahme mitgeteilt.</p>
      <p className="mt-2">(2) Die Auszahlung erfolgt monatlich nachträglich auf das vom Auftragnehmer benannte Konto, sofern die Reports vollständig und fristgerecht eingegangen sind.</p>
      <p className="mt-2">(3) Der Auftragnehmer ist für die steuerliche Verarbeitung der Einnahmen selbst verantwortlich.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§4 Laufzeit und Kündigung</p>
      <p>(1) Der Vertrag beginnt am {signedDate} (Tag der Unterzeichnung) und wird auf unbestimmte Zeit geschlossen.</p>
      <p className="mt-2">(2) Er kann von beiden Parteien mit einer Frist von 14 Tagen zum Monatsende ordentlich gekündigt werden.</p>
      <p className="mt-2">(3) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§5 Vertraulichkeit (NDA), Datenschutz (DSGVO) &amp; Datenlöschung</p>
      <p>(1) <strong>Vertraulichkeit:</strong> Der Auftragnehmer verpflichtet sich, sämtliche vertraulichen Informationen, die ihm im Rahmen der Tätigkeit bekannt werden, streng geheim zu halten. Dies umfasst insbesondere Geschäftsgeheimnisse, technische Details von Applikationen, Schwachstellenanalysen, Testmethoden, Partnerinformationen sowie sämtliche Daten im Zusammenhang mit Identifizierungsverfahren. Diese Verpflichtung gilt unbefristet auch nach Beendigung des Vertragsverhältnisses.</p>
      <p className="mt-2">(2) <strong>NDA &amp; Vertragsstrafe:</strong> Eine Weitergabe, Vervielfältigung oder sonstige Nutzung vertraulicher Informationen ohne vorherige schriftliche Zustimmung des Auftraggebers ist untersagt. Bei Zuwiderhandlung zahlt der Auftragnehmer eine Vertragsstrafe in Höhe von 5.000,00 € pro Verstoß. Weitergehende Schadensersatzansprüche bleiben vorbehalten.</p>
      <p className="mt-2">(3) <strong>Datenschutz &amp; DSGVO:</strong> Der Auftragnehmer verarbeitet personenbezogene Daten ausschließlich zweckgebunden und weisungsgemäß unter strikter Einhaltung der DSGVO und des BDSG. Sämtliche personenbezogenen Daten (insbesondere Ausweisdaten, Video-Ident-Aufzeichnungen, Test-Accounts) sind unverzüglich nach Abschluss des jeweiligen Tests durch den Auftragnehmer zu löschen.</p>
      <p className="mt-2">(4) <strong>Datenlöschung durch Auftraggeber und Partner:</strong> Die MO Handel & Service, Inh. Mariusz Otok verpflichtet sich, alle im Rahmen der Testtätigkeit erhobenen personenbezogenen Daten und Testergebnisse spätestens 30 Tage nach Abschluss des jeweiligen Testzyklus vollständig und unwiederbringlich zu löschen, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen. Sie stellt vertraglich sicher, dass auch ihre Partner (Banken, Finanzdienstleister und Software-Anbieter) die Daten fristgerecht löschen. Auf Wunsch wird eine Löschbestätigung vorgelegt.</p>
      <p className="mt-2">(5) <strong>Auftragsverarbeitung:</strong> Soweit der Auftragnehmer als Auftragsverarbeiter im Sinne von Art. 28 DSGVO tätig wird, gelten die Bestimmungen der separaten Auftragsverarbeitungsvereinbarung (Anlage 1), die Bestandteil dieses Vertrages ist.</p>
      <p className="mt-2">(6) <strong>Technische und organisatorische Maßnahmen:</strong> Der Auftragnehmer trifft angemessene TOMs zum Schutz der Daten.</p>
      <p className="mt-2">(7) Die Regelungen dieses Paragraphen gelten auch nach Vertragsbeendigung fort.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§6 Haftung</p>
      <p>(1) Der Auftragnehmer haftet für Schäden, die er vorsätzlich oder grob fahrlässig verursacht.</p>
      <p className="mt-2">(2) Die Haftung für leichte Fahrlässigkeit ist auf vertragstypische, vorhersehbare Schäden beschränkt.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§7 Schlussbestimmungen</p>
      <p>(1) Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform.</p>
      <p className="mt-2">(2) Sollte eine Bestimmung unwirksam sein, bleiben die übrigen Bestimmungen wirksam. Die Parteien verpflichten sich, die unwirksame Bestimmung durch eine wirksame zu ersetzen, die dem wirtschaftlichen Zweck am nächsten kommt.</p>
      <p className="mt-2">(3) Es gilt ausschließlich deutsches Recht. Gerichtsstand ist Frankfurt am Main.</p>
      <p className="mt-2 text-slate-500 italic">Anlage 1: Auftragsverarbeitungsvereinbarung (Bestandteil dieses Vertrages).</p>
    </div>
  </>
);

const VollzeitATBody = ({ signedDate }) => (
  <>
    <div>
      <p className="font-bold text-[#0A0A0A]">§1 Beginn und Dauer</p>
      <p>Das Arbeitsverhältnis beginnt am {signedDate} und ist unbefristet. Die Probezeit beträgt 1 Monat.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§2 Tätigkeit</p>
      <p>Der Arbeitnehmer wird als IT Application Tester beschäftigt. Die Aufgaben umfassen das Testen von Mobile- und Web-Applikationen, insbesondere im Finanzbereich, Durchführung von Ident-Verfahren (WebID, PostID, IDnow), Schwachstellenanalyse und Erstellung von detaillierten Test-Reports.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§3 Arbeitszeit</p>
      <p>40 Stunden pro Woche (Vollzeit), flexibel nach Absprache.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§4 Vergütung</p>
      <p>Das Bruttogehalt beträgt 2.900,00 € monatlich. Die Vergütung ist bis zum 15. des Folgemonats fällig.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§5 Urlaub</p>
      <p>30 Arbeitstage pro Jahr.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§6 Vertraulichkeit und Datenschutz (NDA + DSGVO)</p>
      <p>Der Arbeitnehmer verpflichtet sich zur strengsten Vertraulichkeit aller Kundendaten und Testergebnisse. Nach Abschluss jedes Tests sind alle Daten vom Arbeitnehmer und allen beteiligten Partnern innerhalb von 30 Tagen unwiderruflich zu löschen. Bei Verstoß gegen diese Verpflichtung beträgt die Vertragsstrafe 5.000 € pro Fall. Es gilt die DSGVO in vollem Umfang.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§7 Kündigung</p>
      <p>Die gesetzlichen Kündigungsfristen des österreichischen Rechts gelten.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§8 Schlussbestimmungen</p>
      <p>Es gilt österreichisches Recht. Gerichtsstand ist Frankfurt am Main bzw. das örtlich zuständige Gericht in Österreich.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§9 Sozialversicherung, Anmeldung und Versicherungsschutz</p>
      <p>Der Arbeitgeber meldet den Arbeitnehmer vor Arbeitsantritt bei der Österreichischen Gesundheitskasse (ÖGK) zur Pflichtversicherung an. Der Arbeitnehmer ist dadurch nach dem Allgemeinen Sozialversicherungsgesetz (ASVG) kranken-, unfall-, pensions- und arbeitslosenversichert. Die Sozialversicherungsbeiträge sowie die Lohnsteuer werden vom Arbeitgeber ordnungsgemäß einbehalten und an die zuständigen Stellen abgeführt. Auf Wunsch wird dem Arbeitnehmer eine Kopie der Anmeldebestätigung ausgehändigt.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§10 Sonderzahlungen (13. und 14. Gehalt)</p>
      <p>Der Arbeitnehmer hat Anspruch auf die kollektivvertraglich vorgesehenen Sonderzahlungen, nämlich einen Urlaubszuschuss (13. Gehalt) und eine Weihnachtsremuneration (14. Gehalt). Jede Sonderzahlung beträgt grundsätzlich ein Monatsentgelt und wird üblicherweise mit dem Juni-Bezug (Urlaubszuschuss) sowie mit dem November-Bezug (Weihnachtsremuneration) ausbezahlt. Bei unterjährigem Beginn oder Ende des Arbeitsverhältnisses werden die Sonderzahlungen aliquot (anteilig) berechnet. Erfolgsabhängige Provisionen bleiben von den Sonderzahlungen unberührt.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§11 Kollektivvertrag</p>
      <p>Auf dieses Arbeitsverhältnis findet der fachlich einschlägige Kollektivvertrag in seiner jeweils gültigen Fassung Anwendung; im Zweifel gilt der Kollektivvertrag für Angestellte im Handel. Der Kollektivvertrag regelt insbesondere Mindestgehälter, Sonderzahlungen, Arbeitszeit, Urlaub und Kündigungsfristen. Enthält der Kollektivvertrag für den Arbeitnehmer günstigere Bestimmungen als dieser Vertrag, so gehen diese vor. Der jeweils gültige Kollektivvertrag kann beim Arbeitgeber eingesehen werden.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§12 Vertraulichkeit – konkrete Verstöße und Folgen</p>
      <p>(1) Zur Klarstellung, welches Verhalten einen Verstoß gegen die Vertraulichkeits- und Datenschutzpflichten darstellt, gilt insbesondere Folgendes als Verstoß:</p>
      <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
        <li>die Weitergabe von Test-Zugangsdaten, Ident-Links, Kunden-, Partner- oder Auftraggeberinformationen an Dritte;</li>
        <li>das Anfertigen, Speichern oder Weiterleiten von Screenshots, Foto-, Ton- oder Videoaufnahmen der Test- oder Ident-Verfahren außerhalb der ausdrücklich vorgesehenen Reports;</li>
        <li>die Nutzung überlassener Daten, Ausweisdaten oder Test-Accounts für private oder vertragsfremde Zwecke;</li>
        <li>die Veröffentlichung oder Weitergabe von Informationen über Auftraggeber, Partner, Testinhalte oder Testmethoden gegenüber Dritten oder in sozialen Medien;</li>
        <li>das Unterlassen der fristgerechten Löschung überlassener Daten nach Abschluss des jeweiligen Tests.</li>
      </ul>
      <p className="mt-2">(2) Bei einem Verstoß haftet der Arbeitnehmer nach den gesetzlichen Bestimmungen; eine in diesem Vertrag vereinbarte Vertragsstrafe (5.000 € pro Fall) bleibt unberührt. Das Recht des Arbeitgebers zur vorzeitigen Auflösung des Arbeitsverhältnisses aus wichtigem Grund (Entlassung) sowie zur Geltendmachung von Schadensersatz bleibt ausdrücklich vorbehalten.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§13 Datenschutz, Datensicherheit und ausschließliche Testzwecke</p>
      <p>(1) Der Arbeitgeber verarbeitet personenbezogene Daten der Mitarbeiter sowie im Rahmen der Tätigkeit erhobene oder verarbeitete Daten ausschließlich zur Durchführung des Arbeitsverhältnisses sowie der vereinbarten Test-, Prüf- und Verifizierungsaufgaben. Die Verarbeitung erfolgt unter Beachtung der geltenden datenschutzrechtlichen Vorschriften, insbesondere der Art. 5, 6, 13 und 32 DSGVO.</p>
      <p className="mt-2">(2) Im Rahmen von Test- und Verifizierungsprozessen können, soweit für die jeweilige Testaufgabe erforderlich, insbesondere Identitätsdaten, Daten aus Ausweisdokumenten sowie Foto- oder Videoaufnahmen verarbeitet werden. Diese Daten werden ausschließlich für den jeweiligen Testzweck verwendet, nicht unbefugt an Dritte weitergegeben und nicht länger gespeichert, als es für den jeweiligen Zweck erforderlich ist oder gesetzliche Aufbewahrungspflichten dies vorsehen. Anschließend werden die Daten gelöscht oder, soweit erforderlich, anonymisiert.</p>
      <p className="mt-2">(3) Sämtliche im Rahmen von Test- und Verifizierungsabläufen verwendeten Daten und Identitätsnachweise dienen ausschließlich der Durchführung von Testzwecken. Eine tatsächliche Eröffnung von Bankkonten, Zahlungsverkehrskonten oder sonstigen Finanzkonten auf Grundlage der für Testzwecke bereitgestellten Daten durch den Arbeitgeber erfolgt nicht.</p>
      <p className="mt-2">(4) Der Arbeitgeber trifft gemäß Art. 32 DSGVO geeignete technische und organisatorische Maßnahmen, um personenbezogene Daten vor unbefugter oder unrechtmäßiger Verarbeitung, Verlust, Zerstörung oder unbefugtem Zugriff zu schützen.</p>
      <p className="mt-2">(5) Der Mitarbeiter verpflichtet sich, sämtliche ihm im Rahmen seiner Tätigkeit bekannt werdenden personenbezogenen Daten und vertraulichen Informationen vertraulich zu behandeln, ausschließlich für die vorgesehenen Aufgaben zu verwenden und nicht unbefugt an Dritte weiterzugeben. Diese Verpflichtung besteht auch nach Beendigung des Arbeitsverhältnisses fort, soweit dies gesetzlich erforderlich ist.</p>
    </div>
  </>
);

const TeilzeitATBody = ({ signedDate }) => (
  <>
    <div>
      <p className="font-bold text-[#0A0A0A]">§1 Beginn und Dauer</p>
      <p>Das Arbeitsverhältnis beginnt am {signedDate} und ist unbefristet. Probezeit: 1 Monat.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§2 Tätigkeit</p>
      <p>IT Application Tester – App-Tests, Schwachstellenanalyse, Ident-Verfahren Testing, Reporting.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§3 Arbeitszeit</p>
      <p>20 Stunden pro Woche (flexibel).</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§4 Vergütung</p>
      <p>Fixgehalt: 2.200,00 € brutto monatlich bei 20 Wochenstunden + erfolgsabhängige Provisionen.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§5 Vertraulichkeit und Datenschutz</p>
      <p>Strenge NDA + DSGVO. Alle Daten werden nach Testabschluss innerhalb von 30 Tagen gelöscht. Vertragsstrafe bei Verstoß: 5.000 €.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§6 Sonstiges</p>
      <p>Gesetzliche Regelungen Österreich. Gerichtsstand Frankfurt am Main bzw. Österreich.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§7 Sozialversicherung, Anmeldung und Versicherungsschutz</p>
      <p>Der Arbeitgeber meldet den Arbeitnehmer vor Arbeitsantritt bei der Österreichischen Gesundheitskasse (ÖGK) zur Pflichtversicherung an. Der Arbeitnehmer ist dadurch nach dem Allgemeinen Sozialversicherungsgesetz (ASVG) kranken-, unfall-, pensions- und arbeitslosenversichert. Die Sozialversicherungsbeiträge sowie die Lohnsteuer werden vom Arbeitgeber ordnungsgemäß einbehalten und an die zuständigen Stellen abgeführt. Auf Wunsch wird dem Arbeitnehmer eine Kopie der Anmeldebestätigung ausgehändigt.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§8 Sonderzahlungen (13. und 14. Gehalt)</p>
      <p>Der Arbeitnehmer hat Anspruch auf die kollektivvertraglich vorgesehenen Sonderzahlungen, nämlich einen Urlaubszuschuss (13. Gehalt) und eine Weihnachtsremuneration (14. Gehalt). Jede Sonderzahlung beträgt grundsätzlich ein Monatsentgelt (bezogen auf das Fixgehalt) und wird üblicherweise mit dem Juni-Bezug (Urlaubszuschuss) sowie mit dem November-Bezug (Weihnachtsremuneration) ausbezahlt. Bei unterjährigem Beginn oder Ende des Arbeitsverhältnisses werden die Sonderzahlungen aliquot (anteilig) berechnet. Erfolgsabhängige Provisionen bleiben von den Sonderzahlungen unberührt.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§9 Kollektivvertrag</p>
      <p>Auf dieses Arbeitsverhältnis findet der fachlich einschlägige Kollektivvertrag in seiner jeweils gültigen Fassung Anwendung; im Zweifel gilt der Kollektivvertrag für Angestellte im Handel. Der Kollektivvertrag regelt insbesondere Mindestgehälter, Sonderzahlungen, Arbeitszeit, Urlaub und Kündigungsfristen. Enthält der Kollektivvertrag für den Arbeitnehmer günstigere Bestimmungen als dieser Vertrag, so gehen diese vor. Der jeweils gültige Kollektivvertrag kann beim Arbeitgeber eingesehen werden.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§10 Vertraulichkeit – konkrete Verstöße und Folgen</p>
      <p>(1) Zur Klarstellung, welches Verhalten einen Verstoß gegen die Vertraulichkeits- und Datenschutzpflichten darstellt, gilt insbesondere Folgendes als Verstoß:</p>
      <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
        <li>die Weitergabe von Test-Zugangsdaten, Ident-Links, Kunden-, Partner- oder Auftraggeberinformationen an Dritte;</li>
        <li>das Anfertigen, Speichern oder Weiterleiten von Screenshots, Foto-, Ton- oder Videoaufnahmen der Test- oder Ident-Verfahren außerhalb der ausdrücklich vorgesehenen Reports;</li>
        <li>die Nutzung überlassener Daten, Ausweisdaten oder Test-Accounts für private oder vertragsfremde Zwecke;</li>
        <li>die Veröffentlichung oder Weitergabe von Informationen über Auftraggeber, Partner, Testinhalte oder Testmethoden gegenüber Dritten oder in sozialen Medien;</li>
        <li>das Unterlassen der fristgerechten Löschung überlassener Daten nach Abschluss des jeweiligen Tests.</li>
      </ul>
      <p className="mt-2">(2) Bei einem Verstoß haftet der Arbeitnehmer nach den gesetzlichen Bestimmungen; eine in diesem Vertrag vereinbarte Vertragsstrafe (5.000 € pro Fall) bleibt unberührt. Das Recht des Arbeitgebers zur vorzeitigen Auflösung des Arbeitsverhältnisses aus wichtigem Grund (Entlassung) sowie zur Geltendmachung von Schadensersatz bleibt ausdrücklich vorbehalten.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§11 Datenschutz, Datensicherheit und ausschließliche Testzwecke</p>
      <p>(1) Der Arbeitgeber verarbeitet personenbezogene Daten der Mitarbeiter sowie im Rahmen der Tätigkeit erhobene oder verarbeitete Daten ausschließlich zur Durchführung des Arbeitsverhältnisses sowie der vereinbarten Test-, Prüf- und Verifizierungsaufgaben. Die Verarbeitung erfolgt unter Beachtung der geltenden datenschutzrechtlichen Vorschriften, insbesondere der Art. 5, 6, 13 und 32 DSGVO.</p>
      <p className="mt-2">(2) Im Rahmen von Test- und Verifizierungsprozessen können, soweit für die jeweilige Testaufgabe erforderlich, insbesondere Identitätsdaten, Daten aus Ausweisdokumenten sowie Foto- oder Videoaufnahmen verarbeitet werden. Diese Daten werden ausschließlich für den jeweiligen Testzweck verwendet, nicht unbefugt an Dritte weitergegeben und nicht länger gespeichert, als es für den jeweiligen Zweck erforderlich ist oder gesetzliche Aufbewahrungspflichten dies vorsehen. Anschließend werden die Daten gelöscht oder, soweit erforderlich, anonymisiert.</p>
      <p className="mt-2">(3) Sämtliche im Rahmen von Test- und Verifizierungsabläufen verwendeten Daten und Identitätsnachweise dienen ausschließlich der Durchführung von Testzwecken. Eine tatsächliche Eröffnung von Bankkonten, Zahlungsverkehrskonten oder sonstigen Finanzkonten auf Grundlage der für Testzwecke bereitgestellten Daten durch den Arbeitgeber erfolgt nicht.</p>
      <p className="mt-2">(4) Der Arbeitgeber trifft gemäß Art. 32 DSGVO geeignete technische und organisatorische Maßnahmen, um personenbezogene Daten vor unbefugter oder unrechtmäßiger Verarbeitung, Verlust, Zerstörung oder unbefugtem Zugriff zu schützen.</p>
      <p className="mt-2">(5) Der Mitarbeiter verpflichtet sich, sämtliche ihm im Rahmen seiner Tätigkeit bekannt werdenden personenbezogenen Daten und vertraulichen Informationen vertraulich zu behandeln, ausschließlich für die vorgesehenen Aufgaben zu verwenden und nicht unbefugt an Dritte weiterzugeben. Diese Verpflichtung besteht auch nach Beendigung des Arbeitsverhältnisses fort, soweit dies gesetzlich erforderlich ist.</p>
    </div>
  </>
);

const FreiberuflerATBody = () => (
  <>
    <div>
      <p className="font-bold text-[#0A0A0A]">§1 Gegenstand</p>
      <p>Der Auftragnehmer erbringt als selbstständiger Freiberufler IT Application Testing-Dienstleistungen (App-Tests, Schwachstellenanalyse, Ident-Verfahren-Testing, Reporting) für den Auftraggeber.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§2 Vergütung</p>
      <p>Die Vergütung erfolgt ausschließlich provisionsbasiert (je nach vereinbarter Provision pro erfolgreichem Test / Report / Projekt). Kein Fixgehalt.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§3 Vertraulichkeit und Datenschutz (NDA + DSGVO)</p>
      <p>Der Auftragnehmer verpflichtet sich zur strengsten Vertraulichkeit. Alle Daten sind nach Abschluss des Tests innerhalb von 30 Tagen vom Auftragnehmer und allen Partnern unwiderruflich zu löschen. Bei Verstoß beträgt die Vertragsstrafe 5.000 € pro Fall. Volle Einhaltung der DSGVO.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§4 Dauer und Kündigung</p>
      <p>Unbefristet, kündbar mit 14 Tagen Frist. Es besteht kein Arbeitsverhältnis – der Auftragnehmer ist selbstständig und für seine Sozialversicherung selbst verantwortlich.</p>
    </div>
    <div>
      <p className="font-bold text-[#0A0A0A]">§5 Gerichtsstand</p>
      <p>Frankfurt am Main bzw. örtlich zuständiges Gericht in Österreich.</p>
    </div>
  </>
);

export const ContractBody = ({ type, signedDate }) => {
  if (type === 'teilzeit') return <TeilzeitBody signedDate={signedDate} />;
  if (type === 'minijob') return <MinijobBody signedDate={signedDate} />;
  if (type === 'minijob_at') return <MinijobATBody signedDate={signedDate} />;
  if (type === 'vollzeit_at') return <VollzeitATBody signedDate={signedDate} />;
  if (type === 'teilzeit_at') return <TeilzeitATBody signedDate={signedDate} />;
  if (type === 'freiberufler_at') return <FreiberuflerATBody />;
  return <VollzeitBody signedDate={signedDate} />;
};
