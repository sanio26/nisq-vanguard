-- ============================================================
-- NISQ VANGUARD
-- SECURE LAB EXECUTION + SERVER-SIDE VALIDATION
-- ============================================================

-- ============================================================
-- 1. SECURE LAB ATTEMPT CREATION
-- ============================================================

create or replace function public.start_lab_attempt(
  p_lab_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_student_id uuid;
  v_lab public.labs%rowtype;
  v_attempt public.lab_attempts%rowtype;
  v_total_points integer;
  v_total_challenges integer;
begin
  v_student_id := auth.uid();

  if v_student_id is null then
    raise exception 'Authentication required.';
  end if;

  select *
  into v_lab
  from public.labs
  where id = p_lab_id
    and status = 'PUBLISHED';

  if not found then
    raise exception 'Lab not found or not published.';
  end if;

  select
    count(*)::integer,
    coalesce(sum(points), 0)::integer
  into
    v_total_challenges,
    v_total_points
  from public.lab_challenges
  where lab_id = p_lab_id;

  select *
  into v_attempt
  from public.lab_attempts
  where lab_id = p_lab_id
    and student_id = v_student_id
    and status = 'IN_PROGRESS'
  order by created_at desc
  limit 1;

  if found then
    update public.lab_attempts
    set
      last_activity_at = now(),
      max_score = v_total_points
    where id = v_attempt.id;

    return jsonb_build_object(
      'attempt_id', v_attempt.id,
      'lab_id', p_lab_id,
      'status', 'IN_PROGRESS',
      'score', v_attempt.score,
      'max_score', v_total_points,
      'total_challenges', v_total_challenges
    );
  end if;

  insert into public.lab_attempts (
    lab_id,
    student_id,
    status,
    score,
    max_score,
    started_at,
    last_activity_at
  )
  values (
    p_lab_id,
    v_student_id,
    'IN_PROGRESS',
    0,
    v_total_points,
    now(),
    now()
  )
  returning *
  into v_attempt;

  insert into public.lab_progress (
    lab_id,
    student_id,
    completed_challenges,
    total_challenges,
    score,
    completion_percentage,
    completed,
    first_started_at,
    last_activity_at
  )
  values (
    p_lab_id,
    v_student_id,
    0,
    v_total_challenges,
    0,
    0,
    false,
    now(),
    now()
  )
  on conflict (lab_id, student_id)
  do update set
    total_challenges = excluded.total_challenges,
    last_activity_at = now();

  return jsonb_build_object(
    'attempt_id', v_attempt.id,
    'lab_id', p_lab_id,
    'status', 'IN_PROGRESS',
    'score', 0,
    'max_score', v_total_points,
    'total_challenges', v_total_challenges
  );
end;
$$;


-- ============================================================
-- 2. SERVER-SIDE CHALLENGE VALIDATION
-- ============================================================

create or replace function public.submit_lab_challenge(
  p_attempt_id uuid,
  p_challenge_id uuid,
  p_submitted_answer text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_student_id uuid;
  v_attempt public.lab_attempts%rowtype;
  v_challenge public.lab_challenges%rowtype;
  v_validator private.lab_challenge_validators%rowtype;

  v_is_correct boolean := false;
  v_points integer := 0;
  v_feedback text := 'Answer submitted.';

  v_completed_count integer := 0;
  v_total_challenges integer := 0;
  v_new_score integer := 0;
  v_percentage numeric := 0;
  v_completed boolean := false;

  v_existing_correct boolean := false;
begin
  v_student_id := auth.uid();

  if v_student_id is null then
    raise exception 'Authentication required.';
  end if;

  if p_submitted_answer is null then
    raise exception 'An answer is required.';
  end if;

  select *
  into v_attempt
  from public.lab_attempts
  where id = p_attempt_id
    and student_id = v_student_id
    and status = 'IN_PROGRESS'
  for update;

  if not found then
    raise exception 'Active lab attempt not found.';
  end if;

  select *
  into v_challenge
  from public.lab_challenges
  where id = p_challenge_id
    and lab_id = v_attempt.lab_id;

  if not found then
    raise exception 'Challenge does not belong to this lab.';
  end if;

  select *
  into v_validator
  from private.lab_challenge_validators
  where challenge_id = p_challenge_id;

  if not found then
    raise exception 'Challenge validator is not configured.';
  end if;

  -- Prevent a correct challenge from awarding points twice.
  select exists (
    select 1
    from public.lab_submissions
    where attempt_id = p_attempt_id
      and challenge_id = p_challenge_id
      and is_correct = true
  )
  into v_existing_correct;

  if v_existing_correct then
    return jsonb_build_object(
      'is_correct', true,
      'points_awarded', 0,
      'feedback', 'This challenge has already been completed.',
      'already_completed', true
    );
  end if;

  -- ==========================================================
  -- VALIDATION TYPES
  -- ==========================================================

  if v_validator.validator_type = 'EXACT_TEXT' then

    v_is_correct :=
      lower(trim(p_submitted_answer)) =
      lower(trim(coalesce(
        v_validator.validation_config ->> 'expected',
        ''
      )));

    if v_is_correct then
      v_feedback := 'Correct. The submitted answer matches the expected result.';
    else
      v_feedback := 'Incorrect. Review the challenge evidence and try again.';
    end if;

  elsif v_validator.validator_type = 'TEXT_CONTAINS' then

    v_is_correct :=
      position(
        lower(
          coalesce(
            v_validator.validation_config ->> 'expected',
            ''
          )
        )
        in lower(p_submitted_answer)
      ) > 0;

    if v_is_correct then
      v_feedback := 'Correct. Your response contains the required security finding.';
    else
      v_feedback := 'The required finding was not detected in your answer.';
    end if;

  elsif v_validator.validator_type = 'REGEX' then

    begin
      v_is_correct :=
        p_submitted_answer ~
        coalesce(
          v_validator.validation_config ->> 'pattern',
          ''
        );

      if v_is_correct then
        v_feedback := 'Correct. Your response matches the required pattern.';
      else
        v_feedback := 'Your response does not match the required pattern.';
      end if;

    exception
      when others then
        v_is_correct := false;
        v_feedback := 'The challenge validator could not process this response.';
    end;

  elsif v_validator.validator_type = 'JSON' then

    begin
      v_is_correct :=
        p_submitted_answer::jsonb =
        coalesce(
          v_validator.validation_config -> 'expected',
          '{}'::jsonb
        );

      if v_is_correct then
        v_feedback := 'Correct. The submitted JSON structure is valid.';
      else
        v_feedback := 'The submitted JSON does not match the expected result.';
      end if;

    exception
      when others then
        v_is_correct := false;
        v_feedback := 'Your submission is not valid JSON.';
    end;

  else
    v_is_correct := false;
    v_feedback :=
      'This challenge requires a validator that is not available in the current environment.';
  end if;

  if v_is_correct then
    v_points := v_challenge.points;
  else
    v_points := 0;
  end if;

  insert into public.lab_submissions (
    attempt_id,
    challenge_id,
    student_id,
    submitted_answer,
    status,
    is_correct,
    points_awarded,
    feedback,
    submitted_at
  )
  values (
    p_attempt_id,
    p_challenge_id,
    v_student_id,
    p_submitted_answer,
    case
      when v_is_correct then 'CORRECT'::public.lab_submission_status
      else 'INCORRECT'::public.lab_submission_status
    end,
    v_is_correct,
    v_points,
    v_feedback,
    now()
  );

  if v_is_correct then

    update public.lab_attempts
    set
      score = least(
        max_score,
        score + v_points
      ),
      last_activity_at = now()
    where id = p_attempt_id
    returning score
    into v_new_score;

  else

    update public.lab_attempts
    set last_activity_at = now()
    where id = p_attempt_id
    returning score
    into v_new_score;

  end if;

  select count(*)::integer
  into v_total_challenges
  from public.lab_challenges
  where lab_id = v_attempt.lab_id;

  select count(*)::integer
  into v_completed_count
  from (
    select distinct challenge_id
    from public.lab_submissions
    where attempt_id = p_attempt_id
      and is_correct = true
  ) completed_challenges;

  if v_total_challenges > 0 then
    v_percentage :=
      round(
        (v_completed_count::numeric / v_total_challenges::numeric) * 100,
        2
      );
  else
    v_percentage := 0;
  end if;

  v_completed :=
    v_total_challenges > 0
    and v_completed_count >= v_total_challenges;

  update public.lab_progress
  set
    completed_challenges = v_completed_count,
    total_challenges = v_total_challenges,
    score = v_new_score,
    completion_percentage = v_percentage,
    completed = v_completed,
    completed_at = case
      when v_completed then coalesce(completed_at, now())
      else completed_at
    end,
    last_activity_at = now(),
    updated_at = now()
  where lab_id = v_attempt.lab_id
    and student_id = v_student_id;

  if v_completed then
    update public.lab_attempts
    set
      status = 'COMPLETED',
      completed_at = coalesce(completed_at, now()),
      last_activity_at = now()
    where id = p_attempt_id;
  end if;

  return jsonb_build_object(
    'is_correct', v_is_correct,
    'points_awarded', v_points,
    'feedback', v_feedback,
    'score', v_new_score,
    'completed_challenges', v_completed_count,
    'total_challenges', v_total_challenges,
    'completion_percentage', v_percentage,
    'completed', v_completed,
    'already_completed', false
  );
end;
$$;


-- ============================================================
-- 3. REMOVE DIRECT CLIENT WRITE ACCESS
-- ============================================================

revoke insert on public.lab_attempts from anon, authenticated;
revoke update on public.lab_attempts from anon, authenticated;

revoke insert on public.lab_submissions from anon, authenticated;
revoke update on public.lab_submissions from anon, authenticated;

revoke insert on public.lab_progress from anon, authenticated;
revoke update on public.lab_progress from anon, authenticated;


-- ============================================================
-- 4. ALLOW AUTHENTICATED USERS TO EXECUTE SECURE RPCs
-- ============================================================

grant execute on function public.start_lab_attempt(uuid)
to authenticated;

grant execute on function public.submit_lab_challenge(uuid, uuid, text)
to authenticated;


-- ============================================================
-- 5. COMMENTS
-- ============================================================

comment on function public.start_lab_attempt(uuid)
is 'Creates or resumes a student lab attempt without allowing client-controlled scoring fields.';

comment on function public.submit_lab_challenge(uuid, uuid, text)
is 'Validates a lab challenge server-side and updates authoritative score and progress.';