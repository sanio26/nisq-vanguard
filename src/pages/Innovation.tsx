import {
  ArrowRight,
  BrainCircuit,
  ChevronRight,
  Cpu,
  Database,
  Fingerprint,
  FlaskConical,
  LockKeyhole,
  Network,
  Radar,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import "../styles/innovation.css";

const researchAreas = [
  {
    number: "01",
    icon: BrainCircuit,
    title: "AI Security",
    description:
      "Exploring practical approaches to securing AI systems, models, data pipelines and AI-assisted workflows.",
  },
  {
    number: "02",
    icon: Radar,
    title: "Threat Intelligence",
    description:
      "Turning security signals and threat knowledge into structured intelligence that supports better decisions.",
  },
  {
    number: "03",
    icon: Network,
    title: "Security Automation",
    description:
      "Investigating repeatable security workflows that reduce manual effort while keeping human oversight in the loop.",
  },
  {
    number: "04",
    icon: LockKeyhole,
    title: "Post-Quantum Cryptography",
    description:
      "Studying the transition toward cryptographic approaches designed for a future shaped by quantum computing.",
  },
  {
    number: "05",
    icon: ShieldCheck,
    title: "Secure AI",
    description:
      "Examining security risks across AI applications, including prompt manipulation, data exposure and model misuse.",
  },
  {
    number: "06",
    icon: Fingerprint,
    title: "Fraud Detection",
    description:
      "Exploring intelligent methods for identifying suspicious digital behaviour and emerging fraud patterns.",
  },
  {
    number: "07",
    icon: ScanSearch,
    title: "Digital Safety",
    description:
      "Developing practical security thinking around identity, privacy, online fraud and everyday digital behaviour.",
  },
  {
    number: "08",
    icon: Cpu,
    title: "Cyber Defence",
    description:
      "Connecting security research with practical defensive architectures, assessment methods and response workflows.",
  },
  {
    number: "09",
    icon: FlaskConical,
    title: "Emerging Technology",
    description:
      "Investigating technologies that may influence how organizations approach security in the years ahead.",
  },
];

const researchMethod = [
  {
    number: "01",
    title: "OBSERVE",
    description:
      "Understand emerging technologies, attack patterns and operational security challenges.",
  },
  {
    number: "02",
    title: "INVESTIGATE",
    description:
      "Break complex security problems into testable technical questions and research directions.",
  },
  {
    number: "03",
    title: "VALIDATE",
    description:
      "Evaluate approaches through controlled experimentation, analysis and practical security scenarios.",
  },
  {
    number: "04",
    title: "TRANSLATE",
    description:
      "Turn useful findings into architectures, tools, education and practical defensive guidance.",
  },
];

function Innovation() {
  return (
    <main className="innovation-page">
      {/* =========================================================
          HERO
      ========================================================== */}

      <section className="innovation-hero">
        <div className="container innovation-hero-grid">
          <div className="innovation-hero-copy">
            <p className="innovation-eyebrow">
              RESEARCH / INNOVATION / CYBER DEFENCE
            </p>

            <h1>
              Research that moves cybersecurity
              <span> forward.</span>
            </h1>

            <p className="innovation-hero-description">
              NISQ Vanguard explores emerging security challenges and
              technologies to understand what comes next — and translate
              meaningful research into practical defensive capability.
            </p>

            <div className="innovation-hero-actions">
              <a
                href="/innovation/cybershieldai"
                className="innovation-primary-button"
              >
                EXPLORE CYBERSHIELDAI
                <ArrowRight size={17} />
              </a>

              <a
                href="#research-areas"
                className="innovation-text-button"
              >
                VIEW RESEARCH AREAS
                <ChevronRight size={16} />
              </a>
            </div>

            <div className="innovation-hero-meta">
              <div>
                <strong>01</strong>
                <span>RESEARCH</span>
              </div>

              <div>
                <strong>02</strong>
                <span>EXPERIMENT</span>
              </div>

              <div>
                <strong>03</strong>
                <span>DEFEND</span>
              </div>
            </div>
          </div>

          {/* Research architecture visual */}

          <div className="innovation-architecture">
            <div className="innovation-architecture-header">
              <span>NISQ / RESEARCH SYSTEM</span>
              <span>R&amp;D / 001</span>
            </div>

            <div className="innovation-architecture-stage">
              <div className="innovation-orbit innovation-orbit-one" />
              <div className="innovation-orbit innovation-orbit-two" />

              <div className="innovation-architecture-node innovation-node-top">
                <Database size={19} />
                <span>SECURITY SIGNALS</span>
              </div>

              <div className="innovation-architecture-line vertical" />

              <div className="innovation-architecture-core">
                <Sparkles size={25} />
                <strong>RESEARCH</strong>
                <span>INTELLIGENCE LAYER</span>
              </div>

              <div className="innovation-architecture-branches">
                <div className="innovation-architecture-branch">
                  <div className="innovation-architecture-line horizontal" />
                  <div className="innovation-architecture-node">
                    <BrainCircuit size={17} />
                    <span>AI SECURITY</span>
                  </div>
                </div>

                <div className="innovation-architecture-branch">
                  <div className="innovation-architecture-line horizontal" />
                  <div className="innovation-architecture-node">
                    <Radar size={17} />
                    <span>THREAT INTEL</span>
                  </div>
                </div>

                <div className="innovation-architecture-branch">
                  <div className="innovation-architecture-line horizontal" />
                  <div className="innovation-architecture-node">
                    <ShieldCheck size={17} />
                    <span>CYBER DEFENCE</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="innovation-architecture-footer">
              <span>OBSERVE</span>
              <span>INVESTIGATE</span>
              <span>VALIDATE</span>
              <span>TRANSLATE</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          INTRODUCTION
      ========================================================== */}

      <section className="innovation-section">
        <div className="container innovation-intro-grid">
          <div>
            <p className="innovation-eyebrow">WHY WE RESEARCH</p>

            <h2>
              Security changes faster when technology changes.
            </h2>
          </div>

          <div className="innovation-intro-copy">
            <p>
              Cybersecurity is no longer limited to traditional networks,
              endpoints and applications. AI systems, autonomous workflows,
              digital fraud, quantum computing and new attack surfaces are
              changing the security landscape.
            </p>

            <p>
              Our innovation work focuses on understanding those changes
              without losing sight of practical security. The objective is
              simple: identify what matters, test what works and communicate
              the result clearly.
            </p>

            <div className="innovation-principles">
              <div>
                <span>01</span>
                <strong>TECHNICAL</strong>
              </div>

              <div>
                <span>02</span>
                <strong>PRACTICAL</strong>
              </div>

              <div>
                <span>03</span>
                <strong>RESPONSIBLE</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          RESEARCH AREAS
      ========================================================== */}

      <section
        id="research-areas"
        className="innovation-section innovation-section-secondary"
      >
        <div className="container">
          <div className="innovation-section-heading">
            <div>
              <p className="innovation-eyebrow">RESEARCH AREAS</p>

              <h2>
                Nine directions.
                <br />
                One defensive purpose.
              </h2>
            </div>

            <p>
              We investigate emerging security problems across AI,
              infrastructure, digital safety and defensive technology.
            </p>
          </div>

          <div className="innovation-research-grid">
            {researchAreas.map((area) => {
              const Icon = area.icon;

              return (
                <article
                  className="innovation-research-card"
                  key={area.number}
                >
                  <div className="innovation-research-top">
                    <span>{area.number}</span>
                    <Icon size={19} />
                  </div>

                  <h3>{area.title}</h3>

                  <p>{area.description}</p>

                  <div className="innovation-card-line" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          RESEARCH METHOD
      ========================================================== */}

      <section className="innovation-section">
        <div className="container">
          <div className="innovation-section-heading innovation-method-heading">
            <div>
              <p className="innovation-eyebrow">OUR METHOD</p>

              <h2>
                From emerging question
                <br />
                to practical capability.
              </h2>
            </div>

            <p>
              Research should not end with a paper or an experiment. We focus
              on understanding the problem, validating the approach and
              translating useful findings into something people can apply.
            </p>
          </div>

          <div className="innovation-method-grid">
            {researchMethod.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>

                <div className="innovation-method-marker">
                  <span />
                </div>

                <h3>{step.title}</h3>

                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          CYBERSHIELDAI FEATURE
      ========================================================== */}

      <section className="innovation-cybershield-section">
        <div className="container">
          <div className="innovation-cybershield-panel">
            <div className="innovation-cybershield-copy">
              <p className="innovation-eyebrow">FLAGSHIP INNOVATION</p>

              <div className="innovation-status">
                <span />
                IN DEVELOPMENT
              </div>

              <h2>CyberShieldAI</h2>

              <p className="innovation-cybershield-subtitle">
                Enterprise AI Threat Hunting &amp; Cyber Attack Detection
              </p>

              <p className="innovation-cybershield-description">
                A research-driven security architecture exploring how
                artificial intelligence, threat intelligence, retrieval
                augmented generation and security workflows can work together
                to support modern threat detection and response.
              </p>

              <a
                href="/innovation/cybershieldai"
                className="innovation-primary-button"
              >
                EXPLORE THE ARCHITECTURE
                <ArrowRight size={17} />
              </a>
            </div>

            <div className="innovation-cybershield-diagram">
              <div className="innovation-diagram-label">
                SECURITY INTELLIGENCE PIPELINE
              </div>

              <div className="innovation-pipeline">
                <div className="innovation-pipeline-node">
                  <Database size={18} />
                  <span>DATA</span>
                </div>

                <div className="innovation-pipeline-arrow">→</div>

                <div className="innovation-pipeline-node">
                  <ScanSearch size={18} />
                  <span>DETECTION</span>
                </div>

                <div className="innovation-pipeline-arrow">→</div>

                <div className="innovation-pipeline-node">
                  <BrainCircuit size={18} />
                  <span>AI</span>
                </div>

                <div className="innovation-pipeline-arrow">→</div>

                <div className="innovation-pipeline-node">
                  <Radar size={18} />
                  <span>INTEL</span>
                </div>

                <div className="innovation-pipeline-arrow">→</div>

                <div className="innovation-pipeline-node innovation-pipeline-node-final">
                  <ShieldCheck size={18} />
                  <span>RESPONSE</span>
                </div>
              </div>

              <div className="innovation-diagram-note">
                <span />
                RESEARCH ARCHITECTURE — NOT A PRODUCTION SECURITY ENGINE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================== */}

      <section className="innovation-final-section">
        <div className="container innovation-final-inner">
          <p className="innovation-eyebrow">BUILD WHAT COMES NEXT</p>

          <h2>
            Emerging technology deserves
            <span> practical security thinking.</span>
          </h2>

          <p>
            Explore our research direction or see how CyberShieldAI brings
            together the technologies we are investigating.
          </p>

          <div className="innovation-final-actions">
            <a
              href="/innovation/cybershieldai"
              className="innovation-primary-button"
            >
              EXPLORE CYBERSHIELDAI
              <ArrowRight size={17} />
            </a>

            <a href="/contact" className="innovation-text-button">
              TALK TO NISQ VANGUARD
              <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Innovation;
