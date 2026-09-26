# Prysm Technologies (ehemals Keyperion / Precision Labs) – PRD

## 🟠 team@more-apps.de + Aufgaben-Gruppenzuweisung + /bewerben (2026-07)
- **Kontakt-E-Mail** überall → `team@more-apps.de` (Footer/Kontakt/Impressum/Datenschutz); HR → `hr@more-apps.de` (Domain-Konsistenz, more-applications.de nicht im Besitz).
- **AdminTasks – Gruppenzuweisung:** neuer „Alle auswählen/abwählen ({N})"-Button im Zuweisungs-Modal (bezogen auf aktuelle Suche/Filterung) → eine Aufgabe an ganze Gruppe gleichzeitig via bestehendes `PUT /api/admin/tasks/{id}/assign-multiple`.
- **Bugfix:** `setAiAppName is not defined` in AdminTasks.jsx (Crash beim Aufgabe-Erstellen) entfernt.
- **/bewerben:** identisch zu /signup aber OHNE Meta-Pixel (Guard in index.html überspringt init+PageView auf /bewerben; Component pixel-frei); zusätzlich Staatsbürgerschaft als dynamische Mehrfach-Eingabe („+ Weitere hinzufügen", join per Komma).
- Verifiziert per Frontend-Testing-Agent: Admin-Login, Task-Erstellung ohne Crash, Alle-auswählen-Toggle, Mehrfachzuweisung („an 2 Mitarbeiter zugewiesen"), keine Konsolenfehler.


## 🟠 /signup Ad-Conversion Landingpage + Meta Pixel (2026-07)
- Neue schlanke Landingpage **`/signup`** (standalone, ohne Navbar/Footer) für Werbe-Conversions. Job-Pitch: Remote Application Tester, 2.200 € netto/Monat, 30 Urlaubstage, Weihnachts- & Geburtstagsgeld (je doppelter Monatslohn), 100% Homeoffice.
- Formular nur: Name, Telefonnummer, Geburtsdatum, E-Mail + optionaler CV-Upload. Sendet an das BESTEHENDE `POST /api/applications/submit` (leere Adressfelder, auto-generiertes Passwort, position="Remote Application Tester", message markiert Kampagne) → Leads erscheinen normal in der Admin-Bewerbungsliste.
- **Meta Pixel** (ID 1596178802206468) global in `public/index.html` (PageView) + `fbq('track','Lead')` bei erfolgreichem Absenden auf /signup.
- Verifiziert: Backend-Funnel-Test 10/10 (200, in Admin-Liste sichtbar, leere Felder akzeptiert, Duplikat→400), Frontend lint-clean + compiled, Pixel-ID im HTML, Screenshot ok.


## 🟠 Favicon + restliche Vertrags-Altdaten (2026-07)
- **Favicon:** `frontend/public/favicon.svg` von altem grünem „T" (#659A65) auf neues oranges MORE-„M" (Gradient #FDBA74→#F97316→#EA580C, „M"-Pfad) umgestellt; Cache-Buster `?v=2` in index.html. Per Frontend-Testing-Agent verifiziert (8/8: neues Icon, 200, image/svg+xml, kein Grün, keine Konsolenfehler).
- **Restliche Vertrags-Altdaten im Frontend behoben** (beim ersten Rebrand nur Backend ersetzt): `MitarbeiterVertrag.jsx`, `MitarbeiterContractSign.jsx` (inkl. Unterzeichner + Ort), `ContractTemplates.jsx` → MORE Applications GmbH, Heinrich-Hertz-Str. 133, 22083 Hamburg, Geschäftsführer Jens Olaf Brändel. SMS-Absender-Default PrecisionLab→MOREApps. Full-Repo-Scan: 0 Altdaten-Treffer.


## 🟠 Inhaltskorrektur: Application TESTING statt Entwicklung (2026-07)
- Nutzer stellte klar: MORE Applications GmbH **testet Software (Application Testing / QA)**, entwickelt sie nicht. Alle öffentlichen Seiten inhaltlich zurück auf Testing/QA umgestellt (Design/Orange/Name/Hamburg-Daten unverändert).
- Home: „Wir finden Fehler, bevor Ihre Nutzer es tun", Services = Funktionales/Performance/Mobile/Usability-Testing, Prozess = Analyse→Testkonzept→Durchführung→Reporting, Stats = geprüfte Anwendungen/Testexperten. Unternehmen = Testing-Agentur-Story. Dienstleistungen = 6 Testing-Leistungen + Test-Tools-Band (Selenium/Cypress/Playwright/Appium/JMeter/Postman…). Karriere = Testing-Rollen (Web App Tester, QA Engineer, Mobile App Tester, Junior Test Analyst, Werkstudent Testing). Footer-Services + Meta-Description auf Testing. Backend-Vertragstexte („IT Application Testing") passen bereits.
- Verifiziert per Frontend-Testing-Agent: Inhalte korrekt (Testing statt Dev), Bewerbungsformular POST /api/applications/submit → Success-Modal, Kontakt-Toast, keine Konsolen-/React-Fehler.


## 🟠 Restyle Indigo → Hell Orange/Weiß (2026-07)
- Nutzer fand den dunklen Indigo-Look schlecht → kompletter Umstieg auf **hellen Weiß/Orange-Stil**. Palette (brand/sage) → Orange (#F97316 etc.), `ink` = warmes Near-Black nur noch für TEXT. `more-gradient-text` + grid + selection + Logo-Gradient + theme-color auf Orange.
- Öffentliche Website: alle dunklen `bg-ink`-Hero-/Sektionen → helle Verläufe (from-orange-50 via-white), CTA-/Info-Karten → Orange-Gradient mit weißer Schrift, Buttons → Orange. Home/Unternehmen/Kontakt/Footer neu geschrieben; Dienstleistungen/Karriere/Impressum/Datenschutz + Navbar per gezielten Replace umgestellt.
- Mitarbeiter-Panel: zuvor eingefärbte Indigo-Hex → Orange rekoloriert (Login/Signup/Verification/Pending/AwaitingApproval/ContractSign/EmailPanel). Admin-Panel bleibt vorerst dunkel (Tokyo Night) – separates internes Tool.
- Verifiziert per Screenshots: Home/Kontakt/Mitarbeiter-Login alle hell/orange, Formularlogik unverändert. Lint sauber (nur bestehende Alt-Warnungen).


## 🟢 Rebrand → MORE Applications GmbH + grundlegendes Redesign (2026-07)
- **Kompletter Rebrand (überall):** Tdata/Webora → **MORE Applications GmbH**. Neues Logo (`MoreLogo`, Indigo→Cyan-Gradient „M", `Logo.jsx` mit `TdataLogo`-Alias für Abwärtskompatibilität aller Imports). Öffentliche Website, Mitarbeiter- UND Admin-Panel umbenannt/umgefärbt.
- **Grundlegend neues Design:** Salbeigrün → modernes **Indigo/Violett + Cyan**, dunkle Hero-Sektionen (`bg-ink`), Fonts Merriweather/Source Sans → **Space Grotesk + Inter**. Umgesetzt via `tailwind.config.js` (sage-Palette auf Indigo remappt + neues `brand`/`ink`/`cyanx`), `index.css`, `index.html`. Panels färben sich über die sage→indigo-Neudefinition automatisch um; hartkodierte Grün-Hex per sed → Indigo ersetzt.
- **Öffentliche Website inhaltlich auf Software-/App-Entwicklung** neu gebaut: Home, Unternehmen, Dienstleistungen, Karriere, Kontakt, Impressum, Datenschutz + Navbar + Footer. Karriere-Formular-Logik (application submit, referral, success-modal) unverändert erhalten; Kontakt-Form bleibt Mock.
- **Impressum (exakt):** MORE Applications GmbH, Geschäftsführer Jens Olaf Brändel, Heinrich-Hertz-Str. 133, 22083 Hamburg, Amtsgericht Hamburg HRB 191673, EUID DEK1101R.HRB191673, USt-IdNr. DE134894775, E-Mail info@more-applications.de. Alle @tdata-testing.de → @more-applications.de.
- **Backend-Texte:** Verträge (applications.py/contracts.py) + SMS (sms_service.py): Arbeitgeber „MO Handel & Service, Inh. Mariusz Otok" → „MORE Applications GmbH", Adresse → Hamburg, Unterzeichner Mariusz Otok → Geschäftsführer Jens Olaf Brändel, Ort in Datumszeilen Ginsheim → Hamburg. `CONTRACT_TEMPLATE_VERSION` 4→5 → Vorlagen re-seeded.
- **Verifiziert:** Backend-Testing 17/17 grün (Login, Bewerbung, 7 Templates v5 mit „MORE Applications GmbH" & 0 Alt-Branding, accept, my-contract, Vertrags-Download mit Hamburg-Adresse + Jens Olaf Brändel). Eigene Screenshots: Home/Leistungen/Impressum/Mitarbeiter-Login/Admin-Login alle korrekt neu gebrandet. Admin-Login-E-Mail (admin@webora.de) bewusst NICHT geändert (Lockout-Schutz).


## 🟢 Env-Wiederherstellung + Admin-Panel Cleanup (2026-07)
- **Container-Recovery:** Nach Container-Neustart waren `backend/.env` + `frontend/.env` sowie die DB verloren. Beide .env neu erstellt (MONGO_URL, DB_NAME=`tdata_testing`, neuer starker JWT_SECRET_KEY, Admin-Creds aus test_credentials, CORS=*, leere ANOSIM/SMSROUTE-Keys → Features inaktiv bis Nutzer Keys liefert), Frontend-Deps neu installiert. Admin + 7 Vertragsvorlagen automatisch re-geseedet. ⚠️ Alte Laufzeitdaten (Bewerbungen/Mitarbeiter/Verträge/Chat) sind verloren.
- **Admin-Panel: 3 Seiten entfernt** (Nutzerwunsch, nicht mehr benötigt): „Anosim Nummern" (`/admin/anosim`), „E-Mail Postfächer" (`/admin/email-inbox`), „Test-Sitzungen" (`/admin/test-sessions`). Entfernt: Sidebar-Einträge + ungenutzte Icons (Phone/Mail/Timer) in `AdminLayout.jsx`, Imports + Route-Blöcke in `App.js`, Page-Dateien `AdminAnosim.jsx`/`AdminEmailInbox.jsx`/`AdminTestSessions.jsx` gelöscht. Öffentliche `/test/:token`-Seite + Backend unangetastet. Per Frontend-Testing-Agent verifiziert (Items weg, keine Crashes, restliche Nav ok).


## 🟢 Telegram-Reste komplett ausgebaut (2026-06)
- Vollständig aus `routes/chat.py` entfernt: `TELEGRAM_BOT_TOKEN`/`TELEGRAM_API`-Konstanten, `send_telegram_notification()`, beide Aufrufe in `/send` + `/send-image`, ungenutzter `httpx`-Import und der verwaiste `logger`. `TELEGRAM_BOT_TOKEN` aus `backend/.env` entfernt, Collection `telegram_subscribers` gedroppt.
- Verifiziert per Testing-Agent (**iteration_31.json**): **461/461 Backend-Tests grün** (21 Chat + 26 neue Telegram-Removal-Regression + 414 Security), 0 kritische Findings, keine Regression. Chat-Senden/-Bild/-Konversationen/-Unread + Path-Traversal-Schutz weiterhin intakt; Webhook 404.
- ⚠️ **Offene Aktion für Nutzer (extern, kann ich nicht):** Der alte Telegram-Bot-Token bleibt trotz Entfernung aus .env gültig und steht in historischen Log-Zeilen → bitte den Bot über BotFather widerrufen/löschen.

## 🟢 Telegram-Webhook entfernt + Security-Re-Audit (2026-06)
- `POST /api/chat/telegram/webhook` inkl. `/start`//`/stop`-Registrierung komplett entfernt (routes/chat.py), `TELEGRAM_WEBHOOK_SECRET` aus .env raus, ungenutzter `Request`-Import bereinigt. Webhook → 404.
- Security-Re-Audit per Testing-Agent (**iteration_30.json**): **414/414 Security-Tests + 21/21 Chat-Tests grün, 0 kritische / 0 kleinere Findings, keine Regression.**
- Hinweis (informativ, kein Sicherheitsrisiko): `db.telegram_subscribers` ist ohne Webhook nur noch lesbar; `send_telegram_notification()` feuert nur für bereits gespeicherte chat_ids. Falls Telegram-Benachrichtigungen künftig nicht mehr gewünscht sind, können Funktion + Collection + `TELEGRAM_BOT_TOKEN` entfernt werden.

## 🔴🟢 Security-Audit (gesamtes Backend) – 0 offene Schwachstellen (2026-06)
Vollständiger Audit + Fixes, per Testing-Agent verifiziert (**387/387 Security-Tests grün, iteration_29.json**).
**Behobene Schwachstellen:**
- **CRITICAL IDOR** `GET /api/employee/documents/{id}/download` (contract-Zweig): fremde signierte Verträge waren abrufbar → jetzt Eigentümerprüfung (`employee_email == token.sub` bzw. Admin).
- **HIGH NoSQL-Injection** `POST /api/applications/login`: untypisierter `dict`-Body erlaubte Mongo-Operatoren (`$ne`) → jetzt Pydantic-Modell `ApplicantLogin(EmailStr, str)` → 422 statt 500/Bypass.
- **Backdoors entfernt**: unauth. `POST /api/admin/init-admin` + `POST /api/employee/init-employee` (letzterer legte Account mit fest kodierten Zugangsdaten an) → gelöscht (404). Demo `GET/POST /api/status` entfernt.
- **CORS**: `allow_credentials=True` + `*` → `allow_credentials=False` (App nutzt Bearer-Token, keine Cookies).
- **Telegram-Webhook** `POST /api/chat/telegram/webhook`: war unauthentifiziert (Info-Leak über Subscriber) → `TELEGRAM_WEBHOOK_SECRET` in .env + **fail-closed** Header-Prüfung (403 ohne/falsches Secret). ⚠️ VPS: gleiches Secret setzen und bei Telegram `setWebhook(secret_token=...)` hinterlegen.
- **Session-Token-Entropie**: `uuid4().hex[:12]` (48 Bit) → `secrets.token_urlsafe(32)` (~256 Bit) für öffentliche 1h-Test-Session-Links.
**Bereits vorher stark (bestätigt):** JWT fail-closed (kein Default-Secret), bcrypt, Brute-Force-Lockout Admin-Login (5→429), Eigentümerprüfung Verträge (get/sign/download), Path-Traversal-Schutz Chat-Bilder, RBAC auf 45 Admin-Endpunkten (no-auth/employee/5 gefälschte JWT-Varianten → 401/403).
**Restliche LOW-Hinweise (nicht ausnutzbar, aktiv gefuzzt):** 7 verbliebene `data: dict`-Bodies (Defence-in-Depth), Brute-Force nur per ip:email (kein per-Account-Zähler). Kein offenes Risiko.

## 🟢 Emergent-Spuren entfernt + KI entfernt (2026-06)
- **Alle sichtbaren „Emergent"-Hinweise aus dem ausgelieferten Code entfernt:**
  - `frontend/public/index.html`: „Made with Emergent"-Badge-Skript (emergent-main.js), Visual-Edits-Skripte (debug-monitor.js/Tailwind-CDN) und PostHog-Analytics komplett entfernt. lang=„de", Titel/Description = Tdata Testing.
  - Doku: `SELF_HOSTING_ANLEITUNG.md` (Emergent Discord/Support → info@tdata-testing.de), `ADMIN_LOGIN_ANLEITUNG.md` (Preview-URL → www.tdata-testing.de).
- **KI-Funktionen auf Nutzerwunsch KOMPLETT entfernt (Option b):**
  - Backend: `services/ai_task_service.py` gelöscht; Admin-Endpoint `POST /api/admin/tasks/ai-generate` entfernt (routes/admin.py); toter LLM-Fallback (`_extract_code_via_llm`, `get_verification_codes_smart`) aus `email_inbox_service.py` entfernt (E-Mail-Code-Erkennung läuft weiterhin rein per Regex `get_verification_codes`). `EMERGENT_LLM_KEY` aus backend/.env entfernt. `emergentintegrations` wird nirgends mehr importiert.
  - Frontend: „✨ Mit KI generieren"-Panel + Logik + State + Sparkles-Import aus `pages/admin/AdminTasks.jsx` entfernt. Aufgaben-Erstellung ansonsten unverändert.
- **Bewusst belassen** (kein ausgelieferter Code / ändert sich beim Deploy): dev-only `frontend/plugins/visual-edits/*` (nicht im Prod-Build), `REACT_APP_BACKEND_URL`/`FRONTEND_URL` (Preview-Deploy-URLs), Test-Dateien, interne memory/*.
- Verifiziert: Backend startet fehlerfrei (Templates synced), Frontend kompiliert (nur bestehende eslint-Warnungen), Startseite lädt, Badge weg. Final-Grep: keine „emergent"-Referenz mehr im ausgelieferten Code/Doku.

## 🟢 Rebrand → Tdata Testing + Redesign öffentliche Website (2026-06)
- **Rebrand Webora → Tdata / Tdata Testing**: Logo/Navbar = „Tdata" (grünes Serifen-„T"-Emblem + Wortmarke), langer Name (Footer, Impressum, Verträge) = „Tdata Testing". Rechtsträger unverändert: MO Handel & Service, Inh. Mariusz Otok.
- **Design: Klassisch & seriös, Salbeigrün/Weiß** (Tailwind-Palette `sage-50..900`, primär #659A65 / hover #507D50, dunkelgrün #1A261A für Footer/CTA). Fonts: Merriweather (Serifen-Headlines, `font-heading`) + Source Sans 3 (`font-body`). Keine Bento-Grids/Glasmorphismus/8xl-Headlines mehr.
- **Öffentliche Seiten komplett neu gebaut**: Home, Unternehmen, Dienstleistungen, Karriere, Kontakt, Impressum, Datenschutz + Navbar (weiß, border-bottom, sticky, kein blur) + Footer (dunkelgrün). Alle E-Mails → @tdata-testing.de.
- **Mitarbeiter-Panel nur umgefärbt** (kein Redesign): `sky-*`→`sage-*`, Blau/Lila-Akzente→sage, `#0EA5E9`→#659A65 etc., Logo grünes „T", Branding „Tdata Testing". Funktionalität unverändert.
- **Admin-Panel bewusst UNVERÄNDERT** (dunkles „Tokyo Night", blaues „W"-Logo `WeboraLogo`, Wortmarke „Webora"). `Logo.jsx` exportiert `TdataLogo` (public/Mitarbeiter) UND das originale `WeboraLogo` (nur Admin).
- **Backend-Texte**: „bei Webora"→„bei Tdata Testing" in Verträgen (applications.py/contracts.py), SMS-Texte (sms_service.py). `CONTRACT_TEMPLATE_VERSION` 3→4 → Vorlagen re-seeded. Admin-Login-Mail (admin@webora.de) bewusst NICHT geändert (Lockout-Schutz).
- **Bugfix**: Karriere-Formular White-Screen bei FastAPI-422 behoben (detail-Array wird jetzt zu String normalisiert, statt als React-Child gerendert).
- Verifiziert: Testing-Agent (Frontend 92%, alle 7 public Seiten fehlerfrei, kein „Webora" sichtbar, Karriere-POST 200, Mitarbeiter-Panel 0 sky-Klassen) + eigene Screenshots (Home/Karriere/Mitarbeiter-Login grün, Admin unverändert blau).

## 🟢 Auftragnehmer-Freitextfeld (nur Freiberufler) (2026-08-18)
- Beim Freiberufler-Vertrag (`freiberufler_at`) kann der Admin im Accept-/Vertrag-ändern-Dialog ein freies Textfeld „Auftragnehmer" (eigene Firma des Freelancers: Name, Adresse, UID …) eingeben. Nur bei `freiberufler_at` sichtbar; bei allen anderen Verträgen unverändert.
- Backend: `contractor` in accept + change-contract-type gespeichert, in `my-contract` + Admin-Liste (ApplicationResponse) zurückgegeben. Download-Vertrag: bei Freiberufler „Auftraggeber/Auftragnehmer"-Labels + `contractor`-Block statt Arbeitnehmer-Name/Adresse (leer = Fallback Name/Adresse). Erste Zeile = Unterzeichner.
- Frontend: Admin-Dialog Textarea (data-testid `accept-contractor`), Unterschriftsseite zeigt bei Freiberufler „Auftraggeber/Auftragnehmer" + contractor (whitespace-pre-line).
- Verifiziert per curl E2E (accept freiberufler_at + contractor → Admin-Liste + my-contract liefern contractor korrekt). Frontend kompiliert fehlerfrei.

## 🟢 Brute-Force-Schutz Admin-Login (2026-08-18)
- `POST /api/admin/login` mit MongoDB-basiertem Rate-Limiting: nach **5 Fehlversuchen** je `{IP}:{Email}` → **15 Min Sperre** (HTTP 429, DE-Meldung). Zähler wird bei Erfolg gelöscht, nach Ablauf der Sperre zurückgesetzt.
- Client-IP via `X-Forwarded-For` (hinter Nginx). Neues DB-Audit-Log `admin_login_audit` (email, ip, success, reason, created_at) – Audit-Fehler blockieren den Login nie (fail-safe).
- Collections: `login_attempts` (identifier, failed_count, locked_until_ts), `admin_login_audit`. Code: routes/admin.py.
- Verifiziert per curl: korrekter Login 200, 5× 401, 6.× 429, korrektes PW bei aktiver Sperre 429, Audit-Log geschrieben. Test-Daten bereinigt.

## 🟢 DSGVO-Klausel Freiberufler AT (2026-08-18)
- §8 „Datenschutz, Datensicherheit und ausschließliche Testzwecke (DSGVO)" mit 30-Tage-Löschung der Testdaten in `freiberufler_at` ergänzt (routes/applications.py, _build_contract_html_parts).
- `CONTRACT_TEMPLATE_VERSION` 2 → 3 → alle Vorlagen re-seeden beim Start. Verifiziert (DB: version=3, §8 + „Löschung der Testdaten" + „30 Tagen" vorhanden). ⚠️ VPS: Backend neu starten, damit Sync greift.

## 🔴 SICHERHEITSVORFALL & BEHEBUNG (2026-08-16)
**Vorfall:** Unbefugter Zugriff aufs Admin-Panel; Fremde konnten Accounts anlegen/akzeptieren.
**Ursachen (per Security-Audit + Code bestätigt):**
1. `utils/auth.py`: `SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "<hartkodiertes Default>")` – `JWT_SECRET_KEY` fehlte in .env → jeder mit Kenntnis des (öffentlichen) Quellcodes konnte Admin-JWTs fälschen.
2. Viele Admin-/Daten-Endpunkte prüften nur `authorization.startswith("Bearer ")`, ohne das Token zu dekodieren oder `role=="admin"` zu prüfen (Broken Access Control) → z. B. `POST /accept`, `GET /applications/`, `DELETE`, Verifikations-Bilder.
3. BOLA: `GET /api/contracts/{id}` gab jeden Vertrag (IBAN/Gehalt/PII) ohne Eigentümerprüfung heraus.
**Behebung (verifiziert, 23/23 Backend-Tests grün):**
- `JWT_SECRET_KEY` (starkes Zufalls-Secret) in `backend/.env` gesetzt; `auth.py` startet NICHT mehr ohne Secret (fail-closed, kein Default).
- `_require_admin(authorization)` (dekodiert Token + prüft role=="admin") auf allen Admin-Endpunkten in `applications.py` erzwungen (get_applications, accept, unlock, contract-type, delete, delete_verification, verification-image).
- `contracts.py`: neue Helfer `_verify_token`/`_require_admin`; Admin-Zwang auf create/list; Eigentümerprüfung (employee_email == token.sub, Admin-Bypass) auf get_contract/sign/download.
- Verifiziert: gefälschte/alte-Secret/Applicant-Tokens → 401/403; echter Admin + Applicant-Eigenzugriff → 200.
**⚠️ NOCH VOM NUTZER AUF VPS ZU TUN:** neues `JWT_SECRET_KEY` in VPS-.env setzen (invalidiert alle alten/gestohlenen Tokens), Admin-Passwort ändern, DB von durch Angreifer angelegten Bewerbungen bereinigen, Code deployen + Backend neu starten. Regressions-Suite: `backend/tests/test_security_auth_remediation.py`.

## 🔵 Rebrand → Webora (2026-06)
- Kompletter Rebrand **Keyperion Technologies → Webora** (Frontend, Backend-Texte, Verträge, Mails, index.html, Impressum, SMS-Texte).
- **Design: Hellblau/Weiß** (grün #00C853/emerald/green → sky #0EA5E9 / sky-* Klassen; rgba 0,200,83 → 14,165,233).
- **Neues Logo** `WeboraLogo` (aufwändiges „W"-Monogramm mit Sky-Gradient, Hexagon-Rahmen, Doppel-W-Tiefe, Glanz) + passendes `favicon.svg` + theme-color #0EA5E9.
- **Rechtsträger**: MO Handel & Service, Inh. Mariusz Jerzy Otok, Darmstädter Landstraße 60, 65462 Ginsheim-Gustavsburg. USt-IdNr **DE368527526**. Verantwortlich §18 Abs.2 MStV: Mariusz Otok. (KEIN HRB – Einzelunternehmen; alte GmbH/HRB/Frankfurt-Registerdaten entfernt.)
- **Verträge (PDF+HTML)**: Arbeitgeber = MO Handel & Service (Marke Webora), Adresse Ginsheim-Gustavsburg, Unterzeichner = **Mariusz Otok**. ⚠️ Gerichtsstand-Klauseln stehen weiterhin auf „Frankfurt am Main" (nicht geändert – bei Bedarf anpassen).
- **Mails**: alle @webora.de (info/hr/kontakt/datenschutz). Admin-Login: **admin@webora.de** (Migration alter Accounts beim Start).
- WhatsApp-Float-Button (wa.me/4917613660609) unten rechts auf allen öffentlichen Seiten.
- Getestet: Startseite + Impressum (Screenshot), Admin-Login (HTTP 200). Vertrags-PDF-Generierung nur code-seitig verifiziert (Strings), nicht E2E.

## (Historie) Zurück zu Keyperion + .de — ersetzt durch Webora-Rebrand
- Prysm-Rebrand komplett zurückgerollt (git checkout f5aea75): wieder **Keyperion Technologies**, grünes Design (#00C853/emerald), grünes „K"-Logo, Geschäftsführer wieder **Lars Kurjo**.
- **Mail-Domain jetzt `.de`**: info@/hr@/kontakt@/datenschutz@keyperion-technologies.de.
- Admin-Login: `admin@keyperion-technologies.de` (Passwort unverändert). Seed migriert alte Accounts (prysm/keyperion.com/precision) automatisch.
- Deployment-Artefakte bleiben: `backend/requirements-prod.txt`, `DEPLOYMENT.md`.

## (Historie) Rebrand → Prysm Technologies + Weiß/Hellblau (2026-06) — RÜCKGÄNGIG
- Komplettes Rebranding **Keyperion Technologies → Prysm Technologies** (Frontend, Backend-Texte, Verträge, Mails, index.html, Impressum).
- Neues Logo: SVG-Prisma (weißes Dreieck auf hellblauem #0EA5E9 Rounded-Square) in `components/Logo.jsx`, Export `PrysmLogo`.
- Theme: **Weiß + Hellblau** auf öffentlicher Seite + Mitarbeiter-Portal. Grün/Emerald (#00C853, emerald-*, green-*) → Sky-Blau (#0EA5E9 / sky-* Klassen). Dunkler Text bleibt dunkel.
- Admin-Panel: nutzt weiterhin separates dunkles "Tokyo Night" Dashboard-Theme (grüne Akzente dort ebenfalls zu sky-blau). Nicht vollständig monochrom/blau umgestellt.
- Mails/Domain: `*@prysm-technologies.com`. Admin-Login: `admin@prysm-technologies.com` (Legacy-Account wird beim Start automatisch migriert).


## Original Problem Statement
Keyperion Technologies VPS-Plattform (Rebrand von "Precision Labs"): Admin Panel Mobile, 1:1 Chat, HTML-Contract, GMX/Web.de IMAP, Test-Sitzungen (1-Stunden-Links), Referral-Links.

## User Language
German.

## Architecture
- Frontend: React + Tailwind + shadcn/ui
- Backend: FastAPI + MongoDB + JWT (7 Tage)
- Integrationen: Anosim, smsroute, IMAP (Gmail/GMX/Web.de), Telegram

## Completed
- Admin login (bcrypt==4.0.1)
- Mobile-responsive Admin
- 1:1 Chat mit Telegram
- Vertragsgenerierung
- GMX/Web.de IMAP
- Test-Sitzungen (Public 1h, Codes SMS+Email)

## Critical Bug Fixes
**2026-02-05: SMS Forwarding zu Test-Sitzungen (P0 – kostete User 1000€)**
- Backend: `get_sms_for_number` erwartete Telefonnummer, bekam aber Booking-ID → korrigiert auf `get_sms_for_booking` mit Fallback
- Frontend: Las `num.booking_id`, API liefert aber `num.id` → Admin-Form korrigiert
- SMS-Format normalisiert (`messageText` → `text`, `messageDate` → `received_at`)
- Automatische Code-Extraktion via `extract_verification_code`
- Nur SMS ab Sessionstart sichtbar

## Pending
- P1: WhatsApp-Weiterleitung SMS-Codes
- P2: Mitarbeiter-CRUD, Dashboard-Analytics, i18n

## Rebrand & Vertragsstartdatum (2026-06-07)
- **Rebrand Precision Labs → Keyperion Technologies** in gesamter Frontend-UI + Backend-Texten:
  - Neues SVG-Logo (Buchstabe "K", `KeyperionLogo` in `components/Logo.jsx`), ersetzt altes PNG `LOGO_URL` überall
  - Neue Domain-Mails: info@/hr@/datenschutz@/kontakt@keyperion-technologies.com
  - Impressum komplett: Keyperion Technologies GmbH, Große Gallusstr. 14, 60315 Frankfurt am Main, HRB 143010, AG Frankfurt am Main, USt-IdNr. DE156178436, Vertreter Lars Kurjo
  - Verträge (Frontend ContractSign/Vertrag, Backend `contracts.py` PDF + `applications.py` HTML): Arbeitgeber = Keyperion Technologies GmbH, Frankfurt, Unterzeichner Lars Kurjo
- **Vertragsstartdatum = Unterschriftsdatum**: §1 zeigt jetzt das tatsächliche Unterschriftsdatum (`{signed_date}` / `sign_date_str` / `new Date()`)
- ⚠️ NICHT geändert (bewusst): Login-Seed-Mails (admin@/mitarbeiter@precision-labs.de), SMS-Absender-ID "PrecisionLab" (.env), Calendly-Slug (App.js), Admin-Login-Placeholder

## Deployment
`cd ~/infometrica && git stash && git pull origin main && cd frontend && npm run build && sudo systemctl restart precision-backend && sudo systemctl restart nginx`

## Last Updated
2026-08-13 (11): **Vertrag nachträglich ändern** – Admin kann einem bereits akzeptierten Bewerber einen anderen Vertragstyp zuweisen, solange NICHT unterschrieben (`contract_signed_at` leer). Neuer Endpoint `PUT /api/applications/{id}/contract-type` (setzt contract_type + optional start_date/allow_skip, blockt mit 400 wenn unterschrieben). Frontend: gelber „Vertrag ändern"-Button (FilePen) in Tabelle/Mobile/Detail-Modal; wiederverwendet den Accept-Dialog im Modus 'reassign' (vorausgewählter aktueller Vertrag, Startdatum + Skip vorbefüllt). Detail-Modal zeigt jetzt „Zugewiesener Vertrag" + Unterschrifts-Status. ApplicationResponse um contract_signed_at/contract_start_date/contract_can_skip erweitert. Verifiziert per curl (Änderung OK, signierter Vertrag→400) + Screenshot.

2026-08-13 (10): **Auto-Sync der Vertragsvorlagen** – Problem: Vorlagen liegen in DB und wurden nur beim ersten Zugriff einmalig aus dem Code geseedet → Code-Änderungen erreichten die Live-DB (VPS) nie („nix geändert"). Fix: `CONTRACT_TEMPLATE_VERSION`-Konstante + `sync_contract_templates()` (applications.py), aufgerufen als startup-Event in server.py. Bei jedem Start werden Vorlagen mit älterer/fehlender Version auf die Code-Version aktualisiert; eigene Admin-Edits bleiben bei gleicher Version erhalten. Version bei Textänderungen hochzählen + VPS-Backend neu starten. Aktuell VERSION=2, alle 7 Vorlagen auf v2. Verifiziert.

2026-06-30 (9): AT-Verträge nach Bewerber-Feedback angepasst (Code-Vorlage + DB neu geseedet). **Freiberufler (AT)**: klar freelance – 20 Std./Woche, 2.200 €/Monat per Rechnung zum Monatsletzten, Provision im Folgemonat, keine SV-Anmeldung durch AG (Freelancer selbst versichert/SVS), keine Sonderzahlungen, kein KV; NDA/DSGVO/30-Tage-Löschung + Vertragsstrafe 5.000 € bleiben; Gerichtsstand nur Österreich. **Teilzeit (AT)**: Kündigung nach österr. AngG ergänzt; 13./14. behalten; Kollektivvertrag = IT-KV (Angestellte Dienstleistungen automatische Datenverarbeitung/IT); Urlaub fix 24 Werktage/Jahr; Mehr-/Überstunden 13,90 €/Std ausbezahlt; Arbeitsmittel: eigene Geräte, kein Homeoffice-Kostenersatz; Arbeitszeit frei einteilbar Mo–So, pro Aufgabe 1 Std angerechnet; Vertragsstrafe 5.000 € ENTFERNT (Vertraulichkeit/30-Tage bleibt); Gerichtsstand rein Österreich. Startdatum (z. B. 10.09.2026) wird per Accept-Dialog gesetzt (§1 {{START_DATE}}). Verifiziert per curl E2E (accept→my-contract: Startdatum ersetzt, 13,90/24 Werktage vorhanden, keine 5.000).

2026-06-30 (8): VPS-Deploy-Bug behoben (yarn.lock ins Repo aufgenommen).

2026-06-30 (7): Verträge im Panel editierbar (DB) + Startdatum pro Bewerber + „Überspringen"-Schalter. Verifiziert.

2026-06-30 (5): Provision für Aufgaben/Probeaufträge (Admin-Feld €, Mitarbeiter sieht Betrag je Auftrag + „Provision gesamt" Summe auf Dashboard). Backend total_provision in /api/employee/stats. Verifiziert.

2026-06-30 (4): Bewerber-Anliegen in DE- & AT-Arbeitsverträge eingearbeitet (Sozialversicherung/Anmeldung, 13./14. Gehalt, Kollektivvertrag/Tarifbindung, konkrete Verstöße). 5 Arbeitsverträge, Frontend+Backend, verifiziert.

2026-06-30 (3): KI-Generator für App-Test-Aufgaben (Gemini 3 Flash). Button „✨ Mit KI generieren" (nur Kategorie App Test), Duplikat-Sperre via ai_app_name (409), ~640 Tokens/Aufgabe. WICHTIG: Import von emergentintegrations ist im Endpoint lazy (ModuleNotFoundError→503), damit ein fehlendes Paket auf dem VPS NICHT das ganze Backend/Login lahmlegt. VPS braucht: `pip install emergentintegrations --extra-index-url ...` + EMERGENT_LLM_KEY in backend/.env.
2026-06-30 (2b): Fälligkeitsdatum (due_date) komplett aus der UI entfernt (Formular + Admin-Liste + Mitarbeiter-Ansicht). Backend-Feld bleibt bestehen, wird aber nicht mehr angezeigt.

2026-06-30 (2): Aufgaben-Kategorien im Admin-Panel. Jede Aufgabe hat eine Kategorie **BD** (Finanz-Tests/KYC) oder **App Test** (Mobile-Apps). Auswahl ist PFLICHT beim Erstellen (kein Auto-Default, Toast blockiert leeres Feld). Aufgabenliste in 2 Tabs getrennt (BD / App Tests) mit Zähler-Badges; Kategorie-Badge auf jeder Task-Karte. Alt-Aufgaben ohne Kategorie erscheinen im Banner „Noch nicht kategorisiert" mit → BD / → App Test Buttons. Mitarbeiter-Ansicht unverändert (KEINE Kategorie sichtbar). Backend: `category` in Task/TaskCreate/TaskUpdate (employee.py), Endpoint `PUT /api/admin/tasks/{id}/category`. Frontend: AdminTasks.jsx.

2026-06-30: Bugfix – Datenschutzklausel fehlte im Backend-PDF für `teilzeit`. §12 „Datenschutz, Datensicherheit und ausschließliche Testzwecke" (5 Absätze) im teilzeit-Zweig von `_build_contract_html_parts` (applications.py) ergänzt, damit Frontend-Vorschau und PDF übereinstimmen. Testing-Agent: 13/13 Backend-Tests bestanden (100%). Klausel jetzt in allen 5 Arbeitsverträgen: vollzeit §11 (Default §9), teilzeit §12, minijob §11, vollzeit_at §9, teilzeit_at §7. freiberufler_at/minijob_at (Werk-/Dienstleistungsvertrag) bewusst ohne diese Klausel.

2026-06-28: 3 österreichische Verträge ergänzt (Vollzeit AT, Teilzeit AT, Freiberufler AT) → insgesamt 7 Vertragstypen.

### Österreich-Verträge (2026-06-28)
- 3 neue Auswahloptionen bei der Annahme: **Vollzeit AT** (40 Std., 2.900 €), **Teilzeit AT** (20 Std., 1.100 € + Provision), **Freiberufler AT** (Dienstleistungsvertrag, nur Provision, selbstständig). Alle österreichisches Recht, Gerichtsstand Frankfurt/Österreich, NDA+DSGVO, Vertragsstrafe 5.000 €.
- Dokumenttitel dynamisch: Freiberufler AT → „DIENSTLEISTUNGSVERTRAG", sonst „ARBEITSVERTRAG".
- Keys: `vollzeit_at`, `teilzeit_at`, `freiberufler_at`. Insgesamt 7 Typen (vollzeit/teilzeit/minijob/minijob_at/vollzeit_at/teilzeit_at/freiberufler_at).

### „Minijob AT" / Werkvertrag (2026-06-26)
- 4. Auswahloption bei der Annahme: **Minijob AT** (interner Key `minijob_at`) = Werkvertrag über IT-Applikations-Testing (Vergütung pro Test, selbstständig, NDA/DSGVO, Vertragsstrafe 5.000 €). Dokumenttitel dynamisch „WERKVERTRAG".
- Vorlage aus Nutzer-PDF (tester_werkvertrag.pdf), Auftraggeber = Keyperion Technologies GmbH.
- Erweitert: `_build_contract_html_parts` (Backend), `ContractTemplates.jsx` (MinijobATBody + CONTRACT_TITLES), accept-Validierung, AdminApplications-Dialog (4. Option).


### Vertragsauswahl bei Annahme (2026-06-26)
- Admin wählt beim Akzeptieren einer Bewerbung den Vertragstyp: **Vollzeit** (bisheriger Vertrag), **Teilzeit** (700 € + Provision, bis 20 Std.) oder **Minijob** (Provision 50–300 €, max. 603 €/2026). Gespeichert als `contract_type` auf der Bewerbung (Default `vollzeit`).
- Bewerber sieht auf der Unterschriftsseite + im PDF/HTML-Download genau diesen Vertrag.
- Vorlagen aus Nutzer-PDFs als Blueprints nachgebaut (ohne Namen), Arbeitgeber = Keyperion Technologies GmbH.
- **Bulk-Annahme komplett entfernt** (Checkboxen, Bulk-Button, Info-Banner, `/bulk-accept` Endpoint).
- Dateien: `models/application.py` (+contract_type), `routes/applications.py` (`accept` mit body, `_build_contract_html_parts`), `pages/mitarbeiter/ContractTemplates.jsx` (neu), `MitarbeiterContractSign.jsx`, `pages/admin/AdminApplications.jsx` (Annahme-Dialog).
