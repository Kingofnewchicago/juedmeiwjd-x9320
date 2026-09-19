import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Home from "@/pages/Home";
import Unternehmen from "@/pages/Unternehmen";
import Dienstleistungen from "@/pages/Dienstleistungen";
import Karriere from "@/pages/Karriere";
import Kontakt from "@/pages/Kontakt";
import Impressum from "@/pages/Impressum";
import Datenschutz from "@/pages/Datenschutz";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminApplications from "@/pages/admin/AdminApplications";
import AdminTasks from "@/pages/admin/AdminTasks";
import AdminVerifications from "@/pages/admin/AdminVerifications";
import AdminContracts from "@/pages/admin/AdminContracts";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminDokumente from "@/pages/admin/AdminDokumente";
import AdminAnosim from "@/pages/admin/AdminAnosim";
import AdminEmailInbox from "@/pages/admin/AdminEmailInbox";
import AdminChat from "@/pages/admin/AdminChat";
import AdminTestSessions from "@/pages/admin/AdminTestSessions";
import AdminReferrals from "@/pages/admin/AdminReferrals";
import TestSession from "@/pages/public/TestSession";
import AdminLayout from "@/components/admin/AdminLayout";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import MitarbeiterLogin from "@/pages/mitarbeiter/MitarbeiterLogin";
import MitarbeiterSignup from "@/pages/mitarbeiter/MitarbeiterSignup";
import MitarbeiterDashboard from "@/pages/mitarbeiter/MitarbeiterDashboard";
import MitarbeiterAuftrage from "@/pages/mitarbeiter/MitarbeiterAuftrage";
import MitarbeiterEinstellungen from "@/pages/mitarbeiter/MitarbeiterEinstellungen";
import MitarbeiterChat from "@/pages/mitarbeiter/MitarbeiterChat";
import MitarbeiterLayout from "@/components/mitarbeiter/MitarbeiterLayout";
import ProtectedEmployeeRoute from "@/components/mitarbeiter/ProtectedEmployeeRoute";
import { Toaster } from "@/components/ui/sonner";

// Sofort-Redirect zu Calendly
const CalendlyRedirect = () => {
  window.location.replace("https://calendly.com/precision-labs-info/30min");
  return null;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
          <Route path="/gespräch" element={<CalendlyRedirect />} />
          <Route path="/gespraech" element={<CalendlyRedirect />} />
          <Route path="/unternehmen" element={<><Navbar /><Unternehmen /><Footer /></>} />
          <Route path="/dienstleistungen" element={<><Navbar /><Dienstleistungen /><Footer /></>} />
          <Route path="/karriere" element={<><Navbar /><Karriere /><Footer /></>} />
          <Route path="/bewerbungen" element={<><Navbar /><Karriere /><Footer /></>} />
          <Route path="/bewerbungen/:refSlug" element={<><Navbar /><Karriere /><Footer /></>} />
          <Route path="/kontakt" element={<><Navbar /><Kontakt /><Footer /></>} />
          <Route path="/impressum" element={<><Navbar /><Impressum /><Footer /></>} />
          <Route path="/datenschutz" element={<><Navbar /><Datenschutz /><Footer /></>} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminApplications />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tasks"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminTasks />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/verifications"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminVerifications />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/contracts"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminContracts />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminSettings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/documents"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminDokumente />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/anosim"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminAnosim />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/email-inbox"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminEmailInbox />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/chat"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminChat />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/test-sessions"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminTestSessions />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/referrals"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminReferrals />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Public Test Session */}
          <Route path="/test/:token" element={<TestSession />} />
          
          {/* Mitarbeiter Routes */}
          <Route path="/mitarbeiter/login" element={<MitarbeiterLogin />} />
          <Route path="/mitarbeiter/signup" element={<MitarbeiterSignup />} />
          <Route
            path="/mitarbeiter/dashboard"
            element={
              <ProtectedEmployeeRoute>
                <MitarbeiterLayout>
                  <MitarbeiterDashboard />
                </MitarbeiterLayout>
              </ProtectedEmployeeRoute>
            }
          />
          <Route
            path="/mitarbeiter/auftrage"
            element={
              <ProtectedEmployeeRoute>
                <MitarbeiterLayout>
                  <MitarbeiterAuftrage />
                </MitarbeiterLayout>
              </ProtectedEmployeeRoute>
            }
          />
          <Route
            path="/mitarbeiter/einstellungen"
            element={
              <ProtectedEmployeeRoute>
                <MitarbeiterLayout>
                  <MitarbeiterEinstellungen />
                </MitarbeiterLayout>
              </ProtectedEmployeeRoute>
            }
          />
          <Route
            path="/mitarbeiter/chat"
            element={
              <ProtectedEmployeeRoute>
                <MitarbeiterLayout>
                  <MitarbeiterChat />
                </MitarbeiterLayout>
              </ProtectedEmployeeRoute>
            }
          />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;
