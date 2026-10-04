import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FileBadge2,
  ExternalLink,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { signOut } from "../lib/auth";
import { useAuth } from "../components/AuthProvider";
import { supabase } from "../lib/supabase";

import "../styles/dashboard.css";

type DashboardCertificate = {
  certificate_id: string;
  course_id: string;
  issued_at: string;
  is_valid: boolean;
  course_title: string;
};

type DashboardCourse = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  difficulty: string | null;
  duration_hours: number | null;
  completion_percentage: number;
  completed: boolean;
  next_lesson_id: string | null;
  next_lesson_title: string | null;
};

function formatCertificateDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDifficulty(value: string | null) {
  if (!value) {
    return "FOUNDATION";
  }

  return value.replace(/_/g, " ").toUpperCase();
}

export default function Dashboard() {
  const navigate = useNavigate();

  const {
    authUser,
    roles,
    loading,
  } = useAuth();

  const [certificates, setCertificates] =
    useState<DashboardCertificate[]>([]);
  const [certificatesLoading, setCertificatesLoading] =
    useState(true);
  const [certificatesError, setCertificatesError] = useState("");

  const [courses, setCourses] = useState<DashboardCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState("");

  useEffect(() => {
    if (loading || !authUser) {
      return;
    }

    /*
     * Capture the authenticated user's ID before entering
     * the asynchronous functions so TypeScript can safely
     * narrow authUser.
     */
    const userId = authUser.user.id;

    let cancelled = false;

    async function loadCertificates() {
      setCertificatesLoading(true);
      setCertificatesError("");

      const { data, error } = await supabase
        .from("certificates")
        .select(
          `
            certificate_id,
            course_id,
            issued_at,
            is_valid
          `,
        )
        .eq("student_id", userId)
        .order("issued_at", { ascending: false });

      if (error) {
        console.error(
          "Dashboard certificate query failed:",
          error,
        );

        if (!cancelled) {
          setCertificatesError(
            "Your certificates could not be loaded right now.",
          );

          setCertificates([]);

          setCertificatesLoading(false);
        }

        return;
      }

      const certificateRows = (data ?? []) as Array<{
        certificate_id: string;
        course_id: string;
        issued_at: string;
        is_valid: boolean;
      }>;

      const courseIds = Array.from(
        new Set(
          certificateRows.map(
            (certificate) => certificate.course_id,
          ),
        ),
      );

      let courseTitleMap: Record<string, string> = {};

      if (courseIds.length > 0) {
        const {
          data: courseData,
          error: courseError,
        } = await supabase
          .from("courses")
          .select("id, title")
          .in("id", courseIds);

        if (courseError) {
          console.error(
            "Dashboard certificate course lookup failed:",
            courseError,
          );
        } else {
          courseTitleMap = (
            courseData ?? []
          ).reduce<Record<string, string>>(
            (map, course) => {
              map[course.id] = course.title;

              return map;
            },
            {},
          );
        }
      }

      if (!cancelled) {
        setCertificates(
          certificateRows.map((certificate) => ({
            ...certificate,
            course_title:
              courseTitleMap[certificate.course_id] ||
              "NISQ Vanguard Academy Course",
          })),
        );

        setCertificatesLoading(false);
      }
    }

    async function loadCourses() {
      setCoursesLoading(true);
      setCoursesError("");

      const {
        data: enrollmentData,
        error: enrollmentError,
      } = await supabase
        .from("enrollments")
        .select(
          `
            course_id,
            completion_percentage,
            completed_at,
            enrolled_at
          `,
        )
        .eq("student_id", userId)
        .order("enrolled_at", { ascending: false });

      if (enrollmentError) {
        console.error(
          "Dashboard enrollment query failed:",
          enrollmentError,
        );

        if (!cancelled) {
          setCoursesError(
            "Your enrolled courses could not be loaded right now.",
          );
          setCourses([]);
          setCoursesLoading(false);
        }

        return;
      }

      const enrollments = (enrollmentData ?? []) as Array<{
        course_id: string;
        completion_percentage: number | null;
        completed_at: string | null;
        enrolled_at: string;
      }>;

      if (enrollments.length === 0) {
        if (!cancelled) {
          setCourses([]);
          setCoursesLoading(false);
        }

        return;
      }

      const courseIds = Array.from(
        new Set(
          enrollments.map(
            (enrollment) => enrollment.course_id,
          ),
        ),
      );

      const {
        data: courseData,
        error: courseError,
      } = await supabase
        .from("courses")
        .select(
          `
            id,
            title,
            slug,
            short_description,
            difficulty,
            duration_hours
          `,
        )
        .in("id", courseIds);

      if (courseError) {
        console.error(
          "Dashboard course query failed:",
          courseError,
        );

        if (!cancelled) {
          setCoursesError(
            "Your course information could not be loaded right now.",
          );
          setCourses([]);
          setCoursesLoading(false);
        }

        return;
      }

      const courseMap = new Map(
        (courseData ?? []).map((course) => [
          course.id,
          course,
        ]),
      );

      /*
       * Phase 1 learning context:
       * resolve the first unfinished lesson for each enrolled
       * course from the real module/lesson progress records.
       * No lesson completion state is changed from the dashboard.
       */
      const {
        data: moduleData,
        error: moduleError,
      } = await supabase
        .from("course_modules")
        .select("id, course_id, module_order")
        .in("course_id", courseIds)
        .order("module_order", { ascending: true });

      if (moduleError) {
        console.error(
          "Dashboard module lookup failed:",
          moduleError,
        );
      }

      const modules = (moduleData ?? []) as Array<{
        id: string;
        course_id: string;
        module_order: number;
      }>;

      const moduleIds = modules.map((module) => module.id);

      let lessons: Array<{
        id: string;
        module_id: string;
        title: string;
        lesson_order: number;
      }> = [];

      if (moduleIds.length > 0) {
        const {
          data: lessonData,
          error: lessonError,
        } = await supabase
          .from("lessons")
          .select("id, module_id, title, lesson_order")
          .in("module_id", moduleIds)
          .order("lesson_order", { ascending: true });

        if (lessonError) {
          console.error(
            "Dashboard lesson lookup failed:",
            lessonError,
          );
        } else {
          lessons = (lessonData ?? []) as typeof lessons;
        }
      }

      let progressRows: Array<{
        module_id: string;
        last_lesson_id: string | null;
        completed: boolean;
      }> = [];

      if (moduleIds.length > 0) {
        const {
          data: progressData,
          error: progressError,
        } = await supabase
          .from("module_progress")
          .select("module_id, last_lesson_id, completed")
          .eq("student_id", userId)
          .in("module_id", moduleIds);

        if (progressError) {
          console.error(
            "Dashboard module progress lookup failed:",
            progressError,
          );
        } else {
          progressRows = (progressData ?? []) as typeof progressRows;
        }
      }

      const progressMap = new Map(
        progressRows.map((progress) => [
          progress.module_id,
          progress,
        ]),
      );

      const lessonsByModule = new Map<
        string,
        Array<{
          id: string;
          module_id: string;
          title: string;
          lesson_order: number;
        }>
      >();

      lessons.forEach((lesson) => {
        const moduleLessons =
          lessonsByModule.get(lesson.module_id) ?? [];

        moduleLessons.push(lesson);
        lessonsByModule.set(lesson.module_id, moduleLessons);
      });

      const modulesByCourse = new Map<
        string,
        Array<{
          id: string;
          course_id: string;
          module_order: number;
        }>
      >();

      modules.forEach((module) => {
        const courseModules =
          modulesByCourse.get(module.course_id) ?? [];

        courseModules.push(module);
        modulesByCourse.set(module.course_id, courseModules);
      });

      const nextLessonByCourse = new Map<
        string,
        { id: string; title: string } | null
      >();

      courseIds.forEach((courseId) => {
        const courseModules =
          modulesByCourse.get(courseId) ?? [];

        let nextLesson: {
          id: string;
          title: string;
        } | null = null;

        for (const module of courseModules) {
          const moduleLessons =
            lessonsByModule.get(module.id) ?? [];
          const progress = progressMap.get(module.id);

          if (moduleLessons.length === 0) {
            continue;
          }

          if (progress?.completed) {
            continue;
          }

          if (!progress?.last_lesson_id) {
            nextLesson = {
              id: moduleLessons[0].id,
              title: moduleLessons[0].title,
            };
            break;
          }

          const lastLessonIndex = moduleLessons.findIndex(
            (lesson) =>
              lesson.id === progress.last_lesson_id,
          );

          if (lastLessonIndex === -1) {
            nextLesson = {
              id: moduleLessons[0].id,
              title: moduleLessons[0].title,
            };
            break;
          }

          const followingLesson =
            moduleLessons[lastLessonIndex + 1];

          if (followingLesson) {
            nextLesson = {
              id: followingLesson.id,
              title: followingLesson.title,
            };
            break;
          }
        }

        nextLessonByCourse.set(courseId, nextLesson);
      });

      const dashboardCourses: DashboardCourse[] =
        enrollments
          .map((enrollment) => {
            const course = courseMap.get(
              enrollment.course_id,
            );

            if (!course) {
              return null;
            }

            const completionPercentage = Math.min(
              100,
              Math.max(
                0,
                Number(
                  enrollment.completion_percentage ?? 0,
                ),
              ),
            );

            const nextLesson =
              nextLessonByCourse.get(
                course.id,
              ) ?? null;

            return {
              id: course.id,
              title: course.title,
              slug: course.slug,
              short_description:
                course.short_description,
              difficulty: course.difficulty,
              duration_hours:
                course.duration_hours,
              completion_percentage:
                completionPercentage,
              completed:
                Boolean(enrollment.completed_at) ||
                completionPercentage >= 100,
              next_lesson_id:
                nextLesson?.id ?? null,
              next_lesson_title:
                nextLesson?.title ?? null,
            };
          })
          .filter(
            (
              course,
            ): course is DashboardCourse =>
              course !== null,
          );

      if (!cancelled) {
        setCourses(dashboardCourses);
        setCoursesLoading(false);
      }
    }

    void Promise.all([
      loadCertificates(),
      loadCourses(),
    ]);

    return () => {
      cancelled = true;
    };
  }, [authUser, loading]);

  async function handleSignOut() {
    try {
      await signOut();

      navigate("/login", {
        replace: true,
      });
    } catch {
      /*
       * The auth helper already converts the Supabase error
       * into a safe user-facing message.
       */
    }
  }

  if (loading || !authUser) {
    return (
      <main className="dashboard-loading">
        <div className="dashboard-loading-content">
          <div className="dashboard-loading-mark">
            NV
          </div>

          <p>
            Loading your secure workspace...
          </p>

          <span>
            Establishing authenticated session
          </span>
        </div>
      </main>
    );
  }

  const fullName =
    authUser.profile?.full_name ||
    authUser.user.user_metadata?.full_name ||
    "NISQ Vanguard User";

  const email =
    authUser.profile?.email ||
    authUser.user.email ||
    "Email unavailable";

  const activeRole =
    roles.length > 0
      ? roles.join(" · ")
      : "STUDENT";

  const profile = authUser.profile;

  const profileFields = [
    profile?.full_name,
    profile?.email,
    profile?.phone,
    profile?.organization,
    profile?.designation,
    profile?.bio,
  ];

  const completedProfileFields =
    profileFields.filter(Boolean).length;

  const profileCompletion = Math.round(
    (completedProfileFields /
      profileFields.length) *
      100,
  );

  const enrolledCourseCount = courses.length;

  const completedCourseCount = courses.filter(
    (course) => course.completed,
  ).length;

  const activeCourseCount =
    enrolledCourseCount - completedCourseCount;

  const overallProgress =
    enrolledCourseCount === 0
      ? 0
      : Math.round(
          courses.reduce(
            (total, course) =>
              total + course.completion_percentage,
            0,
          ) / enrolledCourseCount,
        );

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">

        {/* =====================================================
            WORKSPACE HEADER
        ===================================================== */}

        <section className="dashboard-header">
          <div className="dashboard-header-copy">
            <div className="dashboard-kicker">
              <span className="dashboard-kicker-dot" />

              NISQ VANGUARD

              <span>·</span>

              SECURE WORKSPACE
            </div>

            <h1>
              Welcome,{" "}
              <span>
                {fullName.split(" ")[0]}.
              </span>
            </h1>

            <p>
              Your cybersecurity learning and platform
              workspace.
            </p>
          </div>

          <button
            type="button"
            className="dashboard-signout"
            onClick={handleSignOut}
          >
            <LogOut size={17} />

            <span>
              Sign out
            </span>
          </button>
        </section>

        {/* =====================================================
            ACCOUNT SUMMARY
        ===================================================== */}

        <section className="dashboard-account">
          <div className="dashboard-account-main">
            <div className="dashboard-account-icon">
              <UserRound size={23} />
            </div>

            <div className="dashboard-account-info">
              <span className="dashboard-account-label">
                ACCOUNT
              </span>

              <strong>
                {fullName}
              </strong>

              <span>
                {email}
              </span>
            </div>
          </div>

          <div className="dashboard-account-divider" />

          <div className="dashboard-account-role">
            <div className="dashboard-role-icon">
              <ShieldCheck size={18} />
            </div>

            <div>
              <span>
                ACCESS ROLE
              </span>

              <strong>
                {activeRole}
              </strong>
            </div>
          </div>

          <div className="dashboard-account-status">
            <span className="status-indicator" />

            <span>
              ACTIVE SESSION
            </span>
          </div>
        </section>

        {/* =====================================================
            WORKSPACE OVERVIEW
        ===================================================== */}

        <section className="dashboard-section">

          <div className="dashboard-section-heading">
            <div>
              <p className="eyebrow">
                WORKSPACE
              </p>

              <h2>
                Your learning workspace
              </h2>

              <p className="dashboard-section-description">
                Access your courses, learning progress,
                practical work and certification activity.
              </p>
            </div>

            <div className="dashboard-secure-state">
              <CheckCircle2 size={15} />

              <span>
                Account active
              </span>
            </div>
          </div>

          <div className="dashboard-grid">

            {/* =================================================
                COURSES
            ================================================= */}

            <article className="dashboard-card dashboard-card-featured">

              <div className="dashboard-card-top">
                <div className="dashboard-card-icon">
                  <BookOpen size={21} />
                </div>

                <span className="dashboard-card-index">
                  01
                </span>
              </div>

              <div className="dashboard-card-content">
                <span className="dashboard-card-label">
                  MY COURSES
                </span>

                <h3>
                  Learning
                </h3>

                {coursesLoading ? (
                  <p>
                    Loading your enrolled courses...
                  </p>
                ) : coursesError ? (
                  <p>
                    {coursesError}
                  </p>
                ) : courses.length === 0 ? (
                  <p>
                    You are not enrolled in an Academy
                    course yet.
                  </p>
                ) : (
                  <p>
                    {enrolledCourseCount}{" "}
                    {enrolledCourseCount === 1
                      ? "course"
                      : "courses"}{" "}
                    in your learning workspace.
                  </p>
                )}
              </div>

              {coursesLoading ? (
                <span className="dashboard-card-muted">
                  Loading courses...
                </span>
              ) : coursesError ? (
                <span className="dashboard-card-muted">
                  Course data unavailable
                </span>
              ) : courses.length === 0 ? (
                <button
                  type="button"
                  onClick={() =>
                    navigate("/academy")
                  }
                  className="dashboard-card-action"
                >
                  <span>
                    Explore Academy
                  </span>

                  <ArrowRight size={16} />
                </button>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                    marginTop: "18px",
                  }}
                >
                  {courses.slice(0, 3).map((course) => (
                    <div
                      key={course.id}
                      style={{
                        padding: "13px",
                        border:
                          "1px solid #1d4056",
                        background: "#091b2b",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent:
                            "space-between",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            minWidth: 0,
                          }}
                        >
                          <strong
                            style={{
                              display: "block",
                              color: "#f2f7fa",
                              fontSize: "0.74rem",
                              lineHeight: 1.4,
                            }}
                          >
                            {course.title}
                          </strong>

                          <span
                            style={{
                              display: "block",
                              marginTop: "5px",
                              color: "#617887",
                              fontSize: "0.58rem",
                              fontWeight: 750,
                              letterSpacing:
                                "0.08em",
                            }}
                          >
                            {formatDifficulty(
                              course.difficulty,
                            )}
                          </span>
                        </div>

                        <span
                          style={{
                            color:
                              course.completed
                                ? "#20b8d8"
                                : "#8297a5",
                            fontSize: "0.6rem",
                            fontWeight: 750,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {course.completed
                            ? "COMPLETED"
                            : `${course.completion_percentage}%`}
                        </span>
                      </div>

                      <div
                        style={{
                          height: "4px",
                          marginTop: "11px",
                          background:
                            "#142f40",
                          overflow: "hidden",
                        }}
                      >
                        <span
                          style={{
                            display: "block",
                            width: `${course.completion_percentage}%`,
                            height: "100%",
                            background:
                              "#20b8d8",
                          }}
                        />
                      </div>

                      <button
                        type="button"
                        className="dashboard-card-action"
                        style={{
                          marginTop: "10px",
                          width: "100%",
                          justifyContent:
                            "space-between",
                        }}
                        onClick={() =>
                          navigate(
                            `/academy/${course.slug}`,
                          )
                        }
                      >
                        <span>
                          {course.completed
                            ? "Review course"
                            : course.completion_percentage >
                                0
                              ? "Continue learning"
                              : "Start learning"}
                        </span>

                        <ArrowRight size={15} />
                      </button>
                    </div>
                  ))}

                  {courses.length > 3 && (
                    <button
                      type="button"
                      className="dashboard-card-action"
                      onClick={() =>
                        navigate("/academy")
                      }
                    >
                      <span>
                        View all courses
                      </span>

                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              )}
            </article>

            {/* =================================================
                PROGRESS
            ================================================= */}

            <article className="dashboard-card">

              <div className="dashboard-card-top">
                <div className="dashboard-card-icon">
                  <CheckCircle2 size={21} />
                </div>

                <span className="dashboard-card-index">
                  02
                </span>
              </div>

              <div className="dashboard-card-content">
                <span className="dashboard-card-label">
                  PROGRESS
                </span>

                <h3>
                  Learning progress
                </h3>

                {coursesLoading ? (
                  <p>
                    Calculating your Academy progress...
                  </p>
                ) : coursesError ? (
                  <p>
                    {coursesError}
                  </p>
                ) : courses.length === 0 ? (
                  <p>
                    Enroll in an Academy course to start
                    tracking your learning progress.
                  </p>
                ) : (
                  <p>
                    Your Academy activity is tracked from
                    your real course enrollments.
                  </p>
                )}
              </div>

              {coursesLoading ? (
                <span className="dashboard-card-muted">
                  Calculating progress...
                </span>
              ) : coursesError ? (
                <span className="dashboard-card-muted">
                  Progress unavailable
                </span>
              ) : courses.length === 0 ? (
                <button
                  type="button"
                  className="dashboard-card-action"
                  onClick={() =>
                    navigate("/academy")
                  }
                >
                  <span>
                    Find a course
                  </span>

                  <ArrowRight size={16} />
                </button>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                    marginTop: "18px",
                  }}
                >
                  <div
                    style={{
                      padding: "14px",
                      border:
                        "1px solid #1d4056",
                      background: "#091b2b",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{
                          color: "#8297a5",
                          fontSize: "0.62rem",
                          fontWeight: 750,
                          letterSpacing:
                            "0.08em",
                        }}
                      >
                        OVERALL PROGRESS
                      </span>

                      <strong
                        style={{
                          color: "#20b8d8",
                          fontSize: "0.9rem",
                        }}
                      >
                        {overallProgress}%
                      </strong>
                    </div>

                    <div
                      style={{
                        height: "5px",
                        marginTop: "11px",
                        background:
                          "#142f40",
                        overflow: "hidden",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          width: `${overallProgress}%`,
                          height: "100%",
                          background:
                            "#20b8d8",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(3, 1fr)",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        padding: "11px",
                        border:
                          "1px solid #1d4056",
                        background:
                          "#091b2b",
                      }}
                    >
                      <strong
                        style={{
                          display: "block",
                          color: "#f2f7fa",
                          fontSize: "0.9rem",
                        }}
                      >
                        {enrolledCourseCount}
                      </strong>

                      <span
                        style={{
                          display: "block",
                          marginTop: "4px",
                          color: "#617887",
                          fontSize: "0.55rem",
                          fontWeight: 750,
                          letterSpacing:
                            "0.06em",
                        }}
                      >
                        ENROLLED
                      </span>
                    </div>

                    <div
                      style={{
                        padding: "11px",
                        border:
                          "1px solid #1d4056",
                        background:
                          "#091b2b",
                      }}
                    >
                      <strong
                        style={{
                          display: "block",
                          color: "#f2f7fa",
                          fontSize: "0.9rem",
                        }}
                      >
                        {activeCourseCount}
                      </strong>

                      <span
                        style={{
                          display: "block",
                          marginTop: "4px",
                          color: "#617887",
                          fontSize: "0.55rem",
                          fontWeight: 750,
                          letterSpacing:
                            "0.06em",
                        }}
                      >
                        IN PROGRESS
                      </span>
                    </div>

                    <div
                      style={{
                        padding: "11px",
                        border:
                          "1px solid #1d4056",
                        background:
                          "#091b2b",
                      }}
                    >
                      <strong
                        style={{
                          display: "block",
                          color: "#f2f7fa",
                          fontSize: "0.9rem",
                        }}
                      >
                        {completedCourseCount}
                      </strong>

                      <span
                        style={{
                          display: "block",
                          marginTop: "4px",
                          color: "#617887",
                          fontSize: "0.55rem",
                          fontWeight: 750,
                          letterSpacing:
                            "0.06em",
                        }}
                      >
                        COMPLETED
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </article>

            {/* =================================================
                ASSIGNMENTS
            ================================================= */}

            <article className="dashboard-card">

              <div className="dashboard-card-top">
                <div className="dashboard-card-icon">
                  <ClipboardCheck size={21} />
                </div>

                <span className="dashboard-card-index">
                  03
                </span>
              </div>

              <div className="dashboard-card-content">
                <span className="dashboard-card-label">
                  ASSIGNMENTS
                </span>

                <h3>
                  Practical work
                </h3>

                <p>
                  Course assignments and practical
                  submissions will appear here as they
                  become available.
                </p>
              </div>

              <span className="dashboard-card-muted">
                No assignments yet
              </span>
            </article>

            {/* =================================================
                CERTIFICATES
            ================================================= */}

            <article className="dashboard-card dashboard-card-featured">

              <div className="dashboard-card-top">
                <div className="dashboard-card-icon">
                  <FileBadge2 size={21} />
                </div>

                <span className="dashboard-card-index">
                  04
                </span>
              </div>

              <div className="dashboard-card-content">
                <span className="dashboard-card-label">
                  CERTIFICATES
                </span>

                <h3>
                  Your achievements
                </h3>

                <p>
                  Verified certificates issued for your
                  completed Academy learning paths.
                </p>
              </div>

              {certificatesLoading ? (
                <span className="dashboard-card-muted">
                  Checking certificate records...
                </span>
              ) : certificatesError ? (
                <span className="dashboard-card-muted">
                  {certificatesError}
                </span>
              ) : certificates.length === 0 ? (
                <>
                  <span className="dashboard-card-muted">
                    No certificates issued yet
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/academy")
                    }
                    className="dashboard-card-action"
                  >
                    <span>
                      Continue learning
                    </span>

                    <ArrowRight size={16} />
                  </button>
                </>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                    marginTop: "18px",
                  }}
                >
                  {certificates
                    .slice(0, 3)
                    .map((certificate) => (
                      <div
                        key={
                          certificate.certificate_id
                        }
                        style={{
                          padding: "13px",
                          border:
                            "1px solid #1d4056",
                          background: "#091b2b",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "space-between",
                            gap: "10px",
                          }}
                        >
                          <strong
                            style={{
                              color: "#f2f7fa",
                              fontSize:
                                "0.74rem",
                              lineHeight: 1.4,
                            }}
                          >
                            {
                              certificate.course_title
                            }
                          </strong>

                          <span
                            style={{
                              color:
                                certificate.is_valid
                                  ? "#20b8d8"
                                  : "#8297a5",
                              fontSize:
                                "0.58rem",
                              fontWeight: 750,
                              letterSpacing:
                                "0.08em",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {certificate.is_valid
                              ? "VALID"
                              : "REVOKED"}
                          </span>
                        </div>

                        <span
                          style={{
                            display: "block",
                            marginTop: "6px",
                            color: "#617887",
                            fontSize:
                              "0.62rem",
                            lineHeight: 1.5,
                            wordBreak:
                              "break-word",
                          }}
                        >
                          {
                            certificate.certificate_id
                          }
                        </span>

                        <span
                          style={{
                            display: "block",
                            marginTop: "5px",
                            color: "#8297a5",
                            fontSize:
                              "0.61rem",
                          }}
                        >
                          Issued{" "}
                          {formatCertificateDate(
                            certificate.issued_at,
                          )}
                        </span>

                        {certificate.is_valid && (
                          <button
                            type="button"
                            className="dashboard-card-action"
                            style={{
                              marginTop:
                                "10px",
                              width: "100%",
                              justifyContent:
                                "space-between",
                            }}
                            onClick={() =>
                              navigate(
                                `/verify/${encodeURIComponent(
                                  certificate.certificate_id,
                                )}`,
                              )
                            }
                          >
                            <span>
                              Verify certificate
                            </span>

                            <ExternalLink
                              size={15}
                            />
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </article>

          </div>
        </section>

        {/* =====================================================
            CONTINUE LEARNING
        ===================================================== */}

        <section className="dashboard-section">

          <div className="dashboard-section-heading">
            <div>
              <p className="eyebrow">
                CONTINUE LEARNING
              </p>

              <h2>
                Pick up where you left off
              </h2>

              <p className="dashboard-section-description">
                Your next lesson is calculated from your
                enrolled course and saved module progress.
              </p>
            </div>

            <div className="dashboard-secure-state">
              <BookOpen size={15} />

              <span>
                {courses.filter(
                  (course) =>
                    !course.completed &&
                    Boolean(course.next_lesson_id),
                ).length}{" "}
                active learning path
              </span>
            </div>
          </div>

          {coursesLoading ? (
            <div
              className="dashboard-card"
              style={{
                marginTop: "18px",
              }}
            >
              <span className="dashboard-card-label">
                LEARNING QUEUE
              </span>

              <h3
                style={{
                  marginTop: "8px",
                }}
              >
                Preparing your next lesson...
              </h3>

              <p>
                We are reading your enrolled course and
                saved learning progress.
              </p>
            </div>
          ) : coursesError ? (
            <div
              className="dashboard-card"
              style={{
                marginTop: "18px",
              }}
            >
              <span className="dashboard-card-label">
                LEARNING QUEUE
              </span>

              <h3
                style={{
                  marginTop: "8px",
                }}
              >
                Continue learning unavailable
              </h3>

              <p>
                {coursesError}
              </p>
            </div>
          ) : courses.length === 0 ? (
            <div
              className="dashboard-card"
              style={{
                marginTop: "18px",
              }}
            >
              <span className="dashboard-card-label">
                LEARNING QUEUE
              </span>

              <h3
                style={{
                  marginTop: "8px",
                }}
              >
                Your learning path starts here.
              </h3>

              <p>
                Enroll in an Academy course and this space
                will keep your next lesson ready.
              </p>

              <button
                type="button"
                className="dashboard-card-action"
                onClick={() =>
                  navigate("/academy")
                }
              >
                <span>
                  Explore Academy
                </span>

                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "14px",
                marginTop: "18px",
              }}
            >
              {courses
                .filter(
                  (course) =>
                    !course.completed &&
                    Boolean(course.next_lesson_id),
                )
                .slice(0, 3)
                .map((course) => (
                  <article
                    key={course.id}
                    className="dashboard-card"
                    style={{
                      minHeight: "230px",
                    }}
                  >
                    <div
                      className="dashboard-card-top"
                    >
                      <div
                        className="dashboard-card-icon"
                      >
                        <BookOpen size={21} />
                      </div>

                      <span
                        className="dashboard-card-index"
                      >
                        NEXT
                      </span>
                    </div>

                    <div
                      className="dashboard-card-content"
                    >
                      <span
                        className="dashboard-card-label"
                      >
                        {formatDifficulty(
                          course.difficulty,
                        )}
                      </span>

                      <h3>
                        {course.title}
                      </h3>

                      <p>
                        Next lesson: {" "}
                        <strong
                          style={{
                            color: "#f2f7fa",
                          }}
                        >
                          {course.next_lesson_title}
                        </strong>
                      </p>
                    </div>

                    <div
                      style={{
                        marginTop: "16px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            "space-between",
                          gap: "10px",
                        }}
                      >
                        <span
                          style={{
                            color: "#617887",
                            fontSize: "0.62rem",
                            fontWeight: 750,
                            letterSpacing:
                              "0.07em",
                          }}
                        >
                          COURSE PROGRESS
                        </span>

                        <strong
                          style={{
                            color: "#20b8d8",
                            fontSize: "0.78rem",
                          }}
                        >
                          {course.completion_percentage}%
                        </strong>
                      </div>

                      <div
                        style={{
                          height: "4px",
                          marginTop: "8px",
                          background: "#142f40",
                          overflow: "hidden",
                        }}
                      >
                        <span
                          style={{
                            display: "block",
                            width: `${course.completion_percentage}%`,
                            height: "100%",
                            background: "#20b8d8",
                          }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="dashboard-card-action"
                      style={{
                        width: "100%",
                        justifyContent:
                          "space-between",
                        marginTop: "14px",
                      }}
                      onClick={() =>
                        navigate(
                          `/academy/${course.slug}`,
                        )
                      }
                    >
                      <span>
                        Continue learning
                      </span>

                      <ArrowRight size={16} />
                    </button>
                  </article>
                ))}

              {courses.every(
                (course) =>
                  course.completed ||
                  !course.next_lesson_id,
              ) && (
                <article
                  className="dashboard-card"
                  style={{
                    minHeight: "230px",
                  }}
                >
                  <div
                    className="dashboard-card-top"
                  >
                    <div
                      className="dashboard-card-icon"
                    >
                      <CheckCircle2 size={21} />
                    </div>

                    <span
                      className="dashboard-card-index"
                    >
                      READY
                    </span>
                  </div>

                  <div
                    className="dashboard-card-content"
                  >
                    <span
                      className="dashboard-card-label"
                    >
                      ACADEMY
                    </span>

                    <h3>
                      Learning queue clear
                    </h3>

                    <p>
                      Your enrolled courses have no unfinished
                      lesson ready for the dashboard to surface.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="dashboard-card-action"
                    onClick={() =>
                      navigate("/academy")
                    }
                  >
                    <span>
                      Explore more courses
                    </span>

                    <ArrowRight size={16} />
                  </button>
                </article>
              )}
            </div>
          )}
        </section>

        {/* =====================================================
            CERTIFICATE LIBRARY
        ===================================================== */}

        <section className="dashboard-section">

          <div className="dashboard-section-heading">
            <div>
              <p className="eyebrow">
                VERIFIED ACHIEVEMENTS
              </p>

              <h2>
                Your certificate library
              </h2>

              <p className="dashboard-section-description">
                Certificates issued through NISQ Vanguard
                Academy remain connected to your account and
                can be publicly verified.
              </p>
            </div>

            <div className="dashboard-secure-state">
              <FileBadge2 size={15} />

              <span>
                {certificates.length}{" "}
                {certificates.length === 1
                  ? "certificate"
                  : "certificates"}
              </span>
            </div>
          </div>

          {certificatesLoading ? (
            <div
              className="dashboard-card"
              style={{
                marginTop: "18px",
              }}
            >
              <span className="dashboard-card-label">
                CERTIFICATE STATUS
              </span>

              <h3
                style={{
                  marginTop: "8px",
                }}
              >
                Loading your achievements...
              </h3>

              <p>
                We are checking your secure certificate
                records.
              </p>
            </div>
          ) : certificatesError ? (
            <div
              className="dashboard-card"
              style={{
                marginTop: "18px",
              }}
            >
              <span className="dashboard-card-label">
                CERTIFICATE STATUS
              </span>

              <h3
                style={{
                  marginTop: "8px",
                }}
              >
                Certificates unavailable
              </h3>

              <p>
                {certificatesError}
              </p>
            </div>
          ) : certificates.length === 0 ? (
            <div
              className="dashboard-card"
              style={{
                marginTop: "18px",
              }}
            >
              <span className="dashboard-card-label">
                CERTIFICATE STATUS
              </span>

              <h3
                style={{
                  marginTop: "8px",
                }}
              >
                Your first certificate is waiting.
              </h3>

              <p>
                Complete an eligible Academy course and
                pass its required assessment to unlock a
                verified certificate.
              </p>

              <button
                type="button"
                className="dashboard-card-action"
                onClick={() =>
                  navigate("/academy")
                }
              >
                <span>
                  Explore Academy
                </span>

                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "14px",
                marginTop: "18px",
              }}
            >
              {certificates.map((certificate) => (
                <article
                  key={
                    certificate.certificate_id
                  }
                  className="dashboard-card"
                  style={{
                    display: "grid",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems:
                        "flex-start",
                      justifyContent:
                        "space-between",
                      gap: "18px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <span className="dashboard-card-label">
                        NISQ VANGUARD ACADEMY
                      </span>

                      <h3
                        style={{
                          marginTop: "8px",
                        }}
                      >
                        {
                          certificate.course_title
                        }
                      </h3>
                    </div>

                    <span
                      style={{
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        gap: "6px",
                        color:
                          certificate.is_valid
                            ? "#20b8d8"
                            : "#8297a5",
                        fontSize:
                          "0.63rem",
                        fontWeight: 750,
                        letterSpacing:
                          "0.08em",
                      }}
                    >
                      <CheckCircle2
                        size={14}
                      />

                      {certificate.is_valid
                        ? "VALID CERTIFICATE"
                        : "CERTIFICATE REVOKED"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(190px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        padding: "13px",
                        border:
                          "1px solid #1d4056",
                        background:
                          "#091b2b",
                      }}
                    >
                      <span className="dashboard-card-label">
                        CERTIFICATE ID
                      </span>

                      <strong
                        style={{
                          display: "block",
                          marginTop: "7px",
                          color: "#f2f7fa",
                          fontSize:
                            "0.72rem",
                          wordBreak:
                            "break-word",
                        }}
                      >
                        {
                          certificate.certificate_id
                        }
                      </strong>
                    </div>

                    <div
                      style={{
                        padding: "13px",
                        border:
                          "1px solid #1d4056",
                        background:
                          "#091b2b",
                      }}
                    >
                      <span className="dashboard-card-label">
                        ISSUED
                      </span>

                      <strong
                        style={{
                          display: "block",
                          marginTop: "7px",
                          color: "#f2f7fa",
                          fontSize:
                            "0.72rem",
                        }}
                      >
                        {formatCertificateDate(
                          certificate.issued_at,
                        )}
                      </strong>
                    </div>
                  </div>

                  {certificate.is_valid && (
                    <button
                      type="button"
                      className="dashboard-card-action"
                      onClick={() =>
                        navigate(
                          `/verify/${encodeURIComponent(
                            certificate.certificate_id,
                          )}`,
                        )
                      }
                    >
                      <span>
                        Open public verification
                      </span>

                      <ExternalLink
                        size={16}
                      />
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* =====================================================
            PROFILE & SECURITY
        ===================================================== */}

        <section className="dashboard-bottom-grid">

          {/* PROFILE */}

          <article className="dashboard-profile">

            <div className="dashboard-profile-header">
              <div className="dashboard-profile-icon">
                <UserRound size={20} />
              </div>

              <span>
                PROFILE
              </span>
            </div>

            <h2>
              Complete your professional profile
            </h2>

            <p>
              Keep your account information current so
              future courses, certificates and programs
              can use accurate details.
            </p>

            <div className="dashboard-profile-progress">

              <div className="dashboard-progress-header">
                <span>
                  PROFILE COMPLETION
                </span>

                <strong>
                  {profileCompletion}%
                </strong>
              </div>

              <div className="dashboard-progress-track">
                <span
                  style={{
                    width: `${profileCompletion}%`,
                  }}
                />
              </div>

            </div>

            <button
              type="button"
              className="primary-button"
              onClick={() =>
                alert(
                  "Profile editing will be connected to Supabase in the next dashboard phase.",
                )
              }
            >
              MANAGE PROFILE

              <ArrowRight size={16} />
            </button>

          </article>

          {/* SECURITY */}

          <article className="dashboard-security">

            <div className="dashboard-profile-header">
              <div className="dashboard-security-icon">
                <ShieldCheck size={20} />
              </div>

              <span>
                SECURITY
              </span>
            </div>

            <h2>
              Account protection
            </h2>

            <p>
              Your workspace is protected by Supabase
              authentication and role-aware access controls.
            </p>

            <div className="dashboard-security-items">

              <div>
                <CheckCircle2 size={16} />

                <span>
                  Authenticated session
                </span>
              </div>

              <div>
                <CheckCircle2 size={16} />

                <span>
                  Role-based access
                </span>
              </div>

              <div>
                <CheckCircle2 size={16} />

                <span>
                  Protected workspace
                </span>
              </div>

            </div>

          </article>

        </section>

        {/* =====================================================
            FOOTER SIGNAL
        ===================================================== */}

        <div className="dashboard-footer-signal">

          <span>
            NISQ VANGUARD
          </span>

          <span>
            EDUCATE
          </span>

          <span>
            ASSESS
          </span>

          <span>
            DEFEND
          </span>

          <span className="dashboard-footer-line" />

          <span>
            SECURE WORKSPACE
          </span>

        </div>

      </div>
    </main>
  );
}