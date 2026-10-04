import {
  ArrowRight,
  BarChart3,
  ChevronRight,
  ClipboardCheck,
  LockKeyhole,
  Radar,
  ShieldCheck,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/case-studies.css";

const categories = [
  "ALL",
  "SECURITY ASSESSMENT",
  "AWARENESS",
  "AI SECURITY",
  "CAMPUS SECURITY",
  "DEFENCE TECHNOLOGY",
];

const caseStudies = [
  {
    number: "01",
    category: "SECURITY ASSESSMENT",
    icon: Radar,
    title: "Enterprise Security Posture Assessment",
    summary:
      "A representative security assessment focused on understanding exposure, control maturity and the highest-priority areas for improvement.",
    challenge:
      "An organization needed a structured view of its current cybersecurity posture and the areas requiring the most immediate attention.",
    assessment:
      "The engagement combines security posture review, exposure analysis, configuration review and stakeholder discussions.",
    findings:
      "Risk areas are grouped by severity, business relevance and the effort required to address them.",
    outcome:
      "A prioritized security improvement roadmap gives leadership a clearer path from discovery to remediation.",
  },
  {
    number: "02",
    category: "AWARENESS",
    icon: ShieldCheck,
    title: "Security Awareness Program",
    summary:
      "A representative employee-focused program designed to improve everyday cyber behaviour and reduce human-driven exposure.",
    challenge:
      "Employees interact with phishing, social engineering, fraudulent communication and unsafe digital workflows every day.",
    assessment:
      "The program evaluates existing awareness levels and identifies the behaviours that create the greatest organizational exposure.",
    findings:
      "Common weaknesses are translated into practical scenarios employees can recognize and respond to.",
    outcome:
      "A repeatable awareness framework helps establish stronger security habits across the organization.",
  },
  {
    number: "03",
    category: "AI SECURITY",
    icon: Target,
    title: "AI Security Readiness Review",
    summary:
      "A representative AI security engagement examining how organizations can approach emerging AI risks responsibly.",
    challenge:
      "Rapid adoption of generative and AI-assisted systems introduces new questions around data, access, misuse and trust.",
    assessment:
      "AI workflows, data boundaries, access patterns and security assumptions are reviewed from a defensive perspective.",
    findings:
      "Potential risks are mapped to governance, application security, data protection and AI-specific threat scenarios.",
    outcome:
      "The organization receives a practical AI security roadmap designed to support safer adoption.",
  },
  {
    number: "04",
    category: "CAMPUS SECURITY",
    icon: ClipboardCheck,
    title: "CyberSecure Campus Program",
    summary:
      "A representative campus-wide cybersecurity awareness initiative covering students, faculty and institutional teams.",
    challenge:
      "Large campus communities face phishing, online fraud, account compromise, privacy risks and social engineering.",
    assessment:
      "Awareness requirements are mapped across student, faculty and administrative audiences.",
    findings:
      "Different groups require different levels of technical depth and different examples of digital risk.",
    outcome:
      "A structured campus security program creates a shared baseline for safer digital behaviour.",
  },
];

const methodology = [
  {
    number: "01",
    title: "DISCOVER",
    text: "Understand the environment, objectives, users and business context.",
  },
  {
    number: "02",
    title: "SCOPE",
    text: "Define the systems, people, processes and boundaries involved.",
  },
  {
    number: "03",
    title: "ASSESS",
    text: "Evaluate the relevant security controls, exposure and risk conditions.",
  },
  {
    number: "04",
    title: "IDENTIFY",
    text: "Translate technical observations into meaningful security findings.",
  },
  {
    number: "05",
    title: "PRIORITIZE",
    text: "Rank findings using risk, impact and practical remediation effort.",
  },
  {
    number: "06",
    title: "IMPROVE",
    text: "Turn findings into an actionable security improvement roadmap.",
  },
];

function CaseStudies() {
  return (
    <main className="case-studies-page">
      <section className="case-studies-hero">
        <div className="case-studies-hero-background" />

        <div className="case-studies-container">
          <div className="case-studies-hero-grid">
            <div className="case-studies-hero-copy">
              <div className="case-studies-eyebrow">
                NISQ / CASE STUDIES / SECURITY OUTCOMES
              </div>

              <div className="case-studies-kicker">
                <BarChart3 size={16} />
                <span>ASSESSMENT · INSIGHT · IMPROVEMENT</span>
              </div>

              <h1>
                Turning security
                <span> questions into action.</span>
              </h1>

              <p className="case-studies-hero-description">
                Explore representative security scenarios that demonstrate how
                NISQ Vanguard approaches cybersecurity challenges through
                structured assessment, practical analysis and measurable
                improvement.
              </p>

              <div className="case-studies-hero-actions">
                <a href="#case-library" className="case-studies-primary-button">
                  EXPLORE CASE STUDIES
                  <ArrowRight size={17} />
                </a>

                <Link
                  to="/contact"
                  className="case-studies-secondary-button"
                >
                  DISCUSS YOUR SECURITY
                  <ChevronRight size={17} />
                </Link>
              </div>
            </div>

            <div className="case-studies-hero-visual">
              <div className="case-studies-architecture">
                <div className="architecture-topline">
                  <span>DEFENCE ANALYSIS FRAMEWORK</span>
                  <span className="architecture-status">
                    <i />
                    STATUS / ACTIVE
                  </span>
                </div>

                <div className="architecture-main">
                  <div className="architecture-icon">
                    <LockKeyhole size={28} />
                  </div>

                  <div>
                    <strong>RISK → RESILIENCE</strong>
                    <span>Structured security decision framework</span>
                  </div>
                </div>

                <div className="architecture-lines">
                  <div>
                    <span>01</span>
                    PEOPLE
                  </div>
                  <div>
                    <span>02</span>
                    PROCESS
                  </div>
                  <div>
                    <span>03</span>
                    TECHNOLOGY
                  </div>
                  <div>
                    <span>04</span>
                    THREAT
                  </div>
                </div>

                <div className="architecture-flow">
                  {["DISCOVER", "ASSESS", "PRIORITIZE", "IMPROVE"].map(
                    (item, index) => (
                      <div key={item} className="architecture-flow-item">
                        <span>0{index + 1}</span>
                        <strong>{item}</strong>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="case-library" className="case-studies-library">
        <div className="case-studies-container">
          <div className="case-studies-section-intro">
            <div>
              <span className="section-number">01 / CASE LIBRARY</span>
              <h2>Security work, structured clearly.</h2>
            </div>

            <p>
              These examples are representative scenarios created to
              demonstrate NISQ Vanguard&apos;s methodology. They are not claims
              about specific real-world clients.
            </p>
          </div>

          <div className="case-studies-filters" role="tablist">
            {categories.map((category, index) => (
              <button
                key={category}
                type="button"
                className={`case-studies-filter ${
                  index === 0 ? "active" : ""
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="case-studies-grid">
            {caseStudies.map((study) => {
              const Icon = study.icon;

              return (
                <article className="case-study-card" key={study.number}>
                  <div className="case-study-card-header">
                    <div className="case-study-card-meta">
                      <span>{study.number}</span>
                      <span>{study.category}</span>
                    </div>

                    <div className="case-study-card-icon">
                      <Icon size={21} strokeWidth={1.7} />
                    </div>
                  </div>

                  <div className="case-study-demo-label">
                    REPRESENTATIVE / DEMO SCENARIO
                  </div>

                  <h3>{study.title}</h3>

                  <p className="case-study-summary">{study.summary}</p>

                  <div className="case-study-details">
                    <div className="case-study-detail">
                      <span>CHALLENGE</span>
                      <p>{study.challenge}</p>
                    </div>

                    <div className="case-study-detail">
                      <span>ASSESSMENT</span>
                      <p>{study.assessment}</p>
                    </div>

                    <div className="case-study-detail">
                      <span>FINDINGS</span>
                      <p>{study.findings}</p>
                    </div>

                    <div className="case-study-detail">
                      <span>OUTCOME</span>
                      <p>{study.outcome}</p>
                    </div>
                  </div>

                  <Link to="/contact" className="case-study-card-link">
                    DISCUSS A SIMILAR CHALLENGE
                    <ArrowRight size={16} />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="case-studies-methodology">
        <div className="case-studies-container">
          <div className="methodology-heading">
            <div>
              <span className="section-number">02 / OUR METHODOLOGY</span>
              <h2>
                From discovery
                <span> to improvement.</span>
              </h2>
            </div>

            <p>
              Every engagement follows a structured path designed to transform
              technical observations into practical security decisions.
            </p>
          </div>

          <div className="methodology-grid">
            {methodology.map((item) => (
              <article className="methodology-card" key={item.number}>
                <span className="methodology-number">{item.number}</span>

                <div className="methodology-card-line" />

                <h3>{item.title}</h3>

                <p>{item.text}</p>

                <ArrowRight
                  className="methodology-arrow"
                  size={18}
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="case-studies-outcomes">
        <div className="case-studies-container">
          <div className="outcomes-panel">
            <div className="outcomes-copy">
              <span className="section-number">03 / SECURITY OUTCOMES</span>

              <h2>Clarity before complexity.</h2>

              <p>
                Good cybersecurity starts with understanding what matters,
                where exposure exists and what should happen next. NISQ
                Vanguard turns technical analysis into practical decisions.
              </p>

              <Link to="/contact" className="case-studies-primary-button">
                START A SECURITY CONVERSATION
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="outcomes-stat-grid">
              <div>
                <strong>01</strong>
                <span>UNDERSTAND</span>
              </div>
              <div>
                <strong>02</strong>
                <span>PRIORITIZE</span>
              </div>
              <div>
                <strong>03</strong>
                <span>IMPROVE</span>
              </div>
              <div>
                <strong>04</strong>
                <span>RESILIENCE</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default CaseStudies;