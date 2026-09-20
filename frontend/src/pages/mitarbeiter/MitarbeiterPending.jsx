import React from 'react';
import { Clock, Mail, FileText } from 'lucide-react';
import { TdataLogo } from '../../components/Logo';

const MitarbeiterPending = ({ applicant }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEF1FF] via-white to-[#E0E4FF] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
        <TdataLogo className="h-12 w-12 mx-auto mb-6" />
        
        <div className="w-20 h-20 bg-[#EEF1FF] rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="text-[#6366F1]" size={40} />
        </div>
        
        <h1 className="text-2xl font-bold text-[#0A0A0A] mb-4">
          Bewerbung wird geprüft
        </h1>
        
        <p className="text-slate-600 mb-8">
          Vielen Dank für Ihre Bewerbung, <span className="font-semibold text-[#0A0A0A]">{applicant?.name || applicant?.full_name}</span>! 
          Unser Team prüft derzeit Ihre Unterlagen. Sie werden benachrichtigt, sobald Ihre Bewerbung 
          bearbeitet wurde.
        </p>

        <div className="bg-slate-50 rounded-xl p-6 text-left space-y-4">
          <h3 className="font-semibold text-[#0A0A0A] flex items-center gap-2">
            <FileText size={18} className="text-[#6366F1]" />
            Ihre Bewerbungsdetails
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Position:</span>
              <span className="text-[#0A0A0A] font-medium">{applicant?.position}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">E-Mail:</span>
              <span className="text-[#0A0A0A]">{applicant?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="px-2 py-1 bg-[#EEF1FF] text-[#6366F1] rounded-full text-xs font-medium">
                In Prüfung
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            <Mail className="inline mr-1" size={14} />
            Bei Fragen wenden Sie sich an <a href="mailto:hr@more-applications.de" className="text-[#6366F1] hover:underline">hr@more-applications.de</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MitarbeiterPending;
