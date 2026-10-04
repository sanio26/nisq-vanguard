import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { getSession, signUp } from "../lib/auth";
import "../styles/auth.css";

export default function Signup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] =
    useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const session = await getSession();

        if (!mounted) {
          return;
        }

        if (session) {
          navigate("/dashboard", {
            replace: true,
          });

          return;
        }
      } catch {
        // No active session is expected on signup.
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }

    void checkSession();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedName = fullName.trim();
    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedName) {
      setError("Please enter your full name.");
      return;
    }

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const data = await signUp(
        normalizedEmail,
        password,
        normalizedName
      );

      if (data.session) {
        navigate("/dashboard", {
          replace: true,
        });

        return;
      }

      setSuccess(
        "Your account has been created. Please check your email to confirm your account before signing in."
      );

      setPassword("");
      setConfirmPassword("");
    } catch (signupError) {
      const message =
        signupError instanceof Error
          ? signupError.message
          : "Unable to create your account. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="auth-page">
        <div
          style={{
            width: "100%",
            display: "grid",
            placeItems: "center",
            color: "#9cb0be",
          }}
        >
          Checking secure session...
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">

        {/* =====================================================
            LEFT SIDE
            ===================================================== */}

        <div className="auth-intro">

          <div
            className="auth-brand"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "48px",
            }}
          >
            <div
              className="auth-brand-mark"
              style={{
                width: "44px",
                height: "44px",
                flex: "0 0 44px",
                display: "grid",
                placeItems: "center",
                border: "1px solid #20b8d8",
                color: "#20b8d8",
                fontSize: "0.82rem",
                fontWeight: 800,
                letterSpacing: "0.05em",
              }}
            >
              NV
            </div>

            <div>
              <strong
                style={{
                  display: "block",
                  color: "#f2f7fa",
                  fontSize: "0.92rem",
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                }}
              >
                NISQ VANGUARD
              </strong>

              <span
                style={{
                  display: "block",
                  marginTop: "4px",
                  color: "#718796",
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  letterSpacing: "0.17em",
                }}
              >
                DEFENCE TECHNOLOGIES
              </span>
            </div>
          </div>

          <p className="auth-eyebrow">
            SECURE ACCOUNT REGISTRATION
          </p>

          <h1>
            Build your
            <br />
            secure
            <br />
            workspace.
          </h1>

          <p className="auth-intro-copy">
            Create one secure NISQ Vanguard account to
            access learning programs, cybersecurity
            resources, events, certificates and your
            personalized workspace.
          </p>

          <div className="auth-security-note">
            <LockKeyhole size={21} />

            <div>
              <strong>
                Protected by Supabase Auth
              </strong>

              <p>
                Secure authentication with session-based
                access and role-aware permissions.
              </p>
            </div>
          </div>

          <div
            className="auth-intro-footer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "28px",
              color: "#718796",
              fontSize: "0.62rem",
              fontWeight: 700,
              letterSpacing: "0.16em",
            }}
          >
            <span>EDUCATE</span>
            <span>•</span>
            <span>ASSESS</span>
            <span>•</span>
            <span>DEFEND</span>
          </div>
        </div>

        {/* =====================================================
            RIGHT SIDE
            ===================================================== */}

        <div className="auth-card">

          <div className="auth-card-header">
            <p className="auth-card-eyebrow">
              ACCOUNT REGISTRATION
            </p>

            <h2>
              Create account
            </h2>

            <p className="auth-card-subtitle">
              Start your secure NISQ Vanguard workspace.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* FULL NAME */}

            <div className="auth-field">
              <label htmlFor="signup-name">
                Full name
              </label>

              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                disabled={loading}
              />
            </div>

            {/* EMAIL */}

            <div className="auth-field">
              <label htmlFor="signup-email">
                Email address
              </label>

              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                disabled={loading}
              />
            </div>

            {/* PASSWORD */}

            <div className="auth-field">
              <label htmlFor="signup-password">
                Password
              </label>

              <div
                style={{
                  position: "relative",
                  width: "100%",
                }}
              >
                <input
                  id="signup-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  disabled={loading}
                  style={{
                    paddingRight: "52px",
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "16px",
                    transform: "translateY(-50%)",
                    width: "28px",
                    height: "28px",
                    display: "grid",
                    placeItems: "center",
                    padding: 0,
                    border: 0,
                    background: "transparent",
                    color: "#91a7b6",
                    cursor: loading
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}

            <div className="auth-field">
              <label htmlFor="signup-confirm-password">
                Confirm password
              </label>

              <div
                style={{
                  position: "relative",
                  width: "100%",
                }}
              >
                <input
                  id="signup-confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  disabled={loading}
                  style={{
                    paddingRight: "52px",
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) => !current
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "16px",
                    transform: "translateY(-50%)",
                    width: "28px",
                    height: "28px",
                    display: "grid",
                    placeItems: "center",
                    padding: 0,
                    border: 0,
                    background: "transparent",
                    color: "#91a7b6",
                    cursor: loading
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div className="auth-message auth-message-error">
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div
                className="auth-message"
                style={{
                  color: "#9be0c1",
                  background: "#102d27",
                  border: "1px solid #28604f",
                }}
              >
                {success}
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? (
                "CREATING ACCOUNT..."
              ) : (
                <>
                  CREATE ACCOUNT
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* LOGIN LINK */}

          <div className="auth-footer">
            <span>
              Already have an account?
            </span>

            <Link to="/login">
              SIGN IN
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* SECURITY FOOTER */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              marginTop: "20px",
              paddingTop: "20px",
              borderTop: "1px solid #1d4056",
              color: "#718796",
              fontSize: "0.58rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textAlign: "center",
            }}
          >
            <ShieldCheck size={14} />
            <span>SECURE AUTHENTICATION</span>
            <span>•</span>
            <span>ROLE-BASED ACCESS</span>
          </div>

        </div>
      </section>
    </main>
  );
}