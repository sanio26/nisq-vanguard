-- ============================================================
-- NISQ Vanguard
-- Lab Achievement & Badge Automation
-- ============================================================

CREATE OR REPLACE FUNCTION public.award_lab_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_first_mission UUID;
  v_cyber_explorer UUID;
  v_security_specialist UUID;

  v_completed_labs INTEGER := 0;
  v_completed_attempts INTEGER := 0;
  v_total_score INTEGER := 0;
  v_total_max_score INTEGER := 0;
BEGIN

  -- Only evaluate achievements when a lab becomes completed.
  IF NEW.completed IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  -- ----------------------------------------------------------
  -- Locate the system badges.
  -- ----------------------------------------------------------

  SELECT id
  INTO v_first_mission
  FROM public.lab_badges
  WHERE slug = 'first-mission'
    AND is_active = TRUE
  LIMIT 1;

  SELECT id
  INTO v_cyber_explorer
  FROM public.lab_badges
  WHERE slug = 'cyber-explorer'
    AND is_active = TRUE
  LIMIT 1;

  SELECT id
  INTO v_security_specialist
  FROM public.lab_badges
  WHERE slug = 'security-specialist'
    AND is_active = TRUE
  LIMIT 1;


  -- ----------------------------------------------------------
  -- FIRST MISSION
  --
  -- Awarded after the student completes their first lab.
  -- ----------------------------------------------------------

  IF v_first_mission IS NOT NULL THEN

    SELECT COUNT(*)
    INTO v_completed_labs
    FROM public.lab_progress
    WHERE student_id = NEW.student_id
      AND completed = TRUE;

    IF v_completed_labs >= 1 THEN

      INSERT INTO public.student_lab_badges (
        student_id,
        badge_id,
        metadata
      )
      SELECT
        NEW.student_id,
        v_first_mission,
        jsonb_build_object(
          'achievement',
          'Completed first interactive security lab',
          'lab_id',
          NEW.lab_id
        )
      WHERE NOT EXISTS (
        SELECT 1
        FROM public.student_lab_badges
        WHERE student_id = NEW.student_id
          AND badge_id = v_first_mission
      );

    END IF;

  END IF;


  -- ----------------------------------------------------------
  -- CYBER EXPLORER
  --
  -- Awarded after completing three different labs.
  -- ----------------------------------------------------------

  IF v_cyber_explorer IS NOT NULL THEN

    SELECT COUNT(*)
    INTO v_completed_labs
    FROM public.lab_progress
    WHERE student_id = NEW.student_id
      AND completed = TRUE;

    IF v_completed_labs >= 3 THEN

      INSERT INTO public.student_lab_badges (
        student_id,
        badge_id,
        metadata
      )
      SELECT
        NEW.student_id,
        v_cyber_explorer,
        jsonb_build_object(
          'achievement',
          'Completed three interactive security labs',
          'completed_labs',
          v_completed_labs
        )
      WHERE NOT EXISTS (
        SELECT 1
        FROM public.student_lab_badges
        WHERE student_id = NEW.student_id
          AND badge_id = v_cyber_explorer
      );

    END IF;

  END IF;


  -- ----------------------------------------------------------
  -- SECURITY SPECIALIST
  --
  -- Awarded when a student completes a lab with at least
  -- 80 percent of the available points.
  -- ----------------------------------------------------------

  IF v_security_specialist IS NOT NULL THEN

    SELECT
      COALESCE(SUM(score), 0),
      COALESCE(SUM(max_score), 0)
    INTO
      v_total_score,
      v_total_max_score
    FROM public.lab_attempts
    WHERE student_id = NEW.student_id
      AND status = 'COMPLETED';

    IF v_total_max_score > 0
       AND (v_total_score::NUMERIC / v_total_max_score::NUMERIC) >= 0.80
    THEN

      INSERT INTO public.student_lab_badges (
        student_id,
        badge_id,
        metadata
      )
      SELECT
        NEW.student_id,
        v_security_specialist,
        jsonb_build_object(
          'achievement',
          'Achieved at least 80 percent across completed lab attempts',
          'score',
          v_total_score,
          'max_score',
          v_total_max_score
        )
      WHERE NOT EXISTS (
        SELECT 1
        FROM public.student_lab_badges
        WHERE student_id = NEW.student_id
          AND badge_id = v_security_specialist
      );

    END IF;

  END IF;


  RETURN NEW;
END;
$$;


-- ============================================================
-- Trigger
-- ============================================================

DROP TRIGGER IF EXISTS trg_award_lab_badges
ON public.lab_progress;

CREATE TRIGGER trg_award_lab_badges
AFTER INSERT OR UPDATE OF completed
ON public.lab_progress
FOR EACH ROW
EXECUTE FUNCTION public.award_lab_badges();


-- ============================================================
-- Security
-- ============================================================

REVOKE ALL
ON FUNCTION public.award_lab_badges()
FROM PUBLIC;

COMMENT ON FUNCTION public.award_lab_badges()
IS
'Server-side achievement evaluator for NISQ Vanguard interactive labs.';


-- ============================================================
-- Verification comments
-- ============================================================

COMMENT ON TABLE public.student_lab_badges
IS
'Student achievement records generated by server-side lab completion logic.';