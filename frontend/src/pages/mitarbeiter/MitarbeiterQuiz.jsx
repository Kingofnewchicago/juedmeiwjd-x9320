import React, { useState } from 'react';
import { ClipboardList, ChevronRight, ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { TdataLogo } from '../../components/Logo';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const QUESTIONS = [
  {
    id: 1,
    type: 'select',
    question: 'Sind Sie deutscher Staatsbürger?',
    options: ['Ja', 'Nein'],
  },
  {
    id: 2,
    type: 'select',
    question: 'Besitzen Sie einen gültigen Personalausweis oder Reisepass?',
    options: ['Ja', 'Nein'],
  },
  {
    id: 3,
    type: 'select',
    question: 'Sind Sie mindestens 18 Jahre alt?',
    options: ['Ja', 'Nein'],
  },
  {
    id: 4,
    type: 'select',
    question: 'Was ist die Hauptaufgabe eines Web Application Testers?',
    options: ['Webseiten programmieren', 'Webseiten und Apps auf Fehler testen', 'Kunden beraten'],
  },
  {
    id: 5,
    type: 'select',
    question: 'Was versteht man unter einem "Bug" in der Softwareentwicklung?',
    options: ['Ein neues Feature', 'Ein Fehler oder eine Störung in einer Anwendung', 'Ein Software-Update'],
  },
  {
    id: 6,
    type: 'select',
    question: 'Was bedeutet "responsives Design" bei einer Webseite?',
    options: ['Die Seite lädt schneller', 'Die Seite passt sich an verschiedene Bildschirmgrößen an', 'Die Seite hat mehr Farben'],
  },
  {
    id: 7,
    type: 'select',
    question: 'Was sollten Sie tun, wenn Sie während eines Tests einen Fehler finden?',
    options: ['Ignorieren und weiter testen', 'Den Fehler dokumentieren und melden', 'Die App selbst reparieren'],
  },
  {
    id: 8,
    type: 'select',
    question: 'Was ist eine IP-Adresse?',
    options: ['Ein Passwort für den Router', 'Eine eindeutige Kennung eines Geräts im Netzwerk', 'Ein Browser-Plugin'],
  },
  {
    id: 9,
    type: 'select',
    question: 'Was bedeutet "Cache leeren" im Browser?',
    options: ['Den Browser deinstallieren', 'Gespeicherte Daten und Dateien löschen, damit Seiten neu geladen werden', 'Das Internet ausschalten'],
  },
  {
    id: 10,
    type: 'info',
    question: 'Zu Ihren Aufgaben als Web Application Tester gehört es, Test-Video-Identifikationsverfahren (Ident-Verfahren) von Banken und Finanzdienstleistern durchzuführen. Dabei handelt es sich um Testdurchläufe, bei denen Sie sich jedoch mit Ihrem eigenen, echten Personalausweis identifizieren müssen.',
    confirmText: 'Ich habe das verstanden',
  },
  {
    id: 11,
    type: 'select',
    question: 'Ist es für Sie in Ordnung, dass Sie bei den Tests Ihr echtes Ausweisdokument verwenden?',
    options: ['Ja', 'Nein'],
  },
  {
    id: 12,
    type: 'select',
    question: 'Was ist ein Testbericht?',
    options: ['Eine Rechnung für den Kunden', 'Eine Dokumentation der durchgeführten Tests und gefundenen Fehler', 'Ein Arbeitsvertrag'],
  },
  {
    id: 13,
    type: 'select',
    question: 'Warum ist Vertraulichkeit bei dieser Arbeit wichtig?',
    options: ['Ist nicht wichtig', 'Weil Testdaten sensible Informationen enthalten können', 'Weil es gesetzlich verboten ist zu reden'],
  },
  {
    id: 14,
    type: 'select',
    question: 'Was machen Sie, wenn Sie eine Aufgabe nicht verstehen?',
    options: ['Einfach irgendwas machen', 'Beim Vorgesetzten nachfragen', 'Die Aufgabe überspringen'],
  },
  {
    id: 15,
    type: 'text',
    question: 'Haben Sie noch Fragen oder Anmerkungen zu dieser Tätigkeit?',
    placeholder: 'Ihre Fragen oder Anmerkungen (optional)...',
    optional: true,
  },
];

const MitarbeiterQuiz = ({ applicant, onQuizCompleted }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const questionsPerPage = 3;
  const totalPages = Math.ceil(QUESTIONS.length / questionsPerPage);
  const currentQuestions = QUESTIONS.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  const setAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const canGoNext = () => {
    return currentQuestions.every(q => {
      if (q.optional) return true;
      const ans = answers[q.id];
      if (q.type === 'info') return ans === true;
      return ans && ans.toString().trim() !== '';
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('employee_token');
      const formattedAnswers = QUESTIONS.map(q => ({
        question_id: q.id,
        answer: q.type === 'info'
          ? 'Bestätigt'
          : (answers[q.id] || '').toString()
      }));

      await axios.post(
        `${BACKEND_URL}/api/quiz/submit`,
        { answers: formattedAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Quiz abgeschlossen!');
      if (onQuizCompleted) onQuizCompleted();
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Fehler beim Absenden des Quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (q) => {
    switch (q.type) {
      case 'select':
        return (
          <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6" data-testid={`quiz-question-${q.id}`}>
            <p className="font-medium text-gray-900 mb-4 text-sm sm:text-base">{q.id}. {q.question}</p>
            <div className="flex flex-wrap gap-3">
              {q.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => setAnswer(q.id, opt)}
                  className={`px-5 py-2.5 rounded-lg border-2 font-medium text-sm transition-all ${
                    answers[q.id] === opt
                      ? 'border-sage-500 bg-sage-50 text-sage-700'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                  }`}
                  data-testid={`quiz-option-${q.id}-${opt}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        );

      case 'text':
        return (
          <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6" data-testid={`quiz-question-${q.id}`}>
            <p className="font-medium text-gray-900 mb-4 text-sm sm:text-base">{q.id}. {q.question}</p>
            <textarea
              value={answers[q.id] || ''}
              onChange={(e) => setAnswer(q.id, e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-sage-500 resize-none text-sm"
              placeholder={q.placeholder}
              data-testid={`quiz-text-${q.id}`}
            />
            {q.optional && <p className="text-xs text-gray-400 mt-1">Optional</p>}
          </div>
        );

      case 'info':
        return (
          <div key={q.id} className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 sm:p-6" data-testid={`quiz-question-${q.id}`}>
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-amber-900 text-sm sm:text-base leading-relaxed">{q.question}</p>
            </div>
            <button
              onClick={() => setAnswer(q.id, true)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 font-medium text-sm transition-all ${
                answers[q.id] === true
                  ? 'border-sage-500 bg-sage-50 text-sage-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
              data-testid={`quiz-confirm-${q.id}`}
            >
              {answers[q.id] === true && <CheckCircle size={16} />}
              {q.confirmText}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const isLastPage = currentPage === totalPages - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <TdataLogo className="w-10 h-10" />
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Tdata Testing
            </h1>
            <p className="text-xs text-gray-500">Einführungs-Quiz</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-sage-500 to-sage-600 rounded-2xl p-5 sm:p-6 text-white mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            Willkommen, {applicant?.name}!
          </h2>
          <p className="text-sage-100 text-sm sm:text-base">
            Bevor Sie fortfahren, bitten wir Sie einige Fragen zu Ihrer Tätigkeit als Web Application Tester zu beantworten.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Seite {currentPage + 1} von {totalPages}</span>
            <span>{Math.min((currentPage + 1) * questionsPerPage, QUESTIONS.length)} / {QUESTIONS.length} Fragen</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4 mb-8">
          {currentQuestions.map(renderQuestion)}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 0}
            className="flex items-center gap-2 px-5 py-2.5 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed font-medium transition-colors"
            data-testid="quiz-prev-btn"
          >
            <ChevronLeft size={18} />
            Zurück
          </button>

          {isLastPage ? (
            <button
              onClick={handleSubmit}
              disabled={!canGoNext() || submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-sage-500 text-white font-semibold rounded-lg hover:bg-sage-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              data-testid="quiz-submit-btn"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Wird gesendet...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Quiz abschließen
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={!canGoNext()}
              className="flex items-center gap-2 px-6 py-2.5 bg-sage-500 text-white font-semibold rounded-lg hover:bg-sage-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              data-testid="quiz-next-btn"
            >
              Weiter
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MitarbeiterQuiz;
