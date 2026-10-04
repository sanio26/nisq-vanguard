import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./components/AuthProvider";

// ============================================================
// PUBLIC PAGES
// ============================================================

import Home from "./pages/Home";
import Solutions from "./pages/Solutions";
import Consulting from "./pages/Consulting";
import Training from "./pages/Training";
import Campus from "./pages/Campus";
import Academy from "./pages/Academy";
import CourseDetails from "./pages/CourseDetails";
import Quiz from "./pages/Quiz";
import CertificateVerification from "./pages/CertificateVerification";
import Innovation from "./pages/Innovation";
import CyberShieldAI from "./pages/CyberShieldAI";
import Intelligence from "./pages/Intelligence";
import CaseStudies from "./pages/CaseStudies";
import Events from "./pages/Events";
import About from "./pages/About";
import Contact from "./pages/Contact";

// ============================================================
// USER / AUTH
// ============================================================

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";

// ============================================================
// GLOBAL STYLES
// ============================================================

import "./styles/header.css";
import "./styles/footer.css";

import "./styles/home.css";
import "./styles/solutions.css";
import "./styles/training.css";
import "./styles/campus.css";
import "./styles/academy.css";
import "./styles/course-details.css";
import "./styles/innovation.css";
import "./styles/cybershieldai.css";
import "./styles/intelligence.css";
import "./styles/case-studies.css";
import "./styles/events.css";
import "./styles/about.css";
import "./styles/contact.css";
import "./styles/auth.css";
import "./styles/certificate-verification.css";

// ============================================================
// TEMPORARY PLACEHOLDER
// ============================================================

// Only used for pages that we have not built yet.
// We will progressively replace these with real pages.

function PlaceholderPage({ title }: { title: string }) {
  return (
    <main
      style={{
        minHeight: "70vh",
        display: "grid",
        placeItems: "center",
        padding: "80px 24px",
        background: "#07131f",
        color: "#f2f7fa",
      }}
    >
      <div
        style={{
          width: "min(680px, 100%)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            marginBottom: "12px",
            color: "#20b8d8",
            fontSize: "0.72rem",
            fontWeight: 800,
            letterSpacing: "0.16em",
          }}
        >
          NISQ VANGUARD
        </p>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(2rem, 5vw, 4rem)",
            letterSpacing: "-0.04em",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            marginTop: "18px",
            color: "#9cb0be",
            lineHeight: 1.7,
          }}
        >
          This section is being developed as part of the NISQ
          Vanguard security ecosystem.
        </p>
      </div>
    </main>
  );
}

// ============================================================
// APP
// ============================================================

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-shell">
          <Header />

          <Routes>
            {/* ==================================================
                HOME
                ================================================== */}

            <Route
              path="/"
              element={<Home />}
            />

            {/* ==================================================
                SOLUTIONS
                ================================================== */}

            <Route
              path="/solutions"
              element={<Solutions />}
            />

            <Route
              path="/solutions/consulting"
              element={<Consulting />}
            />

            <Route
              path="/solutions/training"
              element={<Training />}
            />

            {/* ==================================================
                CAMPUS
                ================================================== */}

            <Route
              path="/campus"
              element={<Campus />}
            />

            {/* ==================================================
                ACADEMY
                ================================================== */}

            <Route
              path="/academy"
              element={<Academy />}
            />

            <Route
              path="/academy/:slug"
              element={<CourseDetails />}
            />

            {/* ==================================================
                ACADEMY QUIZ
                ================================================== */}

            <Route
              path="/academy/:slug/quiz/:quizId"
              element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                INNOVATION
                ================================================== */}

            <Route
              path="/innovation"
              element={<Innovation />}
            />

            <Route
              path="/innovation/cybershieldai"
              element={<CyberShieldAI />}
            />

            {/* ==================================================
                INTELLIGENCE
                ================================================== */}

            <Route
              path="/intelligence"
              element={<Intelligence />}
            />

            {/* ==================================================
                CASE STUDIES
                ================================================== */}

            <Route
              path="/case-studies"
              element={<CaseStudies />}
            />

            {/* ==================================================
                EVENTS
                ================================================== */}

            <Route
              path="/events"
              element={<Events />}
            />

            {/* ==================================================
                ABOUT
                ================================================== */}

            <Route
              path="/about"
              element={<About />}
            />

            {/* ==================================================
                CONTACT
                ================================================== */}

            <Route
              path="/contact"
              element={<Contact />}
            />

            {/* ==================================================
                CERTIFICATE VERIFICATION
                ================================================== */}

            <Route
              path="/verify"
              element={<CertificateVerification />}
            />

            <Route
              path="/verify/:certificateId"
              element={<CertificateVerification />}
            />

            {/* ==================================================
                LEGAL
                ================================================== */}

            <Route
              path="/privacy"
              element={
                <PlaceholderPage
                  title="Privacy Policy"
                />
              }
            />

            <Route
              path="/terms"
              element={
                <PlaceholderPage
                  title="Terms of Service"
                />
              }
            />

            <Route
              path="/security"
              element={
                <PlaceholderPage
                  title="Security"
                />
              }
            />

            <Route
              path="/responsible-disclosure"
              element={
                <PlaceholderPage
                  title="Responsible Disclosure"
                />
              }
            />

            {/* ==================================================
                AUTHENTICATION
                ================================================== */}

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/signup"
              element={<Signup />}
            />

            <Route
              path="/reset-password"
              element={<ResetPassword />}
            />

            {/* ==================================================
                STUDENT / USER DASHBOARD
                ================================================== */}

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                ADMIN ECOSYSTEM
                ================================================== */}

            <Route
              path="/admin"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "SUPER_ADMIN",
                    "ADMIN",
                  ]}
                >
                  <PlaceholderPage
                    title="Admin Operations"
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/leads"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "SUPER_ADMIN",
                    "ADMIN",
                    "SALES",
                  ]}
                >
                  <PlaceholderPage
                    title="Lead Management"
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/consultations"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "SUPER_ADMIN",
                    "ADMIN",
                    "CONSULTANT",
                    "SALES",
                  ]}
                >
                  <PlaceholderPage
                    title="Consultation Management"
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/courses"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "SUPER_ADMIN",
                    "ADMIN",
                    "INSTRUCTOR",
                  ]}
                >
                  <PlaceholderPage
                    title="Course Management"
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/events"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "SUPER_ADMIN",
                    "ADMIN",
                  ]}
                >
                  <PlaceholderPage
                    title="Event Management"
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/articles"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "SUPER_ADMIN",
                    "ADMIN",
                    "ANALYST",
                  ]}
                >
                  <PlaceholderPage
                    title="Intelligence Articles"
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/case-studies"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "SUPER_ADMIN",
                    "ADMIN",
                  ]}
                >
                  <PlaceholderPage
                    title="Case Study Management"
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/testimonials"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "SUPER_ADMIN",
                    "ADMIN",
                  ]}
                >
                  <PlaceholderPage
                    title="Testimonial Management"
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "SUPER_ADMIN",
                    "ADMIN",
                  ]}
                >
                  <PlaceholderPage
                    title="User & Role Management"
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "SUPER_ADMIN",
                    "ADMIN",
                  ]}
                >
                  <PlaceholderPage
                    title="Platform Settings"
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "SUPER_ADMIN",
                    "ADMIN",
                  ]}
                >
                  <PlaceholderPage
                    title="Security Audit Logs"
                  />
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                UNKNOWN ROUTES
                ================================================== */}

            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />
          </Routes>

          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}