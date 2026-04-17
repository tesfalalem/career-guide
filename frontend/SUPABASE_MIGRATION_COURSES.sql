-- This file ADDS to your existing schema. 
-- It allows saving the rich, AI-generated courses (Modules/Lessons) separately from your simple roadmaps.

-- 1. Create Courses Table (For the AI Generated Content)
create table courses (
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

-- 2. Create Course Enrollments Table (Distinct from your existing 'user_enrollments' for roadmaps)
create table course_enrollments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  course_id uuid references courses(id) not null,
  progress int default 0,
  completed_lessons jsonb default '[]'::jsonb,
  enrolled_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, course_id)
);

-- ALLOW ANYONE to insert/update for development. 
-- WARNING: This is INSECURE and should be removed when Auth is ready!

alter table courses disable row level security;
alter table course_enrollments disable row level security;

-- 4. Policies (These are currently inactive due to disabled RLS)
-- Anyone can view public courses
create policy "Public courses are viewable by everyone"
  on courses for select
  using ( true );

-- Users can create courses (Allowing any ID for development)
create policy "Users can create courses"
  on courses for insert
  with check ( true ); 

-- Users can enroll (Allowing any ID for development)
create policy "Users can enroll in courses"
  on course_enrollments for insert
  with check ( true );
