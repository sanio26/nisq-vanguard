import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const [status, setStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  useEffect(() => {
    let mounted = true;

    async function completeAuthentication() {
      try {
        const params = new URLSearchParams(
          window.location.search
        );

        const code = params.get("code");

        if (code) {
          const { error } =
            await supabase.auth.exchangeCodeForSession(
              code
            );

          if (error) {
            console.error(
              "Auth callback error:",
              error
            );

            if (mounted) {
              setStatus("error");
            }

            return;
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          if (mounted) {
            setStatus("error");
          }

          return;
        }

        if (mounted) {
          setStatus("success");
        }
      } catch (error) {
        console.error(
          "Authentication callback failed:",
          error
        );

        if (mounted) {
          setStatus("error");
        }
      }
    }

    void completeAuthentication();

    return () => {
      mounted = false;
    };
  }, []);

  if (status === "success") {
    return <Navigate to="/dashboard" replace />;
  }

  if (status === "error") {
    return (
      <main
        style={{
          minHeight: "70vh",
          display: "grid",
          placeItems: "center",
          padding: "4rem 1.5rem",
          background: "#07131F",
          color: "#F2F7FA",
        }}
      >
        <div
          style={{
            maxWidth: "560px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#20B8D8",
              letterSpacing: "0.18em",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            AUTHENTICATION ERROR
          </p>

          <h1
            style={{
              fontSize: "2.5rem",
              margin: "1rem 0",
            }}
          >
            We couldn't complete your sign-in.
          </h1>

          <p
            style={{
              color: "#9CB0BE",
              lineHeight: 1.7,
            }}
          >
            The authentication link may have expired or
            the redirect configuration may need attention.
            Please return to sign in and try again.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "70vh",
        display: "grid",
        placeItems: "center",
        padding: "4rem 1.5rem",
        background: "#07131F",
        color: "#F2F7FA",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            color: "#20B8D8",
            letterSpacing: "0.18em",
            fontSize: "0.75rem",
            fontWeight: 700,
          }}
        >
          NISQ VANGUARD
        </p>

        <h1
          style={{
            fontSize: "2rem",
            marginTop: "1rem",
          }}
        >
          Securing your account…
        </h1>

        <p
          style={{
            color: "#9CB0BE",
            marginTop: "0.75rem",
          }}
        >
          Completing secure authentication.
        </p>
      </div>
    </main>
  );
}