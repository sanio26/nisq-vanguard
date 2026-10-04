import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import { supabase } from "../lib/supabase";
import { updatePassword } from "../lib/auth";
import "../styles/auth.css";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    const initialiseRecoverySession = async () => {
      /*
       * Supabase places the recovery session in the URL.
       * getSession() allows the client to pick it up.
       */
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      if (!session) {
        setError(
          "This password reset link is invalid or has expired. Please request a new one."
        );
      }

      setCheckingSession(false);
    };

    initialiseRecoverySession();

    /*
     * PASSWORD_RECOVERY is emitted when Supabase establishes
     * the recovery session after the email link is opened.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event) => {
        if (!mounted) {
          return;
        }

        if (event === "PASSWORD_RECOVERY") {
          setError("");
          setCheckingSession(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await updatePassword(password);

      setSuccess(
        "Your password has been updated successfully. Redirecting to sign in..."
      );

      window.setTimeout(() => {
        navigate("/login?reset=success", {
          replace: true,
        });
      }, 1400);
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Unable to update your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <main className="auth-page">
        <section className="auth-shell">
          <div className="auth-brand">
            <span className="auth-brand-mark">NV</span>

            <div>
              <strong>NISQ VANGUARD</strong>
              <small>DEFENCE TECHNOLOGIES</small>
            </div>
          </div>

          <div className="auth-loading">
            <div className="auth-loading-spinner" />
            <p>Validating secure recovery session...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-left">
          <div className="auth-brand">
            <span className="auth-brand-mark">NV</span>

            <div>
              <strong>NISQ VANGUARD</strong>
              <small>DEFENCE TECHNOLOGIES</small>
            </div>
          </div>

          <div className="auth-left-content">
            <p className="auth-eyebrow">
              ACCOUNT RECOVERY
            </p>

            <h1>
              Secure your
              <br />
              account again.
            </h1>

            <p className="auth-description">
              Create a new password and restore secure
              access to your NISQ Vanguard workspace,
              learning programs, certificates and
              cybersecurity resources.
            </p>

            <div className="auth-security-card">
              <div className="auth-security-icon">
                <ShieldCheck size={22} />
              </div>

              <div>
                <strong>Protected by Supabase Auth</strong>

                <span>
                  Your password is securely managed by
                  Supabase authentication.
                </span>
              </div>
            </div>
          </div>

          <div className="auth-principles">
            EDUCATE
            <span>•</span>
            ASSESS
            <span>•</span>
            DEFEND
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <p className="auth-eyebrow">
              NEW CREDENTIALS
            </p>

            <h2>Set a new password</h2>

            <p>
              Choose a strong password with at least
              8 characters.
            </p>
          </div>

          {error && (
            <div className="auth-message auth-message-error">
              {error}
            </div>
          )}

          {success && (
            <div className="auth-message auth-message-success">
              {success}
            </div>
          )}

          {!error && (
            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >
              <label>
                <span>New password</span>

                <div className="auth-password-field">
                  <LockKeyhole size={17} />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </label>

              <label>
                <span>Confirm password</span>

                <div className="auth-password-field">
                  <LockKeyhole size={17} />

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "UPDATING PASSWORD..."
                  : "UPDATE PASSWORD"}

                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {error && (
            <Link
              to="/login"
              className="auth-secondary-link"
            >
              ← Back to sign in
            </Link>
          )}

          <div className="auth-card-footer">
            SECURE AUTHENTICATION
            <span>•</span>
            ROLE-BASED ACCESS
          </div>
        </div>
      </section>
    </main>
  );
}