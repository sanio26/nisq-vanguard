import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Loader2,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { supabase } from "../lib/supabase";

interface Quiz {
  id: string;
  course_id: string;
  module_id: string | null;
  title: string;
  description: string | null;
  passing_score: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: unknown;
  question_order: number;
}

interface QuizResult {
  attempt_id: string;
  score: number;
  passed: boolean;
  total_questions: number;
  correct_answers: number;
  passing_score: number;
}

function getOptions(options: unknown): string[] {
  if (Array.isArray(options)) {
    return options.filter(
      (option): option is string => typeof option === "string",
    );
  }

  if (
    options &&
    typeof options === "object" &&
    !Array.isArray(options)
  ) {
    return Object.values(options).filter(
      (option): option is string => typeof option === "string",
    );
  }

  return [];
}

function Quiz() {
  const { slug, quizId } = useParams<{
    slug: string;
    quizId: string;
  }>();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<QuizResult | null>(null);

  const totalQuestions = questions.length;

  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers],
  );

  const current = questions[currentQuestion];

  const currentOptions = current
    ? getOptions(current.options)
    : [];

  useEffect(() => {
    const loadQuiz = async () => {
      if (!quizId) {
        setError("The quiz could not be identified.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const { data: quizData, error: quizError } = await supabase
          .from("quizzes")
          .select(
            `
              id,
              course_id,
              module_id,
              title,
              description,
              passing_score
            `,
          )
          .eq("id", quizId)
          .maybeSingle();

        if (quizError) {
          console.error("Quiz metadata query failed:", quizError);

          throw new Error(
            "Something went wrong while loading this assessment.",
          );
        }

        if (!quizData) {
          throw new Error(
            "The requested assessment could not be found.",
          );
        }

        const {
          data: questionData,
          error: questionError,
        } = await supabase.rpc("get_quiz_questions", {
          p_quiz_id: quizId,
        });

        if (questionError) {
          console.error(
            "Secure quiz question query failed:",
            questionError,
          );

          throw new Error(
            questionError.message ||
              "You must be enrolled in this course to take this assessment.",
          );
        }

        const loadedQuestions = (
          (questionData ?? []) as QuizQuestion[]
        ).sort(
          (a, b) => a.question_order - b.question_order,
        );

        if (loadedQuestions.length === 0) {
          throw new Error(
            "This assessment does not have any questions yet.",
          );
        }

        setQuiz(quizData as Quiz);
        setQuestions(loadedQuestions);
        setAnswers({});
        setCurrentQuestion(0);
        setResult(null);
      } catch (loadError) {
        console.error(
          "Academy quiz loading failed:",
          loadError,
        );

        setQuiz(null);
        setQuestions([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load the assessment.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadQuiz();
  }, [quizId]);

  const selectAnswer = (answer: string) => {
    if (!current || submitting || result) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [current.id]: answer,
    }));

    setError("");
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion === 0 || submitting || result) {
      return;
    }

    setCurrentQuestion((previous) => previous - 1);
    setError("");
  };

  const goToNextQuestion = () => {
    if (
      currentQuestion >= totalQuestions - 1 ||
      submitting ||
      result
    ) {
      return;
    }

    if (!answers[current.id]) {
      setError("Please select an answer before continuing.");
      return;
    }

    setCurrentQuestion((previous) => previous + 1);
    setError("");
  };

  const submitQuiz = async () => {
    if (!quizId || submitting || result) {
      return;
    }

    if (answeredCount !== totalQuestions) {
      setError(
        `Please answer all ${totalQuestions} questions before submitting.`,
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const {
        data,
        error: submitError,
      } = await supabase.rpc("submit_quiz_attempt", {
        p_quiz_id: quizId,
        p_answers: answers,
      });

      if (submitError) {
        console.error(
          "Secure quiz submission failed:",
          submitError,
        );

        throw new Error(
          submitError.message ||
            "Your assessment could not be submitted.",
        );
      }

      const submittedResult = Array.isArray(data)
        ? data[0]
        : data;

      if (!submittedResult) {
        throw new Error(
          "The assessment was submitted, but no result was returned.",
        );
      }

      setResult(submittedResult as QuizResult);
    } catch (submitError) {
      console.error(
        "Academy quiz submission failed:",
        submitError,
      );

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit the assessment.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setResult(null);
    setError("");
  };

  if (loading) {
    return (
      <main className="academy-quiz-page">
        <section className="academy-quiz-state">
          <Loader2
            size={28}
            className="academy-quiz-spinner"
          />

          <p>Loading assessment...</p>
        </section>
      </main>
    );
  }

  if (error && !quiz) {
    return (
      <main className="academy-quiz-page">
        <section className="academy-quiz-state academy-quiz-error">
          <div className="academy-quiz-state-icon">
            <CircleAlert size={24} />
          </div>

          <span className="academy-quiz-eyebrow">
            ACADEMY ASSESSMENT
          </span>

          <h1>Assessment unavailable</h1>

          <p>{error}</p>

          <Link
            to={`/academy/${slug ?? ""}`}
            className="academy-quiz-secondary-button"
          >
            <ArrowLeft size={17} />
            Back to course
          </Link>
        </section>
      </main>
    );
  }

  if (!quiz || !current) {
    return null;
  }

  if (result) {
    const percentage = Number(result.score);
    const passed = result.passed;

    return (
      <main className="academy-quiz-page">
        <section className="academy-quiz-result-shell">
          <div
            className={`academy-quiz-result-card ${
              passed ? "is-passed" : "is-failed"
            }`}
          >
            <div className="academy-quiz-result-icon">
              {passed ? (
                <CheckCircle2 size={38} />
              ) : (
                <CircleAlert size={38} />
              )}
            </div>

            <span className="academy-quiz-eyebrow">
              ASSESSMENT COMPLETE
            </span>

            <h1>
              {passed
                ? "Assessment passed"
                : "Assessment not passed"}
            </h1>

            <p className="academy-quiz-result-message">
              {passed
                ? "Your result has been securely recorded in your Academy learning history."
                : `You need ${result.passing_score}% to pass this assessment. Review the course material and try again.`}
            </p>

            <div className="academy-quiz-score">
              <strong>{percentage}%</strong>
              <span>Your score</span>
            </div>

            <div className="academy-quiz-result-stats">
              <div>
                <strong>
                  {result.correct_answers}
                </strong>

                <span>Correct</span>
              </div>

              <div>
                <strong>
                  {result.total_questions}
                </strong>

                <span>Total</span>
              </div>

              <div>
                <strong>
                  {result.passing_score}%
                </strong>

                <span>Pass mark</span>
              </div>
            </div>

            <div className="academy-quiz-result-actions">
              <button
                type="button"
                className="academy-quiz-primary-button"
                onClick={resetQuiz}
              >
                <RotateCcw size={17} />
                Retake assessment
              </button>

              <Link
                to={`/academy/${slug ?? ""}`}
                className="academy-quiz-secondary-button"
              >
                <ArrowLeft size={17} />
                Back to course
              </Link>
            </div>
          </div>
        </section>


      <style>{`
        .academy-quiz-page {
          min-height: 100vh;
          padding: 120px 24px 80px;
          background:
            radial-gradient(
              circle at top right,
              rgba(99, 102, 241, 0.10),
              transparent 32%
            ),
            radial-gradient(
              circle at bottom left,
              rgba(14, 165, 233, 0.08),
              transparent 30%
            ),
            var(--background, #08090d);
        }

        .academy-quiz-shell,
        .academy-quiz-result-shell {
          width: min(1100px, 100%);
          margin: 0 auto;
        }

        .academy-quiz-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 42px;
        }

        .academy-quiz-back,
        .academy-quiz-security {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: inherit;
          text-decoration: none;
          font-size: 0.88rem;
        }

        .academy-quiz-back {
          opacity: 0.72;
          transition: opacity 0.2s ease;
        }

        .academy-quiz-back:hover {
          opacity: 1;
        }

        .academy-quiz-security {
          padding: 8px 12px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 999px;
          opacity: 0.75;
        }

        .academy-quiz-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 40px;
          margin-bottom: 36px;
        }

        .academy-quiz-eyebrow {
          display: inline-block;
          margin-bottom: 12px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          opacity: 0.55;
        }

        .academy-quiz-header h1 {
          margin: 0;
          font-size: clamp(2rem, 4vw, 3.5rem);
          line-height: 1.05;
          letter-spacing: -0.04em;
        }

        .academy-quiz-header p {
          max-width: 680px;
          margin: 18px 0 0;
          line-height: 1.7;
          opacity: 0.68;
        }

        .academy-quiz-summary {
          flex: 0 0 auto;
          text-align: right;
        }

        .academy-quiz-summary strong {
          font-size: 2rem;
        }

        .academy-quiz-summary span {
          opacity: 0.55;
        }

        .academy-quiz-progress {
          margin-bottom: 28px;
        }

        .academy-quiz-progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 9px;
          font-size: 0.8rem;
          opacity: 0.6;
        }

        .academy-quiz-progress-track {
          height: 6px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
        }

        .academy-quiz-progress-fill {
          height: 100%;
          border-radius: inherit;
          background: currentColor;
          transition: width 0.3s ease;
        }

        .academy-quiz-inline-error {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 20px;
          padding: 13px 15px;
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 12px;
          color: #fca5a5;
          background: rgba(239, 68, 68, 0.07);
          font-size: 0.9rem;
        }

        .academy-quiz-question-card {
          display: grid;
          grid-template-columns: 76px 1fr;
          gap: 28px;
          padding: clamp(24px, 5vw, 48px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.025);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.2);
        }

        .academy-quiz-question-number {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 5px;
          font-size: 1.1rem;
          font-weight: 700;
          opacity: 0.35;
        }

        .academy-quiz-question-label {
          display: block;
          margin-bottom: 13px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          opacity: 0.45;
        }

        .academy-quiz-question-content h2 {
          max-width: 850px;
          margin: 0 0 32px;
          font-size: clamp(1.35rem, 2.4vw, 2rem);
          line-height: 1.35;
          letter-spacing: -0.025em;
        }

        .academy-quiz-options {
          display: grid;
          gap: 12px;
        }

        .academy-quiz-option {
          display: grid;
          grid-template-columns: 42px 1fr auto;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 16px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 15px;
          color: inherit;
          background: rgba(255, 255, 255, 0.025);
          text-align: left;
          cursor: pointer;
          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            transform 0.2s ease;
        }

        .academy-quiz-option:hover:not(:disabled) {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.05);
        }

        .academy-quiz-option.is-selected {
          border-color: currentColor;
          background: rgba(255, 255, 255, 0.075);
        }

        .academy-quiz-option-marker {
          display: grid;
          width: 38px;
          height: 38px;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 700;
          opacity: 0.65;
        }

        .academy-quiz-option.is-selected
          .academy-quiz-option-marker {
          border-color: currentColor;
          opacity: 1;
        }

        .academy-quiz-option-text {
          line-height: 1.5;
        }

        .academy-quiz-option-check {
          opacity: 0.9;
        }

        .academy-quiz-navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-top: 24px;
        }

        .academy-quiz-primary-button,
        .academy-quiz-secondary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 46px;
          padding: 0 18px;
          border-radius: 12px;
          font: inherit;
          font-size: 0.9rem;
          font-weight: 650;
          text-decoration: none;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            opacity 0.2s ease,
            background 0.2s ease;
        }

        .academy-quiz-primary-button {
          border: 1px solid #20b8d8;
          color: #06131f;
          background: #20b8d8;
          box-shadow: 0 8px 24px rgba(32, 184, 216, 0.14);
        }

        .academy-quiz-primary-button:hover:not(:disabled) {
          color: #04101a;
          background: #35c5e2;
          border-color: #35c5e2;
          box-shadow: 0 10px 28px rgba(32, 184, 216, 0.20);
        }

        .academy-quiz-primary-button:hover:not(:disabled),
        .academy-quiz-secondary-button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .academy-quiz-primary-button:disabled,
        .academy-quiz-secondary-button:disabled {
          cursor: not-allowed;
          opacity: 0.35;
        }

        .academy-quiz-secondary-button {
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: inherit;
          background: rgba(255, 255, 255, 0.035);
        }

        .academy-quiz-footer-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 24px;
          font-size: 0.78rem;
          opacity: 0.45;
          text-align: center;
        }

        .academy-quiz-state {
          display: flex;
          min-height: 60vh;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          text-align: center;
        }

        .academy-quiz-state p {
          max-width: 500px;
          margin: 0;
          line-height: 1.7;
          opacity: 0.65;
        }

        .academy-quiz-state-icon {
          display: grid;
          width: 58px;
          height: 58px;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
        }

        .academy-quiz-error h1 {
          margin: 0;
        }

        .academy-quiz-result-shell {
          display: flex;
          min-height: 70vh;
          align-items: center;
          justify-content: center;
        }

        .academy-quiz-result-card {
          width: min(650px, 100%);
          padding: clamp(28px, 6vw, 56px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.025);
          text-align: center;
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.25);
        }

        .academy-quiz-result-icon {
          display: grid;
          width: 74px;
          height: 74px;
          margin: 0 auto 24px;
          place-items: center;
          border: 1px solid currentColor;
          border-radius: 22px;
        }

        .academy-quiz-result-card h1 {
          margin: 0;
          font-size: clamp(2rem, 5vw, 3.1rem);
          letter-spacing: -0.04em;
        }

        .academy-quiz-result-message {
          max-width: 520px;
          margin: 18px auto 0;
          line-height: 1.7;
          opacity: 0.65;
        }

        .academy-quiz-score {
          display: flex;
          flex-direction: column;
          margin: 34px 0;
        }

        .academy-quiz-score strong {
          font-size: clamp(4rem, 10vw, 6rem);
          line-height: 0.95;
          letter-spacing: -0.07em;
        }

        .academy-quiz-score span {
          margin-top: 10px;
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          opacity: 0.45;
        }

        .academy-quiz-result-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .academy-quiz-result-stats div {
          display: flex;
          min-height: 86px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }

        .academy-quiz-result-stats div + div {
          border-left: 1px solid rgba(255, 255, 255, 0.08);
        }

        .academy-quiz-result-stats strong {
          font-size: 1.25rem;
        }

        .academy-quiz-result-stats span {
          font-size: 0.72rem;
          opacity: 0.45;
        }

        .academy-quiz-result-actions {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 30px;
        }

        .academy-quiz-spinner {
          animation: academy-quiz-spin 0.9s linear infinite;
        }

        @keyframes academy-quiz-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 700px) {
          .academy-quiz-page {
            padding: 100px 16px 60px;
          }

          .academy-quiz-topbar,
          .academy-quiz-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .academy-quiz-summary {
            text-align: left;
          }

          .academy-quiz-question-card {
            grid-template-columns: 1fr;
            gap: 12px;
            padding: 24px 18px;
          }

          .academy-quiz-question-number {
            justify-content: flex-start;
          }

          .academy-quiz-navigation {
            flex-direction: column-reverse;
            align-items: stretch;
          }

          .academy-quiz-primary-button,
          .academy-quiz-secondary-button {
            width: 100%;
          }

          .academy-quiz-result-stats {
            grid-template-columns: 1fr;
          }

          .academy-quiz-result-stats div + div {
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            border-left: 0;
          }
        }
      `}</style>
      </main>
    );
  }

  const progressPercentage =
    ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <main className="academy-quiz-page">
      <section className="academy-quiz-shell">
        <div className="academy-quiz-topbar">
          <Link
            to={`/academy/${slug ?? ""}`}
            className="academy-quiz-back"
          >
            <ArrowLeft size={17} />
            Back to course
          </Link>

          <div className="academy-quiz-security">
            <ShieldCheck size={16} />
            Secure assessment
          </div>
        </div>

        <div className="academy-quiz-header">
          <div>
            <span className="academy-quiz-eyebrow">
              ACADEMY ASSESSMENT
            </span>

            <h1>{quiz.title}</h1>

            {quiz.description && (
              <p>{quiz.description}</p>
            )}
          </div>

          <div className="academy-quiz-summary">
            <strong>{answeredCount}</strong>

            <span>
              / {totalQuestions} answered
            </span>
          </div>
        </div>

        <div className="academy-quiz-progress">
          <div className="academy-quiz-progress-label">
            <span>
              Question {currentQuestion + 1} of{" "}
              {totalQuestions}
            </span>

            <span>
              {Math.round(progressPercentage)}%
            </span>
          </div>

          <div className="academy-quiz-progress-track">
            <div
              className="academy-quiz-progress-fill"
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>
        </div>

        {error && (
          <div className="academy-quiz-inline-error">
            <CircleAlert size={17} />
            <span>{error}</span>
          </div>
        )}

        <div className="academy-quiz-question-card">
          <div className="academy-quiz-question-number">
            {String(current.question_order).padStart(
              2,
              "0",
            )}
          </div>

          <div className="academy-quiz-question-content">
            <span className="academy-quiz-question-label">
              QUESTION {current.question_order}
            </span>

            <h2>{current.question}</h2>

            <div className="academy-quiz-options">
              {currentOptions.map((option, index) => {
                const selected =
                  answers[current.id] === option;

                return (
                  <button
                    key={`${current.id}-${index}`}
                    type="button"
                    className={`academy-quiz-option ${
                      selected ? "is-selected" : ""
                    }`}
                    onClick={() =>
                      selectAnswer(option)
                    }
                    disabled={submitting}
                  >
                    <span className="academy-quiz-option-marker">
                      {String.fromCharCode(65 + index)}
                    </span>

                    <span className="academy-quiz-option-text">
                      {option}
                    </span>

                    {selected && (
                      <CheckCircle2
                        size={20}
                        className="academy-quiz-option-check"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="academy-quiz-navigation">
          <button
            type="button"
            className="academy-quiz-secondary-button"
            onClick={goToPreviousQuestion}
            disabled={
              currentQuestion === 0 || submitting
            }
          >
            <ArrowLeft size={17} />
            Previous
          </button>

          {currentQuestion < totalQuestions - 1 ? (
            <button
              type="button"
              className="academy-quiz-primary-button"
              onClick={goToNextQuestion}
              disabled={
                !answers[current.id] || submitting
              }
            >
              Next question
              <ArrowRight size={17} />
            </button>
          ) : (
            <button
              type="button"
              className="academy-quiz-primary-button"
              onClick={() => void submitQuiz()}
              disabled={
                submitting ||
                answeredCount !== totalQuestions
              }
            >
              {submitting ? (
                <>
                  <Loader2
                    size={17}
                    className="academy-quiz-spinner"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  Submit assessment
                  <CheckCircle2 size={17} />
                </>
              )}
            </button>
          )}
        </div>

        <div className="academy-quiz-footer-note">
          <ShieldCheck size={15} />

          Your answers are evaluated securely on the
          server. Correct answers are never exposed to
          the browser.
        </div>
      </section>

      <style>{`
        .academy-quiz-page {
          min-height: 100vh;
          padding: 120px 24px 80px;
          background:
            radial-gradient(
              circle at top right,
              rgba(99, 102, 241, 0.10),
              transparent 32%
            ),
            radial-gradient(
              circle at bottom left,
              rgba(14, 165, 233, 0.08),
              transparent 30%
            ),
            var(--background, #08090d);
        }

        .academy-quiz-shell,
        .academy-quiz-result-shell {
          width: min(1100px, 100%);
          margin: 0 auto;
        }

        .academy-quiz-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 42px;
        }

        .academy-quiz-back,
        .academy-quiz-security {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: inherit;
          text-decoration: none;
          font-size: 0.88rem;
        }

        .academy-quiz-back {
          opacity: 0.72;
          transition: opacity 0.2s ease;
        }

        .academy-quiz-back:hover {
          opacity: 1;
        }

        .academy-quiz-security {
          padding: 8px 12px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 999px;
          opacity: 0.75;
        }

        .academy-quiz-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 40px;
          margin-bottom: 36px;
        }

        .academy-quiz-eyebrow {
          display: inline-block;
          margin-bottom: 12px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          opacity: 0.55;
        }

        .academy-quiz-header h1 {
          margin: 0;
          font-size: clamp(2rem, 4vw, 3.5rem);
          line-height: 1.05;
          letter-spacing: -0.04em;
        }

        .academy-quiz-header p {
          max-width: 680px;
          margin: 18px 0 0;
          line-height: 1.7;
          opacity: 0.68;
        }

        .academy-quiz-summary {
          flex: 0 0 auto;
          text-align: right;
        }

        .academy-quiz-summary strong {
          font-size: 2rem;
        }

        .academy-quiz-summary span {
          opacity: 0.55;
        }

        .academy-quiz-progress {
          margin-bottom: 28px;
        }

        .academy-quiz-progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 9px;
          font-size: 0.8rem;
          opacity: 0.6;
        }

        .academy-quiz-progress-track {
          height: 6px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
        }

        .academy-quiz-progress-fill {
          height: 100%;
          border-radius: inherit;
          background: currentColor;
          transition: width 0.3s ease;
        }

        .academy-quiz-inline-error {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 20px;
          padding: 13px 15px;
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 12px;
          color: #fca5a5;
          background: rgba(239, 68, 68, 0.07);
          font-size: 0.9rem;
        }

        .academy-quiz-question-card {
          display: grid;
          grid-template-columns: 76px 1fr;
          gap: 28px;
          padding: clamp(24px, 5vw, 48px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.025);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.2);
        }

        .academy-quiz-question-number {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 5px;
          font-size: 1.1rem;
          font-weight: 700;
          opacity: 0.35;
        }

        .academy-quiz-question-label {
          display: block;
          margin-bottom: 13px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          opacity: 0.45;
        }

        .academy-quiz-question-content h2 {
          max-width: 850px;
          margin: 0 0 32px;
          font-size: clamp(1.35rem, 2.4vw, 2rem);
          line-height: 1.35;
          letter-spacing: -0.025em;
        }

        .academy-quiz-options {
          display: grid;
          gap: 12px;
        }

        .academy-quiz-option {
          display: grid;
          grid-template-columns: 42px 1fr auto;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 16px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 15px;
          color: inherit;
          background: rgba(255, 255, 255, 0.025);
          text-align: left;
          cursor: pointer;
          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            transform 0.2s ease;
        }

        .academy-quiz-option:hover:not(:disabled) {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.05);
        }

        .academy-quiz-option.is-selected {
          border-color: currentColor;
          background: rgba(255, 255, 255, 0.075);
        }

        .academy-quiz-option-marker {
          display: grid;
          width: 38px;
          height: 38px;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 700;
          opacity: 0.65;
        }

        .academy-quiz-option.is-selected
          .academy-quiz-option-marker {
          border-color: currentColor;
          opacity: 1;
        }

        .academy-quiz-option-text {
          line-height: 1.5;
        }

        .academy-quiz-option-check {
          opacity: 0.9;
        }

        .academy-quiz-navigation {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-top: 24px;
        }

        .academy-quiz-primary-button,
        .academy-quiz-secondary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 46px;
          padding: 0 18px;
          border-radius: 12px;
          font: inherit;
          font-size: 0.9rem;
          font-weight: 650;
          text-decoration: none;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            opacity 0.2s ease,
            background 0.2s ease;
        }

        .academy-quiz-primary-button {
          border: 1px solid #20b8d8;
          color: #06131f;
          background: #20b8d8;
          box-shadow: 0 8px 24px rgba(32, 184, 216, 0.14);
        }

        .academy-quiz-primary-button:hover:not(:disabled) {
          color: #04101a;
          background: #35c5e2;
          border-color: #35c5e2;
          box-shadow: 0 10px 28px rgba(32, 184, 216, 0.20);
        }

        .academy-quiz-primary-button:hover:not(:disabled),
        .academy-quiz-secondary-button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .academy-quiz-primary-button:disabled,
        .academy-quiz-secondary-button:disabled {
          cursor: not-allowed;
          opacity: 0.35;
        }

        .academy-quiz-secondary-button {
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: inherit;
          background: rgba(255, 255, 255, 0.035);
        }

        .academy-quiz-footer-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 24px;
          font-size: 0.78rem;
          opacity: 0.45;
          text-align: center;
        }

        .academy-quiz-state {
          display: flex;
          min-height: 60vh;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          text-align: center;
        }

        .academy-quiz-state p {
          max-width: 500px;
          margin: 0;
          line-height: 1.7;
          opacity: 0.65;
        }

        .academy-quiz-state-icon {
          display: grid;
          width: 58px;
          height: 58px;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
        }

        .academy-quiz-error h1 {
          margin: 0;
        }

        .academy-quiz-result-shell {
          display: flex;
          min-height: 70vh;
          align-items: center;
          justify-content: center;
        }

        .academy-quiz-result-card {
          width: min(650px, 100%);
          padding: clamp(28px, 6vw, 56px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.025);
          text-align: center;
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.25);
        }

        .academy-quiz-result-icon {
          display: grid;
          width: 74px;
          height: 74px;
          margin: 0 auto 24px;
          place-items: center;
          border: 1px solid currentColor;
          border-radius: 22px;
        }

        .academy-quiz-result-card h1 {
          margin: 0;
          font-size: clamp(2rem, 5vw, 3.1rem);
          letter-spacing: -0.04em;
        }

        .academy-quiz-result-message {
          max-width: 520px;
          margin: 18px auto 0;
          line-height: 1.7;
          opacity: 0.65;
        }

        .academy-quiz-score {
          display: flex;
          flex-direction: column;
          margin: 34px 0;
        }

        .academy-quiz-score strong {
          font-size: clamp(4rem, 10vw, 6rem);
          line-height: 0.95;
          letter-spacing: -0.07em;
        }

        .academy-quiz-score span {
          margin-top: 10px;
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          opacity: 0.45;
        }

        .academy-quiz-result-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .academy-quiz-result-stats div {
          display: flex;
          min-height: 86px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }

        .academy-quiz-result-stats div + div {
          border-left: 1px solid rgba(255, 255, 255, 0.08);
        }

        .academy-quiz-result-stats strong {
          font-size: 1.25rem;
        }

        .academy-quiz-result-stats span {
          font-size: 0.72rem;
          opacity: 0.45;
        }

        .academy-quiz-result-actions {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 30px;
        }

        .academy-quiz-spinner {
          animation: academy-quiz-spin 0.9s linear infinite;
        }

        @keyframes academy-quiz-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 700px) {
          .academy-quiz-page {
            padding: 100px 16px 60px;
          }

          .academy-quiz-topbar,
          .academy-quiz-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .academy-quiz-summary {
            text-align: left;
          }

          .academy-quiz-question-card {
            grid-template-columns: 1fr;
            gap: 12px;
            padding: 24px 18px;
          }

          .academy-quiz-question-number {
            justify-content: flex-start;
          }

          .academy-quiz-navigation {
            flex-direction: column-reverse;
            align-items: stretch;
          }

          .academy-quiz-primary-button,
          .academy-quiz-secondary-button {
            width: 100%;
          }

          .academy-quiz-result-stats {
            grid-template-columns: 1fr;
          }

          .academy-quiz-result-stats div + div {
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            border-left: 0;
          }
        }
      `}</style>
    </main>
  );
}

export default Quiz;