import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, ArrowUpRight } from 'lucide-react';
import { MoreLogo } from './Logo';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    navigation: [
      { name: 'Start', path: '/' },
      { name: 'Unternehmen', path: '/unternehmen' },
      { name: 'Leistungen', path: '/dienstleistungen' },
      { name: 'Karriere', path: '/karriere' },
      { name: 'Kontakt', path: '/kontakt' },
    ],
    services: [
      'Web-Applikationen',
      'Mobile Apps',
      'Cloud & APIs',
      'UI/UX Design',
    ],
    legal: [
      { name: 'Impressum', path: '/impressum' },
      { name: 'Datenschutz', path: '/datenschutz' },
      { name: 'Mitarbeiter Login', path: '/mitarbeiter/login' },
    ],
  };

  return (
    <footer className="relative bg-ink text-white font-body overflow-hidden" data-testid="footer">
      {/* glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-600/25 blur-[120px] rounded-full" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <MoreLogo className="h-11 w-11" />
              <span className="text-xl font-heading font-bold text-white">
                MORE<span className="text-brand-300">Applications</span>
              </span>
            </div>
            <p className="text-white/60 leading-relaxed max-w-sm mb-8">
              Wir entwickeln moderne Software und Applikationen – von der ersten
              Idee bis zum skalierbaren Produkt. Durchdacht, zuverlässig und
              termintreu aus Hamburg.
            </p>

            <div className="space-y-3">
              <a href="mailto:info@more-applications.de" className="inline-flex items-center gap-3 text-white/70 hover:text-white transition-colors" data-testid="footer-email">
                <Mail size={18} className="text-brand-400" />
                info@more-applications.de
              </a>
              <div className="flex items-start gap-3 text-white/70">
                <MapPin size={18} className="text-brand-400 mt-0.5" />
                <span>Heinrich-Hertz-Str. 133, 22083 Hamburg</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-heading text-sm font-bold text-white mb-5">Navigation</h4>
              <ul className="space-y-3">
                {links.navigation.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-white/60 hover:text-white transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-white mb-5">Leistungen</h4>
              <ul className="space-y-3">
                {links.services.map((service) => (
                  <li key={service}>
                    <Link to="/dienstleistungen" className="text-white/60 hover:text-white transition-colors">
                      {service}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-white mb-5">Rechtliches</h4>
              <ul className="space-y-3">
                {links.legal.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-white/60 hover:text-white transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CTA strip */}
        <div className="mt-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 rounded-2xl border border-white/10 bg-white/[0.03] p-7">
          <div>
            <p className="font-heading text-xl font-bold text-white">Ein Projekt im Kopf?</p>
            <p className="text-white/55 text-sm mt-1">Erzählen Sie uns davon – wir melden uns innerhalb von 24 Stunden.</p>
          </div>
          <Link to="/kontakt" className="inline-flex items-center gap-1.5 h-12 px-6 bg-brand-500 hover:bg-brand-400 text-white font-semibold rounded-full transition-colors">
            Kontakt aufnehmen
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-white/45">
            <p>© {currentYear} MORE Applications GmbH. Alle Rechte vorbehalten.</p>
            <p>Entwickelt in Hamburg, Deutschland</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
