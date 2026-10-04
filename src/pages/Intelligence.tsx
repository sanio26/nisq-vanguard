import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Clock3,
  Search,
  Shield,
  Sparkles,
  Tag,
  TrendingUp,
} from "lucide-react";
import "../styles/intelligence.css";

const categories = [
  "ALL",
  "CYBERSECURITY",
  "THREAT INTELLIGENCE",
  "AI SECURITY",
  "DIGITAL FRAUD",
  "PRIVACY",
  "RESEARCH",
  "STUDENT SECURITY",
  "EMERGING TECHNOLOGY",
];

const featuredArticles = [
  {
    category: "AI SECURITY",
    number: "01",
    title: "Understanding the security implications of AI-powered systems.",
    excerpt:
      "A practical look at emerging AI security challenges, attack surfaces and the defensive questions organizations should be asking.",
    date: "RESEARCH EDITION",
    readingTime: "8 MIN READ",
  },
  {
    category: "THREAT INTELLIGENCE",
    number: "02",
    title: "From security signals to meaningful threat intelligence.",
    excerpt:
      "Why collecting more security data is not enough — and how context, prioritization and analysis can improve defensive decisions.",
    date: "INTELLIGENCE BRIEF",
    readingTime: "6 MIN READ",
  },
  {
    category: "DIGITAL FRAUD",
    number: "03",
    title: "The changing landscape of digital fraud and social engineering.",
    excerpt:
      "Exploring how increasingly convincing digital deception is changing the way individuals and organizations need to think about trust.",
    date: "SECURITY ANALYSIS",
    readingTime: "7 MIN READ",
  },
];

const latestInsights = [
  {
    category: "CYBERSECURITY",
    title: "Building practical security awareness inside organizations.",
    date: "12 SEP 2026",
    readingTime: "5 MIN",
  },
  {
    category: "PRIVACY",
    title: "Why privacy should be treated as a security engineering problem.",
    date: "08 SEP 2026",
    readingTime: "6 MIN",
  },
  {
    category: "STUDENT SECURITY",
    title: "Five security habits every cybersecurity student should develop.",
    date: "03 SEP 2026",
    readingTime: "4 MIN",
  },
  {
    category: "EMERGING TECHNOLOGY",
    title: "What post-quantum cryptography means for future security.",
    date: "28 AUG 2026",
    readingTime: "9 MIN",
  },
];

const editorialSections = [
  {
    number: "01",
    title: "Threat Intelligence",
    description:
      "Signals, campaigns, attack patterns and the context required to understand emerging threats.",
    icon: TrendingUp,
  },
  {
    number: "02",
    title: "AI Security",
    description:
      "Research and analysis covering secure AI, AI-assisted attacks, defensive AI and emerging attack surfaces.",
    icon: Sparkles,
  },
  {
    number: "03",
    title: "Practical Security",
    description:
      "Security concepts translated into practical guidance for organizations, students and everyday users.",
    icon: Shield,
  },
];

export default function Intelligence() {
  return (
    <main className="intelligence-page">
      <section className="intelligence-hero">
        <div className="intelligence-container">
          <div className="intelligence-hero-grid">
            <div className="intelligence-hero-copy">
              <div className="intelligence-eyebrow">
                <span className="intelligence-eyebrow-dot" />
                NISQ / INTELLIGENCE / SECURITY PUBLICATION
              </div>

              <div className="intelligence-edition">
                <BookOpen size={14} />
                RESEARCH · ANALYSIS · INSIGHT
              </div>

              <h1>
                Security intelligence for a{" "}
                <span>changing digital world.</span>
              </h1>

              <p>
                NISQ Intelligence brings together cybersecurity research,
                threat analysis, practical security guidance and emerging
                technology perspectives.
              </p>

              <div className="intelligence-hero-actions">
                <a
                  href="#latest"
                  className="intelligence-primary-button"
                >
                  READ LATEST INSIGHTS
                  <ArrowRight size={17} />
                </a>

                <a
                  href="#categories"
                  className="intelligence-text-button"
                >
                  EXPLORE TOPICS
                  <ChevronRight size={17} />
                </a>
              </div>
            </div>

            <div className="intelligence-hero-editorial">
              <div className="intelligence-editorial-top">
                <span>NISQ INTELLIGENCE</span>
                <span>ISSUE / 001</span>
              </div>

              <div className="intelligence-editorial-main">
                <div className="intelligence-editorial-index">
                  FEATURED RESEARCH
                </div>

                <div className="intelligence-editorial-symbol">
                  <Shield size={36} />
                </div>

                <div className="intelligence-editorial-title">
                  THE SECURITY
                  <br />
                  KNOWLEDGE
                  <br />
                  LAYER
                </div>

                <p>
                  Research, intelligence and practical defensive thinking.
                </p>
              </div>

              <div className="intelligence-editorial-footer">
                <span>OBSERVE</span>
                <span>UNDERSTAND</span>
                <span>RESPOND</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="intelligence-topics">
        <div className="intelligence-container">
          <div className="intelligence-section-heading">
            <div>
              <span className="intelligence-section-label">
                01 / EXPLORE TOPICS
              </span>

              <h2>
                Follow the questions{" "}
                <span>that matter.</span>
              </h2>
            </div>

            <p>
              Explore cybersecurity through the areas shaping how people,
              organizations and technology approach digital risk.
            </p>
          </div>

          <div className="intelligence-category-list">
            {categories.map((category, index) => (
              <button
                type="button"
                className={`intelligence-category ${
                  index === 0 ? "active" : ""
                }`}
                key={category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="intelligence-featured">
        <div className="intelligence-container">
          <div className="intelligence-section-heading intelligence-featured-heading">
            <div>
              <span className="intelligence-section-label">
                02 / FEATURED
              </span>

              <h2>
                Ideas worth{" "}
                <span>investigating.</span>
              </h2>
            </div>

            <span className="intelligence-section-meta">
              EDITORIAL SELECTION
            </span>
          </div>

          <div className="intelligence-featured-grid">
            {featuredArticles.map((article) => (
              <article
                className="intelligence-featured-card"
                key={article.number}
              >
                <div className="intelligence-card-top">
                  <span>{article.number}</span>
                  <span>{article.category}</span>
                </div>

                <div className="intelligence-featured-graphic">
                  <div className="intelligence-graphic-ring intelligence-ring-one" />
                  <div className="intelligence-graphic-ring intelligence-ring-two" />
                  <div className="intelligence-graphic-core">
                    <Shield size={25} />
                  </div>
                </div>

                <div className="intelligence-card-body">
                  <div className="intelligence-card-meta">
                    <span>{article.date}</span>
                    <span>{article.readingTime}</span>
                  </div>

                  <h3>{article.title}</h3>

                  <p>{article.excerpt}</p>

                  <a
                    href="#latest"
                    className="intelligence-card-link"
                  >
                    READ ANALYSIS
                    <ArrowRight size={15} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="latest" className="intelligence-latest">
        <div className="intelligence-container">
          <div className="intelligence-section-heading">
            <div>
              <span className="intelligence-section-label">
                03 / LATEST INTELLIGENCE
              </span>

              <h2>
                Recent thinking from{" "}
                <span>NISQ.</span>
              </h2>
            </div>

            <div className="intelligence-search">
              <Search size={16} />
              <span>SEARCH INTELLIGENCE</span>
            </div>
          </div>

          <div className="intelligence-latest-list">
            {latestInsights.map((article, index) => (
              <article
                className="intelligence-latest-item"
                key={article.title}
              >
                <span className="intelligence-latest-number">
                  0{index + 1}
                </span>

                <div className="intelligence-latest-category">
                  <Tag size={14} />
                  {article.category}
                </div>

                <div className="intelligence-latest-title">
                  <h3>{article.title}</h3>

                  <a href="#latest">
                    READ
                    <ArrowRight size={14} />
                  </a>
                </div>

                <div className="intelligence-latest-meta">
                  <span>{article.date}</span>
                  <span>
                    <Clock3 size={13} />
                    {article.readingTime}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="intelligence-editorial">
        <div className="intelligence-container">
          <div className="intelligence-editorial-heading">
            <span className="intelligence-section-label">
              04 / EDITORIAL DIRECTION
            </span>

            <h2>
              Intelligence should make{" "}
              <span>security clearer.</span>
            </h2>

            <p>
              NISQ Intelligence is designed to bridge the gap between complex
              cybersecurity developments and practical understanding.
            </p>
          </div>

          <div className="intelligence-editorial-grid">
            {editorialSections.map((section) => {
              const Icon = section.icon;

              return (
                <article
                  className="intelligence-editorial-card"
                  key={section.number}
                >
                  <div className="intelligence-editorial-card-top">
                    <span>{section.number}</span>
                    <Icon size={21} />
                  </div>

                  <h3>{section.title}</h3>

                  <p>{section.description}</p>

                  <div className="intelligence-editorial-line" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="intelligence-final">
        <div className="intelligence-container">
          <div className="intelligence-final-shell">
            <div>
              <span className="intelligence-section-label">
                NISQ VANGUARD / INTELLIGENCE
              </span>

              <h2>
                Keep learning.{" "}
                <span>Keep defending.</span>
              </h2>

              <p>
                Explore NISQ Vanguard&apos;s research, academy and cybersecurity
                programs.
              </p>
            </div>

            <div className="intelligence-final-actions">
              <a
                href="/academy"
                className="intelligence-primary-button"
              >
                EXPLORE ACADEMY
                <ArrowRight size={17} />
              </a>

              <a
                href="/innovation"
                className="intelligence-text-button"
              >
                VIEW INNOVATION
                <ChevronRight size={17} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}