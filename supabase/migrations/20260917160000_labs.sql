-- ============================================================
-- NISQ VANGUARD
-- INTERACTIVE LABS ECOSYSTEM
-- ============================================================
--
-- This migration creates the foundation for:
--
--   Labs
--   Lab Challenges
--   Lab Attempts
--   Challenge Submissions
--   Student Progress
--   Badges
--   Student Badges
--
-- Automatic validation logic is intentionally kept separate
-- from public challenge data. This prevents answer keys and
-- validation rules from being exposed to browser clients.
--
-- ============================================================


-- ============================================================
-- EXTENSIONS
-- ============================================================

create extension if not exists "pgcrypto";


-- ============================================================
-- ENUMS
-- ============================================================

do $$
begin
  create type public.lab_status as enum (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
  );
exception
  when duplicate_object then null;
end
$$;


do $$
begin
  create type public.lab_difficulty as enum (
    'BEGINNER',
    'INTERMEDIATE',
    'ADVANCED'
  );
exception
  when duplicate_object then null;
end
$$;


do $$
begin
  create type public.lab_category as enum (
    'CYBERSECURITY',
    'PROGRAMMING',
    'AI_SECURITY',
    'NETWORK_SECURITY',
    'WEB_SECURITY',
    'DIGITAL_FORENSICS',
    'CRYPTOGRAPHY'
  );
exception
  when duplicate_object then null;
end
$$;


do $$
begin
  create type public.lab_attempt_status as enum (
    'IN_PROGRESS',
    'COMPLETED',
    'ABANDONED'
  );
exception
  when duplicate_object then null;
end
$$;


do $$
begin
  create type public.lab_submission_status as enum (
    'PENDING',
    'CORRECT',
    'INCORRECT'
  );
exception
  when duplicate_object then null;
end
$$;


-- ============================================================
-- LABS
-- ============================================================

create table if not exists public.labs (
  id uuid primary key default gen_random_uuid(),

  title text not null,
  slug text not null unique,

  short_description text,
  description text,

  category public.lab_category not null,

  difficulty public.lab_difficulty not null default 'BEGINNER',

  estimated_minutes integer,

  objectives text[] not null default '{}',

  instructions text,

  thumbnail_url text,

  status public.lab_status not null default 'DRAFT',

  created_by uuid references auth.users(id)
    on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint labs_title_length
    check (char_length(title) between 3 and 160),

  constraint labs_slug_format
    check (
      slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    ),

  constraint labs_estimated_minutes_positive
    check (
      estimated_minutes is null
      or estimated_minutes > 0
    )
);


-- ============================================================
-- LAB CHALLENGES
-- ============================================================

create table if not exists public.lab_challenges (
  id uuid primary key default gen_random_uuid(),

  lab_id uuid not null
    references public.labs(id)
    on delete cascade,

  title text not null,

  prompt text not null,

  challenge_order integer not null,

  points integer not null default 100,

  hints text[] not null default '{}',

  starter_code text,

  submission_type text not null default 'TEXT',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint lab_challenges_order_positive
    check (challenge_order > 0),

  constraint lab_challenges_points_positive
    check (points > 0),

  constraint lab_challenges_submission_type
    check (
      submission_type in (
        'TEXT',
        'CODE',
        'JSON'
      )
    ),

  constraint lab_challenges_unique_order
    unique (lab_id, challenge_order)
);


-- ============================================================
-- PRIVATE VALIDATION CONFIGURATION
-- ============================================================
--
-- IMPORTANT:
--
-- Validation rules and answer keys must never be exposed
-- through the public Supabase Data API.
--
-- This schema is intentionally outside the normal public
-- API surface. Server-side validation can access it through
-- a trusted backend / Edge Function.
--
-- ============================================================

create schema if not exists private;


create table if not exists private.lab_challenge_validators (
  challenge_id uuid primary key
    references public.lab_challenges(id)
    on delete cascade,

  validator_type text not null,

  validation_config jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint validator_type_allowed
    check (
      validator_type in (
        'EXACT_TEXT',
        'TEXT_CONTAINS',
        'REGEX',
        'JSON',
        'CODE'
      )
    )
);


-- ============================================================
-- LAB ATTEMPTS
-- ============================================================

create table if not exists public.lab_attempts (
  id uuid primary key default gen_random_uuid(),

  lab_id uuid not null
    references public.labs(id)
    on delete cascade,

  student_id uuid not null
    references auth.users(id)
    on delete cascade,

  status public.lab_attempt_status not null default 'IN_PROGRESS',

  score integer not null default 0,

  max_score integer not null default 0,

  started_at timestamptz not null default now(),

  completed_at timestamptz,

  last_activity_at timestamptz not null default now(),

  created_at timestamptz not null default now(),

  constraint lab_attempts_score_non_negative
    check (score >= 0),

  constraint lab_attempts_max_score_non_negative
    check (max_score >= 0),

  constraint lab_attempts_score_not_above_max
    check (score <= max_score)
);


-- ============================================================
-- LAB SUBMISSIONS
-- ============================================================

create table if not exists public.lab_submissions (
  id uuid primary key default gen_random_uuid(),

  attempt_id uuid not null
    references public.lab_attempts(id)
    on delete cascade,

  challenge_id uuid not null
    references public.lab_challenges(id)
    on delete cascade,

  student_id uuid not null
    references auth.users(id)
    on delete cascade,

  submitted_answer jsonb not null,

  status public.lab_submission_status not null default 'PENDING',

  is_correct boolean,

  points_awarded integer not null default 0,

  feedback text,

  submitted_at timestamptz not null default now(),

  constraint lab_submissions_points_non_negative
    check (points_awarded >= 0)
);


-- ============================================================
-- STUDENT LAB PROGRESS
-- ============================================================

create table if not exists public.lab_progress (
  id uuid primary key default gen_random_uuid(),

  lab_id uuid not null
    references public.labs(id)
    on delete cascade,

  student_id uuid not null
    references auth.users(id)
    on delete cascade,

  completed_challenges integer not null default 0,

  total_challenges integer not null default 0,

  score integer not null default 0,

  completion_percentage numeric(5,2) not null default 0,

  completed boolean not null default false,

  first_started_at timestamptz,

  completed_at timestamptz,

  last_activity_at timestamptz not null default now(),

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint lab_progress_completed_challenges_non_negative
    check (completed_challenges >= 0),

  constraint lab_progress_total_challenges_non_negative
    check (total_challenges >= 0),

  constraint lab_progress_score_non_negative
    check (score >= 0),

  constraint lab_progress_completion_range
    check (
      completion_percentage >= 0
      and completion_percentage <= 100
    ),

  constraint lab_progress_unique_student_lab
    unique (student_id, lab_id)
);


-- ============================================================
-- BADGES
-- ============================================================

create table if not exists public.lab_badges (
  id uuid primary key default gen_random_uuid(),

  name text not null unique,

  slug text not null unique,

  description text,

  icon_name text,

  criteria jsonb not null default '{}'::jsonb,

  is_active boolean not null default true,

  created_at timestamptz not null default now(),

  constraint lab_badges_name_length
    check (char_length(name) between 2 and 120),

  constraint lab_badges_slug_format
    check (
      slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    )
);


-- ============================================================
-- STUDENT BADGES
-- ============================================================

create table if not exists public.student_lab_badges (
  id uuid primary key default gen_random_uuid(),

  student_id uuid not null
    references auth.users(id)
    on delete cascade,

  badge_id uuid not null
    references public.lab_badges(id)
    on delete cascade,

  awarded_at timestamptz not null default now(),

  metadata jsonb not null default '{}'::jsonb,

  constraint student_lab_badges_unique
    unique (student_id, badge_id)
);


-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists labs_status_idx
  on public.labs(status);

create index if not exists labs_category_idx
  on public.labs(category);

create index if not exists labs_difficulty_idx
  on public.labs(difficulty);

create index if not exists labs_created_by_idx
  on public.labs(created_by);

create index if not exists lab_challenges_lab_id_idx
  on public.lab_challenges(lab_id);

create index if not exists lab_attempts_student_id_idx
  on public.lab_attempts(student_id);

create index if not exists lab_attempts_lab_id_idx
  on public.lab_attempts(lab_id);

create index if not exists lab_attempts_student_lab_idx
  on public.lab_attempts(student_id, lab_id);

create index if not exists lab_submissions_attempt_id_idx
  on public.lab_submissions(attempt_id);

create index if not exists lab_submissions_challenge_id_idx
  on public.lab_submissions(challenge_id);

create index if not exists lab_submissions_student_id_idx
  on public.lab_submissions(student_id);

create index if not exists lab_progress_student_id_idx
  on public.lab_progress(student_id);

create index if not exists lab_progress_lab_id_idx
  on public.lab_progress(lab_id);

create index if not exists student_lab_badges_student_id_idx
  on public.student_lab_badges(student_id);


-- ============================================================
-- UPDATED_AT FUNCTION
-- ============================================================

create or replace function public.update_labs_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

drop trigger if exists labs_updated_at
on public.labs;

create trigger labs_updated_at
before update on public.labs
for each row
execute function public.update_labs_updated_at();


drop trigger if exists lab_challenges_updated_at
on public.lab_challenges;

create trigger lab_challenges_updated_at
before update on public.lab_challenges
for each row
execute function public.update_labs_updated_at();


drop trigger if exists lab_challenge_validators_updated_at
on private.lab_challenge_validators;

create trigger lab_challenge_validators_updated_at
before update on private.lab_challenge_validators
for each row
execute function public.update_labs_updated_at();


drop trigger if exists lab_progress_updated_at
on public.lab_progress;

create trigger lab_progress_updated_at
before update on public.lab_progress
for each row
execute function public.update_labs_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.labs
enable row level security;

alter table public.lab_challenges
enable row level security;

alter table public.lab_attempts
enable row level security;

alter table public.lab_submissions
enable row level security;

alter table public.lab_progress
enable row level security;

alter table public.lab_badges
enable row level security;

alter table public.student_lab_badges
enable row level security;


-- ============================================================
-- GRANTS
-- ============================================================
--
-- Keep the public API limited to the operations required by
-- the website. Server-side validation configuration remains
-- outside the public API.
--
-- ============================================================

revoke all on table public.labs
from anon, authenticated;

revoke all on table public.lab_challenges
from anon, authenticated;

revoke all on table public.lab_attempts
from anon, authenticated;

revoke all on table public.lab_submissions
from anon, authenticated;

revoke all on table public.lab_progress
from anon, authenticated;

revoke all on table public.lab_badges
from anon, authenticated;

revoke all on table public.student_lab_badges
from anon, authenticated;


grant select on table public.labs
to anon, authenticated;

grant select on table public.lab_challenges
to anon, authenticated;

grant select, insert, update on table public.lab_attempts
to authenticated;

grant select, insert on table public.lab_submissions
to authenticated;

grant select, insert, update on table public.lab_progress
to authenticated;

grant select on table public.lab_badges
to anon, authenticated;

grant select on table public.student_lab_badges
to authenticated;


-- ============================================================
-- LAB POLICIES
-- ============================================================

drop policy if exists "Published labs are publicly readable"
on public.labs;

create policy "Published labs are publicly readable"
on public.labs
for select
to anon, authenticated
using (
  status = 'PUBLISHED'
);


drop policy if exists "Administrators and instructors can read all labs"
on public.labs;

create policy "Administrators and instructors can read all labs"
on public.labs
for select
to authenticated
using (
  public.is_admin()
  or public.has_role('INSTRUCTOR')
);


drop policy if exists "Administrators and instructors can create labs"
on public.labs;

create policy "Administrators and instructors can create labs"
on public.labs
for insert
to authenticated
with check (
  public.is_admin()
  or public.has_role('INSTRUCTOR')
);


drop policy if exists "Administrators and instructors can update labs"
on public.labs;

create policy "Administrators and instructors can update labs"
on public.labs
for update
to authenticated
using (
  public.is_admin()
  or public.has_role('INSTRUCTOR')
)
with check (
  public.is_admin()
  or public.has_role('INSTRUCTOR')
);


drop policy if exists "Administrators can delete labs"
on public.labs;

create policy "Administrators can delete labs"
on public.labs
for delete
to authenticated
using (
  public.is_admin()
);


-- ============================================================
-- CHALLENGE POLICIES
-- ============================================================

drop policy if exists "Published lab challenges are readable"
on public.lab_challenges;

create policy "Published lab challenges are readable"
on public.lab_challenges
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.labs
    where public.labs.id = public.lab_challenges.lab_id
      and public.labs.status = 'PUBLISHED'
  )
);


drop policy if exists "Administrators and instructors can read all challenges"
on public.lab_challenges;

create policy "Administrators and instructors can read all challenges"
on public.lab_challenges
for select
to authenticated
using (
  public.is_admin()
  or public.has_role('INSTRUCTOR')
);


drop policy if exists "Administrators and instructors can create challenges"
on public.lab_challenges;

create policy "Administrators and instructors can create challenges"
on public.lab_challenges
for insert
to authenticated
with check (
  public.is_admin()
  or public.has_role('INSTRUCTOR')
);


drop policy if exists "Administrators and instructors can update challenges"
on public.lab_challenges;

create policy "Administrators and instructors can update challenges"
on public.lab_challenges
for update
to authenticated
using (
  public.is_admin()
  or public.has_role('INSTRUCTOR')
)
with check (
  public.is_admin()
  or public.has_role('INSTRUCTOR')
);


drop policy if exists "Administrators can delete challenges"
on public.lab_challenges;

create policy "Administrators can delete challenges"
on public.lab_challenges
for delete
to authenticated
using (
  public.is_admin()
);


-- ============================================================
-- ATTEMPT POLICIES
-- ============================================================

drop policy if exists "Students can read their own lab attempts"
on public.lab_attempts;

create policy "Students can read their own lab attempts"
on public.lab_attempts
for select
to authenticated
using (
  student_id = (select auth.uid())
  or public.is_admin()
);


drop policy if exists "Students can create their own lab attempts"
on public.lab_attempts;

create policy "Students can create their own lab attempts"
on public.lab_attempts
for insert
to authenticated
with check (
  student_id = (select auth.uid())
);


drop policy if exists "Students can update their own lab attempts"
on public.lab_attempts;

create policy "Students can update their own lab attempts"
on public.lab_attempts
for update
to authenticated
using (
  student_id = (select auth.uid())
)
with check (
  student_id = (select auth.uid())
);


-- ============================================================
-- SUBMISSION POLICIES
-- ============================================================

drop policy if exists "Students can read their own submissions"
on public.lab_submissions;

create policy "Students can read their own submissions"
on public.lab_submissions
for select
to authenticated
using (
  student_id = (select auth.uid())
  or public.is_admin()
);


drop policy if exists "Students can create their own submissions"
on public.lab_submissions;

create policy "Students can create their own submissions"
on public.lab_submissions
for insert
to authenticated
with check (
  student_id = (select auth.uid())
);


-- ============================================================
-- PROGRESS POLICIES
-- ============================================================

drop policy if exists "Students can read their own lab progress"
on public.lab_progress;

create policy "Students can read their own lab progress"
on public.lab_progress
for select
to authenticated
using (
  student_id = (select auth.uid())
  or public.is_admin()
);


drop policy if exists "Students can create their own lab progress"
on public.lab_progress;

create policy "Students can create their own lab progress"
on public.lab_progress
for insert
to authenticated
with check (
  student_id = (select auth.uid())
);


drop policy if exists "Students can update their own lab progress"
on public.lab_progress;

create policy "Students can update their own lab progress"
on public.lab_progress
for update
to authenticated
using (
  student_id = (select auth.uid())
)
with check (
  student_id = (select auth.uid())
);


-- ============================================================
-- BADGE POLICIES
-- ============================================================

drop policy if exists "Active badges are publicly readable"
on public.lab_badges;

create policy "Active badges are publicly readable"
on public.lab_badges
for select
to anon, authenticated
using (
  is_active = true
);


drop policy if exists "Administrators can manage badges"
on public.lab_badges;

create policy "Administrators can manage badges"
on public.lab_badges
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);


-- ============================================================
-- STUDENT BADGE POLICIES
-- ============================================================

drop policy if exists "Students can read their own badges"
on public.student_lab_badges;

create policy "Students can read their own badges"
on public.student_lab_badges
for select
to authenticated
using (
  student_id = (select auth.uid())
  or public.is_admin()
);


-- ============================================================
-- PRIVATE VALIDATOR SECURITY
-- ============================================================
--
-- Do not grant Data API access to validation configuration.
-- Future server-side validation can access this table using
-- a trusted server/Edge Function.
--
-- ============================================================

revoke all on schema private
from anon, authenticated;

revoke all on table private.lab_challenge_validators
from anon, authenticated;


-- ============================================================
-- INITIAL BADGES
-- ============================================================

insert into public.lab_badges (
  name,
  slug,
  description,
  icon_name,
  criteria
)
values
(
  'First Mission',
  'first-mission',
  'Complete your first interactive cybersecurity lab.',
  'ShieldCheck',
  '{"type":"LAB_COMPLETION_COUNT","value":1}'::jsonb
),
(
  'Cyber Explorer',
  'cyber-explorer',
  'Complete three interactive cybersecurity labs.',
  'Compass',
  '{"type":"LAB_COMPLETION_COUNT","value":3}'::jsonb
),
(
  'Security Specialist',
  'security-specialist',
  'Complete five advanced lab challenges.',
  'Award',
  '{"type":"ADVANCED_CHALLENGE_COUNT","value":5}'::jsonb
)
on conflict (slug)
do update set
  name = excluded.name,
  description = excluded.description,
  icon_name = excluded.icon_name,
  criteria = excluded.criteria;


-- ============================================================
-- COMMENTS
-- ============================================================

comment on table public.labs is
  'Interactive NISQ Vanguard learning labs.';

comment on table public.lab_challenges is
  'Challenges belonging to interactive labs.';

comment on table public.lab_attempts is
  'Student attempts and aggregate scores for labs.';

comment on table public.lab_submissions is
  'Student challenge submissions and validation results.';

comment on table public.lab_progress is
  'Per-student progress for each interactive lab.';

comment on table public.lab_badges is
  'Achievement badges available in the interactive labs ecosystem.';

comment on table public.student_lab_badges is
  'Badges awarded to individual students.';

comment on table private.lab_challenge_validators is
  'Private server-side validation configuration. Never expose through the public Data API.';