import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ChevronUp,
  Clock3,
  ExternalLink,
  FileText,
  RefreshCw,
  ShieldCheck,
  Video,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./../styles/course-details.css";

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

type CourseModule = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  module_order: number;
};

type Lesson = {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  content: string | null;
  video_url: string | null;
  resource_url: string | null;
  duration_minutes: number | null;
  lesson_order: number;
  is_preview: boolean;
};

type Enrollment = {
  id: string;
  completion_percentage: number;
  enrolled_at: string;
  completed_at: string | null;
};

type ModuleProgress = {
  id: string;
  student_id: string;
  module_id: string;
  completed: boolean;
  completed_at: string | null;
  last_lesson_id: string | null;
  updated_at: string;
};

type Quiz = {
  id: string;
  course_id: string;
  module_id: string | null;
  title: string;
  description: string | null;
  passing_score: number;
};

type CourseCertificate = {
  certificate_id: string;
  issued_at: string;
  certificate_url: string | null;
  is_valid: boolean;
};

type CompletionFeedback = {
  lessonId: string;
  nextLessonId: string | null;
  courseComplete: boolean;
};

const difficultyLabel: Record<
  NonNullable<Course["difficulty"]>,
  string
> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

function formatCourseDuration(hours: number | null) {
  if (hours === null) {
    return "Self-paced";
  }

  if (hours === 1) {
    return "1 hour";
  }

  return `${hours} hours`;
}

function formatLessonDuration(minutes: number | null) {
  if (minutes === null) {
    return "Self-paced";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}

function CourseDetails() {
  const { slug } = useParams<{ slug: string }>();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [enrollmentLoading, setEnrollmentLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [moduleProgress, setModuleProgress] = useState<
    Record<string, ModuleProgress>
  >({});
  const [progressLoading, setProgressLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizLoading, setQuizLoading] = useState(true);
  const [quizError, setQuizError] = useState("");
  const [assessmentPassed, setAssessmentPassed] = useState(false);
  const [assessmentScore, setAssessmentScore] = useState<number | null>(null);
  const [assessmentAttempted, setAssessmentAttempted] = useState(false);
  const [assessmentLastScore, setAssessmentLastScore] =
    useState<number | null>(null);
  const [assessmentError, setAssessmentError] = useState("");

  const [certificate, setCertificate] =
    useState<CourseCertificate | null>(null);
  const [certificateLoading, setCertificateLoading] = useState(true);
  const [issuingCertificate, setIssuingCertificate] = useState(false);
  const [certificateError, setCertificateError] = useState("");
  const [progressError, setProgressError] = useState("");
  const [savingLessonId, setSavingLessonId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [completionFeedback, setCompletionFeedback] =
    useState<CompletionFeedback | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEnrollment = useCallback(async (courseId: string) => {
    setEnrollmentLoading(true);
    setEnrollmentError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Academy authentication lookup failed:", userError);
      setIsAuthenticated(false);
      setEnrollment(null);
      setEnrollmentLoading(false);
      return;
    }

    if (!user) {
      setIsAuthenticated(false);
      setEnrollment(null);
      setEnrollmentLoading(false);
      return;
    }

    setIsAuthenticated(true);

    const { data, error: enrollmentQueryError } = await supabase
      .from("enrollments")
      .select(
        `
          id,
          completion_percentage,
          enrolled_at,
          completed_at
        `,
      )
      .eq("student_id", user.id)
      .eq("course_id", courseId)
      .limit(1)
      .maybeSingle();

    if (enrollmentQueryError) {
      console.error(
        "Academy enrollment query failed:",
        enrollmentQueryError,
      );
      setEnrollment(null);
      setEnrollmentError(
        "Your enrollment status could not be checked. Please try again.",
      );
      setEnrollmentLoading(false);
      return;
    }

    setEnrollment((data ?? null) as Enrollment | null);
    setEnrollmentLoading(false);
  }, []);

  const loadModuleProgress = useCallback(async (moduleIds: string[]) => {
    setProgressLoading(true);
    setProgressError("");

    if (moduleIds.length === 0) {
      setModuleProgress({});
      setProgressLoading(false);
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(
        "Academy progress authentication lookup failed:",
        userError,
      );
      setModuleProgress({});
      setProgressLoading(false);
      return;
    }

    if (!user) {
      setModuleProgress({});
      setProgressLoading(false);
      return;
    }

    const { data, error: progressQueryError } = await supabase
      .from("module_progress")
      .select(
        `
          id,
          student_id,
          module_id,
          completed,
          completed_at,
          last_lesson_id,
          updated_at
        `,
      )
      .eq("student_id", user.id)
      .in("module_id", moduleIds);

    if (progressQueryError) {
      console.error(
        "Academy module progress query failed:",
        progressQueryError,
      );
      setModuleProgress({});
      setProgressError(
        "Your learning progress could not be loaded. Please try again.",
      );
      setProgressLoading(false);
      return;
    }

    const progressMap = (data ?? []).reduce<
      Record<string, ModuleProgress>
    >((state, item) => {
      const progress = item as ModuleProgress;
      state[progress.module_id] = progress;
      return state;
    }, {});

    setModuleProgress(progressMap);
    setProgressLoading(false);
  }, []);

  const loadAssessmentStatus = useCallback(async (quizIds: string[]) => {
    setAssessmentError("");
    setAssessmentPassed(false);
    setAssessmentScore(null);
    setAssessmentAttempted(false);
    setAssessmentLastScore(null);

    if (quizIds.length === 0) {
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return;
    }

    const { data, error: attemptError } = await supabase
      .from("quiz_attempts")
      .select(
        `
          quiz_id,
          score,
          passed,
          attempted_at
        `,
      )
      .eq("student_id", user.id)
      .in("quiz_id", quizIds)
      .order("attempted_at", { ascending: false });

    if (attemptError) {
      console.error("Academy assessment history query failed:", attemptError);
      setAssessmentError(
        "Your assessment status could not be checked. Please try again.",
      );
      return;
    }

    const attempts = data ?? [];
    const latestAttempt = attempts[0];
    const passedAttempt = attempts.find(
      (attempt) => Boolean(attempt.passed),
    );

    setAssessmentAttempted(attempts.length > 0);

    if (latestAttempt) {
      setAssessmentLastScore(Number(latestAttempt.score));
    }

    if (passedAttempt) {
      setAssessmentPassed(true);
      setAssessmentScore(Number(passedAttempt.score));
    }

  }, []);

  const loadCertificate = useCallback(async (courseId: string) => {
    setCertificateLoading(true);
    setCertificateError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setCertificate(null);
      setCertificateLoading(false);
      return;
    }

    const { data, error: certificateQueryError } = await supabase
      .from("certificates")
      .select(
        `
          certificate_id,
          issued_at,
          certificate_url,
          is_valid
        `,
      )
      .eq("student_id", user.id)
      .eq("course_id", courseId)
      .limit(1)
      .maybeSingle();

    if (certificateQueryError) {
      console.error(
        "Academy certificate query failed:",
        certificateQueryError,
      );
      setCertificate(null);
      setCertificateLoading(false);
      return;
    }

    setCertificate((data ?? null) as CourseCertificate | null);
    setCertificateLoading(false);
  }, []);

  const handleIssueCertificate = async () => {
    if (
      !course ||
      !enrollment ||
      completionPercentage < 100 ||
      !assessmentPassed ||
      issuingCertificate ||
      certificate
    ) {
      return;
    }

    setIssuingCertificate(true);
    setCertificateError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setCertificateError("Please sign in before claiming your certificate.");
      setIssuingCertificate(false);
      return;
    }

    const { data, error: issueError } = await supabase.rpc(
      "issue_course_certificate",
      {
        p_course_id: course.id,
      },
    );

    if (issueError) {
      console.error("Academy certificate issuance failed:", issueError);
      setCertificateError(
        issueError.message ||
          "Your certificate could not be issued. Make sure you have completed the course and passed its assessment.",
      );
      setIssuingCertificate(false);
      return;
    }

    const issuedCertificate = Array.isArray(data) ? data[0] : data;

    if (!issuedCertificate?.certificate_id) {
      setCertificateError(
        "The certificate service did not return a certificate ID. Please try again.",
      );
      setIssuingCertificate(false);
      return;
    }

    setCertificate({
      certificate_id: issuedCertificate.certificate_id,
      issued_at: issuedCertificate.issued_at,
      certificate_url: issuedCertificate.certificate_url ?? null,
      is_valid: issuedCertificate.is_valid ?? true,
    });
    setCertificateError("");
    setIssuingCertificate(false);
  };

  const loadCourse = useCallback(async () => {
    if (!slug) {
      setError("This course could not be found.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setQuizLoading(true);
    setQuizError("");
    setQuizzes([]);
    setAssessmentError("");
    setAssessmentPassed(false);
    setAssessmentScore(null);
    setAssessmentAttempted(false);
    setAssessmentLastScore(null);

    const { data: courseData, error: courseError } = await supabase
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
        `,
      )
      .eq("slug", slug)
      .eq("status", "PUBLISHED")
      .maybeSingle();

    if (courseError) {
      console.error("Academy course query failed:", courseError);
      setCourse(null);
      setModules([]);
      setLessons([]);
      setEnrollment(null);
      setModuleProgress({});
      setError(
        "Something went wrong while loading this course. Please try again.",
      );
      setQuizzes([]);
      setQuizLoading(false);
      setLoading(false);
      return;
    }

    if (!courseData) {
      setCourse(null);
      setModules([]);
      setLessons([]);
      setEnrollment(null);
      setModuleProgress({});
      setError("The requested course could not be found.");
      setQuizzes([]);
      setQuizLoading(false);
      setLoading(false);
      return;
    }

    const currentCourse = courseData as Course;

    const { data: quizData, error: quizQueryError } = await supabase
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
      .eq("course_id", currentCourse.id)
      .order("created_at", { ascending: true });

    if (quizQueryError) {
      console.error("Academy assessment query failed:", quizQueryError);
      setQuizzes([]);
      setQuizError(
        "The course loaded, but its assessment could not be loaded.",
      );
    } else {
      setQuizzes((quizData ?? []) as Quiz[]);
    }

    setQuizLoading(false);

    const loadedQuizzes = (quizData ?? []) as Quiz[];
    void loadAssessmentStatus(loadedQuizzes.map((quiz) => quiz.id));
    void loadCertificate(currentCourse.id);

    const { data: moduleData, error: moduleError } = await supabase
      .from("course_modules")
      .select(
        `
          id,
          course_id,
          title,
          description,
          module_order
        `,
      )
      .eq("course_id", currentCourse.id)
      .order("module_order", { ascending: true });

    if (moduleError) {
      console.error("Academy module query failed:", moduleError);
      setCourse(currentCourse);
      setModules([]);
      setLessons([]);
      setError(
        "The course loaded, but its learning modules could not be loaded.",
      );
      setLoading(false);

      void loadEnrollment(currentCourse.id);
      setProgressLoading(false);
      return;
    }

    const loadedModules = (moduleData ?? []) as CourseModule[];
    const moduleIds = loadedModules.map(
      (module: CourseModule) => module.id,
    );

    if (moduleIds.length === 0) {
      setCourse(currentCourse);
      setModules([]);
      setLessons([]);
      setOpenModules({});
      setModuleProgress({});
      setLoading(false);

      void loadEnrollment(currentCourse.id);
      setProgressLoading(false);
      return;
    }

    const { data: lessonData, error: lessonError } = await supabase
      .from("lessons")
      .select(
        `
          id,
          module_id,
          title,
          description,
          content,
          video_url,
          resource_url,
          duration_minutes,
          lesson_order,
          is_preview
        `,
      )
      .in("module_id", moduleIds)
      .order("lesson_order", { ascending: true });

    if (lessonError) {
      console.error("Academy lesson query failed:", lessonError);
      setCourse(currentCourse);
      setModules(loadedModules);
      setLessons([]);
      setError(
        "The course modules loaded, but its lessons could not be loaded.",
      );
      setLoading(false);

      void loadEnrollment(currentCourse.id);
      void loadModuleProgress(moduleIds);
      return;
    }

    const loadedLessons = (lessonData ?? []) as Lesson[];

    setCourse(currentCourse);
    setModules(loadedModules);
    setLessons(loadedLessons);

    if (loadedModules.length > 0) {
      setOpenModules(
        loadedModules.reduce<Record<string, boolean>>(
          (state, module, index) => {
            state[module.id] = index === 0;
            return state;
          },
          {},
        ),
      );
    } else {
      setOpenModules({});
    }

    setLoading(false);

    void loadEnrollment(currentCourse.id);
    void loadModuleProgress(moduleIds);
  }, [
    slug,
    loadEnrollment,
    loadModuleProgress,
    loadAssessmentStatus,
    loadCertificate,
  ]);

  useEffect(() => {
    void loadCourse();
  }, [loadCourse]);

  const handleEnroll = async () => {
    if (!course || enrolling) {
      return;
    }

    setEnrolling(true);
    setEnrollmentError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setIsAuthenticated(false);
      setEnrollmentError("Please sign in before enrolling in this course.");
      setEnrolling(false);
      return;
    }

    setIsAuthenticated(true);

    const { data, error: insertError } = await supabase
      .from("enrollments")
      .insert({
        student_id: user.id,
        course_id: course.id,
        completion_percentage: 0,
      })
      .select(
        `
          id,
          completion_percentage,
          enrolled_at,
          completed_at
        `,
      )
      .single();

    if (insertError) {
      console.error("Academy enrollment creation failed:", insertError);

      if (insertError.code === "23505") {
        await loadEnrollment(course.id);
        setEnrollmentError("");
      } else {
        setEnrollmentError(
          "We could not enroll you in this course. Please try again.",
        );
      }

      setEnrolling(false);
      return;
    }

    setEnrollment(data as Enrollment);
    setEnrollmentError("");
    setEnrolling(false);

    void loadModuleProgress(modules.map((module) => module.id));
  };

  const toggleModule = (moduleId: string) => {
    setOpenModules((current) => ({
      ...current,
      [moduleId]: !current[moduleId],
    }));
  };

  const getModuleLessons = (moduleId: string) =>
    lessons
      .filter((lesson) => lesson.module_id === moduleId)
      .sort((a, b) => a.lesson_order - b.lesson_order);

  const getCompletedLessonCount = (
    module: CourseModule,
    progressMap: Record<string, ModuleProgress>,
  ) => {
    const moduleLessons = getModuleLessons(module.id);
    const progress = progressMap[module.id];

    if (moduleLessons.length === 0 || !progress) {
      return 0;
    }

    if (progress.completed) {
      return moduleLessons.length;
    }

    if (!progress.last_lesson_id) {
      return 0;
    }

    const lastLessonIndex = moduleLessons.findIndex(
      (lesson) => lesson.id === progress.last_lesson_id,
    );

    if (lastLessonIndex === -1) {
      return 0;
    }

    return lastLessonIndex + 1;
  };

  const calculateCourseCompletion = (
    progressMap: Record<string, ModuleProgress>,
  ) => {
    const totalLessons = lessons.length;

    if (totalLessons === 0) {
      return 0;
    }

    const completedLessons = modules.reduce((total, module) => {
      return total + getCompletedLessonCount(module, progressMap);
    }, 0);

    const percentage = (completedLessons / totalLessons) * 100;

    return Math.round(percentage * 100) / 100;
  };

  const handleMarkLessonComplete = async (
    lesson: Lesson,
    module: CourseModule,
  ) => {
    if (!course || !enrollment || savingLessonId) {
      return;
    }

    setSavingLessonId(lesson.id);
    setProgressError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setProgressError("Please sign in to save your learning progress.");
      setSavingLessonId(null);
      return;
    }

    const moduleLessons = getModuleLessons(module.id);

    if (moduleLessons.length === 0) {
      setSavingLessonId(null);
      return;
    }

    const lessonIndex = moduleLessons.findIndex(
      (item) => item.id === lesson.id,
    );

    if (lessonIndex === -1) {
      setProgressError(
        "This lesson could not be matched to its learning module.",
      );
      setSavingLessonId(null);
      return;
    }

    const existingProgress = moduleProgress[module.id];

    let existingLastIndex = -1;

    if (existingProgress?.last_lesson_id) {
      existingLastIndex = moduleLessons.findIndex(
        (item) => item.id === existingProgress.last_lesson_id,
      );
    }

    if (
      existingProgress &&
      existingLastIndex >= lessonIndex
    ) {
      setActiveLessonId(lesson.id);
      setSavingLessonId(null);
      return;
    }

    const isModuleComplete =
      lessonIndex === moduleLessons.length - 1;

    const now = new Date().toISOString();

    const progressPayload = {
      student_id: user.id,
      module_id: module.id,
      completed: isModuleComplete,
      completed_at: isModuleComplete ? now : null,
      last_lesson_id: lesson.id,
      updated_at: now,
    };

    const { data: savedProgress, error: progressSaveError } =
      await supabase
        .from("module_progress")
        .upsert(progressPayload, {
          onConflict: "student_id,module_id",
        })
        .select(
          `
            id,
            student_id,
            module_id,
            completed,
            completed_at,
            last_lesson_id,
            updated_at
          `,
        )
        .single();

    if (progressSaveError) {
      console.error(
        "Academy module progress save failed:",
        progressSaveError,
      );
      setProgressError(
        "Your lesson progress could not be saved. Please try again.",
      );
      setSavingLessonId(null);
      return;
    }

    const savedModuleProgress = savedProgress as ModuleProgress;

    const nextProgressMap = {
      ...moduleProgress,
      [module.id]: savedModuleProgress,
    };

    setModuleProgress(nextProgressMap);

    const nextCompletionPercentage =
      calculateCourseCompletion(nextProgressMap);

    const courseCompleted = nextCompletionPercentage >= 100;

    const { data: updatedEnrollment, error: enrollmentUpdateError } =
      await supabase
        .from("enrollments")
        .update({
          completion_percentage: nextCompletionPercentage,
          completed_at: courseCompleted
            ? enrollment.completed_at ?? now
            : null,
        })
        .eq("id", enrollment.id)
        .select(
          `
            id,
            completion_percentage,
            enrolled_at,
            completed_at
          `,
        )
        .single();

    if (enrollmentUpdateError) {
      console.error(
        "Academy enrollment progress update failed:",
        enrollmentUpdateError,
      );

      setProgressError(
        "The lesson was saved, but the course completion percentage could not be updated.",
      );
      setSavingLessonId(null);
      return;
    }

    const orderedLessons = getOrderedLessons();
    const currentLessonIndex = orderedLessons.findIndex(
      (item) => item.id === lesson.id,
    );
    const nextLesson =
      currentLessonIndex >= 0
        ? orderedLessons[currentLessonIndex + 1] ?? null
        : null;

    setEnrollment(updatedEnrollment as Enrollment);
    setActiveLessonId(lesson.id);
    setCompletionFeedback({
      lessonId: lesson.id,
      nextLessonId: nextLesson?.id ?? null,
      courseComplete: courseCompleted,
    });
    setSavingLessonId(null);
  };

  const isLessonCompleted = (
    lesson: Lesson,
    module: CourseModule,
  ) => {
    const progress = moduleProgress[module.id];

    if (!progress) {
      return false;
    }

    if (progress.completed) {
      return true;
    }

    if (!progress.last_lesson_id) {
      return false;
    }

    const moduleLessons = getModuleLessons(module.id);
    const lessonIndex = moduleLessons.findIndex(
      (item) => item.id === lesson.id,
    );
    const lastCompletedIndex = moduleLessons.findIndex(
      (item) => item.id === progress.last_lesson_id,
    );

    return (
      lessonIndex !== -1 &&
      lastCompletedIndex !== -1 &&
      lessonIndex <= lastCompletedIndex
    );
  };

  const isModuleCompleted = (moduleId: string) =>
    Boolean(moduleProgress[moduleId]?.completed);

  const getOrderedLessons = () => {
    const orderedModules = [...modules].sort(
      (a, b) => a.module_order - b.module_order,
    );

    return orderedModules.flatMap((module) =>
      getModuleLessons(module.id),
    );
  };

  const getNextIncompleteLesson = () => {
    if (!enrollment || lessons.length === 0) {
      return null;
    }

    return (
      getOrderedLessons().find((lesson) => {
        const lessonModule = modules.find(
          (module) => module.id === lesson.module_id,
        );

        return Boolean(
          lessonModule &&
          !isLessonCompleted(lesson, lessonModule),
        );
      }) ?? null
    );
  };

  const getLessonModule = (lesson: Lesson | null) => {
    if (!lesson) {
      return null;
    }

    return (
      modules.find((module) => module.id === lesson.module_id) ??
      null
    );
  };

  const openLesson = (lesson: Lesson) => {
    setActiveLessonId(lesson.id);
    setCompletionFeedback(null);
    setOpenModules((current) => ({
      ...current,
      [lesson.module_id]: true,
    }));
  };

  const scrollToAssessment = () => {
    document.getElementById("course-assessment")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const getAdjacentLesson = (lessonId: string, direction: -1 | 1) => {
    const orderedLessons = getOrderedLessons();
    const currentIndex = orderedLessons.findIndex(
      (lesson) => lesson.id === lessonId,
    );

    if (currentIndex === -1) {
      return null;
    }

    return orderedLessons[currentIndex + direction] ?? null;
  };

  useEffect(() => {
    if (
      loading ||
      !enrollment ||
      progressLoading ||
      lessons.length === 0 ||
      activeLessonId
    ) {
      return;
    }

    const nextLesson = getNextIncompleteLesson();

    if (nextLesson) {
      openLesson(nextLesson);
    }
  }, [
    loading,
    enrollment,
    progressLoading,
    lessons,
    moduleProgress,
  ]);

  if (loading) {
    return (
      <main className="course-details-page">
        <section className="course-details-state">
          <div className="course-details-loader" />
          <p>Loading course...</p>
        </section>
      </main>
    );
  }

  if (error && !course) {
    return (
      <main className="course-details-page">
        <section className="course-details-state course-details-error-state">
          <div className="course-details-state-icon">
            <RefreshCw size={22} />
          </div>

          <span className="course-details-eyebrow">
            NISQ VANGUARD ACADEMY
          </span>

          <h1>Course unavailable</h1>
          <p>{error}</p>

          <div className="course-details-state-actions">
            <button
              type="button"
              className="course-details-retry-button"
              onClick={() => void loadCourse()}
            >
              <RefreshCw size={16} />
              Try again
            </button>

            <Link
              to="/academy"
              className="course-details-secondary-button"
            >
              <ArrowLeft size={16} />
              Back to Academy
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!course) {
    return null;
  }

  const totalLessons = lessons.length;

  const completionPercentage = enrollment
    ? Math.max(
        0,
        Math.min(100, Number(enrollment.completion_percentage)),
      )
    : 0;

  const completedLessonCount = modules.reduce((total, module) => {
    return total + getCompletedLessonCount(module, moduleProgress);
  }, 0);

  const completedModuleCount = modules.filter((module) =>
    isModuleCompleted(module.id),
  ).length;

  return (
    <main className="course-details-page">
      <section className="course-details-hero">
        <div className="course-details-container">
          <Link to="/academy" className="course-details-back-link">
            <ArrowLeft size={16} />
            Back to Academy
          </Link>

          <div className="course-details-hero-grid">
            <div className="course-details-hero-content">
              <div className="course-details-eyebrow">
                <span className="course-details-eyebrow-line" />
                NISQ VANGUARD ACADEMY
              </div>

              <div className="course-details-badges">
                {course.difficulty && (
                  <span className="course-details-badge">
                    {difficultyLabel[course.difficulty]}
                  </span>
                )}

                {course.certificate_enabled && (
                  <span className="course-details-badge course-details-badge-accent">
                    <ShieldCheck size={14} />
                    Certificate
                  </span>
                )}
              </div>

              <h1>{course.title}</h1>

              <p className="course-details-summary">
                {course.short_description ||
                  course.description ||
                  "Explore this cybersecurity learning programme."}
              </p>

              <div className="course-details-meta">
                <span>
                  <Clock3 size={16} />
                  {formatCourseDuration(course.duration_hours)}
                </span>

                <span>
                  <BookOpen size={16} />
                  {modules.length}{" "}
                  {modules.length === 1 ? "module" : "modules"}
                </span>

                <span>
                  <FileText size={16} />
                  {totalLessons}{" "}
                  {totalLessons === 1 ? "lesson" : "lessons"}
                </span>
              </div>
            </div>

            <div className="course-details-hero-media">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt=""
                  loading="eager"
                />
              ) : (
                <div className="course-details-placeholder">
                  <span>NV</span>
                  <small>ACADEMY</small>
                </div>
              )}

              <div className="course-details-media-overlay">
                <span>LEARNING PATH</span>
                <ShieldCheck size={20} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="course-details-content">
        <div className="course-details-container">
          <div className="course-details-content-grid">
            <div className="course-details-main">
              <div className="course-details-section-heading">
                <div>
                  <span className="course-details-section-label">
                    COURSE OVERVIEW
                  </span>
                  <h2>Learn through a structured security path.</h2>
                </div>
              </div>

              {course.description && (
                <div className="course-details-description">
                  {course.description.split("\n").map(
                    (paragraph, index) => (
                      <p key={`${paragraph}-${index}`}>
                        {paragraph}
                      </p>
                    ),
                  )}
                </div>
              )}

              {!course.description && (
                <div className="course-details-description">
                  <p>
                    This course combines structured lessons with
                    practical cybersecurity learning. Work through
                    each module in order and build your understanding
                    step by step.
                  </p>
                </div>
              )}

              <div className="course-details-curriculum">
                <div className="course-details-curriculum-heading">
                  <div>
                    <span className="course-details-section-label">
                      CURRICULUM
                    </span>
                    <h2>Modules & lessons</h2>
                  </div>

                  <span className="course-details-curriculum-count">
                    {completedLessonCount}/{totalLessons} lessons
                    complete
                  </span>
                </div>

                {enrollment && !progressLoading && totalLessons > 0 && (
                  (() => {
                    const nextLesson = getNextIncompleteLesson();
                    const nextModule = getLessonModule(nextLesson);

                    return (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "18px",
                          flexWrap: "wrap",
                          marginTop: "18px",
                          padding: "18px 20px",
                          border: "1px solid #1d4056",
                          background: "linear-gradient(135deg, #0a2031 0%, #091b2b 100%)",
                        }}
                      >
                        <div style={{ minWidth: 0, flex: "1 1 280px" }}>
                          <span className="course-details-section-label">
                            {nextLesson ? "CONTINUE LEARNING" : "COURSE COMPLETE"}
                          </span>

                          <strong
                            style={{
                              display: "block",
                              marginTop: "7px",
                              color: "#f2f7fa",
                              fontSize: "0.95rem",
                              lineHeight: 1.4,
                            }}
                          >
                            {nextLesson
                              ? nextLesson.title
                              : "All lessons completed"}
                          </strong>

                          <span
                            style={{
                              display: "block",
                              marginTop: "5px",
                              color: "#8297a5",
                              fontSize: "0.7rem",
                              lineHeight: 1.5,
                            }}
                          >
                            {nextLesson && nextModule
                              ? `${nextModule.title} · ${formatLessonDuration(nextLesson.duration_minutes)}`
                              : "Your learning path is ready for the assessment."}
                          </span>
                        </div>

                        {nextLesson ? (
                          <button
                            type="button"
                            className="course-details-retry-button"
                            onClick={() => openLesson(nextLesson)}
                            style={{ marginTop: 0, whiteSpace: "nowrap" }}
                          >
                            Continue lesson
                            <ArrowRight size={16} />
                          </button>
                        ) : (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "7px",
                              color: "#20b8d8",
                              fontSize: "0.7rem",
                              fontWeight: 750,
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                            }}
                          >
                            <CheckCircle2 size={16} />
                            Ready for assessment
                          </span>
                        )}
                      </div>
                    );
                  })()
                )}

                {error && (
                  <div className="course-details-inline-error">
                    <RefreshCw size={16} />
                    <span>{error}</span>
                  </div>
                )}

                {progressError && (
                  <div className="course-details-inline-error">
                    <RefreshCw size={16} />
                    <span>{progressError}</span>
                  </div>
                )}

                {progressLoading && enrollment && (
                  <div className="course-details-inline-error">
                    <RefreshCw size={16} />
                    <span>Loading your learning progress...</span>
                  </div>
                )}

                {modules.length === 0 && !error && (
                  <div className="course-details-empty">
                    <BookOpen size={22} />
                    <h3>Curriculum coming soon</h3>
                    <p>
                      This course is published, but its learning
                      modules have not been added yet.
                    </p>
                  </div>
                )}

                {modules.length > 0 && (
                  <div className="course-details-modules">
                    {modules.map((module, moduleIndex) => {
                      const moduleLessons = getModuleLessons(module.id);
                      const isOpen = Boolean(
                        openModules[module.id],
                      );
                      const moduleCompleted = isModuleCompleted(
                        module.id,
                      );
                      const moduleCompletedCount =
                        getCompletedLessonCount(
                          module,
                          moduleProgress,
                        );

                      return (
                        <article
                          className={`course-details-module ${
                            isOpen ? "is-open" : ""
                          }`}
                          key={module.id}
                        >
                          <button
                            type="button"
                            className="course-details-module-toggle"
                            onClick={() =>
                              toggleModule(module.id)
                            }
                            aria-expanded={isOpen}
                          >
                            <div className="course-details-module-number">
                              {String(moduleIndex + 1).padStart(
                                2,
                                "0",
                              )}
                            </div>

                            <div className="course-details-module-heading">
                              <span>
                                {moduleCompletedCount}/
                                {moduleLessons.length}{" "}
                                {moduleLessons.length === 1
                                  ? "lesson"
                                  : "lessons"}
                              </span>

                              <h3>
                                {module.title}
                              </h3>

                              {module.description && (
                                <p>
                                  {module.description}
                                </p>
                              )}

                              {moduleCompleted && (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    marginTop: "9px",
                                    color: "#20b8d8",
                                    fontSize: "0.64rem",
                                    fontWeight: 750,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                  }}
                                >
                                  <CheckCircle2 size={13} />
                                  Module complete
                                </span>
                              )}
                            </div>

                            <div className="course-details-module-icon">
                              {isOpen ? (
                                <ChevronUp size={20} />
                              ) : (
                                <ChevronDown size={20} />
                              )}
                            </div>
                          </button>

                          {isOpen && (
                            <div className="course-details-lesson-list">
                              {moduleLessons.length === 0 && (
                                <div className="course-details-no-lessons">
                                  Lessons for this module are
                                  coming soon.
                                </div>
                              )}

                              {moduleLessons.map(
                                (lesson, lessonIndex) => {
                                  const completed =
                                    isLessonCompleted(
                                      lesson,
                                      module,
                                    );
                                  const isActive =
                                    activeLessonId ===
                                    lesson.id;
                                  const isSaving =
                                    savingLessonId ===
                                    lesson.id;

                                  return (
                                    <div
                                      className="course-details-lesson"
                                      key={lesson.id}
                                    >
                                      <div className="course-details-lesson-number">
                                        {String(
                                          lessonIndex + 1,
                                        ).padStart(2, "0")}
                                      </div>

                                      <div
                                        className="course-details-lesson-icon"
                                        style={{
                                          borderColor: completed
                                            ? "#1f6174"
                                            : undefined,
                                        }}
                                      >
                                        {lesson.video_url ? (
                                          <Video size={17} />
                                        ) : (
                                          <FileText size={17} />
                                        )}
                                      </div>

                                      <div className="course-details-lesson-content">
                                        <div className="course-details-lesson-title-row">
                                          <h4>
                                            {lesson.title}
                                          </h4>

                                          {lesson.is_preview && (
                                            <span className="course-details-preview-badge">
                                              Preview
                                            </span>
                                          )}

                                          {completed && (
                                            <span
                                              className="course-details-preview-badge"
                                              style={{
                                                borderColor:
                                                  "#1f6174",
                                                color:
                                                  "#20b8d8",
                                              }}
                                            >
                                              Complete
                                            </span>
                                          )}

                                          {enrollment &&
                                            !completed &&
                                            getNextIncompleteLesson()?.id ===
                                              lesson.id && (
                                              <span
                                                className="course-details-preview-badge"
                                                style={{
                                                  borderColor: "#2a7081",
                                                  color: "#8eddec",
                                                }}
                                              >
                                                Current
                                              </span>
                                            )}
                                        </div>

                                        {lesson.description && (
                                          <p>
                                            {
                                              lesson.description
                                            }
                                          </p>
                                        )}

                                        <div className="course-details-lesson-meta">
                                          <span>
                                            <Clock3 size={13} />
                                            {formatLessonDuration(
                                              lesson.duration_minutes,
                                            )}
                                          </span>

                                          {lesson.video_url && (
                                            <span>
                                              <Video size={13} />
                                              Video
                                            </span>
                                          )}

                                          {lesson.resource_url && (
                                            <a
                                              href={
                                                lesson.resource_url
                                              }
                                              target="_blank"
                                              rel="noreferrer"
                                              onClick={(
                                                event,
                                              ) =>
                                                event.stopPropagation()
                                              }
                                            >
                                              <ExternalLink
                                                size={13}
                                              />
                                              Resource
                                            </a>
                                          )}
                                        </div>

                                        <div
                                          style={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: "10px",
                                            marginTop: "13px",
                                          }}
                                        >
                                          <button
                                            type="button"
                                            className="course-details-sidebar-link"
                                            style={{
                                              marginTop: 0,
                                              padding: 0,
                                              border: 0,
                                              background:
                                                "transparent",
                                              cursor: "pointer",
                                              fontFamily:
                                                "inherit",
                                            }}
                                            onClick={() =>
                                              setActiveLessonId(
                                                isActive
                                                  ? null
                                                  : lesson.id,
                                              )
                                            }
                                          >
                                            {isActive
                                              ? "Close lesson"
                                              : "Open lesson"}
                                            {isActive ? (
                                              <ChevronUp
                                                size={15}
                                              />
                                            ) : (
                                              <ArrowRight
                                                size={15}
                                              />
                                            )}
                                          </button>

                                          {enrollment && (
                                            <button
                                              type="button"
                                              className="course-details-sidebar-link"
                                              style={{
                                                marginTop: 0,
                                                padding: 0,
                                                border: 0,
                                                background:
                                                  "transparent",
                                                cursor:
                                                  completed
                                                    ? "default"
                                                    : "pointer",
                                                fontFamily:
                                                  "inherit",
                                                opacity:
                                                  completed
                                                    ? 0.65
                                                    : 1,
                                              }}
                                              disabled={
                                                completed ||
                                                Boolean(
                                                  savingLessonId,
                                                )
                                              }
                                              onClick={() =>
                                                void handleMarkLessonComplete(
                                                  lesson,
                                                  module,
                                                )
                                              }
                                            >
                                              {isSaving ? (
                                                <>
                                                  <RefreshCw
                                                    size={15}
                                                  />
                                                  Saving...
                                                </>
                                              ) : completed ? (
                                                <>
                                                  <CheckCircle2
                                                    size={15}
                                                  />
                                                  Completed
                                                </>
                                              ) : (
                                                <>
                                                  <CheckCircle2
                                                    size={15}
                                                  />
                                                  Mark complete
                                                </>
                                              )}
                                            </button>
                                          )}
                                        </div>

                                        {isActive && (
                                          <div
                                            style={{
                                              marginTop:
                                                "18px",
                                              padding:
                                                "20px",
                                              border:
                                                "1px solid #1d4056",
                                              background:
                                                "#091b2b",
                                            }}
                                          >
                                            <span className="course-details-section-label">
                                              LESSON
                                            </span>

                                            <h4
                                              style={{
                                                margin:
                                                  "10px 0 12px",
                                                color:
                                                  "#f2f7fa",
                                                fontSize:
                                                  "1rem",
                                                lineHeight:
                                                  1.4,
                                              }}
                                            >
                                              {lesson.title}
                                            </h4>

                                            {lesson.content ? (
                                              <div
                                                style={{
                                                  color:
                                                    "#9aadb8",
                                                  fontSize:
                                                    "0.78rem",
                                                  lineHeight:
                                                    1.8,
                                                  whiteSpace:
                                                    "pre-wrap",
                                                }}
                                              >
                                                {
                                                  lesson.content
                                                }
                                              </div>
                                            ) : (
                                              <p
                                                style={{
                                                  margin: 0,
                                                  color:
                                                    "#8297a5",
                                                  fontSize:
                                                    "0.76rem",
                                                  lineHeight:
                                                    1.7,
                                                }}
                                              >
                                                Lesson content
                                                is being
                                                prepared.
                                              </p>
                                            )}

                                            {lesson.video_url && (
                                              <a
                                                href={
                                                  lesson.video_url
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                className="course-details-sidebar-link"
                                                style={{
                                                  marginTop:
                                                    "18px",
                                                }}
                                              >
                                                <Video
                                                  size={15}
                                                />
                                                Open lesson
                                                video
                                                <ExternalLink
                                                  size={14}
                                                />
                                              </a>
                                            )}

                                            {enrollment && (
                                              <div
                                                style={{
                                                  marginTop:
                                                    "20px",
                                                  paddingTop:
                                                    "16px",
                                                  borderTop:
                                                    "1px solid rgba(29, 64, 86, 0.65)",
                                                }}
                                              >
                                                <button
                                                  type="button"
                                                  className="course-details-retry-button"
                                                  disabled={
                                                    completed ||
                                                    Boolean(
                                                      savingLessonId,
                                                    )
                                                  }
                                                  onClick={() =>
                                                    void handleMarkLessonComplete(
                                                      lesson,
                                                      module,
                                                    )
                                                  }
                                                >
                                                  {isSaving ? (
                                                    <>
                                                      <RefreshCw
                                                        size={
                                                          16
                                                        }
                                                      />
                                                      Saving
                                                      progress...
                                                    </>
                                                  ) : completed ? (
                                                    <>
                                                      <CheckCircle2
                                                        size={
                                                          16
                                                        }
                                                      />
                                                      Lesson
                                                      completed
                                                    </>
                                                  ) : (
                                                    <>
                                                      <CheckCircle2
                                                        size={
                                                          16
                                                        }
                                                      />
                                                      Mark lesson
                                                      complete
                                                    </>
                                                  )}
                                                </button>
                                              </div>
                                            )}

                                            {completionFeedback?.lessonId ===
                                              lesson.id && (
                                              <div
                                                style={{
                                                  marginTop: "18px",
                                                  padding: "18px 20px",
                                                  border: "1px solid #1f6174",
                                                  background: "linear-gradient(135deg, #0a2635 0%, #091b2b 100%)",
                                                }}
                                              >
                                                <div
                                                  style={{
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    gap: "12px",
                                                  }}
                                                >
                                                  <CheckCircle2
                                                    size={20}
                                                    color="#20b8d8"
                                                    style={{
                                                      flexShrink: 0,
                                                      marginTop: "1px",
                                                    }}
                                                  />
                                                  <div>
                                                    <span className="course-details-section-label">
                                                      LESSON COMPLETE
                                                    </span>
                                                    <strong
                                                      style={{
                                                        display: "block",
                                                        marginTop: "6px",
                                                        color: "#f2f7fa",
                                                        fontSize: "0.86rem",
                                                        lineHeight: 1.5,
                                                      }}
                                                    >
                                                      {completionFeedback.courseComplete
                                                        ? "You've completed the full learning path."
                                                        : "Your progress has been saved."}
                                                    </strong>
                                                    <p
                                                      style={{
                                                        margin: "5px 0 0",
                                                        color: "#8297a5",
                                                        fontSize: "0.7rem",
                                                        lineHeight: 1.6,
                                                      }}
                                                    >
                                                      {completionFeedback.courseComplete
                                                        ? "Your course assessment is now unlocked."
                                                        : (() => {
                                                            const nextLesson =
                                                              lessons.find(
                                                                (item) =>
                                                                  item.id ===
                                                                  completionFeedback.nextLessonId,
                                                              );
                                                            return nextLesson
                                                              ? `Next up: ${nextLesson.title}`
                                                              : "Continue through the remaining lessons in your learning path.";
                                                          })()}
                                                    </p>
                                                  </div>
                                                </div>

                                                <div
                                                  style={{
                                                    display: "flex",
                                                    gap: "10px",
                                                    flexWrap: "wrap",
                                                    marginTop: "16px",
                                                  }}
                                                >
                                                  {completionFeedback.nextLessonId ? (
                                                    <button
                                                      type="button"
                                                      className="course-details-retry-button"
                                                      style={{ marginTop: 0 }}
                                                      onClick={() => {
                                                        const nextLesson =
                                                          lessons.find(
                                                            (item) =>
                                                              item.id ===
                                                              completionFeedback.nextLessonId,
                                                          );
                                                        if (nextLesson) {
                                                          openLesson(nextLesson);
                                                        }
                                                      }}
                                                    >
                                                      Continue to next lesson
                                                      <ArrowRight size={16} />
                                                    </button>
                                                  ) : completionFeedback.courseComplete ? (
                                                    <button
                                                      type="button"
                                                      className="course-details-retry-button"
                                                      style={{ marginTop: 0 }}
                                                      onClick={scrollToAssessment}
                                                    >
                                                      Go to assessment
                                                      <ClipboardCheck size={16} />
                                                    </button>
                                                  ) : null}
                                                </div>
                                              </div>
                                            )}

                                            {!enrollment &&
                                              isAuthenticated && (
                                                <p
                                                  style={{
                                                    margin:
                                                      "18px 0 0",
                                                    color:
                                                      "#8297a5",
                                                    fontSize:
                                                      "0.72rem",
                                                    lineHeight:
                                                      1.6,
                                                  }}
                                                >
                                                  Enroll in this
                                                  course to
                                                  track your
                                                  lesson
                                                  progress.
                                                </p>
                                              )}

                                            {enrollment && (
                                              <div
                                                style={{
                                                  display: "flex",
                                                  justifyContent: "space-between",
                                                  gap: "10px",
                                                  flexWrap: "wrap",
                                                  marginTop: "18px",
                                                  paddingTop: "16px",
                                                  borderTop: "1px solid rgba(29, 64, 86, 0.65)",
                                                }}
                                              >
                                                {getAdjacentLesson(lesson.id, -1) ? (
                                                  <button
                                                    type="button"
                                                    className="course-details-sidebar-link"
                                                    style={{ marginTop: 0, border: 0, background: "transparent", cursor: "pointer", fontFamily: "inherit" }}
                                                    onClick={() => {
                                                      const previousLesson = getAdjacentLesson(lesson.id, -1);
                                                      if (previousLesson) openLesson(previousLesson);
                                                    }}
                                                  >
                                                    <ArrowLeft size={15} />
                                                    Previous lesson
                                                  </button>
                                                ) : (
                                                  <span />
                                                )}

                                                {getAdjacentLesson(lesson.id, 1) ? (
                                                  <button
                                                    type="button"
                                                    className="course-details-sidebar-link"
                                                    style={{ marginTop: 0, border: 0, background: "transparent", cursor: "pointer", fontFamily: "inherit" }}
                                                    onClick={() => {
                                                      const nextLesson = getAdjacentLesson(lesson.id, 1);
                                                      if (nextLesson) openLesson(nextLesson);
                                                    }}
                                                  >
                                                    Next lesson
                                                    <ArrowRight size={15} />
                                                  </button>
                                                ) : (
                                                  <span
                                                    style={{
                                                      color: "#20b8d8",
                                                      fontSize: "0.68rem",
                                                      fontWeight: 750,
                                                    }}
                                                  >
                                                    Final lesson
                                                  </span>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>

                                      <CheckCircle2
                                        size={18}
                                        className="course-details-lesson-status"
                                        style={{
                                          color: completed
                                            ? "#20b8d8"
                                            : undefined,
                                        }}
                                      />
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>

              {quizLoading && (
                <div
                  style={{
                    marginTop: "28px",
                    padding: "22px 24px",
                    border: "1px solid #1d4056",
                    background: "#091b2b",
                  }}
                >
                  <span className="course-details-section-label">
                    ASSESSMENT
                  </span>
                  <p
                    style={{
                      margin: "10px 0 0",
                      color: "#8297a5",
                      fontSize: "0.76rem",
                      lineHeight: 1.7,
                    }}
                  >
                    Checking for available course assessments...
                  </p>
                </div>
              )}

              {assessmentError && (
                <div
                  className="course-details-inline-error"
                  style={{ marginTop: "12px" }}
                >
                  <RefreshCw size={16} />
                  <span>{assessmentError}</span>
                </div>
              )}

              {!quizLoading && quizError && (
                <div
                  className="course-details-inline-error"
                  style={{ marginTop: "28px" }}
                >
                  <RefreshCw size={16} />
                  <span>{quizError}</span>
                </div>
              )}

              {!quizLoading && !quizError && quizzes.length > 0 && (
                <section
                  id="course-assessment"
                  style={{
                    marginTop: "28px",
                    padding: "26px",
                    border: completionPercentage >= 100
                      ? "1px solid #1f6174"
                      : "1px solid #1d4056",
                    background: completionPercentage >= 100
                      ? "linear-gradient(135deg, #0b2431 0%, #0b2133 100%)"
                      : "#0b2133",
                    scrollMarginTop: "24px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "20px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ maxWidth: "680px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "9px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span className="course-details-section-label">
                          ASSESSMENT
                        </span>
                        <span
                          className="course-details-badge"
                          style={{
                            borderColor: completionPercentage >= 100
                              ? "#1f6174"
                              : "#1d4056",
                            color: completionPercentage >= 100
                              ? "#20b8d8"
                              : "#8297a5",
                          }}
                        >
                          {completionPercentage >= 100
                            ? "Unlocked"
                            : "Locked"}
                        </span>
                      </div>

                      <h2
                        style={{
                          margin: "10px 0 8px",
                          color: "#f2f7fa",
                          fontSize: "clamp(1.35rem, 2.5vw, 1.9rem)",
                          lineHeight: 1.2,
                        }}
                      >
                        {assessmentPassed
                          ? "Assessment completed."
                          : completionPercentage >= 100
                            ? "You're ready to demonstrate what you've learned."
                            : "Complete the learning path to unlock the assessment."}
                      </h2>

                      <p
                        style={{
                          margin: 0,
                          color: "#8fa4b1",
                          fontSize: "0.78rem",
                          lineHeight: 1.75,
                        }}
                      >
                        {assessmentPassed
                          ? "Your passing result is securely recorded in your Academy history. You can review the assessment at any time."
                          : completionPercentage >= 100
                            ? "All lessons are complete. Take the assessment to demonstrate your knowledge and unlock certificate eligibility."
                            : `Finish all lessons to unlock this assessment. Current learning progress: ${completionPercentage}%.`}
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "48px",
                        height: "48px",
                        border: "1px solid #1d4056",
                        background: "#081a29",
                        flexShrink: 0,
                      }}
                    >
                      {assessmentPassed ? (
                        <CheckCircle2
                          size={24}
                          color="#20b8d8"
                          aria-hidden="true"
                        />
                      ) : (
                        <ClipboardCheck
                          size={24}
                          color={completionPercentage >= 100 ? "#20b8d8" : "#607785"}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: "12px",
                      marginTop: "22px",
                    }}
                  >
                    {quizzes.map((quiz, index) => {
                      const assessmentUnlocked = completionPercentage >= 100;
                      const assessmentFailed =
                        assessmentUnlocked &&
                        assessmentAttempted &&
                        !assessmentPassed;

                      return (
                        <div
                          key={quiz.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "18px",
                            padding: "18px 20px",
                            border: assessmentPassed
                              ? "1px solid #1f6174"
                              : "1px solid #1d4056",
                            background: "#081a29",
                            flexWrap: "wrap",
                          }}
                        >
                          <div style={{ minWidth: 0, flex: "1 1 320px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "9px",
                                flexWrap: "wrap",
                              }}
                            >
                              <span
                                style={{
                                  color: "#20b8d8",
                                  fontSize: "0.62rem",
                                  fontWeight: 800,
                                  letterSpacing: "0.12em",
                                  textTransform: "uppercase",
                                }}
                              >
                                Assessment {String(index + 1).padStart(2, "0")}
                              </span>

                              {assessmentPassed ? (
                                <span
                                  className="course-details-badge course-details-badge-accent"
                                  style={{ whiteSpace: "nowrap" }}
                                >
                                  <CheckCircle2 size={13} />
                                  Passed
                                  {assessmentScore !== null
                                    ? ` · ${assessmentScore}%`
                                    : ""}
                                </span>
                              ) : assessmentFailed ? (
                                <span
                                  className="course-details-badge"
                                  style={{
                                    whiteSpace: "nowrap",
                                    borderColor: "#5b3b3b",
                                    color: "#d6a3a3",
                                  }}
                                >
                                  Retry available
                                  {assessmentLastScore !== null
                                    ? ` · ${assessmentLastScore}%`
                                    : ""}
                                </span>
                              ) : null}
                            </div>

                            <h3
                              style={{
                                margin: "8px 0 5px",
                                color: "#f2f7fa",
                                fontSize: "1rem",
                              }}
                            >
                              {quiz.title}
                            </h3>

                            <p
                              style={{
                                margin: 0,
                                color: "#8297a5",
                                fontSize: "0.72rem",
                                lineHeight: 1.6,
                              }}
                            >
                              {quiz.description ||
                                `Pass mark: ${quiz.passing_score}%`}
                            </p>
                          </div>

                          {enrollment ? (
                            assessmentUnlocked ? (
                              <Link
                                to={`/academy/${course.slug}/quiz/${quiz.id}`}
                                className="course-details-retry-button"
                                style={{
                                  textDecoration: "none",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <ClipboardCheck size={16} />
                                {assessmentPassed
                                  ? "Review assessment"
                                  : assessmentFailed
                                    ? "Retry assessment"
                                    : "Start assessment"}
                                <ArrowRight size={16} />
                              </Link>
                            ) : (
                              <span
                                style={{
                                  color: "#607785",
                                  fontSize: "0.7rem",
                                  lineHeight: 1.5,
                                  textAlign: "right",
                                }}
                              >
                                Complete all lessons to unlock.
                              </span>
                            )
                          ) : isAuthenticated ? (
                            <span
                              style={{
                                color: "#8297a5",
                                fontSize: "0.7rem",
                                lineHeight: 1.5,
                              }}
                            >
                              Enroll above to unlock the assessment.
                            </span>
                          ) : (
                            <Link
                              to="/login"
                              className="course-details-sidebar-link"
                              style={{ marginTop: 0, whiteSpace: "nowrap" }}
                            >
                              Sign in to continue
                              <ArrowRight size={16} />
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {assessmentPassed && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        marginTop: "16px",
                        padding: "14px 16px",
                        border: "1px solid #1f6174",
                        background: "#091f2b",
                      }}
                    >
                      <Award
                        size={18}
                        color="#20b8d8"
                        style={{ flexShrink: 0, marginTop: "1px" }}
                      />
                      <div>
                        <strong
                          style={{
                            display: "block",
                            color: "#f2f7fa",
                            fontSize: "0.78rem",
                          }}
                        >
                          Assessment passed — certificate eligibility unlocked.
                        </strong>
                        <p
                          style={{
                            margin: "4px 0 0",
                            color: "#8297a5",
                            fontSize: "0.68rem",
                            lineHeight: 1.6,
                          }}
                        >
                          Your verified certificate can now be claimed from the learning path panel.
                        </p>
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>

            <aside className="course-details-sidebar">
              <div className="course-details-sidebar-card">
                <span className="course-details-section-label">
                  YOUR LEARNING PATH
                </span>

                {enrollmentLoading ? (
                  <>
                    <h3>Checking your enrollment...</h3>
                    <p>
                      We're checking your Academy enrollment
                      status.
                    </p>
                  </>
                ) : enrollment ? (
                  <>
                    <span className="course-details-badge course-details-badge-accent">
                      <CheckCircle2 size={14} />
                      Enrolled
                    </span>

                    <h3>
                      You're enrolled in this course.
                    </h3>

                    <p>
                      Your learning progress is currently at{" "}
                      <strong>{completionPercentage}%</strong>.
                    </p>

                    <div
                      style={{
                        marginTop: "18px",
                        height: "5px",
                        background: "#173247",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${completionPercentage}%`,
                          height: "100%",
                          background: "#20b8d8",
                          transition:
                            "width 300ms ease",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        gap: "12px",
                        marginTop: "9px",
                        color: "#617887",
                        fontSize: "0.64rem",
                        fontWeight: 650,
                      }}
                    >
                      <span>
                        {completedLessonCount}/
                        {totalLessons} lessons
                      </span>

                      <span>
                        {completedModuleCount}/
                        {modules.length} modules
                      </span>
                    </div>

                    {completionPercentage >= 100 && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "7px",
                          marginTop: "18px",
                          color: "#20b8d8",
                          fontSize: "0.72rem",
                          fontWeight: 750,
                        }}
                      >
                        <CheckCircle2 size={16} />
                        Course completed
                      </div>
                    )}

                    <Link
                      to="/dashboard"
                      className="course-details-sidebar-link"
                    >
                      Student dashboard
                      <ArrowRight size={16} />
                    </Link>
                  </>
                ) : isAuthenticated ? (
                  <>
                    <h3>
                      Start building your learning path.
                    </h3>

                    <p>
                      Enroll in this course to begin tracking
                      your learning progress.
                    </p>

                    <button
                      type="button"
                      className="course-details-retry-button"
                      onClick={() => void handleEnroll()}
                      disabled={enrolling}
                      style={{ marginTop: "20px" }}
                    >
                      {enrolling ? (
                        <>
                          <RefreshCw size={16} />
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={16} />
                          Enroll in course
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <h3>
                      Sign in to start learning.
                    </h3>

                    <p>
                      Sign in to your NISQ Vanguard account to
                      enroll and track your Academy progress.
                    </p>

                    <Link
                      to="/login"
                      className="course-details-sidebar-link"
                    >
                      Sign in to enroll
                      <ArrowRight size={16} />
                    </Link>
                  </>
                )}

                {enrollmentError && (
                  <div className="course-details-inline-error">
                    <RefreshCw size={16} />
                    <span>{enrollmentError}</span>
                  </div>
                )}
              </div>

              {course.certificate_enabled && (
                <div
                  className="course-details-sidebar-card"
                  style={{
                    borderColor:
                      certificate || (completionPercentage >= 100 && assessmentPassed)
                        ? "#1f6174"
                        : undefined,
                  }}
                >
                  <span className="course-details-section-label">
                    CERTIFICATE
                  </span>

                  {certificateLoading ? (
                    <>
                      <h3>Checking certificate status...</h3>
                      <p>
                        We're checking whether a verified certificate has already been issued for this course.
                      </p>
                    </>
                  ) : certificate ? (
                    <>
                      <span className="course-details-badge course-details-badge-accent">
                        <CheckCircle2 size={14} />
                        Certificate issued
                      </span>

                      <h3>Your certificate is ready.</h3>

                      <p>
                        Certificate ID:{" "}
                        <strong>{certificate.certificate_id}</strong>
                      </p>

                      <Link
                        to={`/verify/${encodeURIComponent(
                          certificate.certificate_id,
                        )}`}
                        className="course-details-sidebar-link"
                      >
                        Verify certificate
                        <ExternalLink size={16} />
                      </Link>
                    </>
                  ) : completionPercentage >= 100 && assessmentPassed ? (
                    <>
                      <span className="course-details-badge course-details-badge-accent">
                        <Award size={14} />
                        Certificate eligible
                      </span>

                      <h3>Claim your certificate.</h3>
                      <p>
                        You completed the learning path and passed the required assessment. Your verified certificate is ready to be issued.
                      </p>

                      <button
                        type="button"
                        className="course-details-retry-button"
                        onClick={() => void handleIssueCertificate()}
                        disabled={issuingCertificate}
                        style={{ marginTop: "18px" }}
                      >
                        {issuingCertificate ? (
                          <>
                            <RefreshCw size={16} />
                            Issuing certificate...
                          </>
                        ) : (
                          <>
                            <Award size={16} />
                            Claim certificate
                          </>
                        )}
                      </button>
                    </>
                  ) : completionPercentage >= 100 ? (
                    <>
                      <span className="course-details-badge">
                        <ClipboardCheck size={14} />
                        Assessment required
                      </span>

                      <h3>One step before certification.</h3>
                      <p>
                        You completed every lesson. Pass the required assessment to become eligible for your verified certificate.
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="course-details-badge">
                        <BookOpen size={14} />
                        Learning in progress
                      </span>

                      <h3>Complete the learning path.</h3>
                      <p>
                        Complete every lesson, then pass the required assessment to unlock your verified certificate.
                      </p>
                    </>
                  )}

                  {certificateError && (
                    <div
                      className="course-details-inline-error"
                      style={{ marginTop: "12px" }}
                    >
                      <RefreshCw size={15} />
                      <span>{certificateError}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="course-details-sidebar-card course-details-sidebar-card-muted">
                <div className="course-details-sidebar-icon">
                  <ShieldCheck size={20} />
                </div>

                <h3>Verified learning</h3>

                <p>
                  {course.certificate_enabled
                    ? "This course is configured to support certificate-based achievement."
                    : "This course focuses on practical learning and measurable progress."}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

export default CourseDetails;