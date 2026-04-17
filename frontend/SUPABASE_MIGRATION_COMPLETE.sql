-- ==========================================
-- 1. SETUP & EXTENSIONS
-- ==========================================
-- Enable UUID extension for generating unique IDs
create extension if not exists "uuid-ossp";

-- ==========================================
-- 2. USER PROFILES (Extends Supabase Auth)
-- ==========================================
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  role text default 'student' check (role in ('student', 'admin')),
  academic_year text,
  xp int default 0,
  streak int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Trigger to create profile on new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'student');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid duplication errors on re-run
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- 3. ROADMAPS SYSTEM (Simple Lists)
-- ==========================================
create table if not exists roadmaps (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  category text,
  difficulty text check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  is_template boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists roadmap_nodes (
  id uuid default uuid_generate_v4() primary key,
  roadmap_id uuid references roadmaps(id) on delete cascade,
  title text not null,
  description text,
  order_index int,
  resource_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists user_enrollments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  roadmap_id uuid references roadmaps(id) on delete cascade,
  status text default 'active' check (status in ('active', 'completed', 'dropped')),
  progress int default 0,
  started_at timestamp with time zone default timezone('utc'::text, now()),
  completed_at timestamp with time zone
);

-- ==========================================
-- 4. AI COURSE SYSTEM (Rich Content)
-- ==========================================
create table if not exists courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  category text,
  level text check (level in ('Beginner', 'Intermediate', 'Advanced')),
  duration text,
  modules jsonb not null default '[]'::jsonb, -- Stores the full AI syllabus
  author text default 'AI Architect',
  rating numeric default 0,
  enrolled_count int default 0,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists course_enrollments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  course_id uuid references courses(id) not null,
  progress int default 0,
  completed_lessons jsonb default '[]'::jsonb,
  enrolled_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, course_id)
);

-- ==========================================
-- 5. SECURITY POLICIES (Row Level Security)
-- ==========================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table roadmaps enable row level security;
alter table courses enable row level security;
alter table course_enrollments enable row level security;

-- PROFILES Policies
drop policy if exists "Public profiles are viewable by everyone" on profiles;
create policy "Public profiles are viewable by everyone" 
  on profiles for select using ( true );

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" 
  on profiles for update using ( auth.uid() = id );

-- ROADMAPS Policies
drop policy if exists "Roadmaps are viewable by everyone" on roadmaps;
create policy "Roadmaps are viewable by everyone" 
  on roadmaps for select using ( true );

-- COURSES Policies
drop policy if exists "Courses are viewable by everyone" on courses;
create policy "Courses are viewable by everyone" 
  on courses for select using ( true );

drop policy if exists "Users can create courses" on courses;
create policy "Users can create courses" 
  on courses for insert with check ( auth.uid() = created_by );

-- COURSE ENROLLMENTS Policies
drop policy if exists "Users can view own course enrollments" on course_enrollments;
create policy "Users can view own course enrollments" 
  on course_enrollments for select using ( auth.uid() = user_id );

drop policy if exists "Users can enroll in courses" on course_enrollments;
create policy "Users can enroll in courses" 
  on course_enrollments for insert with check ( auth.uid() = user_id );

drop policy if exists "Users can update own course progress" on course_enrollments;
create policy "Users can update own course progress" 
  on course_enrollments for update using ( auth.uid() = user_id );

-- ==========================================
-- 6. TEMPORARY DEVELOPMENT OVERRIDE
-- ==========================================
-- REQUIRED if you are using 'mock-user-id' in code.
-- Comment these out when you are ready for production!
-------------------------------------------------------
-- alter table courses disable row level security;
-- alter table course_enrollments disable row level security;
-------------------------------------------------------