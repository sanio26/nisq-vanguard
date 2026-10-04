import {
  ArrowRight,
  BrainCircuit,
  Building2,
  ChevronRight,
  FlaskConical,
  GraduationCap,
  LockKeyhole,
  Network,
  Radar,
  ScanSearch,
  ShieldCheck,
  Users,
} from "lucide-react";

import "../styles/about.css";

const principles = [
  {
    number: "01",
    title: "PRACTICAL",
    description:
      "Security should translate into decisions, behaviours and controls that people can actually apply.",
    icon: ShieldCheck,
  },
  {
    number: "02",
    title: "RESPONSIBLE",
    description:
      "Security research and testing must be conducted with clear authorization, disciplined scope and respect for people and systems.",
    icon: LockKeyhole,
  },
  {
    number: "03",
    title: "CONTINUOUS",
    description:
      "Threats evolve continuously. Security programs must learn, adapt and improve with them.",
    icon: Radar,
  },
];

const capabilities = [
  {
    number: "01",
    title: "Cybersecurity Consulting",
    description:
      "Security assessments, advisory, awareness and readiness programs built around organizational risk.",
    icon: Building2,
  },
  {
    number: "02",
    title: "Cybersecurity Education",
    description:
      "Practical learning experiences for students, professionals, employees and institutions.",
    icon: GraduationCap,
  },
  {
    number: "03",
    title: "AI Security",
    description:
      "Research and assessment focused on the security implications of artificial intelligence.",
    icon: BrainCircuit,
  },
  {
    number: "04",
    title: "Threat Intelligence",
    description:
      "Structured security intelligence to understand emerging threats, attack patterns and defensive priorities.",
    icon: Radar,
  },
  {
    number: "05",
    title: "Defence Technology",
    description:
      "Exploration of technologies that can strengthen digital resilience and defensive capability.",
    icon: Network,
  },
  {
    number: "06",
    title: "Research & Innovation",
    description:
      "Investigation of emerging security problems and technologies before they become tomorrow's challenges.",
    icon: FlaskConical,
  },
];

const ecosystem = [
  {
    label: "ORGANIZATIONS",
    title: "Strengthen security posture",
    description:
      "Consulting, assessments, awareness and security advisory.",
    href: "/solutions",
    icon: Building2,
  },
  {
    label: "INSTITUTIONS",
    title: "Build cyber-aware campuses",
    description:
      "Awareness programs, workshops, training and security education.",
    href: "/campus",
    icon: GraduationCap,
  },
  {
    label: "STUDENTS",
    title: "Learn by doing",
    description:
      "Cybersecurity courses, practical learning and future labs.",
    href: "/academy",
    icon: Users,
  },
  {
    label: "RESEARCH",
    title: "Explore what's next",
    description:
      "AI security, threat intelligence and emerging defence technologies.",
    href: "/innovation",
    icon: FlaskConical,
  },
];

function About() {
  return (
    <main className="about-page">
      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="about-hero">
        <div className="about-container about-hero-grid">
          <div className="about-hero-copy">
            <p className="about-eyebrow">
              NISQ VANGUARD / ABOUT
            </p>

            <h1>
              Building practical cybersecurity for a
              <span> changing digital world.</span>
            </h1>

            <p className="about-hero-description">
              NISQ Vanguard – Defence Technologies brings
              cybersecurity consulting, education, research
              and emerging defence technology together into
              one security ecosystem.
            </p>

            <div className="about-hero-actions">
              <a
                href="/solutions"
                className="about-primary-button"
              >
                EXPLORE OUR CAPABILITIES
                <ArrowRight size={17} />
              </a>

              <a
                href="/contact"
                className="about-secondary-button"
              >
                TALK TO NISQ VANGUARD
                <ChevronRight size={17} />
              </a>
            </div>
          </div>

          <div className="about-hero-visual">
            <div className="about-architecture-frame">
              <div className="about-architecture-header">
                <span>SECURITY ECOSYSTEM</span>
                <span className="about-live-indicator">
                  ACTIVE
                </span>
              </div>

              <div className="about-architecture">
                <div className="about-architecture-line about-line-one" />
                <div className="about-architecture-line about-line-two" />
                <div className="about-architecture-line about-line-three" />
                <div className="about-architecture-line about-line-four" />

                <div className="about-architecture-node about-node-core">
                  <ShieldCheck size={27} />
                  <strong>NISQ</strong>
                  <span>VANGUARD</span>
                </div>

                <div className="about-architecture-node about-node-one">
                  <Building2 size={18} />
                  <span>ORGANIZATIONS</span>
                </div>

                <div className="about-architecture-node about-node-two">
                  <GraduationCap size={18} />
                  <span>EDUCATION</span>
                </div>

                <div className="about-architecture-node about-node-three">
                  <BrainCircuit size={18} />
                  <span>AI SECURITY</span>
                </div>

                <div className="about-architecture-node about-node-four">
                  <Radar size={18} />
                  <span>INTELLIGENCE</span>
                </div>
              </div>

              <div className="about-architecture-footer">
                <span>EDUCATE</span>
                <span>ASSESS</span>
                <span>DEFEND</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          POSITIONING
          ===================================================== */}

      <section className="about-positioning-section">
        <div className="about-container">
          <div className="about-section-heading">
            <div>
              <p className="about-eyebrow">
                WHAT WE DO
              </p>

              <h2>
                Cybersecurity is more than a security tool.
              </h2>
            </div>

            <span className="about-heading-index">
              01
            </span>
          </div>

          <div className="about-positioning-grid">
            <div className="about-positioning-main">
              <p className="about-large-statement">
                We focus on the intersection of
                <strong>
                  {" "}
                  people, organizations, technology and
                  evolving threats.
                </strong>
              </p>

              <p>
                From helping an organization understand its
                security posture to helping students develop
                practical cybersecurity skills, our approach
                is designed around the real-world context in
                which security decisions are made.
              </p>

              <p>
                Our ecosystem connects consulting,
                cybersecurity awareness, learning,
                intelligence and research rather than
                treating them as isolated services.
              </p>
            </div>

            <div className="about-positioning-side">
              <div className="about-side-item">
                <span>01</span>
                <div>
                  <strong>Understand the risk</strong>
                  <p>
                    Identify the systems, people and
                    decisions that matter.
                  </p>
                </div>
              </div>

              <div className="about-side-item">
                <span>02</span>
                <div>
                  <strong>Build capability</strong>
                  <p>
                    Develop practical security knowledge
                    and defensive capability.
                  </p>
                </div>
              </div>

              <div className="about-side-item">
                <span>03</span>
                <div>
                  <strong>Adapt continuously</strong>
                  <p>
                    Improve as technology and threats
                    evolve.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          EDUCATE / ASSESS / DEFEND
          ===================================================== */}

      <section className="about-framework-section">
        <div className="about-container">
          <div className="about-section-heading">
            <div>
              <p className="about-eyebrow">
                OUR APPROACH
              </p>

              <h2>
                Educate. Assess. Defend.
              </h2>
            </div>

            <span className="about-heading-index">
              02
            </span>
          </div>

          <div className="about-framework">
            <article className="about-framework-card">
              <div className="about-framework-top">
                <span>01</span>
                <GraduationCap size={24} />
              </div>

              <p className="about-framework-label">
                EDUCATE
              </p>

              <h3>
                Build security awareness and capability.
              </h3>

              <p>
                Training, campus programs, academy learning
                and practical security education help people
                make safer decisions.
              </p>

              <a href="/academy">
                EXPLORE ACADEMY
                <ArrowRight size={15} />
              </a>
            </article>

            <article className="about-framework-card">
              <div className="about-framework-top">
                <span>02</span>
                <ScanSearch size={24} />
              </div>

              <p className="about-framework-label">
                ASSESS
              </p>

              <h3>
                Understand where security can improve.
              </h3>

              <p>
                Assessments and advisory work identify
                security gaps, prioritize risk and establish
                practical improvement paths.
              </p>

              <a href="/solutions/consulting">
                EXPLORE CONSULTING
                <ArrowRight size={15} />
              </a>
            </article>

            <article className="about-framework-card">
              <div className="about-framework-top">
                <span>03</span>
                <ShieldCheck size={24} />
              </div>

              <p className="about-framework-label">
                DEFEND
              </p>

              <h3>
                Turn security insight into resilience.
              </h3>

              <p>
                Defence means improving controls,
                strengthening behaviour and preparing for
                changing threats.
              </p>

              <a href="/innovation">
                EXPLORE INNOVATION
                <ArrowRight size={15} />
              </a>
            </article>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRINCIPLES
          ===================================================== */}

      <section className="about-principles-section">
        <div className="about-container">
          <div className="about-section-heading">
            <div>
              <p className="about-eyebrow">
                OPERATING PRINCIPLES
              </p>

              <h2>
                How we think about security.
              </h2>
            </div>

            <span className="about-heading-index">
              03
            </span>
          </div>

          <div className="about-principles-grid">
            {principles.map((principle) => {
              const Icon = principle.icon;

              return (
                <article
                  className="about-principle-card"
                  key={principle.number}
                >
                  <div className="about-principle-header">
                    <span>{principle.number}</span>
                    <Icon size={23} />
                  </div>

                  <h3>{principle.title}</h3>

                  <p>{principle.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          CAPABILITIES
          ===================================================== */}

      <section className="about-capabilities-section">
        <div className="about-container">
          <div className="about-section-heading">
            <div>
              <p className="about-eyebrow">
                CAPABILITIES
              </p>

              <h2>
                One ecosystem. Multiple security
                capabilities.
              </h2>
            </div>

            <span className="about-heading-index">
              04
            </span>
          </div>

          <div className="about-capabilities-grid">
            {capabilities.map((capability) => {
              const Icon = capability.icon;

              return (
                <article
                  className="about-capability-card"
                  key={capability.number}
                >
                  <div className="about-capability-number">
                    {capability.number}
                  </div>

                  <Icon size={24} />

                  <h3>{capability.title}</h3>

                  <p>{capability.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          CYBERSHIELDAI / RESEARCH
          ===================================================== */}

      <section className="about-research-section">
        <div className="about-container">
          <div className="about-research-panel">
            <div className="about-research-copy">
              <p className="about-eyebrow">
                RESEARCH & INNOVATION
              </p>

              <h2>
                Exploring the security problems
                <span> ahead of us.</span>
              </h2>

              <p>
                Cybersecurity changes with technology.
                Our research direction explores AI security,
                threat intelligence, secure AI, automation,
                post-quantum cryptography and emerging
                defence technologies.
              </p>

              <div className="about-research-tags">
                <span>AI SECURITY</span>
                <span>THREAT INTELLIGENCE</span>
                <span>SECURE AI</span>
                <span>DEFENCE TECHNOLOGY</span>
              </div>

              <a
                href="/innovation"
                className="about-primary-button"
              >
                EXPLORE RESEARCH
                <ArrowRight size={17} />
              </a>
            </div>

            <div className="about-research-visual">
              <div className="about-research-grid">
                <div className="about-research-node">
                  <BrainCircuit size={23} />
                  <span>AI</span>
                </div>

                <div className="about-research-node">
                  <Radar size={23} />
                  <span>INTEL</span>
                </div>

                <div className="about-research-node about-research-center">
                  <ShieldCheck size={30} />
                  <strong>CYBER</strong>
                  <span>DEFENCE</span>
                </div>

                <div className="about-research-node">
                  <Network size={23} />
                  <span>RISK</span>
                </div>

                <div className="about-research-node">
                  <FlaskConical size={23} />
                  <span>RESEARCH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ECOSYSTEM
          ===================================================== */}

      <section className="about-ecosystem-section">
        <div className="about-container">
          <div className="about-section-heading">
            <div>
              <p className="about-eyebrow">
                THE NISQ ECOSYSTEM
              </p>

              <h2>
                Different needs. One security
                ecosystem.
              </h2>
            </div>

            <span className="about-heading-index">
              05
            </span>
          </div>

          <div className="about-ecosystem-grid">
            {ecosystem.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  href={item.href}
                  className="about-ecosystem-card"
                  key={item.label}
                >
                  <div className="about-ecosystem-top">
                    <span>{item.label}</span>
                    <Icon size={20} />
                  </div>

                  <h3>{item.title}</h3>

                  <p>{item.description}</p>

                  <span className="about-ecosystem-link">
                    EXPLORE
                    <ArrowRight size={15} />
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
          ===================================================== */}

      <section className="about-final-section">
        <div className="about-container">
          <div className="about-final-card">
            <div>
              <p className="about-eyebrow">
                NISQ VANGUARD
              </p>

              <h2>
                Start with the security challenge.
                <span> Build from there.</span>
              </h2>

              <p>
                Whether you represent an organization,
                institution or the next generation of
                security professionals, there is a path
                into the NISQ Vanguard ecosystem.
              </p>
            </div>

            <div className="about-final-actions">
              <a
                href="/contact"
                className="about-primary-button"
              >
                START A CONVERSATION
                <ArrowRight size={17} />
              </a>

              <a
                href="/academy"
                className="about-secondary-button"
              >
                START LEARNING
                <ChevronRight size={17} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default About;