import { type FormEvent, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  FileCheck2,
  GraduationCap,
  SearchCheck,
  ShieldAlert,
  ShieldCheck,
  Target,
} from "lucide-react";

import { supabase } from "../lib/supabase";

const services = [
  {
    number: "01",
    icon: SearchCheck,
    title: "Cybersecurity Health Check",
    description:
      "A structured review of your current cybersecurity posture to identify strengths, gaps and practical improvement areas.",
  },
  {
    number: "02",
    icon: ShieldCheck,
    title: "Security Assessment",
    description:
      "Assess security controls, processes and operational practices against the risks that matter to your organization.",
  },
  {
    number: "03",
    icon: ShieldAlert,
    title: "Vulnerability Assessment",
    description:
      "Identify security weaknesses and prioritize remediation based on risk and business impact.",
  },
  {
    number: "04",
    icon: Target,
    title: "Security Advisory",
    description:
      "Practical security guidance for organizations making technology, architecture and risk decisions.",
  },
  {
    number: "05",
    icon: FileCheck2,
    title: "Security Policy Guidance",
    description:
      "Develop and strengthen cybersecurity policies, procedures and governance practices.",
  },
  {
    number: "06",
    icon: GraduationCap,
    title: "Employee Cybersecurity Awareness",
    description:
      "Build stronger security behaviour through practical awareness programs designed around real-world threats.",
  },
  {
    number: "07",
    icon: ShieldAlert,
    title: "Incident Response Readiness",
    description:
      "Prepare people, processes and decision-making for effective response when a security incident occurs.",
  },
  {
    number: "08",
    icon: BrainCircuit,
    title: "AI Security Assessment",
    description:
      "Evaluate security considerations around AI systems, workflows, data and emerging AI-related risks.",
  },
];

const methodology = [
  {
    number: "01",
    title: "DISCOVER",
    description:
      "Understand the organization, environment and security objectives.",
  },
  {
    number: "02",
    title: "SCOPE",
    description:
      "Define the systems, processes and areas that need to be assessed.",
  },
  {
    number: "03",
    title: "ASSESS",
    description:
      "Evaluate the current security posture using a structured approach.",
  },
  {
    number: "04",
    title: "IDENTIFY",
    description:
      "Identify weaknesses, risks, dependencies and improvement opportunities.",
  },
  {
    number: "05",
    title: "PRIORITIZE",
    description:
      "Focus attention on the risks with the greatest practical impact.",
  },
  {
    number: "06",
    title: "IMPROVE",
    description:
      "Turn findings into practical recommendations and measurable improvements.",
  },
];

const organizationTypes = [
  "Corporate",
  "Startup",
  "SME",
  "Educational Institution",
  "Government",
  "Non-Profit",
  "Other",
];

const consultationTimes = [
  { value: "09:00", label: "09:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "14:00", label: "02:00 PM" },
  { value: "15:00", label: "03:00 PM" },
  { value: "16:00", label: "04:00 PM" },
  { value: "17:00", label: "05:00 PM" },
];

export default function Consulting() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setSubmitStatus("idle");
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const consent = formData.get("consent") === "on";

    if (!consent) {
      setSubmitStatus("error");
      setIsSubmitting(false);
      return;
    }

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const organization = String(
      formData.get("organization") ?? "",
    ).trim();
    const designation = String(
      formData.get("designation") ?? "",
    ).trim();
    const organizationType = String(
      formData.get("organization_type") ?? "",
    ).trim();
    const service = String(formData.get("service") ?? "").trim();
    const preferredDate = String(
      formData.get("preferred_date") ?? "",
    ).trim();
    const preferredTime = String(
      formData.get("preferred_time") ?? "",
    ).trim();
    const message = String(formData.get("message") ?? "").trim();

    if (
      !name ||
      !email ||
      !phone ||
      !organization ||
      !designation ||
      !organizationType ||
      !service ||
      !preferredDate ||
      !preferredTime ||
      !message
    ) {
      setSubmitStatus("error");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from("consultations").insert({
      name,
      email,
      phone,
      organization,
      designation,
      organization_type: organizationType,
      service,
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      message,
      consent: true,
    });

    if (error) {
      console.error("Consultation submission failed:", error);
      setSubmitStatus("error");
      setIsSubmitting(false);
      return;
    }

    form.reset();
    setSubmitStatus("success");
    setIsSubmitting(false);
  };

  return (
    <main className="consulting-page">
      {/* Hero */}
      <section className="consulting-hero">
        <div className="container consulting-hero-grid">
          <div className="consulting-hero-content">
            <p className="eyebrow">CYBERSECURITY CONSULTING</p>

            <h1>
              Turn security uncertainty into{" "}
              <span>practical decisions.</span>
            </h1>

            <p>
              NISQ Vanguard helps organizations understand their cybersecurity
              posture, identify meaningful risks and establish practical
              priorities for improvement.
            </p>

            <div className="hero-actions">
              <a href="#consultation" className="button button-primary">
                BOOK A CONSULTATION
                <ArrowRight size={17} />
              </a>

              <a href="/solutions" className="button button-secondary">
                VIEW ALL SOLUTIONS
                <ArrowRight size={17} />
              </a>
            </div>
          </div>

          <div
            className="consulting-hero-system"
            aria-label="NISQ Vanguard consulting methodology"
          >
            <div className="consulting-system-header">
              <span>CONSULTING SYSTEM</span>
              <span>01 — 06</span>
            </div>

            <div className="consulting-system-core">
              <div className="consulting-system-ring">
                <ShieldCheck size={52} strokeWidth={1.25} />
              </div>

              <strong>SECURITY POSTURE</strong>

              <span>DISCOVER · ASSESS · IMPROVE</span>
            </div>

            <div className="consulting-system-nodes">
              <span>PEOPLE</span>
              <span>PROCESS</span>
              <span>TECHNOLOGY</span>
            </div>

            <div className="consulting-system-footer">
              <span>NISQ / CONSULTING</span>
              <span>RISK · RESILIENCE · READINESS</span>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="section">
        <div className="container">
          <div className="consultation-intro">
            <div>
              <p className="eyebrow">SECURITY ADVISORY</p>

              <h2>
                Security should support the organization, not become another
                source of uncertainty.
              </h2>
            </div>

            <p>
              Our consulting approach connects people, processes and
              technology. We focus on understanding the environment first,
              identifying meaningful risks and turning findings into actions
              that organizations can realistically implement.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section section-secondary">
        <div className="container">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">CONSULTING CAPABILITIES</p>

              <h2>
                Practical cybersecurity support across the risk lifecycle.
              </h2>
            </div>

            <p>
              Choose the area where you need support, or start with a
              cybersecurity health check to understand where your organization
              stands.
            </p>
          </div>

          <div className="consulting-services-grid">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <article
                  className="consulting-service-card"
                  key={service.number}
                >
                  <div className="consulting-service-top">
                    <span>{service.number}</span>
                    <Icon size={24} strokeWidth={1.5} />
                  </div>

                  <h3>{service.title}</h3>

                  <p>{service.description}</p>

                  <a href="#consultation" className="text-link">
                    Discuss this service
                    <ArrowRight size={15} />
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="section">
        <div className="container">
          <div className="methodology-layout">
            <div className="section-heading">
              <p className="eyebrow">OUR METHODOLOGY</p>

              <h2>
                A structured path from understanding the environment to
                improving resilience.
              </h2>

              <p>
                Every engagement follows a clear sequence designed to turn
                security uncertainty into practical next steps.
              </p>
            </div>

            <div className="methodology-grid">
              {methodology.map((step) => (
                <article className="methodology-step" key={step.number}>
                  <span>{step.number}</span>

                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Responsible testing */}
      <section className="responsible-testing-section">
        <div className="container">
          <div className="responsible-testing">
            <div>
              <p className="eyebrow">RESPONSIBLE SECURITY</p>

              <h2>
                Security testing should be authorized, scoped and purposeful.
              </h2>
            </div>

            <p>
              NISQ Vanguard approaches security assessment responsibly. Any
              testing activity should be explicitly authorized and conducted
              within an agreed scope. We do not encourage unauthorized access,
              exploitation or testing of systems without permission.
            </p>
          </div>
        </div>
      </section>

      {/* Consultation */}
      <section className="consultation-section" id="consultation">
        <div className="container consultation-grid">
          <div className="consultation-intro">
            <div>
              <p className="eyebrow">START A CONVERSATION</p>

              <h2>Tell us what you need to protect.</h2>
            </div>

            <p>
              Share a little about your organization, your security priorities
              and the area where you need support. Our team can use this
              information to understand the context before the consultation.
            </p>

            <div className="consultation-notes">
              <div>
                <span>01</span>
                <p>Understand your requirements.</p>
              </div>

              <div>
                <span>02</span>
                <p>Identify the appropriate service.</p>
              </div>

              <div>
                <span>03</span>
                <p>Discuss practical next steps.</p>
              </div>
            </div>
          </div>

          <div className="consultation-form-card">
            <div className="consultation-form-header">
              <p className="eyebrow">CONSULTATION REQUEST</p>

              <h2>Book a consultation</h2>

              <p>
                Complete the form and our team will review your request.
              </p>
            </div>

            {submitStatus === "success" && (
              <div
                className="form-status form-status-success"
                role="status"
                aria-live="polite"
              >
                <strong>Consultation request received.</strong>
                <span>
                  Your request has been securely submitted. Our team can now
                  review the information you provided.
                </span>
              </div>
            )}

            {submitStatus === "error" && (
              <div
                className="form-status form-status-error"
                role="alert"
                aria-live="assertive"
              >
                <strong>Something went wrong.</strong>
                <span>
                  We could not submit your consultation request. Please check
                  your information and try again.
                </span>
              </div>
            )}

            <form
              className="consultation-form"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="consultation-name">Name</label>

                  <input
                    id="consultation-name"
                    name="name"
                    type="text"
                    placeholder="Your full name"
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="consultation-email">Email</label>

                  <input
                    id="consultation-email"
                    name="email"
                    type="email"
                    placeholder="you@organization.com"
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="consultation-phone">Phone</label>

                  <input
                    id="consultation-phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    autoComplete="tel"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="consultation-organization">
                    Organization
                  </label>

                  <input
                    id="consultation-organization"
                    name="organization"
                    type="text"
                    placeholder="Organization name"
                    autoComplete="organization"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="consultation-designation">
                    Designation
                  </label>

                  <input
                    id="consultation-designation"
                    name="designation"
                    type="text"
                    placeholder="Your designation"
                    autoComplete="organization-title"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="consultation-type">
                    Organization Type
                  </label>

                  <select
                    id="consultation-type"
                    name="organization_type"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>
                      Select organization type
                    </option>

                    {organizationTypes.map((type) => (
                      <option value={type} key={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="consultation-service">
                    Service Required
                  </label>

                  <select
                    id="consultation-service"
                    name="service"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>
                      Select a service
                    </option>

                    {services.map((service) => (
                      <option key={service.number} value={service.title}>
                        {service.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="consultation-date">
                    Preferred Date
                  </label>

                  <input
                    id="consultation-date"
                    name="preferred_date"
                    type="date"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="consultation-time">
                    Preferred Time
                  </label>

                  <select
                    id="consultation-time"
                    name="preferred_time"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>
                      Select preferred time
                    </option>

                    {consultationTimes.map((time) => (
                      <option value={time.value} key={time.value}>
                        {time.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field form-field-full">
                  <label htmlFor="consultation-message">Message</label>

                  <textarea
                    id="consultation-message"
                    name="message"
                    rows={6}
                    placeholder="Tell us about your security requirements..."
                    required
                  />
                </div>

                <div className="form-field form-field-full">
                  <label className="consent-field">
                    <input
                      type="checkbox"
                      name="consent"
                      required
                    />

                    <span>
                      I consent to NISQ Vanguard using the information provided
                      to respond to this consultation request.
                    </span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="button button-primary"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "SUBMITTING REQUEST..."
                  : "SUBMIT CONSULTATION REQUEST"}

                {!isSubmitting && <ArrowRight size={17} />}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta-section">
        <div className="container cta-content">
          <div>
            <p className="eyebrow">NISQ VANGUARD</p>

            <h2>Educate. Assess. Defend.</h2>

            <p>
              Practical cybersecurity for organizations, institutions and
              people navigating an increasingly complex digital environment.
            </p>
          </div>

          <a href="#consultation" className="button button-light">
            START A CONVERSATION
            <ArrowRight size={17} />
          </a>
        </div>
      </section>
    </main>
  );
}