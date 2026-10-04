import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { supabase } from "../lib/supabase";

const services = [
  "Cybersecurity Health Check",
  "Security Assessment",
  "Vulnerability Assessment",
  "Security Advisory",
  "Security Policy Guidance",
  "Employee Cybersecurity Awareness",
  "Incident Response Readiness",
  "AI Security Assessment",
  "Corporate Training",
  "Campus Cybersecurity Program",
  "Other",
];

const organizationTypes = [
  "Startup",
  "Small & Medium Business",
  "Enterprise",
  "Educational Institution",
  "Government / Public Sector",
  "Non-Profit Organization",
  "Individual",
  "Other",
];

type FormState = {
  name: string;
  email: string;
  phone: string;
  organization: string;
  designation: string;
  organization_type: string;
  service: string;
  preferred_date: string;
  preferred_time: string;
  message: string;
  consent: boolean;
};

const initialForm: FormState = {
  name: "",
  email: "",
  phone: "",
  organization: "",
  designation: "",
  organization_type: "",
  service: "",
  preferred_date: "",
  preferred_time: "",
  message: "",
  consent: false,
};

export default function Contact() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const minimumDate = useMemo(() => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    if (!form.name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!form.email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!form.service) {
      setErrorMessage("Please select a service.");
      return;
    }

    if (!form.consent) {
      setErrorMessage(
        "Please provide consent before submitting your consultation request.",
      );
      return;
    }

    setSubmitting(true);
    setSubmitted(false);

    try {
      const { error } = await supabase.from("consultations").insert({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        organization: form.organization.trim() || null,
        designation: form.designation.trim() || null,
        organization_type: form.organization_type || null,
        service: form.service,
        preferred_date: form.preferred_date || null,
        preferred_time: form.preferred_time || null,
        message: form.message.trim() || null,
        consent: form.consent,
      });

      if (error) {
        throw new Error("CONSULTATION_SUBMISSION_FAILED");
      }

      setSubmitted(true);
      setForm(initialForm);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="contact-page">
      {/* =========================================================
          HERO
          ========================================================= */}
      <section className="contact-hero">
        <div className="container contact-hero-grid">
          <div className="contact-hero-content">
            <p className="eyebrow">CONTACT NISQ VANGUARD</p>

            <h1>Let&apos;s talk about your security.</h1>

            <p className="contact-hero-description">
              Tell us what you are trying to protect, where you need help, and
              what you want to achieve. We&apos;ll help identify the right next
              step.
            </p>

            <div className="contact-hero-points">
              <div>
                <ShieldCheck size={19} />
                <span>Practical security guidance</span>
              </div>

              <div>
                <Building2 size={19} />
                <span>Built around your organization</span>
              </div>

              <div>
                <ArrowRight size={19} />
                <span>Clear next steps</span>
              </div>
            </div>
          </div>

          <div className="contact-hero-panel">
            <div className="contact-panel-top">
              <span>SECURITY CONVERSATION</span>

              <span className="contact-status">
                <span />
                AVAILABLE
              </span>
            </div>

            <div className="contact-panel-core">
              <div className="contact-panel-icon">
                <ShieldCheck size={42} strokeWidth={1.3} />
              </div>

              <strong>EDUCATE · ASSESS · DEFEND</strong>

              <span>
                Start with the problem.
                <br />
                Build from there.
              </span>
            </div>

            <div className="contact-panel-footer">
              <span>NISQ / DEFENCE TECHNOLOGIES</span>
              <span>01 — 01</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW WE CAN HELP
          ========================================================= */}
      <section className="section section-secondary contact-information">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">HOW WE CAN HELP</p>

            <h2>Start with the security challenge you are facing.</h2>

            <p>
              Whether you are an organization, educational institution or
              individual looking for guidance, choose the path that best
              describes what you need.
            </p>
          </div>

          <div className="contact-info-grid">
            <article className="contact-info-card">
              <div className="contact-info-icon">
                <Building2 size={23} />
              </div>

              <p className="contact-info-label">ORGANIZATIONS</p>

              <h3>Strengthen your security posture.</h3>

              <p>
                Discuss assessments, advisory services, awareness programs,
                incident readiness and AI security.
              </p>

              <a href="#consultation">
                Book a consultation
                <ArrowRight size={16} />
              </a>
            </article>

            <article className="contact-info-card">
              <div className="contact-info-icon">
                <GraduationIcon />
              </div>

              <p className="contact-info-label">COLLEGES</p>

              <h3>Build a cyber-aware campus.</h3>

              <p>
                Plan cybersecurity awareness programs, workshops, bootcamps,
                competitions and faculty training.
              </p>

              <a href="#consultation">
                Plan a campus program
                <ArrowRight size={16} />
              </a>
            </article>

            <article className="contact-info-card">
              <div className="contact-info-icon">
                <ShieldCheck size={23} />
              </div>

              <p className="contact-info-label">STUDENTS</p>

              <h3>Start building cybersecurity skills.</h3>

              <p>
                Explore practical learning opportunities through the NISQ
                Vanguard Academy.
              </p>

              <a href="/academy">
                Explore Academy
                <ArrowRight size={16} />
              </a>
            </article>
          </div>
        </div>
      </section>

      {/* =========================================================
          CONSULTATION FORM
          ========================================================= */}
      <section
        className="section contact-consultation"
        id="consultation"
      >
        <div className="container contact-form-layout">
          <div className="contact-form-intro">
            <p className="eyebrow">BOOK A CONSULTATION</p>

            <h2>Tell us what you need help with.</h2>

            <p>
              Submit your requirements and our team can understand your
              priorities before the conversation begins.
            </p>

            <div className="contact-detail-list">
              <div className="contact-detail">
                <Mail size={19} />

                <div>
                  <span>Email</span>
                  <strong>Contact through consultation form</strong>
                </div>
              </div>

              <div className="contact-detail">
                <Phone size={19} />

                <div>
                  <span>Response</span>
                  <strong>Our team will follow up with you</strong>
                </div>
              </div>

              <div className="contact-detail">
                <MapPin size={19} />

                <div>
                  <span>Engagement</span>
                  <strong>Remote and organization-focused</strong>
                </div>
              </div>
            </div>

            <div className="contact-security-note">
              <ShieldCheck size={19} />

              <p>
                Please do not submit passwords, private credentials, API keys
                or other sensitive security secrets through this form.
              </p>
            </div>
          </div>

          <div className="consultation-form-card">
            {submitted ? (
              <div className="contact-success">
                <div className="contact-success-icon">
                  <CheckCircle2 size={42} strokeWidth={1.4} />
                </div>

                <p className="eyebrow">REQUEST RECEIVED</p>

                <h2>Thank you for reaching out.</h2>

                <p>
                  Your consultation request has been submitted successfully.
                  Our team will review your requirements and follow up with
                  you.
                </p>

                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setSubmitted(false)}
                >
                  SUBMIT ANOTHER REQUEST
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-header">
                  <p className="eyebrow">CONSULTATION REQUEST</p>

                  <h2>Let&apos;s understand your requirements.</h2>

                  <p>
                    Fields marked with <span>*</span> are required.
                  </p>
                </div>

                <div className="contact-form-grid">
                  {/* Name */}
                  <div className="form-field">
                    <label htmlFor="name">
                      Name <span>*</span>
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={(event) =>
                        updateField("name", event.target.value)
                      }
                      placeholder="Your full name"
                      autoComplete="name"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="form-field">
                    <label htmlFor="email">
                      Email <span>*</span>
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="form-field">
                    <label htmlFor="phone">Phone</label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(event) =>
                        updateField("phone", event.target.value)
                      }
                      placeholder="+91 XXXXX XXXXX"
                      autoComplete="tel"
                    />
                  </div>

                  {/* Organization */}
                  <div className="form-field">
                    <label htmlFor="organization">Organization</label>

                    <input
                      id="organization"
                      name="organization"
                      type="text"
                      value={form.organization}
                      onChange={(event) =>
                        updateField("organization", event.target.value)
                      }
                      placeholder="Organization name"
                      autoComplete="organization"
                    />
                  </div>

                  {/* Designation */}
                  <div className="form-field">
                    <label htmlFor="designation">Designation</label>

                    <input
                      id="designation"
                      name="designation"
                      type="text"
                      value={form.designation}
                      onChange={(event) =>
                        updateField("designation", event.target.value)
                      }
                      placeholder="Your role"
                      autoComplete="organization-title"
                    />
                  </div>

                  {/* Organization Type */}
                  <div className="form-field">
                    <label htmlFor="organization_type">
                      Organization Type
                    </label>

                    <select
                      id="organization_type"
                      name="organization_type"
                      value={form.organization_type}
                      onChange={(event) =>
                        updateField(
                          "organization_type",
                          event.target.value,
                        )
                      }
                    >
                      <option value="">Select organization type</option>

                      {organizationTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Service */}
                  <div className="form-field form-field-full">
                    <label htmlFor="service">
                      Service Required <span>*</span>
                    </label>

                    <select
                      id="service"
                      name="service"
                      value={form.service}
                      onChange={(event) =>
                        updateField("service", event.target.value)
                      }
                      required
                    >
                      <option value="">Select a service</option>

                      {services.map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Preferred Date */}
                  <div className="form-field">
                    <label htmlFor="preferred_date">
                      Preferred Date
                    </label>

                    <input
                      id="preferred_date"
                      name="preferred_date"
                      type="date"
                      min={minimumDate}
                      value={form.preferred_date}
                      onChange={(event) =>
                        updateField(
                          "preferred_date",
                          event.target.value,
                        )
                      }
                    />
                  </div>

                  {/* Preferred Time */}
                  <div className="form-field">
                    <label htmlFor="preferred_time">
                      Preferred Time
                    </label>

                    <input
                      id="preferred_time"
                      name="preferred_time"
                      type="time"
                      value={form.preferred_time}
                      onChange={(event) =>
                        updateField(
                          "preferred_time",
                          event.target.value,
                        )
                      }
                    />
                  </div>

                  {/* Message */}
                  <div className="form-field form-field-full">
                    <label htmlFor="message">Message</label>

                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      value={form.message}
                      onChange={(event) =>
                        updateField("message", event.target.value)
                      }
                      placeholder="Tell us briefly about your security requirements..."
                    />
                  </div>
                </div>

                {/* Consent */}
                <label className="contact-consent">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(event) =>
                      updateField("consent", event.target.checked)
                    }
                    required
                  />

                  <span>
                    I consent to NISQ Vanguard using the information provided
                    above to respond to my consultation request.{" "}
                    <strong>*</strong>
                  </span>
                </label>

                {/* Error */}
                {errorMessage && (
                  <div className="contact-form-error" role="alert">
                    {errorMessage}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="button button-primary contact-submit"
                  disabled={submitting}
                >
                  {submitting
                    ? "SUBMITTING..."
                    : "SUBMIT CONSULTATION"}

                  {!submitting && <ArrowRight size={17} />}
                </button>

                <p className="contact-form-footnote">
                  Your request is securely submitted to the NISQ Vanguard
                  platform.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function GraduationIcon() {
  return (
    <span className="graduation-icon" aria-hidden="true">
      <span />
    </span>
  );
}