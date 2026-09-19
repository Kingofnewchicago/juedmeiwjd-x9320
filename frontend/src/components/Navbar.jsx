import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { TdataLogo } from './Logo';

const Wordmark = ({ size = 'text-2xl' }) => (
  <span className={`${size} font-heading font-bold tracking-tight`}>
    <span className="text-sage-600">T</span>
    <span className="text-[#223322]">data</span>
  </span>
);

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Startseite', path: '/' },
    { name: 'Unternehmen', path: '/unternehmen' },
    { name: 'Leistungen', path: '/dienstleistungen' },
    { name: 'Karriere', path: '/karriere' },
    { name: 'Kontakt', path: '/kontakt' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 bg-white border-b border-[#DDE8DD]" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" data-testid="nav-logo">
            <TdataLogo className="h-10 w-10" />
            <div className="flex flex-col leading-none">
              <Wordmark />
              <span className="text-[10px] font-body font-semibold uppercase tracking-[0.25em] text-[#556655] mt-0.5">Testing</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-${link.name.toLowerCase()}`}
                className={`font-body text-[15px] font-semibold pb-1 border-b-2 transition-colors duration-150 ${
                  isActive(link.path)
                    ? 'text-sage-700 border-sage-500'
                    : 'text-[#223322] border-transparent hover:text-sage-600 hover:border-sage-300'
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
            className="hidden lg:inline-flex items-center h-11 px-6 bg-sage-600 text-white font-body text-sm font-semibold rounded-sm hover:bg-sage-700 transition-colors duration-150"
          >
            Beratung anfragen
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-[#223322]"
            data-testid="nav-mobile-toggle"
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#DDE8DD] bg-white" data-testid="nav-mobile-menu">
          <div className="px-6 py-4 flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`py-3 font-body text-lg font-semibold border-b border-[#F1F6F1] ${
                  isActive(link.path) ? 'text-sage-700' : 'text-[#223322]'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/kontakt"
              className="mt-4 inline-flex items-center justify-center h-12 bg-sage-600 text-white font-body font-semibold rounded-sm"
            >
              Beratung anfragen
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
