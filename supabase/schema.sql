
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. TEAMS
create table teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  join_code text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. USERS (PROFILES)
-- Note: We generally link this to auth.users via a trigger, but for now we create it manually or via hook
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  role text default 'MEMBER' check (role in ('COACH', 'CO_COACH', 'MEMBER')),
  status text default 'PENDING' check (status in ('PENDING', 'ACTIVE', 'REJECTED', 'BANNED')),
  team_id uuid references teams(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. JOIN REQUESTS
create table join_requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  team_id uuid references teams(id) on delete cascade not null,
  status text default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. STRAVA ACCOUNTS (Sensitive)
create table strava_accounts (
  user_id uuid references profiles(id) on delete cascade primary key,
  athlete_id bigint unique not null,
  access_token text not null,
  refresh_token text not null,
  expires_at bigint not null,
  profile_picture text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ACTIVITIES
create table activities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  team_id uuid references teams(id) on delete cascade not null,
  strava_id bigint unique not null,
  name text not null,
  distance float not null, -- meters
  moving_time int not null, -- seconds
  elapsed_time int not null, -- seconds
  total_elevation_gain float,
  start_date timestamp with time zone not null,
  map_polyline text,
  average_speed float,
  type text, -- Run, Ride, etc
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. POSTS (Feed)
create table posts (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references teams(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  activity_id uuid references activities(id) unique, -- One post per activity usually
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. COMMENTS
create table comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. LIKES
create table likes (
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (post_id, user_id)
);

-- 9. MEETUPS
create table meetups (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references teams(id) on delete cascade not null,
  created_by uuid references profiles(id) not null,
  title text not null,
  start_time timestamp with time zone not null,
  location_name text,
  location_url text,
  route_url text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. MEETUP RSVRS
create table meetup_rsvps (
  meetup_id uuid references meetups(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  status text check (status in ('GOING', 'MAYBE', 'NOT_GOING')),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (meetup_id, user_id)
);


-- ROW LEVEL SECURITY (RLS)
alter table profiles enable row level security;
alter table teams enable row level security;
alter table join_requests enable row level security;
alter table strava_accounts enable row level security;
alter table activities enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;
alter table likes enable row level security;
alter table meetups enable row level security;
alter table meetup_rsvps enable row level security;

-- POLICIES (Simplified for V1)

-- Profiles: Publicly readable by team members (todo: refine)
create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Teams: Viewable by members
create policy "Teams viewable by members" on teams for select using (true); -- todo: restrict to own team

-- Strava Accounts: Only owner can see
create policy "Strava sensitive data only owner" on strava_accounts for all using (auth.uid() = user_id);

-- Activities/Posts/Comments: Viewable by team members
create policy "Feed entries viewable by everyone" on posts for select using (true);
create policy "Members can create posts" on posts for insert with check (auth.uid() = user_id);

-- TRIGGER: Create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- SEED DATA (Optional: Create a default team)
insert into teams (name, join_code) values ('HUJI Run', 'HUJI2026');
