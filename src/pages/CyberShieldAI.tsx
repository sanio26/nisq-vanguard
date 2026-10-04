import {
  Activity,
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Cpu,
  Database,
  GitBranch,
  LockKeyhole,
  Network,
  Radar,
  ScanSearch,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import "../styles/cybershieldai.css";

const pipeline = [
  {
    step: "01",
    title: "DATA COLLECTION",
    description:
      "Security signals, logs, telemetry and contextual inputs form the foundation of the detection pipeline.",
    icon: Database,
  },
  {
    step: "02",
    title: "PREPROCESSING",
    description:
      "Signals are normalized, enriched and prepared for downstream detection and analysis.",
    icon: Workflow,
  },
  {
    step: "03",
    title: "AI THREAT DETECTION",
    description:
      "Machine learning and intelligent detection approaches identify suspicious patterns and anomalies.",
    icon: BrainCircuit,
  },
  {
    step: "04",
    title: "THREAT INTELLIGENCE + RAG",
    description:
      "Relevant security knowledge can be retrieved and combined with observed signals for contextual analysis.",
    icon: Radar,
  },
  {
    step: "05",
    title: "AI SECURITY COPILOT",
    description:
      "An analyst-oriented interface can help investigate signals, explain findings and organize defensive actions.",
    icon: Bot,
  },
  {
    step: "06",
    title: "SECURITY RESPONSE",
    description:
      "Validated findings can inform response workflows, prioritization and human-led security decisions.",
    icon: ShieldCheck,
  },
];

const capabilities = [
  {
    number: "01",
    title: "Threat Detection",
    description:
      "Explore intelligent approaches for identifying suspicious behaviour, anomalies and potential attack activity.",
    icon: ScanSearch,
  },
  {
    number: "02",
    title: "Threat Intelligence",
    description:
      "Connect observed security signals with structured intelligence and contextual security knowledge.",
    icon: Radar,
  },
  {
    number: "03",
    title: "Retrieval-Augmented Analysis",
    description:
      "Use relevant knowledge retrieval to provide additional context around security investigations.",
    icon: Search,
  },
  {
    number: "04",
    title: "Security Copilot",
    description:
      "Design an analyst-focused AI interface for investigation, explanation and defensive decision support.",
    icon: Bot,
  },
  {
    number: "05",
    title: "Security Automation",
    description:
      "Investigate how validated intelligence can connect with structured response and operational workflows.",
    icon: GitBranch,
  },
  {
    number: "06",
    title: "Human Oversight",
    description:
      "Keep important security decisions under appropriate human review rather than treating AI output as authority.",
    icon: LockKeyhole,
  },
];

const principles = [
  "AI output should remain explainable and reviewable.",
  "Security decisions require appropriate human oversight.",
  "Research capabilities must be validated before operational use.",
  "Sensitive security data requires strong access controls.",
];

export default function CyberShieldAI() {
  return (
    <main className="cybershield-page">
      <section className="cybershield-hero">
        <div className="cybershield-container cybershield-hero-grid">
          <div className="cybershield-hero-copy">
            <div className="cybershield-eyebrow">
              <span className="cybershield-eyebrow-dot" />
              NISQ / INNOVATION / CYBERSHIELD AI
            </div>

            <div className="cybershield-status">
              <CircleDot size={13} />
              IN DEVELOPMENT
            </div>

            <h1>
              Enterprise AI threat hunting &{" "}
              <span>cyber attack detection.</span>
            </h1>

            <p className="cybershield-hero-description">
              CyberShieldAI explores how artificial intelligence, threat
              intelligence and retrieval-augmented security analysis can work
              together to support modern cyber defence.
            </p>

            <div className="cybershield-hero-actions">
              <a href="#architecture" className="cybershield-primary-button">
                EXPLORE THE ARCHITECTURE
                <ArrowRight size={17} />
              </a>

              <a href="#capabilities" className="cybershield-text-button">
                VIEW CAPABILITIES
                <ChevronRight size={17} />
              </a>
            </div>

            <div className="cybershield-hero-note">
              <LockKeyhole size={15} />
              <span>
                Research platform concept — not represented as a production
                security engine.
              </span>
            </div>
          </div>

          <div className="cybershield-hero-visual">
            <div className="cybershield-visual-topline">
              <span>NISQ / CYBERSHIELD AI</span>
              <span>R&amp;D / 001</span>
            </div>

            <div className="cybershield-core-system">
              <div className="cybershield-orbit cybershield-orbit-one" />
              <div className="cybershield-orbit cybershield-orbit-two" />

              <div className="cybershield-node cybershield-node-top">
                <Database size={18} />
                <span>SECURITY SIGNALS</span>
              </div>

              <div className="cybershield-core">
                <Sparkles size={25} />
                <strong>CYBERSHIELD AI</strong>
                <span>INTELLIGENCE LAYER</span>
              </div>

              <div className="cybershield-node-row">
                <div className="cybershield-node">
                  <Radar size={17} />
                  <span>THREAT INTEL</span>
                </div>

                <div className="cybershield-node">
                  <BrainCircuit size={17} />
                  <span>AI DETECTION</span>
                </div>

                <div className="cybershield-node">
                  <Bot size={17} />
                  <span>AI COPILOT</span>
                </div>
              </div>
            </div>

            <div className="cybershield-visual-footer">
              <span>DETECTION</span>
              <span>INTELLIGENCE</span>
              <span>REASONING</span>
              <span>RESPONSE</span>
            </div>
          </div>
        </div>
      </section>

      <section className="cybershield-intro">
        <div className="cybershield-container cybershield-intro-grid">
          <div>
            <span className="cybershield-section-label">01 / THE CONCEPT</span>
            <h2>
              Turning security signals into{" "}
              <span>defensive intelligence.</span>
            </h2>
          </div>

          <div className="cybershield-intro-copy">
            <p>
              Modern security environments generate enormous amounts of
              telemetry. The challenge is not simply collecting more data — it
              is understanding what matters, why it matters and what should
              happen next.
            </p>

            <p>
              CyberShieldAI is designed as a research direction for combining
              detection systems, threat intelligence, retrieval and AI-assisted
              investigation into one coherent security workflow.
            </p>
          </div>
        </div>
      </section>

      <section id="architecture" className="cybershield-architecture">
        <div className="cybershield-container">
          <div className="cybershield-section-heading">
            <div>
              <span className="cybershield-section-label">
                02 / SYSTEM ARCHITECTURE
              </span>
              <h2>
                From raw signals to{" "}
                <span>security response.</span>
              </h2>
            </div>

            <p>
              A conceptual pipeline showing how the major CyberShieldAI
              components can connect into a unified defensive workflow.
            </p>
          </div>

          <div className="cybershield-pipeline">
            {pipeline.map((item, index) => {
              const Icon = item.icon;

              return (
                <div className="cybershield-pipeline-item" key={item.step}>
                  <div className="cybershield-pipeline-index">
                    {item.step}
                  </div>

                  <div className="cybershield-pipeline-icon">
                    <Icon size={20} />
                  </div>

                  <div className="cybershield-pipeline-content">
                    <div className="cybershield-pipeline-title">
                      {item.title}
                    </div>

                    <p>{item.description}</p>
                  </div>

                  {index < pipeline.length - 1 && (
                    <div className="cybershield-pipeline-arrow">
                      <ArrowRight size={16} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="cybershield-architecture-note">
            <Activity size={17} />
            <div>
              <strong>RESEARCH ARCHITECTURE</strong>
              <span>
                This diagram represents the intended research and product
                direction. It does not claim that every component is currently
                implemented or production-ready.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="capabilities" className="cybershield-capabilities">
        <div className="cybershield-container">
          <div className="cybershield-section-heading">
            <div>
              <span className="cybershield-section-label">
                03 / CAPABILITIES
              </span>
              <h2>
                Intelligence designed around{" "}
                <span>security operations.</span>
              </h2>
            </div>

            <p>
              CyberShieldAI brings several research capabilities together
              without pretending that AI can replace security expertise.
            </p>
          </div>

          <div className="cybershield-capability-grid">
            {capabilities.map((item) => {
              const Icon = item.icon;

              return (
                <article className="cybershield-capability-card" key={item.number}>
                  <div className="cybershield-card-top">
                    <span>{item.number}</span>
                    <Icon size={21} />
                  </div>

                  <h3>{item.title}</h3>
                  <p>{item.description}</p>

                  <div className="cybershield-card-line" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="cybershield-copilot">
        <div className="cybershield-container">
          <div className="cybershield-copilot-shell">
            <div className="cybershield-copilot-copy">
              <span className="cybershield-section-label">
                04 / SECURITY COPILOT
              </span>

              <div className="cybershield-copilot-badge">
                <Bot size={15} />
                AI-ASSISTED SECURITY ANALYSIS
              </div>

              <h2>
                An AI interface for{" "}
                <span>security investigation.</span>
              </h2>

              <p>
                The CyberShieldAI Copilot concept focuses on helping security
                teams investigate evidence, retrieve relevant knowledge,
                understand findings and organize next steps.
              </p>

              <div className="cybershield-copilot-points">
                <div>
                  <CheckCircle2 size={17} />
                  <span>Investigate security signals</span>
                </div>

                <div>
                  <CheckCircle2 size={17} />
                  <span>Retrieve relevant intelligence</span>
                </div>

                <div>
                  <CheckCircle2 size={17} />
                  <span>Explain detection context</span>
                </div>

                <div>
                  <CheckCircle2 size={17} />
                  <span>Support analyst decision-making</span>
                </div>
              </div>
            </div>

            <div className="cybershield-copilot-interface">
              <div className="cybershield-interface-header">
                <div className="cybershield-interface-brand">
                  <Sparkles size={16} />
                  CYBERSHIELD COPILOT
                </div>

                <span>R&amp;D INTERFACE</span>
              </div>

              <div className="cybershield-interface-content">
                <div className="cybershield-interface-label">
                  SECURITY ANALYSIS
                </div>

                <div className="cybershield-analysis-card">
                  <div className="cybershield-analysis-icon">
                    <ScanSearch size={18} />
                  </div>

                  <div>
                    <strong>Suspicious activity detected</strong>
                    <span>
                      Investigation context can be assembled from available
                      security signals and relevant intelligence.
                    </span>
                  </div>
                </div>

                <div className="cybershield-analysis-card">
                  <div className="cybershield-analysis-icon">
                    <Radar size={18} />
                  </div>

                  <div>
                    <strong>Context retrieval</strong>
                    <span>
                      Relevant knowledge can be surfaced through a retrieval
                      layer before analyst review.
                    </span>
                  </div>
                </div>

                <div className="cybershield-interface-input">
                  <span>Ask about this investigation...</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cybershield-principles">
        <div className="cybershield-container cybershield-principles-grid">
          <div>
            <span className="cybershield-section-label">
              05 / RESPONSIBLE AI
            </span>

            <h2>
              Security AI must be{" "}
              <span>powerful and accountable.</span>
            </h2>

            <p>
              Cybersecurity decisions have real consequences. Our approach
              keeps validation, access control, explainability and human
              oversight at the centre of the system.
            </p>
          </div>

          <div className="cybershield-principle-list">
            {principles.map((principle, index) => (
              <div className="cybershield-principle" key={principle}>
                <span>0{index + 1}</span>
                <CheckCircle2 size={17} />
                <p>{principle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cybershield-roadmap">
        <div className="cybershield-container">
          <div className="cybershield-roadmap-shell">
            <div className="cybershield-roadmap-heading">
              <span className="cybershield-section-label">
                06 / RESEARCH DIRECTION
              </span>

              <h2>
                Building the next layer of{" "}
                <span>cyber defence.</span>
              </h2>

              <p>
                CyberShieldAI is part of NISQ Vanguard&apos;s broader research
                direction around AI security, threat intelligence and
                responsible security automation.
              </p>
            </div>

            <div className="cybershield-roadmap-visual">
              <div className="cybershield-roadmap-line" />

              <div className="cybershield-roadmap-stage">
                <Cpu size={19} />
                <span>DETECT</span>
              </div>

              <div className="cybershield-roadmap-stage">
                <Network size={19} />
                <span>CONNECT</span>
              </div>

              <div className="cybershield-roadmap-stage">
                <BrainCircuit size={19} />
                <span>REASON</span>
              </div>

              <div className="cybershield-roadmap-stage">
                <ShieldCheck size={19} />
                <span>DEFEND</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cybershield-final">
        <div className="cybershield-container">
          <div className="cybershield-final-shell">
            <div>
              <span className="cybershield-section-label">
                NISQ VANGUARD / INNOVATION
              </span>

              <h2>
                Explore what comes{" "}
                <span>next.</span>
              </h2>

              <p>
                Discover our wider research areas or speak with NISQ Vanguard
                about cybersecurity, AI security and defensive technology.
              </p>
            </div>

            <div className="cybershield-final-actions">
              <a href="/innovation" className="cybershield-primary-button">
                VIEW RESEARCH
                <ArrowRight size={17} />
              </a>

              <a href="/contact" className="cybershield-text-button">
                TALK TO NISQ VANGUARD
                <ChevronRight size={17} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}