import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { getSession, sendPasswordReset, signIn } from "../lib/auth";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    const checkExistingSession = async () => {
      try {
        const session = await getSession();

        if (mounted && session) {
          navigate("/dashboard", { replace: true });
          return;
        }
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };

    void checkExistingSession();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const getRedirectPath = () => {
    const state = location.state as {
      from?: {
        pathname?: string;
      };
    } | null;

    const pathname = state?.from?.pathname;

    if (pathname && pathname !== "/login" && pathname !== "/signup") {
      return pathname;
    }

    return "/dashboard";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      await signIn(normalizedEmail, password);
      navigate(getRedirectPath(), { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please check your credentials and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Enter your email address to reset your password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordReset(normalizedEmail);

      setSuccess(
        "If an account exists for this email, you will receive password reset instructions shortly.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to process the password reset request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <main className="auth-page">
        <div className="auth-loading">
          <div className="auth-loading-mark">
            <ShieldCheck size={22} />
          </div>

          <p>Checking secure session…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <section className="auth-intro">
          <Link
            to="/"
            className="auth-brand"
            aria-label="NISQ Vanguard home"
          >
            <span className="auth-brand-mark">NV</span>

            <span>
              <strong>NISQ VANGUARD</strong>
              <small>DEFENCE TECHNOLOGIES</small>
            </span>
          </Link>

          <div className="auth-intro-content">
            <p className="auth-eyebrow">SECURE ACCESS</p>

            <h1>
              Your cybersecurity
              <br />
              workspace starts here.
            </h1>

            <p className="auth-intro-description">
              Access your learning workspace, security programs, events,
              certificates and the NISQ Vanguard ecosystem through one secure
              account.
            </p>

            <div className="auth-security-note">
              <div className="auth-security-icon">
                <LockKeyhole size={18} />
              </div>

              <div>
                <strong>Protected by Supabase Auth</strong>
                <span>
                  Secure session-based authentication with role-aware access.
                </span>
              </div>
            </div>
          </div>

          <div className="auth-intro-footer">
            <span>EDUCATE.</span>
            <span>ASSESS.</span>
            <span>DEFEND.</span>
          </div>
        </section>

        <section className="auth-card-section">
          <div className="auth-card">
            <div className="auth-card-header">
              <p className="auth-card-eyebrow">
                {forgotMode ? "ACCOUNT RECOVERY" : "ACCOUNT ACCESS"}
              </p>

              <h2>
                {forgotMode ? "Reset your password" : "Welcome back"}
              </h2>

              <p>
                {forgotMode
                  ? "Enter your registered email address and we’ll send you secure password reset instructions."
                  : "Sign in to continue to your NISQ Vanguard workspace."}
              </p>
            </div>

            {forgotMode ? (
              <form
                className="auth-form"
                onSubmit={handleForgotPassword}
                noValidate
              >
                <div className="auth-field">
                  <label htmlFor="forgot-email">Email address</label>

                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@organization.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div
                    className="auth-message auth-message-error"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                {success && (
                  <div
                    className="auth-message auth-message-success"
                    role="status"
                  >
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={loading}
                >
                  {loading ? (
                    "SENDING…"
                  ) : (
                    <>
                      SEND RESET INSTRUCTIONS
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="auth-secondary-action"
                  onClick={() => {
                    setForgotMode(false);
                    setError("");
                    setSuccess("");
                  }}
                  disabled={loading}
                >
                  ← Back to sign in
                </button>
              </form>
            ) : (
              <form
                className="auth-form"
                onSubmit={handleSubmit}
                noValidate
              >
                <div className="auth-field">
                  <label htmlFor="login-email">Email address</label>

                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@organization.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="auth-field">
                  <div className="auth-password-row">
                    <label htmlFor="login-password">Password</label>

                    <button
                      type="button"
                      className="auth-forgot"
                      onClick={() => {
                        setForgotMode(true);
                        setError("");
                        setSuccess("");
                      }}
                      disabled={loading}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="auth-password-input">
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      disabled={loading}
                    />

                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    className="auth-message auth-message-error"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                {success && (
                  <div
                    className="auth-message auth-message-success"
                    role="status"
                  >
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={loading}
                >
                  {loading ? (
                    "AUTHENTICATING…"
                  ) : (
                    <>
                      SIGN IN
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>
            )}

            {!forgotMode && (
              <div className="auth-register">
                <span>Don't have an account?</span>

                <Link to="/signup">
                  CREATE ACCOUNT
                  <ArrowRight size={15} />
                </Link>
              </div>
            )}

            <div className="auth-card-footer">
              <span>SECURE AUTHENTICATION</span>
              <span aria-hidden="true">•</span>
              <span>ROLE-BASED ACCESS</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}