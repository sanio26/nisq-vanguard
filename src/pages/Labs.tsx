import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Clock3,
  FlaskConical,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import { supabase } from "../lib/supabase";
import "../styles/labs.css";

type LabCategory =
  | "CYBERSECURITY"
  | "PROGRAMMING"
  | "AI_SECURITY"
  | "NETWORK_SECURITY"
  | "WEB_SECURITY"
  | "DIGITAL_FORENSICS"
  | "CRYPTOGRAPHY";

type LabDifficulty =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED";

type Lab = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  category: LabCategory;
  difficulty: LabDifficulty;
  estimated_minutes: number | null;
  objectives: string[];
  thumbnail_url: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

const categoryLabels: Record<LabCategory, string> = {
  CYBERSECURITY: "Cybersecurity",
  PROGRAMMING: "Programming",
  AI_SECURITY: "AI Security",
  NETWORK_SECURITY: "Network Security",
  WEB_SECURITY: "Web Security",
  DIGITAL_FORENSICS: "Digital Forensics",
  CRYPTOGRAPHY: "Cryptography",
};

const difficultyLabels: Record<LabDifficulty, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const categoryOptions = [
  "ALL",
  "CYBERSECURITY",
  "PROGRAMMING",
  "AI_SECURITY",
  "NETWORK_SECURITY",
  "WEB_SECURITY",
  "DIGITAL_FORENSICS",
  "CRYPTOGRAPHY",
] as const;

const difficultyOptions = [
  "ALL",
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
] as const;

function formatDuration(minutes: number | null) {
  if (!minutes) {
    return "Self-paced";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (!remainingMinutes) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}

function Labs() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] =
    useState<(typeof categoryOptions)[number]>("ALL");
  const [difficulty, setDifficulty] =
    useState<(typeof difficultyOptions)[number]>("ALL");

  const loadLabs = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: labsError } = await supabase
      .from("labs")
      .select(
        `
          id,
          title,
          slug,
          short_description,
          description,
          category,
          difficulty,
          estimated_minutes,
          objectives,
          thumbnail_url,
          status
        `
      )
      .eq("status", "PUBLISHED")
      .order("created_at", { ascending: false });

    if (labsError) {
      console.error("Labs query failed:", labsError);

      setLabs([]);
      setError(
        "Something went wrong while loading the labs. Please try again."
      );
      setLoading(false);
      return;
    }

    setLabs((data ?? []) as Lab[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadLabs();
  }, [loadLabs]);

  const filteredLabs = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return labs.filter((lab) => {
      const matchesSearch =
        !normalizedSearch ||
        lab.title.toLowerCase().includes(normalizedSearch) ||
        lab.short_description
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        lab.description?.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        category === "ALL" || lab.category === category;

      const matchesDifficulty =
        difficulty === "ALL" || lab.difficulty === difficulty;

      return Boolean(
        matchesSearch &&
          matchesCategory &&
          matchesDifficulty
      );
    });
  }, [labs, searchQuery, category, difficulty]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    category !== "ALL" ||
    difficulty !== "ALL";

  function clearFilters() {
    setSearchQuery("");
    setCategory("ALL");
    setDifficulty("ALL");
  }

  return (
    <main className="labs-page">
      {/* ======================================================
          HERO
          ====================================================== */}

      <section className="labs-hero">
        <div className="labs-container">
          <div className="labs-hero-grid">
            <div className="labs-hero-copy">
              <div className="labs-eyebrow">
                <span />
                NISQ VANGUARD / CYBER LABS
              </div>

              <h1>
                Learn by
                <br />
                <span>breaking things.</span>
              </h1>

              <p>
                Practice cybersecurity through structured,
                hands-on environments designed to turn security
                concepts into practical capability.
              </p>

              <div className="labs-hero-actions">
                <a
                  href="#lab-catalogue"
                  className="labs-primary-button"
                >
                  EXPLORE LABS
                  <ArrowRight size={17} />
                </a>

                <Link
                  to="/academy"
                  className="labs-secondary-button"
                >
                  VISIT ACADEMY
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>

            <div className="labs-hero-system">
              <div className="labs-system-header">
                <div>
                  <span>NV / LAB SYSTEM</span>
                  <strong>INTERACTIVE SECURITY ENVIRONMENT</strong>
                </div>

                <ShieldCheck size={22} />
              </div>

              <div className="labs-system-visual">
                <div className="labs-system-node labs-system-node-main">
                  <FlaskConical size={24} />
                  <span>LAB ENVIRONMENT</span>
                </div>

                <div className="labs-system-line labs-line-one" />
                <div className="labs-system-line labs-line-two" />

                <div className="labs-system-node labs-system-node-small labs-node-top">
                  <Target size={18} />
                  <span>CHALLENGE</span>
                </div>

                <div className="labs-system-node labs-system-node-small labs-node-bottom">
                  <ShieldCheck size={18} />
                  <span>VALIDATION</span>
                </div>
              </div>

              <div className="labs-system-footer">
                <span>CONTROLLED</span>
                <span>MEASURABLE</span>
                <span>PRACTICAL</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          CATALOGUE
          ====================================================== */}

      <section
        className="labs-catalogue"
        id="lab-catalogue"
      >
        <div className="labs-container">
          <div className="labs-section-heading">
            <div>
              <span className="labs-section-label">
                PRACTICAL TRAINING
              </span>

              <h2>
                Interactive
                <br />
                <span>security labs.</span>
              </h2>
            </div>

            <p>
              Choose a challenge based on your current skill level
              and build practical security experience through
              measurable exercises.
            </p>
          </div>

          {/* ==================================================
              FILTER BAR
              ================================================== */}

          <div className="labs-filter-panel">
            <div className="labs-search">
              <Search size={18} />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Search labs..."
                aria-label="Search labs"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="labs-clear-search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="labs-filter-control">
              <SlidersHorizontal size={17} />

              <label htmlFor="lab-category">
                CATEGORY
              </label>

              <select
                id="lab-category"
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value as (typeof categoryOptions)[number]
                  )
                }
              >
                {categoryOptions.map((option) => (
                  <option
                    value={option}
                    key={option}
                  >
                    {option === "ALL"
                      ? "All Categories"
                      : categoryLabels[
                          option as LabCategory
                        ]}
                  </option>
                ))}
              </select>
            </div>

            <div className="labs-filter-control">
              <label htmlFor="lab-difficulty">
                LEVEL
              </label>

              <select
                id="lab-difficulty"
                value={difficulty}
                onChange={(event) =>
                  setDifficulty(
                    event.target.value as (typeof difficultyOptions)[number]
                  )
                }
              >
                {difficultyOptions.map((option) => (
                  <option
                    value={option}
                    key={option}
                  >
                    {option === "ALL"
                      ? "All Levels"
                      : difficultyLabels[
                          option as LabDifficulty
                        ]}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="labs-reset-button"
                onClick={clearFilters}
              >
                RESET
                <X size={15} />
              </button>
            )}
          </div>

          {/* ==================================================
              RESULT COUNT
              ================================================== */}

          {!loading && !error && (
            <div className="labs-result-meta">
              <span>
                {filteredLabs.length}{" "}
                {filteredLabs.length === 1
                  ? "LAB"
                  : "LABS"}{" "}
                AVAILABLE
              </span>

              {hasActiveFilters && (
                <span>
                  FILTERED FROM {labs.length}
                </span>
              )}
            </div>
          )}

          {/* ==================================================
              LOADING
              ================================================== */}

          {loading && (
            <div className="labs-state">
              <RefreshCw
                size={24}
                className="labs-loading-icon"
              />

              <strong>Loading security labs</strong>

              <p>
                Connecting to the NISQ Vanguard learning
                environment.
              </p>
            </div>
          )}

          {/* ==================================================
              ERROR
              ================================================== */}

          {!loading && error && (
            <div className="labs-state labs-state-error">
              <ShieldCheck size={25} />

              <strong>Unable to load labs</strong>

              <p>{error}</p>

              <button
                type="button"
                onClick={() => void loadLabs()}
                className="labs-retry-button"
              >
                TRY AGAIN
                <RefreshCw size={16} />
              </button>
            </div>
          )}

          {/* ==================================================
              EMPTY
              ================================================== */}

          {!loading &&
            !error &&
            filteredLabs.length === 0 && (
              <div className="labs-state">
                <Search size={25} />

                <strong>
                  {labs.length === 0
                    ? "No labs are published yet"
                    : "No labs match your filters"}
                </strong>

                <p>
                  {labs.length === 0
                    ? "New interactive labs will appear here once they are published."
                    : "Try changing your search or filter criteria."}
                </p>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="labs-retry-button"
                  >
                    CLEAR FILTERS
                    <X size={16} />
                  </button>
                )}
              </div>
            )}

          {/* ==================================================
              LAB GRID
              ================================================== */}

          {!loading &&
            !error &&
            filteredLabs.length > 0 && (
              <div className="labs-grid">
                {filteredLabs.map((lab, index) => (
                  <article
                    className="labs-card"
                    key={lab.id}
                  >
                    <div className="labs-card-top">
                      <span className="labs-card-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="labs-card-category">
                        {categoryLabels[lab.category]}
                      </span>
                    </div>

                    {lab.thumbnail_url ? (
                      <div className="labs-card-image">
                        <img
                          src={lab.thumbnail_url}
                          alt=""
                        />
                      </div>
                    ) : (
                      <div className="labs-card-visual">
                        <FlaskConical size={30} />
                        <span>
                          NV / LAB{" "}
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </span>
                      </div>
                    )}

                    <div className="labs-card-content">
                      <div className="labs-card-meta">
                        <span>
                          {difficultyLabels[lab.difficulty]}
                        </span>

                        <span className="labs-meta-divider">
                          /
                        </span>

                        <span>
                          <Clock3 size={14} />
                          {formatDuration(
                            lab.estimated_minutes
                          )}
                        </span>
                      </div>

                      <h3>{lab.title}</h3>

                      <p>
                        {lab.short_description ??
                          lab.description ??
                          "Interactive cybersecurity learning environment."}
                      </p>

                      {lab.objectives.length > 0 && (
                        <div className="labs-objectives">
                          {lab.objectives
                            .slice(0, 3)
                            .map((objective) => (
                              <span key={objective}>
                                <Target size={13} />
                                {objective}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>

                    <div className="labs-card-footer">
                      <Link
                        to={`/labs/${lab.slug}`}
                        className="labs-card-link"
                      >
                        START LAB
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
        </div>
      </section>

      {/* ======================================================
          LEARNING MODEL
          ====================================================== */}

      <section className="labs-methodology">
        <div className="labs-container">
          <div className="labs-methodology-heading">
            <span className="labs-section-label">
              HOW THE LABS WORK
            </span>

            <h2>
              From concept
              <br />
              <span>to capability.</span>
            </h2>
          </div>

          <div className="labs-methodology-grid">
            <div className="labs-method-card">
              <span>01</span>
              <ShieldCheck size={22} />
              <h3>UNDERSTAND</h3>
              <p>
                Learn the security concept and understand the
                environment before taking action.
              </p>
            </div>

            <div className="labs-method-card">
              <span>02</span>
              <Target size={22} />
              <h3>INVESTIGATE</h3>
              <p>
                Work through practical challenges using the
                information and tools provided.
              </p>
            </div>

            <div className="labs-method-card">
              <span>03</span>
              <FlaskConical size={22} />
              <h3>EXECUTE</h3>
              <p>
                Submit your solution and demonstrate that you
                can apply the underlying concept.
              </p>
            </div>

            <div className="labs-method-card">
              <span>04</span>
              <AwardIcon />
              <h3>MEASURE</h3>
              <p>
                Validation, scoring and progress tracking turn
                practice into measurable learning.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function AwardIcon() {
  return (
    <div className="labs-method-award">
      <ShieldCheck size={22} />
    </div>
  );
}

export default Labs;