import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  FileCheck2,
  MailWarning,
  MonitorCheck,
  ShieldCheck,
  Users,
} from "lucide-react";
import "../styles/training.css";

const trainingPrograms = [
  {
    number: "01",
    title: "Employee Cyber Awareness",
    description:
      "Build practical cybersecurity habits across employees and teams.",
    icon: Users,
  },
  {
    number: "02",
    title: "Phishing Awareness",
    description:
      "Teach employees how to recognise phishing emails, links and deceptive requests.",
    icon: MailWarning,
  },
  {
    number: "03",
    title: "Social Engineering",
    description:
      "Understand manipulation techniques used to target people and organisations.",
    icon: Users,
  },
  {
    number: "04",
    title: "AI Scam Awareness",
    description:
      "Prepare teams for AI-generated impersonation, deepfakes and emerging scams.",
    icon: BrainCircuit,
  },
  {
    number: "05",
    title: "Email Security",
    description:
      "Improve secure email behaviour, suspicious-message handling and reporting.",
    icon: MailWarning,
  },
  {
    number: "06",
    title: "Data Protection",
    description:
      "Strengthen awareness around sensitive information, privacy and secure handling.",
    icon: FileCheck2,
  },
  {
    number: "07",
    title: "Secure Remote Work",
    description:
      "Help distributed teams work securely across devices, networks and cloud services.",
    icon: MonitorCheck,
  },
  {
    number: "08",
    title: "Incident Reporting",
    description:
      "Create confidence around identifying, reporting and responding to security incidents.",
    icon: ShieldCheck,
  },
];

const methodology = [
  {
    number: "01",
    title: "UNDERSTAND",
    description:
      "Understand the organisation, audience, existing awareness level and key risk areas.",
  },
  {
    number: "02",
    title: "DESIGN",
    description:
      "Build training around the organisation's people, workflows and security priorities.",
  },
  {
    number: "03",
    title: "DELIVER",
    description:
      "Deliver practical sessions using relevant examples, demonstrations and exercises.",
  },
  {
    number: "04",
    title: "REINFORCE",
    description:
      "Turn individual sessions into repeatable security behaviour and awareness.",
  },
];

const audiences = [
  "Employees",
  "Management",
  "Technical Teams",
  "Remote Teams",
  "New Joiners",
  "Security Teams",
];

export default function Training() {
  return (
    <main className="training-page">
      <section className="training-hero">
        <div className="container training-hero-grid">
          <div className="training-hero-copy">
            <p className="training-eyebrow">
              NISQ VANGUARD · CORPORATE SECURITY TRAINING
            </p>

            <h1>
              Turn cybersecurity awareness into everyday behaviour.
            </h1>

            <p className="training-hero-description">
              Practical cybersecurity training designed to help employees
              recognise threats, protect information and respond responsibly
              when something goes wrong.
            </p>

            <div className="training-hero-actions">
              <a
                href="/contact?service=Corporate%20Training"
                className="training-primary-button"
              >
                REQUEST TRAINING
                <ArrowRight size={17} />
              </a>

              <a
                href="#training-programs"
                className="training-secondary-button"
              >
                EXPLORE PROGRAMS
                <ArrowRight size={17} />
              </a>
            </div>

            <div className="training-hero-metrics">
              <div>
                <strong>PEOPLE</strong>
                <span>Human behaviour</span>
              </div>

              <div>
                <strong>RISK</strong>
                <span>Practical awareness</span>
              </div>

              <div>
                <strong>RESILIENCE</strong>
                <span>Better response</span>
              </div>
            </div>
          </div>

          <div className="training-architecture">
            <div className="training-architecture-header">
              <span>SECURITY AWARENESS SYSTEM</span>
              <span>ORGANISATION</span>
            </div>

            <div className="training-architecture-body">
              <div className="training-architecture-node training-node-top">
                <Users size={20} />
                <span>PEOPLE</span>
              </div>

              <div className="training-architecture-line" />

              <div className="training-architecture-core">
                <ShieldCheck size={32} />

                <strong>SECURITY CULTURE</strong>

                <span>
                  Awareness · Practice · Response
                </span>
              </div>

              <div className="training-architecture-line" />

              <div className="training-architecture-row">
                <div className="training-architecture-node">
                  <MailWarning size={18} />
                  <span>THREATS</span>
                </div>

                <div className="training-architecture-node">
                  <FileCheck2 size={18} />
                  <span>DATA</span>
                </div>

                <div className="training-architecture-node">
                  <MonitorCheck size={18} />
                  <span>WORKFLOW</span>
                </div>
              </div>
            </div>

            <div className="training-architecture-footer">
              <span>EDUCATE</span>
              <span>ASSESS</span>
              <span>DEFEND</span>
            </div>
          </div>
        </div>
      </section>

      <section className="training-section training-section-secondary">
        <div className="container training-intro-grid">
          <div>
            <p className="training-eyebrow">WHY SECURITY TRAINING</p>

            <h2>
              Technology can reduce risk. People still make the decisions.
            </h2>
          </div>

          <div className="training-intro-copy">
            <p>
              Employees interact with emails, documents, applications,
              devices and external requests every day.
            </p>

            <p>
              Effective awareness training helps people recognise suspicious
              behaviour before it becomes a security incident.
            </p>

            <p>
              NISQ Vanguard focuses on practical situations employees can
              actually encounter at work.
            </p>
          </div>
        </div>
      </section>

      <section
        id="training-programs"
        className="training-section training-programs-section"
      >
        <div className="container">
          <div className="training-section-heading">
            <div>
              <p className="training-eyebrow">TRAINING PROGRAMS</p>

              <h2>
                Security awareness built around real workplace risks.
              </h2>
            </div>

            <p>
              Select focused modules or combine them into an organisation-wide
              cybersecurity awareness program.
            </p>
          </div>

          <div className="training-program-grid">
            {trainingPrograms.map((program) => {
              const Icon = program.icon;

              return (
                <article
                  className="training-program-card"
                  key={program.number}
                >
                  <div className="training-program-top">
                    <span>{program.number}</span>
                    <Icon size={21} />
                  </div>

                  <h3>{program.title}</h3>

                  <p>{program.description}</p>

                  <span className="training-card-line" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="training-section training-audience-section">
        <div className="container training-audience-grid">
          <div>
            <p className="training-eyebrow">WHO IT IS FOR</p>

            <h2>
              Training that fits different roles across the organisation.
            </h2>

            <p className="training-audience-description">
              Security awareness should not be limited to one department.
              Programs can be adapted for different audiences and levels of
              responsibility.
            </p>
          </div>

          <div className="training-audience-list">
            {audiences.map((audience, index) => (
              <div className="training-audience-item" key={audience}>
                <span>0{index + 1}</span>
                <strong>{audience}</strong>
                <CheckCircle2 size={18} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="training-section training-methodology-section">
        <div className="container">
          <div className="training-section-heading">
            <div>
              <p className="training-eyebrow">OUR METHOD</p>

              <h2>
                From awareness session to lasting security behaviour.
              </h2>
            </div>
          </div>

          <div className="training-methodology-grid">
            {methodology.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>

                <h3>{step.title}</h3>

                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="training-cta-section">
        <div className="container training-cta">
          <div>
            <p className="training-eyebrow">BUILD SECURITY AWARENESS</p>

            <h2>
              Give your teams the knowledge to make safer security decisions.
            </h2>
          </div>

          <a
            href="/contact?service=Corporate%20Training"
            className="training-primary-button"
          >
            REQUEST TRAINING
            <ArrowRight size={17} />
          </a>
        </div>
      </section>
    </main>
  );
}
