-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Helper Functions for RLS
create or replace function public.is_team_coach(check_team_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
      and team_id = check_team_id
      and role in ('COACH', 'CO_COACH')
      and status = 'ACTIVE'
  );
end;
$$;

create or replace function public.is_team_member(check_team_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid()
      and team_id = check_team_id
      and status = 'ACTIVE'
  );
end;
$$;

-- 2. Training Plans
create table public.training_plans (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  week_start_date date not null,
  title text not null,
  status text default 'DRAFT' check (status in ('DRAFT', 'PUBLISHED')),
  change_note text,
  published_at timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references public.profiles(id) not null,
  unique (team_id, week_start_date)
);

-- 3. Workouts
create table public.workouts (
  id uuid default uuid_generate_v4() primary key,
  plan_id uuid references public.training_plans(id) on delete cascade not null,
  day_of_week int check (day_of_week between 0 and 6) not null,
  title text not null,
  description text,
  type text check (type in ('EASY', 'WORKOUT', 'LONG_RUN', 'REST')) not null,
  distance_km numeric,
  duration_min numeric,
  intensity text,
  target_pace text,
  structure jsonb,
  workout_source text default 'MANUAL' check (workout_source in ('MANUAL', 'AI_GENERATED')),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Events (Replacing old meetups)
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  title text not null,
  description text,
  starts_at timestamp with time zone not null,
  ends_at timestamp with time zone,
  location text,
  type text check (type in ('PRACTICE', 'RACE', 'SOCIAL')),
  repeat_weekly boolean default false,
  repeat_until timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references public.profiles(id) not null
);

-- 5. Event RSVPs
create table public.event_rsvps (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('GOING', 'NOT_GOING')) not null,
  response_note text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (event_id, user_id)
);

-- 6. Event Attendance
create table public.event_attendance (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('PRESENT', 'ABSENT', 'EXCUSED')) not null,
  checked_by uuid references public.profiles(id) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  checked_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (event_id, user_id)
);

-- ROW LEVEL SECURITY 
alter table public.training_plans enable row level security;
alter table public.workouts enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.event_attendance enable row level security;

-- POLICIES

-- Training Plans
create policy "Coaches can manage training plans" on public.training_plans
  for all using (public.is_team_coach(team_id)) 
  with check (public.is_team_coach(team_id) and created_by = auth.uid());

create policy "Members can view published training plans" on public.training_plans
  for select using (public.is_team_member(team_id) and status = 'PUBLISHED');

-- Workouts
create policy "Coaches can manage workouts" on public.workouts
  for all using (
    exists (
      select 1 from public.training_plans plan 
      where plan.id = workouts.plan_id and public.is_team_coach(plan.team_id)
    )
  )
  with check (
    exists (
      select 1 from public.training_plans plan 
      where plan.id = workouts.plan_id and public.is_team_coach(plan.team_id)
    )
  );

create policy "Members can view workouts of published plans" on public.workouts
  for select using (
    exists (
      select 1 from public.training_plans plan 
      where plan.id = workouts.plan_id 
        and public.is_team_member(plan.team_id) 
        and plan.status = 'PUBLISHED'
    )
  );

-- Events
create policy "Coaches can manage events" on public.events
  for all using (public.is_team_coach(team_id)) 
  with check (public.is_team_coach(team_id) and created_by = auth.uid());

create policy "Members can view events" on public.events
  for select using (public.is_team_member(team_id));

-- Event RSVPs
create policy "Members can manage their own RSVPs" on public.event_rsvps
  for all using (
    auth.uid() = user_id and
    exists (
      select 1 from public.events e
      where e.id = event_rsvps.event_id and public.is_team_member(e.team_id)
    )
  )
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.events e
      where e.id = event_rsvps.event_id and public.is_team_member(e.team_id)
    )
  );

create policy "Coaches can view all RSVPs" on public.event_rsvps
  for select using (
    exists (
      select 1 from public.events e
      where e.id = event_rsvps.event_id and public.is_team_coach(e.team_id)
    )
  );

-- Event Attendance
create policy "Coaches can manage attendance" on public.event_attendance
  for all using (
    exists (
      select 1 from public.events e
      where e.id = event_attendance.event_id and public.is_team_coach(e.team_id)
    )
  )
  with check (
    exists (
      select 1 from public.events e
      where e.id = event_attendance.event_id and public.is_team_coach(e.team_id)
    )
    and checked_by = auth.uid()
  );

create policy "Members can view attendance" on public.event_attendance
  for select using (
    exists (
      select 1 from public.events e
      where e.id = event_attendance.event_id and public.is_team_member(e.team_id)
    )
  );


-- TRIGGERS FOR UPDATED_AT
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger set_training_plans_updated_at
  before update on public.training_plans
  for each row execute function public.set_updated_at();

create trigger set_workouts_updated_at
  before update on public.workouts
  for each row execute function public.set_updated_at();

create trigger set_events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

create trigger set_event_rsvps_updated_at
  before update on public.event_rsvps
  for each row execute function public.set_updated_at();

create trigger set_event_attendance_updated_at
  before update on public.event_attendance
  for each row execute function public.set_updated_at();
