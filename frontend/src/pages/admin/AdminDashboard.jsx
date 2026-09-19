import React from 'react';
import { Rocket, Clock, Shield } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7] rounded-2xl p-5 sm:p-8 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Willkommen im Admin-Portal!</h1>
        <p className="text-blue-100">
          Ihr Dashboard wird derzeit entwickelt. Bald können Sie hier alle wichtigen Funktionen verwalten.
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#16161e] border border-[#292e42] rounded-xl p-6">
          <div className="w-12 h-12 bg-[#7aa2f7]/10 rounded-lg flex items-center justify-center mb-4">
            <Rocket className="text-[#7aa2f7]" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-[#c0caf5] mb-2">Login erfolgreich</h3>
          <p className="text-sm text-[#9aa5ce]">
            Sie sind jetzt im Admin-Bereich angemeldet. Alle Funktionen werden bald verfügbar sein.
          </p>
        </div>

        <div className="bg-[#16161e] border border-[#292e42] rounded-xl p-6">
          <div className="w-12 h-12 bg-[#bb9af7]/10 rounded-lg flex items-center justify-center mb-4">
            <Clock className="text-[#bb9af7]" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-[#c0caf5] mb-2">Session-Zeit</h3>
          <p className="text-sm text-[#9aa5ce]">
            Sie bleiben dauerhaft eingeloggt, bis Sie sich manuell abmelden.
          </p>
        </div>

        <div className="bg-[#16161e] border border-[#292e42] rounded-xl p-6">
          <div className="w-12 h-12 bg-[#9ece6a]/10 rounded-lg flex items-center justify-center mb-4">
            <Shield className="text-[#9ece6a]" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-[#c0caf5] mb-2">Sicher & Geschützt</h3>
          <p className="text-sm text-[#9aa5ce]">
            Alle Admin-Bereiche sind durch JWT-Token geschützt und verschlüsselt.
          </p>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="bg-[#16161e] border border-[#292e42] rounded-xl p-5 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-[#c0caf5] mb-4">Bald verfügbar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-[#7aa2f7] rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-[#c0caf5]">Bewerbungsverwaltung</h4>
              <p className="text-sm text-[#9aa5ce]">Alle Bewerbungen in einer übersichtlichen Tabelle</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-[#bb9af7] rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-[#c0caf5]">Mitarbeiterverwaltung</h4>
              <p className="text-sm text-[#9aa5ce]">Komplette Employee-Management-Funktionen</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-[#7dcfff] rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-[#c0caf5]">Dokumentenverwaltung</h4>
              <p className="text-sm text-[#9aa5ce]">Upload, Download und Verwaltung aller Dokumente</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-[#9ece6a] rounded-full mt-2"></div>
            <div>
              <h4 className="font-medium text-[#c0caf5]">E-Signatur Integration</h4>
              <p className="text-sm text-[#9aa5ce]">Online-Signatur-Funktionen für Dokumente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Info */}
      <div className="bg-[#7aa2f7]/10 border border-[#7aa2f7]/30 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-[#7aa2f7] mb-2">🎉 Login-System funktioniert!</h3>
        <p className="text-[#c0caf5]">
          Das Admin-Login-System ist vollständig funktional mit JWT-Authentifizierung und geschützten Routen. Bereit für die nächste Phase!
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
