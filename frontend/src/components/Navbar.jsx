import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { MoreLogo } from './Logo';

const Wordmark = () => (
  <span className="font-heading font-bold tracking-tight leading-none text-[19px]">
    <span className="text-ink">MORE</span>
    <span className="text-brand-600">Applications</span>
  </span>
);

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { name: 'Start', path: '/' },
    { name: 'Unternehmen', path: '/unternehmen' },
    { name: 'Leistungen', path: '/dienstleistungen' },
    { name: 'Karriere', path: '/karriere' },
    { name: 'Kontakt', path: '/kontakt' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-brand-100 shadow-[0_1px_20px_-8px_rgba(79,70,229,0.25)]' : 'bg-white/60 backdrop-blur-md border-b border-transparent'
      }`}
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex justify-between items-center h-[76px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" data-testid="nav-logo">
            <MoreLogo className="h-10 w-10 transition-transform duration-300 group-hover:scale-105" />
            <div className="flex flex-col">
              <Wordmark />
              <span className="text-[9px] font-body font-semibold uppercase tracking-[0.32em] text-brand-400 mt-1">GmbH · Hamburg</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-${link.name.toLowerCase()}`}
                className={`font-body text-[14px] font-semibold px-4 py-2 rounded-full transition-all duration-150 ${
                  isActive(link.path)
                    ? 'text-brand-700 bg-brand-50'
                    : 'text-ink/70 hover:text-brand-600 hover:bg-brand-50/60'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <Link
            to="/kontakt"
            data-testid="nav-cta"
            className="hidden lg:inline-flex items-center gap-1.5 h-11 pl-5 pr-4 bg-ink text-white font-body text-sm font-semibold rounded-full hover:bg-brand-600 transition-colors duration-200 group"
          >
            Projekt anfragen
            <ArrowUpRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-ink"
            data-testid="nav-mobile-toggle"
            aria-label="Menü"
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-brand-100 bg-white" data-testid="nav-mobile-menu">
          <div className="px-6 py-4 flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`py-3 font-body text-lg font-semibold border-b border-brand-50 ${
                  isActive(link.path) ? 'text-brand-700' : 'text-ink'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/kontakt"
              className="mt-4 inline-flex items-center justify-center h-12 bg-ink text-white font-body font-semibold rounded-full"
            >
              Projekt anfragen
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
