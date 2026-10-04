import {
  ArrowRight,
  BrainCircuit,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  SearchCheck,
  ShieldAlert,
  ShieldCheck,
  Target,
} from "lucide-react";

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
      "Identify security weaknesses and help prioritize remediation based on risk and business impact.",
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

export default function Solutions() {
  return (
    <main className="solutions-page">
      {/* =====================================================
          HERO
          ===================================================== */}
      <section className="solutions-hero">
        <div className="solutions-container solutions-hero-grid">
          <div className="solutions-hero-content">
            <p className="solutions-eyebrow">SECURITY SOLUTIONS</p>

            <h1>Security decisions built around real-world risk.</h1>

            <p className="solutions-hero-description">
              NISQ Vanguard helps organizations understand their cybersecurity
              posture, identify meaningful risks and build practical paths
              toward stronger resilience.
            </p>

            <div className="solutions-actions">
              <a
                href="/contact"
                className="solutions-button solutions-button-primary"
              >
                <span>BOOK A CONSULTATION</span>
                <ArrowRight size={17} />
              </a>

              <a
                href="/solutions/training"
                className="solutions-button solutions-button-secondary"
              >
                <span>EXPLORE TRAINING</span>
                <ArrowRight size={17} />
              </a>
            </div>
          </div>

          <div className="solutions-hero-visual">
            <div className="solutions-architecture">
              <div className="solutions-grid-pattern" />

              <div className="solutions-architecture-header">
                <span>SECURITY POSTURE</span>

                <span className="solutions-architecture-index">
                  01 — 08
                </span>
              </div>

              <div className="solutions-architecture-center">
                <div className="solutions-center-ring solutions-ring-one">
                  <div className="solutions-center-ring solutions-ring-two">
                    <div className="solutions-center-core">
                      <ClipboardCheck
                        size={42}
                        strokeWidth={1.35}
                      />
                    </div>
                  </div>
                </div>

                <strong>UNDERSTAND</strong>

                <span>ASSESS · PRIORITIZE · IMPROVE</span>
              </div>

              <div className="solutions-node solutions-node-one">
                <span>01</span>
                <strong>PEOPLE</strong>
              </div>

              <div className="solutions-node solutions-node-two">
                <span>02</span>
                <strong>PROCESS</strong>
              </div>

              <div className="solutions-node solutions-node-three">
                <span>03</span>
                <strong>TECHNOLOGY</strong>
              </div>

              <div className="solutions-connector solutions-connector-one" />
              <div className="solutions-connector solutions-connector-two" />
              <div className="solutions-connector solutions-connector-three" />

              <div className="solutions-architecture-footer">
                <span>NISQ / SECURITY POSTURE</span>
                <span>IDENTIFY · PRIORITIZE · IMPROVE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SERVICE INTRO
          ===================================================== */}
      <section className="solutions-section solutions-services-section">
        <div className="solutions-container">
          <div className="solutions-section-heading">
            <div>
              <p className="solutions-eyebrow">WHAT WE DO</p>

              <h2>
                Cybersecurity capabilities for organizations at every stage.
              </h2>
            </div>

            <p>
              From understanding your current posture to preparing for
              emerging risks, our services focus on practical security
              outcomes.
            </p>
          </div>

          <div className="solutions-service-grid">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <article
                  className="solutions-service-card"
                  key={service.number}
                >
                  <div className="solutions-service-top">
                    <span>{service.number}</span>

                    <Icon size={24} strokeWidth={1.5} />
                  </div>

                  <div className="solutions-service-content">
                    <h3>{service.title}</h3>

                    <p>{service.description}</p>
                  </div>

                  <a
                    href="/contact"
                    className="solutions-service-link"
                  >
                    <span>DISCUSS THIS SERVICE</span>
                    <ArrowRight size={15} />
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          METHODOLOGY
          ===================================================== */}
      <section className="solutions-methodology-section">
        <div className="solutions-container solutions-methodology-layout">
          <div className="solutions-methodology-intro">
            <p className="solutions-eyebrow">OUR METHODOLOGY</p>

            <h2>
              A structured path from discovery to improvement.
            </h2>

            <p>
              Every engagement begins with understanding the environment and
              ends with practical recommendations that can be acted upon.
            </p>

            <a
              href="/solutions/consulting"
              className="solutions-text-link"
            >
              VIEW CONSULTING APPROACH
              <ArrowRight size={16} />
            </a>
          </div>

          <div className="solutions-methodology-list">
            {methodology.map((step) => (
              <div
                className="solutions-methodology-step"
                key={step.number}
              >
                <span>{step.number}</span>

                <div>
                  <strong>{step.title}</strong>
                  <p>{step.description}</p>
                </div>

                <ArrowRight size={17} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          RESPONSIBLE SECURITY
          ===================================================== */}
      <section className="solutions-responsible-section">
        <div className="solutions-container">
          <div className="solutions-responsible">
            <div>
              <p className="solutions-eyebrow">
                RESPONSIBLE SECURITY
              </p>

              <h2>
                Security testing should be authorized, scoped and purposeful.
              </h2>
            </div>

            <div className="solutions-responsible-copy">
              <p>
                NISQ Vanguard approaches security assessment responsibly.
                Testing activities should be explicitly authorized and
                conducted within an agreed scope.
              </p>

              <a
                href="/responsible-disclosure"
                className="solutions-text-link"
              >
                RESPONSIBLE DISCLOSURE
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
          ===================================================== */}
      <section className="solutions-cta-section">
        <div className="solutions-container solutions-cta">
          <div>
            <p className="solutions-eyebrow">NEXT STEP</p>

            <h2>Understand where your organization stands.</h2>

            <p>
              Start a conversation about your security priorities and the
              areas where you need practical support.
            </p>
          </div>

          <a
            href="/contact"
            className="solutions-button solutions-button-primary"
          >
            <span>BOOK A CONSULTATION</span>
            <ArrowRight size={17} />
          </a>
        </div>
      </section>
    </main>
  );
}