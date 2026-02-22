-- 1. Add fields for publish + media AND ensure RLS is explicitly enabled
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;

alter table public.posts
  add column if not exists title text,
  add column if not exists image_url text,
  add column if not exists post_type text default 'UPDATE'
    check (post_type in ('UPDATE', 'IMAGE', 'TRAINING_PLAN', 'MEMBER_JOINED', 'PB')),
  add column if not exists status text default 'PUBLISHED'
    check (status in ('DRAFT', 'PUBLISHED')),
  add column if not exists published_at timestamp with time zone,
  add column if not exists updated_at timestamp with time zone
    default timezone('utc'::text, now()) not null;

-- 2. Drop old policies
drop policy if exists "Members can create posts" on public.posts;
drop policy if exists "Only Coaches can create posts" on public.posts;
drop policy if exists "Only Coaches can update or delete posts" on public.posts;
drop policy if exists "Only Coaches can delete posts" on public.posts;
drop policy if exists "Feed entries viewable by everyone" on public.posts;
drop policy if exists "Team members can view feed" on public.posts;

-- 3. SELECT: Coaches can see all posts in their team; members only published posts
create policy "Team members can view published posts"
on public.posts
for select
using (
  public.is_team_member(team_id)
  and (
    status = 'PUBLISHED'
    or public.is_team_coach(team_id)
  )
);

-- 4. INSERT: only coaches
create policy "Only coaches can create posts"
on public.posts
for insert
with check (
  public.is_team_coach(team_id)
  and user_id = auth.uid()
);

-- 5. UPDATE: allow any coach in team to edit (recommended)
create policy "Only coaches can update posts"
on public.posts
for update
using (public.is_team_coach(team_id))
with check (public.is_team_coach(team_id));

-- 6. DELETE: only coaches
create policy "Only coaches can delete posts"
on public.posts
for delete
using (public.is_team_coach(team_id));

-- 7. Trigger (idempotent)
drop trigger if exists set_posts_updated_at on public.posts;

create trigger set_posts_updated_at
before update on public.posts
for each row execute function public.set_updated_at();


-- 8. LIKES AND COMMENTS RLS (Enforcing interactivity)
-- Drop existing permissive or missing policies (just in case)
drop policy if exists "Members can insert comments" on public.comments;
drop policy if exists "Members can view comments" on public.comments;
drop policy if exists "Members can manage their own likes" on public.likes;
drop policy if exists "Members can view likes" on public.likes;
drop policy if exists "Team members can view likes" on public.likes;
drop policy if exists "Coaches can delete comments" on public.comments;
drop policy if exists "Users and Coaches can delete comments" on public.comments;

-- COMMENTS:
-- Anyone in the team can view comments on published posts (or all if coach)
create policy "Team members can view comments"
on public.comments
for select
using (
  exists (
    select 1 from public.posts p 
    where p.id = comments.post_id 
      and public.is_team_member(p.team_id)
      and (p.status = 'PUBLISHED' or public.is_team_coach(p.team_id))
  )
);

-- Anyone in the team can comment on published posts
create policy "Team members can insert comments"
on public.comments
for insert
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.posts p 
    where p.id = comments.post_id 
      and public.is_team_member(p.team_id)
      and (p.status = 'PUBLISHED' or public.is_team_coach(p.team_id))
  )
);

-- Users can edit their own comments
drop policy if exists "Users can update their own comments" on public.comments;
create policy "Users can update their own comments"
on public.comments
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Coaches can delete any comment (moderation). Users can delete their own.
create policy "Users and Coaches can delete comments"
on public.comments
for delete
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.posts p
    where p.id = comments.post_id and public.is_team_coach(p.team_id)
  )
);

-- LIKES:
-- Anyone in the team can view likes of published posts
create policy "Team members can view likes"
on public.likes
for select
using (
  exists (
    select 1 from public.posts p 
    where p.id = likes.post_id 
      and public.is_team_member(p.team_id)
      and (p.status = 'PUBLISHED' or public.is_team_coach(p.team_id))
  )
);

-- Anyone in the team can manage their own likes
create policy "Team members can manage their own likes"
on public.likes
for all
using (
  user_id = auth.uid()
  and exists (
    select 1 from public.posts p 
    where p.id = likes.post_id 
      and public.is_team_member(p.team_id)
      and (p.status = 'PUBLISHED' or public.is_team_coach(p.team_id))
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.posts p 
    where p.id = likes.post_id 
      and public.is_team_member(p.team_id)
      and (p.status = 'PUBLISHED' or public.is_team_coach(p.team_id))
  )
);

-- 9. STANDALONE TRIGGERS AND CONSTRAINTS
-- Ensure updated_at trigger function exists (if not already in earlier migration)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- One-like-per-user-per-post
create unique index if not exists likes_unique_post_user
on public.likes (post_id, user_id);
