import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FlaskConical,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Target,
  XCircle,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { supabase } from "../lib/supabase";
import { useAuth } from "../components/AuthProvider";
import "../styles/lab-details.css";

type Lab = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  category: string;
  difficulty: string;
  estimated_minutes: number | null;
  objectives: string[];
  instructions: string | null;
  status: string;
};

type Challenge = {
  id: string;
  lab_id: string;
  title: string;
  prompt: string;
  challenge_order: number;
  points: number;
  hints: string[];
  starter_code: string | null;
  submission_type: string;
};

type AttemptState = {
  attempt_id: string;
  lab_id: string;
  status: string;
  score: number;
  max_score: number;
  total_challenges: number;
};

type SubmissionResult = {
  is_correct: boolean;
  points_awarded: number;
  feedback: string;
  score: number;
  completed_challenges: number;
  total_challenges: number;
  completion_percentage: number;
  completed: boolean;
  already_completed: boolean;
};

function difficultyLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

function formatDuration(minutes: number | null) {
  if (!minutes) {
    return "Self-paced";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  return remaining
    ? `${hours} hr ${remaining} min`
    : `${hours} hr`;
}

export default function LabDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { authUser, loading: authLoading } = useAuth();

  const [lab, setLab] = useState<Lab | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [attempt, setAttempt] =
    useState<AttemptState | null>(null);

  const [currentChallengeIndex, setCurrentChallengeIndex] =
    useState(0);

  const [answer, setAnswer] = useState("");
  const [result, setResult] =
    useState<SubmissionResult | null>(null);

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadLab = useCallback(async () => {
    if (!slug) {
      setError("This lab could not be identified.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const {
      data: labData,
      error: labError,
    } = await supabase
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
          instructions,
          status
        `
      )
      .eq("slug", slug)
      .eq("status", "PUBLISHED")
      .maybeSingle();

    if (labError) {
      console.error("Lab loading error:", labError);
      setError("Unable to load this lab.");
      setLoading(false);
      return;
    }

    if (!labData) {
      setError("This lab does not exist or is not currently published.");
      setLoading(false);
      return;
    }

    const {
      data: challengeData,
      error: challengeError,
    } = await supabase
      .from("lab_challenges")
      .select(
        `
          id,
          lab_id,
          title,
          prompt,
          challenge_order,
          points,
          hints,
          starter_code,
          submission_type
        `
      )
      .eq("lab_id", labData.id)
      .order("challenge_order", {
        ascending: true,
      });

    if (challengeError) {
      console.error(
        "Challenge loading error:",
        challengeError
      );

      setError(
        "The lab loaded, but its challenges could not be retrieved."
      );
      setLoading(false);
      return;
    }

    setLab(labData as Lab);
    setChallenges((challengeData ?? []) as Challenge[]);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    void loadLab();
  }, [loadLab]);

  const startLab = useCallback(async () => {
    if (!lab) {
      return;
    }

    if (!authUser) {
      navigate("/login", {
        state: {
          from: {
            pathname: `/labs/${lab.slug}`,
          },
        },
      });

      return;
    }

    setStarting(true);
    setError("");

    const {
      data,
      error: startError,
    } = await supabase.rpc(
      "start_lab_attempt",
      {
        p_lab_id: lab.id,
      }
    );

    if (startError) {
      console.error(
        "Start lab error:",
        startError
      );

      setError(
        startError.message ||
          "Unable to start this lab."
      );
      setStarting(false);
      return;
    }

    setAttempt(data as AttemptState);
    setCurrentChallengeIndex(0);
    setResult(null);
    setAnswer("");
    setStarting(false);
  }, [authUser, lab, navigate]);

  const submitAnswer = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!attempt || !currentChallenge) {
      return;
    }

    if (!answer.trim()) {
      setError("Enter an answer before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");
    setResult(null);

    const {
      data,
      error: submitError,
    } = await supabase.rpc(
      "submit_lab_challenge",
      {
        p_attempt_id: attempt.attempt_id,
        p_challenge_id: currentChallenge.id,
        p_submitted_answer: answer,
      }
    );

    if (submitError) {
      console.error(
        "Challenge submission error:",
        submitError
      );

      setError(
        submitError.message ||
          "Unable to submit your answer."
      );
      setSubmitting(false);
      return;
    }

    const submission = data as SubmissionResult;

    setResult(submission);

    setAttempt((current) =>
      current
        ? {
            ...current,
            score: submission.score,
            status: submission.completed
              ? "COMPLETED"
              : current.status,
          }
        : current
    );

    setSubmitting(false);
  };

  const nextChallenge = () => {
    if (
      currentChallengeIndex <
      challenges.length - 1
    ) {
      setCurrentChallengeIndex(
        (current) => current + 1
      );
      setAnswer("");
      setResult(null);
      setError("");
    }
  };

  const previousChallenge = () => {
    if (currentChallengeIndex > 0) {
      setCurrentChallengeIndex(
        (current) => current - 1
      );
      setAnswer("");
      setResult(null);
      setError("");
    }
  };

  const currentChallenge =
    challenges[currentChallengeIndex];

  if (authLoading || loading) {
    return (
      <main className="lab-details-page">
        <div className="lab-details-container">
          <div className="lab-details-state">
            <RefreshCw
              size={26}
              className="lab-spin"
            />

            <strong>
              Loading secure lab environment
            </strong>

            <p>
              Preparing the NISQ Vanguard practical
              learning environment.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !lab) {
    return (
      <main className="lab-details-page">
        <div className="lab-details-container">
          <div className="lab-details-state lab-error-state">
            <XCircle size={28} />

            <strong>
              Lab unavailable
            </strong>

            <p>{error}</p>

            <Link
              to="/labs"
              className="lab-details-button"
            >
              <ArrowLeft size={16} />
              BACK TO LABS
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!lab) {
    return null;
  }

  return (
    <main className="lab-details-page">
      {/* ======================================================
          LAB HEADER
          ====================================================== */}

      <section className="lab-details-hero">
        <div className="lab-details-container">
          <Link
            to="/labs"
            className="lab-back-link"
          >
            <ArrowLeft size={16} />
            ALL LABS
          </Link>

          <div className="lab-details-hero-grid">
            <div>
              <div className="lab-details-eyebrow">
                <span />
                NISQ VANGUARD / INTERACTIVE LAB
              </div>

              <div className="lab-details-meta">
                <span>
                  {difficultyLabel(
                    lab.difficulty
                  )}
                </span>

                <span>/</span>

                <span>
                  {lab.category
                    .replaceAll("_", " ")}
                </span>

                <span>/</span>

                <span>
                  <Clock3 size={14} />
                  {formatDuration(
                    lab.estimated_minutes
                  )}
                </span>
              </div>

              <h1>{lab.title}</h1>

              <p className="lab-details-lead">
                {lab.short_description ??
                  lab.description ??
                  "Practical cybersecurity training environment."}
              </p>

              {!attempt && (
                <button
                  type="button"
                  className="lab-start-button"
                  onClick={() => void startLab()}
                  disabled={starting}
                >
                  {starting ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="lab-spin"
                      />
                      STARTING...
                    </>
                  ) : (
                    <>
                      START LAB
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="lab-details-system">
              <div className="lab-system-top">
                <span>
                  NV / LAB SYSTEM
                </span>

                <ShieldCheck size={20} />
              </div>

              <div className="lab-system-core">
                <FlaskConical size={34} />

                <strong>
                  CONTROLLED
                  <br />
                  ENVIRONMENT
                </strong>
              </div>

              <div className="lab-system-status">
                <span>
                  <i />
                  ENVIRONMENT READY
                </span>

                <span>
                  VALIDATION ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          LAB OVERVIEW
          ====================================================== */}

      <section className="lab-overview">
        <div className="lab-details-container">
          <div className="lab-overview-grid">
            <div>
              <span className="lab-section-label">
                MISSION BRIEF
              </span>

              <h2>
                Understand the
                <br />
                <span>objective.</span>
              </h2>

              <p>
                {lab.description ??
                  lab.short_description ??
                  "Complete the practical security exercises in this environment."}
              </p>

              {lab.instructions && (
                <div className="lab-instructions">
                  <h3>
                    INSTRUCTIONS
                  </h3>

                  <p>
                    {lab.instructions}
                  </p>
                </div>
              )}
            </div>

            <div className="lab-objectives-panel">
              <div className="lab-panel-heading">
                <Target size={19} />
                <span>
                  LEARNING OBJECTIVES
                </span>
              </div>

              {lab.objectives.length > 0 ? (
                <div className="lab-objective-list">
                  {lab.objectives.map(
                    (objective, index) => (
                      <div
                        className="lab-objective"
                        key={objective}
                      >
                        <span>
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <p>{objective}</p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="lab-no-objectives">
                  Objectives for this lab will be
                  provided in the challenge environment.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          CHALLENGE WORKSPACE
          ====================================================== */}

      {attempt && challenges.length > 0 && (
        <section className="lab-workspace">
          <div className="lab-details-container">
            <div className="lab-workspace-header">
              <div>
                <span className="lab-section-label">
                  ACTIVE MISSION
                </span>

                <h2>
                  Challenge
                  {" "}
                  {currentChallengeIndex + 1}
                  <span>
                    {" "}
                    / {challenges.length}
                  </span>
                </h2>
              </div>

              <div className="lab-score-panel">
                <span>
                  CURRENT SCORE
                </span>

                <strong>
                  {attempt.score}
                  <small>
                    / {attempt.max_score}
                  </small>
                </strong>
              </div>
            </div>

            <div className="lab-progress-bar">
              <span
                style={{
                  width: `${
                    ((currentChallengeIndex + 1) /
                      challenges.length) *
                    100
                  }%`,
                }}
              />
            </div>

            <div className="lab-challenge-layout">
              <article className="lab-challenge-card">
                <div className="lab-challenge-header">
                  <div>
                    <span>
                      CHALLENGE{" "}
                      {String(
                        currentChallenge.challenge_order
                      ).padStart(2, "0")}
                    </span>

                    <h3>
                      {currentChallenge.title}
                    </h3>
                  </div>

                  <strong>
                    {currentChallenge.points} PTS
                  </strong>
                </div>

                <div className="lab-challenge-prompt">
                  <p>
                    {currentChallenge.prompt}
                  </p>
                </div>

                {currentChallenge.starter_code && (
                  <pre className="lab-starter-code">
                    <code>
                      {
                        currentChallenge.starter_code
                      }
                    </code>
                  </pre>
                )}

                {currentChallenge.hints.length > 0 && (
                  <details className="lab-hints">
                    <summary>
                      NEED A HINT?
                    </summary>

                    <div>
                      {currentChallenge.hints.map(
                        (hint, index) => (
                          <p key={hint}>
                            <span>
                              {index + 1}.
                            </span>
                            {hint}
                          </p>
                        )
                      )}
                    </div>
                  </details>
                )}

                <form
                  className="lab-answer-form"
                  onSubmit={submitAnswer}
                >
                  <label htmlFor="lab-answer">
                    YOUR ANSWER
                  </label>

                  <textarea
                    id="lab-answer"
                    value={answer}
                    onChange={(event) =>
                      setAnswer(
                        event.target.value
                      )
                    }
                    placeholder="Enter your answer..."
                    rows={5}
                    disabled={submitting}
                  />

                  {error && (
                    <div className="lab-inline-error">
                      <XCircle size={16} />
                      {error}
                    </div>
                  )}

                  {result && (
                    <div
                      className={
                        result.is_correct
                          ? "lab-result lab-result-success"
                          : "lab-result lab-result-error"
                      }
                    >
                      {result.is_correct ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <XCircle size={20} />
                      )}

                      <div>
                        <strong>
                          {result.is_correct
                            ? "Challenge completed"
                            : "Not quite"}
                        </strong>

                        <p>
                          {result.feedback}
                        </p>

                        {result.points_awarded >
                          0 && (
                          <span>
                            +
                            {
                              result.points_awarded
                            }{" "}
                            points
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="lab-submit-button"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <RefreshCw
                          size={16}
                          className="lab-spin"
                        />
                        VALIDATING...
                      </>
                    ) : (
                      <>
                        SUBMIT ANSWER
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              </article>

              <aside className="lab-challenge-sidebar">
                <div className="lab-sidebar-card">
                  <div className="lab-sidebar-heading">
                    <LockKeyhole size={18} />
                    <span>
                      SECURE VALIDATION
                    </span>
                  </div>

                  <p>
                    Your answer is validated by the
                    platform backend. Scoring is not
                    controlled by the browser.
                  </p>
                </div>

                <div className="lab-sidebar-card">
                  <div className="lab-sidebar-heading">
                    <Target size={18} />
                    <span>
                      MISSION STATUS
                    </span>
                  </div>

                  <div className="lab-challenge-list">
                    {challenges.map(
                      (challenge, index) => (
                        <button
                          type="button"
                          key={challenge.id}
                          className={
                            index ===
                            currentChallengeIndex
                              ? "active"
                              : ""
                          }
                          onClick={() => {
                            setCurrentChallengeIndex(
                              index
                            );
                            setAnswer("");
                            setResult(null);
                            setError("");
                          }}
                        >
                          <span>
                            {String(
                              index + 1
                            ).padStart(2, "0")}
                          </span>

                          <strong>
                            {challenge.title}
                          </strong>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </aside>
            </div>

            <div className="lab-navigation">
              <button
                type="button"
                onClick={previousChallenge}
                disabled={
                  currentChallengeIndex === 0
                }
              >
                <ArrowLeft size={16} />
                PREVIOUS
              </button>

              {currentChallengeIndex <
              challenges.length - 1 ? (
                <button
                  type="button"
                  onClick={nextChallenge}
                >
                  NEXT CHALLENGE
                  <ArrowRight size={16} />
                </button>
              ) : (
                <span className="lab-final-message">
                  {result?.completed
                    ? "MISSION COMPLETE"
                    : "COMPLETE ALL CHALLENGES"}
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ======================================================
          EMPTY CHALLENGE STATE
          ====================================================== */}

      {attempt && challenges.length === 0 && (
        <section className="lab-workspace">
          <div className="lab-details-container">
            <div className="lab-details-state">
              <FlaskConical size={28} />

              <strong>
                Lab environment is ready
              </strong>

              <p>
                This lab does not have any challenges
                configured yet.
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}