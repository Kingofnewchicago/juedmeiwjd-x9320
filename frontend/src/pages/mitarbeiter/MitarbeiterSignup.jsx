import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, Calendar, HelpCircle, AlertCircle, CheckCircle, ArrowRight, ArrowLeft, X } from 'lucide-react';
import axios from 'axios';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Tooltip Component
const FieldTooltip = ({ text, isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="absolute right-0 top-full mt-2 z-50">
      <div className="bg-[#0A0A0A] text-white text-sm p-4 rounded-xl shadow-xl max-w-xs relative">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-white/60 hover:text-white"
        >
          <X size={14} />
        </button>
        <p className="pr-4">{text}</p>
        <div className="absolute -top-2 right-4 w-4 h-4 bg-[#0A0A0A] rotate-45"></div>
      </div>
    </div>
  );
};

// Field with Label and Tooltip
const FormField = ({ label, tooltip, icon: Icon, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-[#4A4A4A]">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowTooltip(!showTooltip)}
          className="text-slate-400 hover:text-[#659A65] transition-colors"
        >
          <HelpCircle size={16} />
        </button>
        <FieldTooltip 
          text={tooltip} 
          isOpen={showTooltip} 
          onClose={() => setShowTooltip(false)} 
        />
      </div>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        {children}
      </div>
    </div>
  );
};

const MitarbeiterSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthday: '',
    nationality: '',
    street: '',
    plz: '',
    city: '',
    password: '',
    passwordConfirm: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.birthday || !formData.street || !formData.plz || !formData.city || !formData.password) {
      setError('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(`${BACKEND_URL}/api/applications/submit`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        position: 'Bewerber',
        message: 'Registrierung über Mitarbeiter-Signup',
        mobilnummer: formData.phone,
        strasse: formData.street,
        postleitzahl: formData.plz,
        stadt: formData.city,
        geburtsdatum: formData.birthday,
        staatsangehoerigkeit: formData.nationality || 'Deutsch',
      });

      setSuccess(true);
      // Redirect to login page after short delay
      setTimeout(() => {
        navigate('/mitarbeiter/login');
      }, 2000);
    } catch (err) {
      const errorDetail = err.response?.data?.detail;
      let errorMessage = 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.';
      
      if (typeof errorDetail === 'string') {
        if (errorDetail.includes('existiert bereits')) {
          errorMessage = 'Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.';
        } else {
          errorMessage = errorDetail;
        }
      } else if (Array.isArray(errorDetail)) {
        // Pydantic validation errors
        errorMessage = errorDetail.map(e => e.msg || e.message || 'Ungültige Eingabe').join(', ');
      } else if (errorDetail && typeof errorDetail === 'object') {
        errorMessage = errorDetail.msg || errorDetail.message || 'Registrierung fehlgeschlagen.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white pt-32 pb-20">
          <div className="max-w-xl mx-auto px-6">
            <div className="bg-[#F1F6F1] border border-[#659A65]/20 rounded-2xl p-12 text-center">
              <div className="w-20 h-20 bg-[#659A65] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-[#0A0A0A] mb-4">Konto erfolgreich erstellt!</h2>
              <p className="text-slate-600 mb-8 text-lg">
                Ihr Mitarbeiter-Konto wurde erfolgreich erstellt. Sie können sich jetzt anmelden und Ihre Bewerbung verfolgen.
              </p>
              <Link
                to="/mitarbeiter/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#659A65] text-white font-semibold rounded-full hover:bg-[#659A65] transition-colors text-lg"
              >
                Zum Login
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="pt-32 pb-12 px-6 bg-[#F8F9FA]">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-[#659A65] font-mono text-sm uppercase tracking-widest mb-4 block">Mitarbeiterbereich</span>
            <h1 className="text-4xl md:text-5xl font-bold text-[#0A0A0A] mb-4">
              Konto erstellen
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Erstellen Sie jetzt ein Mitarbeiter Konto um Ihre Bewerbung zu verfolgen
            </p>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-16 px-6">
          <div className="max-w-2xl mx-auto">
            {/* Info Box */}
            <div className="bg-[#F1F6F1] border border-[#659A65]/20 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#659A65] rounded-full flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0A0A0A] mb-1">Wichtiger Hinweis</h3>
                  <p className="text-slate-600">
                    Benutzen Sie bitte die E-Mail und Telefonnummer, die Sie bei der Bewerbung auch benutzt haben.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <FormField 
                  label="Vollständiger Name" 
                  tooltip="Geben Sie Ihren vollständigen Namen ein, wie er auf Ihrem Ausweis steht. Dies wird für die Vertragsunterlagen benötigt."
                  icon={User}
                >
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Max Mustermann"
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659A65] focus:border-transparent transition-all bg-[#F8F9FA]"
                    data-testid="signup-name"
                  />
                </FormField>

                {/* Email */}
                <FormField 
                  label="E-Mail-Adresse" 
                  tooltip="Ihre E-Mail-Adresse wird für die Anmeldung und wichtige Benachrichtigungen verwendet. Verwenden Sie die gleiche E-Mail wie bei Ihrer Bewerbung."
                  icon={Mail}
                >
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ihre@email.de"
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659A65] focus:border-transparent transition-all bg-[#F8F9FA]"
                    data-testid="signup-email"
                  />
                </FormField>

                {/* Phone */}
                <FormField 
                  label="Telefonnummer" 
                  tooltip="Ihre Telefonnummer wird für dringende Kontaktaufnahmen und SMS-Verifizierungen benötigt. Verwenden Sie die gleiche Nummer wie bei Ihrer Bewerbung."
                  icon={Phone}
                >
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+49 170 1234567"
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659A65] focus:border-transparent transition-all bg-[#F8F9FA]"
                    data-testid="signup-phone"
                  />
                </FormField>

                {/* Birthday */}
                <FormField 
                  label="Geburtsdatum" 
                  tooltip="Ihr Geburtsdatum wird zur Altersverifizierung und für die Vertragsunterlagen benötigt."
                  icon={Calendar}
                >
                  <input
                    type="date"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659A65] focus:border-transparent transition-all bg-[#F8F9FA]"
                    data-testid="signup-birthday"
                  />
                </FormField>

                {/* Address */}
                <FormField 
                  label="Straße und Hausnummer" 
                  tooltip="Ihre Straße und Hausnummer wird für die Vertragsunterlagen und den Postversand benötigt."
                  icon={MapPin}
                >
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="Musterstraße 123"
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659A65] focus:border-transparent transition-all bg-[#F8F9FA]"
                    data-testid="signup-street"
                  />
                </FormField>

                {/* PLZ and City in a row */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField 
                    label="PLZ" 
                    tooltip="Ihre Postleitzahl für die Adressverifizierung."
                    icon={MapPin}
                  >
                    <input
                      type="text"
                      name="plz"
                      value={formData.plz}
                      onChange={handleChange}
                      placeholder="12345"
                      className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659A65] focus:border-transparent transition-all bg-[#F8F9FA]"
                      data-testid="signup-plz"
                    />
                  </FormField>

                  <FormField 
                    label="Stadt" 
                    tooltip="Ihre Stadt für die Vertragsunterlagen."
                    icon={MapPin}
                  >
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Berlin"
                      className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659A65] focus:border-transparent transition-all bg-[#F8F9FA]"
                      data-testid="signup-city"
                    />
                  </FormField>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200 my-8"></div>

                {/* Password Section Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-[#0A0A0A]">Passwort festlegen</h3>
                  <p className="text-sm text-slate-500">Wählen Sie ein sicheres Passwort für Ihr Konto</p>
                </div>

                {/* Password */}
                <FormField 
                  label="Passwort" 
                  tooltip="Ihr Passwort sollte mindestens 6 Zeichen lang sein und eine Kombination aus Buchstaben und Zahlen enthalten."
                  icon={Lock}
                >
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mindestens 6 Zeichen"
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659A65] focus:border-transparent transition-all bg-[#F8F9FA]"
                    data-testid="signup-password"
                  />
                </FormField>

                {/* Confirm Password */}
                <FormField 
                  label="Passwort bestätigen" 
                  tooltip="Geben Sie Ihr Passwort erneut ein, um sicherzustellen, dass Sie es korrekt eingegeben haben."
                  icon={Lock}
                >
                  <input
                    type="password"
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    placeholder="Passwort wiederholen"
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#659A65] focus:border-transparent transition-all bg-[#F8F9FA]"
                    data-testid="signup-password-confirm"
                  />
                </FormField>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-[#659A65] text-white font-semibold rounded-full hover:bg-[#659A65] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg shadow-[#659A65]/20 hover:shadow-xl hover:shadow-[#659A65]/30"
                  data-testid="signup-submit"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Wird erstellt...
                    </>
                  ) : (
                    <>
                      Konto erstellen
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-8 pt-8 border-t border-slate-200 text-center">
                <p className="text-slate-600">
                  Bereits ein Konto?{' '}
                  <Link
                    to="/mitarbeiter/login"
                    className="text-[#659A65] font-semibold hover:underline"
                  >
                    Jetzt anmelden
                  </Link>
                </p>
              </div>
            </div>

            {/* Back Link */}
            <div className="text-center mt-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-[#659A65] transition-colors"
              >
                <ArrowLeft size={18} />
                Zurück zur Startseite
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default MitarbeiterSignup;
