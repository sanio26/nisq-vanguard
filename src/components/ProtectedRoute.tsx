import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "./AuthProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const location = useLocation();

  const {
    session,
    roles,
    loading,
    authUser,
  } = useAuth();

  if (loading) {
    return (
      <main className="auth-loading-page">
        <div className="auth-loading-shell">
          <div className="auth-loading-mark">
            NV
          </div>

          <p>
            Verifying secure access...
          </p>
        </div>
      </main>
    );
  }

  if (!session || !authUser) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: {
            pathname: location.pathname,
          },
        }}
      />
    );
  }

  if (!authUser.profile?.is_active) {
    return (
      <main className="auth-loading-page">
        <div className="auth-access-denied">
          <p className="eyebrow">
            NISQ VANGUARD · ACCESS CONTROL
          </p>

          <h1>
            Account access is unavailable.
          </h1>

          <p>
            Your account is currently not active.
            Please contact NISQ Vanguard support.
          </p>
        </div>
      </main>
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.some((role) =>
      roles.includes(role as typeof roles[number])
    )
  ) {
    return (
      <main className="auth-loading-page">
        <div className="auth-access-denied">
          <p className="eyebrow">
            NISQ VANGUARD · ACCESS CONTROL
          </p>

          <h1>
            Access restricted.
          </h1>

          <p>
            Your account does not have permission to
            access this area.
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}