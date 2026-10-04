import { useCallback, useEffect, useState } from "react";
import { ArrowRight, BookOpen, Clock3, RefreshCw, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/academy.css";

type Course = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  thumbnail_url: string | null;
  duration_hours: number | null;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  certificate_enabled: boolean;
};

const difficultyLabel: Record<
  NonNullable<Course["difficulty"]>,
  string
> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

function formatDuration(hours: number | null) {
  if (hours === null) {
    return "Self-paced";
  }

  if (hours === 1) {
    return "1 hour";
  }

  return `${hours} hours`;
}

function Academy() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: coursesError } = await supabase
      .from("courses")
      .select(
        `
          id,
          title,
          slug,
          short_description,
          description,
          thumbnail_url,
          duration_hours,
          difficulty,
          status,
          certificate_enabled
        `
      )
      .eq("status", "PUBLISHED")
      .order("created_at", { ascending: false });

    if (coursesError) {
      console.error("Academy courses query failed:", coursesError);
      setCourses([]);
      setError("Something went wrong while loading the Academy. Please try again.");
      setLoading(false);
      return;
    }

    setCourses((data ?? []) as Course[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  return (
    <main className="academy-page">
      <section className="academy-hero">
        <div className="academy-hero-content">
          <div className="academy-eyebrow">
            <span className="academy-eyebrow-line" />
            NISQ VANGUARD ACADEMY
          </div>

          <h1>Learn cybersecurity by doing.</h1>

          <p className="academy-hero-description">
            Build practical cybersecurity knowledge through structured courses,
            hands-on learning, assessments, and real-world security thinking.
          </p>

          <div className="academy-hero-actions">
            <a href="#courses" className="academy-primary-button">
              Explore courses
              <ArrowRight size={17} />
            </a>

            <Link to="/dashboard" className="academy-secondary-button">
              Student dashboard
            </Link>
          </div>
        </div>

        <div className="academy-hero-panel">
          <div className="academy-hero-panel-top">
            <span>LEARNING SYSTEM</span>
            <ShieldCheck size={20} />
          </div>

          <div className="academy-learning-path">
            <div className="academy-path-item">
              <span>01</span>
              <div>
                <strong>Learn</strong>
                <small>Security fundamentals</small>
              </div>
            </div>

            <div className="academy-path-connector" />

            <div className="academy-path-item">
              <span>02</span>
              <div>
                <strong>Practice</strong>
                <small>Labs and assessments</small>
              </div>
            </div>

            <div className="academy-path-connector" />

            <div className="academy-path-item">
              <span>03</span>
              <div>
                <strong>Demonstrate</strong>
                <small>Quizzes and projects</small>
              </div>
            </div>

            <div className="academy-path-connector" />

            <div className="academy-path-item">
              <span>04</span>
              <div>
                <strong>Certify</strong>
                <small>Verified achievement</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="academy-intro">
        <div>
          <span className="academy-section-label">THE ACADEMY</span>
          <h2>A structured path into cybersecurity.</h2>
        </div>

        <p>
          NISQ Vanguard Academy is designed around practical understanding:
          learn the concepts, understand the risks, apply the techniques, and
          demonstrate what you know.
        </p>
      </section>

      <section className="academy-course-section" id="courses">
        <div className="academy-section-heading">
          <div>
            <span className="academy-section-label">COURSE CATALOGUE</span>
            <h2>Choose your learning path.</h2>
          </div>

          {!loading && !error && (
            <span className="academy-course-count">
              {courses.length} {courses.length === 1 ? "course" : "courses"}
            </span>
          )}
        </div>

        {loading && (
          <div className="academy-state">
            <div className="academy-loader" />
            <p>Loading Academy courses...</p>
          </div>
        )}

        {!loading && error && (
          <div className="academy-state academy-error-state">
            <div className="academy-state-icon">
              <RefreshCw size={22} />
            </div>

            <h3>We couldn't load the courses.</h3>
            <p>{error}</p>

            <button
              type="button"
              className="academy-retry-button"
              onClick={() => void loadCourses()}
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        )}

        {!loading && !error && courses.length === 0 && (
          <div className="academy-state">
            <div className="academy-state-icon">
              <BookOpen size={22} />
            </div>

            <h3>No published courses yet.</h3>

            <p>
              Courses will appear here once they are published through the
              NISQ Vanguard Academy administration system.
            </p>
          </div>
        )}

        {!loading && !error && courses.length > 0 && (
          <div className="academy-course-grid">
            {courses.map((course) => (
              <article className="academy-course-card" key={course.id}>
                <div className="academy-course-media">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <div className="academy-course-placeholder">
                      <span>NV</span>
                      <small>ACADEMY</small>
                    </div>
                  )}

                  {course.difficulty && (
                    <span className="academy-difficulty">
                      {difficultyLabel[course.difficulty]}
                    </span>
                  )}
                </div>

                <div className="academy-course-body">
                  <div className="academy-course-meta">
                    <span>
                      <Clock3 size={14} />
                      {formatDuration(course.duration_hours)}
                    </span>

                    {course.certificate_enabled && (
                      <span>
                        <ShieldCheck size={14} />
                        Certificate
                      </span>
                    )}
                  </div>

                  <h3>{course.title}</h3>

                  <p>
                    {course.short_description ||
                      course.description ||
                      "Explore this cybersecurity learning programme."}
                  </p>

                  <Link
                    to={`/academy/${course.slug}`}
                    className="academy-course-link"
                  >
                    View course
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="academy-principles">
        <div className="academy-principle">
          <span>01</span>
          <h3>Practical</h3>
          <p>
            Learn security concepts through application rather than passive
            theory alone.
          </p>
        </div>

        <div className="academy-principle">
          <span>02</span>
          <h3>Structured</h3>
          <p>
            Progress through modules, lessons, assessments, and measurable
            learning milestones.
          </p>
        </div>

        <div className="academy-principle">
          <span>03</span>
          <h3>Verified</h3>
          <p>
            Build toward assessments and certificates that can be verified
            through the platform.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Academy;
