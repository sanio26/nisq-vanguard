import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  ArrowRight,
  Award,
  CheckCircle2,
  LoaderCircle,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { supabase } from "../lib/supabase";
import "../styles/certificate-verification.css";

type CertificateRecord = {
  certificate_id: string;
  student_name: string;
  course_title: string;
  issued_at: string;
  is_valid: boolean;
};

function formatIssuedDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default function CertificateVerification() {
  const { certificateId } = useParams();
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState(
    certificateId ?? ""
  );

  const [certificate, setCertificate] =
    useState<CertificateRecord | null>(null);

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(Boolean(certificateId));
  const [error, setError] = useState("");

  async function verifyCertificate(id: string) {
    const normalizedId = id.trim();

    if (!normalizedId) {
      setCertificate(null);
      setError("Enter a certificate ID to verify.");
      setSearched(true);
      return;
    }

    setLoading(true);
    setError("");
    setCertificate(null);
    setSearched(true);

    const { data, error: verificationError } =
      await supabase.rpc("verify_certificate", {
        p_certificate_id: normalizedId,
      });

    if (verificationError) {
      console.error(
        "Certificate verification failed:",
        verificationError
      );

      setError(
        "We couldn't complete the verification request. Please try again."
      );
      setLoading(false);
      return;
    }

    const result = Array.isArray(data)
      ? data[0] ?? null
      : data;

    if (!result) {
      setError(
        "No certificate was found with that certificate ID."
      );
      setLoading(false);
      return;
    }

    if (!result.is_valid) {
      setError(
        "This certificate exists but is currently marked as invalid."
      );
      setLoading(false);
      return;
    }

    setCertificate({
      certificate_id: result.certificate_id,
      student_name:
        result.student_name || "NISQ Vanguard Learner",
      course_title:
        result.course_title ||
        "NISQ Vanguard Academy Course",
      issued_at: result.issued_at,
      is_valid: result.is_valid,
    });

    setLoading(false);
  }

  useEffect(() => {
    if (certificateId) {
      setSearchValue(certificateId);
      void verifyCertificate(certificateId);
    }
  }, [certificateId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedId = searchValue.trim();

    if (!normalizedId) {
      void verifyCertificate("");
      return;
    }

    if (normalizedId !== certificateId) {
      navigate(
        `/verify/${encodeURIComponent(normalizedId)}`
      );
      return;
    }

    void verifyCertificate(normalizedId);
  }

  function handleVerifyAnother() {
    setSearchValue("");
    setCertificate(null);
    setError("");
    setSearched(false);
    navigate("/verify");
  }

  return (
    <main className="certificate-verification-page">
      <section className="certificate-verification-hero">
        <div className="certificate-verification-container">
          <div className="certificate-verification-intro">
            <div className="certificate-verification-eyebrow">
              <span />
              NISQ VANGUARD / OFFICIAL VERIFICATION
            </div>

            <h1>
              Verify a cybersecurity
              <span> certificate.</span>
            </h1>

            <p>
              Confirm whether a NISQ Vanguard Academy certificate
              is currently valid using its unique certificate ID.
            </p>
          </div>

          <div className="certificate-verification-panel">
            <div className="certificate-verification-panel-header">
              <div className="certificate-verification-icon">
                <ShieldCheck size={22} />
              </div>

              <div>
                <span>VERIFICATION PORTAL</span>
                <strong>Certificate authenticity check</strong>
              </div>
            </div>

            <form
              className="certificate-verification-form"
              onSubmit={handleSubmit}
            >
              <label htmlFor="certificate-id">
                Certificate ID
              </label>

              <div className="certificate-verification-input-wrap">
                <Search size={18} />

                <input
                  id="certificate-id"
                  type="text"
                  value={searchValue}
                  onChange={(event) =>
                    setSearchValue(event.target.value)
                  }
                  placeholder="Enter certificate ID"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={loading}
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="certificate-spinner"
                    />
                    VERIFYING
                  </>
                ) : (
                  <>
                    VERIFY CERTIFICATE
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {searched && !loading && certificate && (
              <div className="certificate-result certificate-result-valid">
                <div className="certificate-result-status">
                  <CheckCircle2 size={22} />

                  <div>
                    <span>VERIFICATION RESULT</span>
                    <strong>Certificate verified</strong>
                  </div>
                </div>

                <div className="certificate-result-grid">
                  <div>
                    <span>CERTIFICATE ID</span>
                    <strong>
                      {certificate.certificate_id}
                    </strong>
                  </div>

                  <div>
                    <span>STUDENT</span>
                    <strong>
                      {certificate.student_name}
                    </strong>
                  </div>

                  <div>
                    <span>COURSE</span>
                    <strong>
                      {certificate.course_title}
                    </strong>
                  </div>

                  <div>
                    <span>ISSUED</span>
                    <strong>
                      {formatIssuedDate(
                        certificate.issued_at
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>STATUS</span>
                    <strong>VALID</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="certificate-document-link"
                  onClick={handleVerifyAnother}
                >
                  <Award size={17} />
                  Verify another certificate
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {searched &&
              !loading &&
              !certificate &&
              error && (
                <div className="certificate-result certificate-result-invalid">
                  <div className="certificate-result-status">
                    <XCircle size={22} />

                    <div>
                      <span>VERIFICATION RESULT</span>
                      <strong>
                        Certificate not verified
                      </strong>
                    </div>
                  </div>

                  <p>{error}</p>

                  <button
                    type="button"
                    className="certificate-document-link"
                    onClick={handleVerifyAnother}
                  >
                    <Search size={17} />
                    Try another certificate ID
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
          </div>
        </div>
      </section>

      <section className="certificate-verification-info">
        <div className="certificate-verification-container">
          <div>
            <span className="certificate-section-label">
              ABOUT VERIFICATION
            </span>

            <h2>
              A public check for
              <br />
              verified learning.
            </h2>
          </div>

          <div className="certificate-info-copy">
            <p>
              Each certificate issued through the NISQ Vanguard
              Academy can be associated with a unique certificate
              identifier.
            </p>

            <p>
              Use this portal to confirm the certificate's current
              validity without requiring access to the student's
              private account.
            </p>

            <div className="certificate-info-points">
              <div>
                <ShieldCheck size={18} />
                <span>Public verification</span>
              </div>

              <div>
                <CheckCircle2 size={18} />
                <span>Validity status</span>
              </div>

              <div>
                <Award size={18} />
                <span>Academy credential</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}