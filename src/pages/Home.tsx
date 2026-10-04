import { ArrowRight, ShieldCheck, Target, Users } from "lucide-react";

const pillars = [
  {
    number: "01",
    title: "EDUCATE",
    description:
      "Build practical cybersecurity awareness across employees, students, faculty and leadership.",
    icon: Users,
  },
  {
    number: "02",
    title: "ASSESS",
    description:
      "Understand your security posture through structured assessments, analysis and prioritization.",
    icon: Target,
  },
  {
    number: "03",
    title: "DEFEND",
    description:
      "Turn security findings into practical improvements, stronger resilience and informed decisions.",
    icon: ShieldCheck,
  },
];

const methodology = [
  "DISCOVER",
  "SCOPE",
  "ASSESS",
  "IDENTIFY",
  "PRIORITIZE",
  "IMPROVE",
];

export default function Home() {
  return (
    <main className="home-page">
      {/* =====================================================
          HERO
          ===================================================== */}
      <section className="home-hero">
        <div className="home-container home-hero-grid">
          <div className="home-hero-content">
            <p className="home-eyebrow">
              NISQ VANGUARD · DEFENCE TECHNOLOGIES
            </p>

            <h1>
              Cybersecurity built around people, organizations and the threats
              of tomorrow.
            </h1>

            <p className="home-hero-description">
              NISQ Vanguard strengthens cyber resilience through cybersecurity
              consulting, awareness, education, emerging AI security and
              practical defence technology.
            </p>

            <div className="home-hero-actions">
              <a href="/contact" className="home-button home-button-primary">
                <span>BOOK A CONSULTATION</span>
                <ArrowRight size={17} />
              </a>

              <a href="/solutions" className="home-button home-button-secondary">
                <span>EXPLORE OUR SERVICES</span>
                <ArrowRight size={17} />
              </a>
            </div>

            <div className="home-hero-meta">
              <span>CYBER RESILIENCE</span>
              <span>AI SECURITY</span>
              <span>SECURITY EDUCATION</span>
            </div>
          </div>

          {/* Defence architecture visual */}
          <div className="home-hero-visual">
            <div className="home-architecture-card">
              <div className="home-architecture-grid" />

              <div className="home-architecture-top">
                <span>DEFENCE ARCHITECTURE</span>

                <span className="home-architecture-status">
                  <span className="home-status-dot" />
                  ACTIVE
                </span>
              </div>

              <div className="home-architecture-center">
                <div className="home-core-outer">
                  <div className="home-core-middle">
                    <div className="home-core-inner">
                      <ShieldCheck size={46} strokeWidth={1.35} />
                    </div>
                  </div>
                </div>

                <strong>CYBER RESILIENCE</strong>

                <span>EDUCATE · ASSESS · DEFEND</span>
              </div>

              <div className="home-architecture-node home-node-one">
                <span>01</span>
                <strong>PEOPLE</strong>
              </div>

              <div className="home-architecture-node home-node-two">
                <span>02</span>
                <strong>ORGANIZATIONS</strong>
              </div>

              <div className="home-architecture-node home-node-three">
                <span>03</span>
                <strong>THREATS</strong>
              </div>

              <div className="home-architecture-line home-line-one" />
              <div className="home-architecture-line home-line-two" />
              <div className="home-architecture-line home-line-three" />

              <div className="home-architecture-footer">
                <span>NISQ / DEFENCE SYSTEM</span>
                <span>SECURE · ANALYSE · IMPROVE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PILLARS
          ===================================================== */}
      <section className="home-section home-pillars-section">
        <div className="home-container">
          <div className="home-section-heading">
            <div>
              <p className="home-eyebrow">OUR APPROACH</p>

              <h2>Three principles. One security journey.</h2>
            </div>

            <p>
              Cybersecurity is not a single product. We combine awareness,
              assessment and practical defence to help organizations make
              better security decisions.
            </p>
          </div>

          <div className="home-pillar-grid">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;

              return (
                <article className="home-pillar-card" key={pillar.number}>
                  <div className="home-pillar-top">
                    <span>{pillar.number}</span>

                    <Icon size={24} strokeWidth={1.5} />
                  </div>

                  <div className="home-pillar-content">
                    <h3>{pillar.title}</h3>

                    <p>{pillar.description}</p>
                  </div>

                  <a href="/solutions" className="home-card-link">
                    <span>EXPLORE</span>
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
      <section className="home-section home-methodology-section">
        <div className="home-container home-methodology-layout">
          <div className="home-methodology-intro">
            <p className="home-eyebrow">DEFENCE METHODOLOGY</p>

            <h2>
              From understanding the problem to improving resilience.
            </h2>

            <p>
              Our methodology gives organizations a structured path from
              discovery through measurable security improvement.
            </p>

            <a href="/solutions/consulting" className="home-text-link">
              VIEW OUR CONSULTING APPROACH
              <ArrowRight size={16} />
            </a>
          </div>

          <div className="home-methodology-list">
            {methodology.map((step, index) => (
              <div className="home-methodology-step" key={step}>
                <span>0{index + 1}</span>

                <strong>{step}</strong>

                <ArrowRight size={17} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          DEFENCE PRINCIPLE
          ===================================================== */}
      <section className="home-defence-section">
        <div className="home-container home-defence-layout">
          <div>
            <p className="home-eyebrow">DEFENCE TECHNOLOGY</p>

            <h2>
              Security should create confidence, not complexity.
            </h2>
          </div>

          <div className="home-defence-copy">
            <p>
              We connect people, processes, technology and intelligence into
              practical security programs designed around real organizational
              needs.
            </p>

            <div className="home-defence-points">
              <span>01 — PRACTICAL</span>
              <span>02 — RESPONSIBLE</span>
              <span>03 — CONTINUOUS</span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
          ===================================================== */}
      <section className="home-cta-section">
        <div className="home-container home-cta-content">
          <div>
            <p className="home-eyebrow">START A CONVERSATION</p>

            <h2>Let's build a stronger security posture.</h2>

            <p>
              Tell us what you are trying to protect, where you need help, and
              what you want to achieve.
            </p>
          </div>

          <a href="/contact" className="home-button home-button-cta">
            <span>BOOK A CONSULTATION</span>
            <ArrowRight size={17} />
          </a>
        </div>
      </section>
    </main>
  );
}