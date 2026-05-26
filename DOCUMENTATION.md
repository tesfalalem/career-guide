# BiT CareerGuide — Full System Documentation

> **Version:** 1.0.0 | **Last Updated:** May 2026  
> **Platform:** Web (React + PHP) · Mobile (Flutter)  
> **Institution:** Bahir Dar Institute of Technology (BiT), BDU

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [User Roles](#3-user-roles)
4. [Backend API](#4-backend-api)
5. [Database Schema](#5-database-schema)
6. [Web Application](#6-web-application)
   - 6.1 [Student Portal](#61-student-portal)
   - 6.2 [Teacher Portal](#62-teacher-portal)
   - 6.3 [Admin Portal](#63-admin-portal)
   - 6.4 [BiT Academic Portal](#64-bit-academic-portal)
7. [Mobile Application](#7-mobile-application)
   - 7.1 [Student Mobile](#71-student-mobile)
   - 7.2 [Teacher Mobile](#72-teacher-mobile)
   - 7.3 [Admin Mobile](#73-admin-mobile)
   - 7.4 [BiT Mobile](#74-bit-mobile)
8. [AI Features](#8-ai-features)
9. [Setup & Configuration](#9-setup--configuration)
10. [API Reference](#10-api-reference)

---

## 1. System Overview

BiT CareerGuide is a full-stack career guidance platform built for students and staff at Bahir Dar Institute of Technology. It bridges the gap between academic learning and professional career readiness through AI-powered roadmaps, curated courses, assessments, and institutional career listings.

**Key capabilities:**
- AI-generated and BiT-curated career roadmaps with Beginner / Medium / Advanced levels
- Course management with lesson-level content blocks (text, video, links, files)
- Official career listings managed by BiT admins
- Teacher resource management with student monitoring
- Role-based access for students, teachers, admins, and BiT coordinators
- Real-time notifications and in-app support chat
- Cross-platform: React web app + Flutter mobile app sharing the same PHP backend

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  ┌──────────────────────┐  ┌──────────────────────────┐ │
│  │   Web App (React)    │  │  Mobile App (Flutter)    │ │
│  │   Vite + Tailwind    │  │  Riverpod + GoRouter     │ │
│  │   TypeScript         │  │  Dio HTTP client         │ │
│  └──────────┬───────────┘  └────────────┬─────────────┘ │
└─────────────┼────────────────────────────┼───────────────┘
              │  HTTP/JSON (JWT Bearer)     │
              ▼                             ▼
┌─────────────────────────────────────────────────────────┐
│                   BACKEND LAYER                          │
│  XAMPP Apache · PHP 8+ · Custom Router                  │
│  http://localhost/careerguide/backend/api               │
│                                                         │
│  Controllers: Auth, User, Course, Roadmap, AI,          │
│  BitController, AdminController, TeacherController,     │
│  CareersController, AssessmentController,               │
│  NotificationController, SupportController, ...         │
└──────────────────────────┬──────────────────────────────┘
                           │  PDO / MySQL
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                         │
│  MySQL (careerguide database)                           │
│  Tables: users, courses, course_enrollments,            │
│  roadmaps, curated_roadmaps, careers, assessments,      │
│  notifications, support_messages, ...                   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   AI LAYER                               │
│  Primary:  Groq (llama-3.3-70b-versatile)               │
│  Backup:   OpenRouter (gemini-2.0-flash)                │
│  Local:    Ollama (llama3)                              │
└─────────────────────────────────────────────────────────┘
```

**Tech Stack:**

| Layer | Technology |
|---|---|
| Web Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Mobile | Flutter 3, Dart, Riverpod, GoRouter |
| Backend | PHP 8+, custom MVC router, PDO |
| Database | MySQL / MariaDB (via XAMPP) |
| Auth | JWT (JSON Web Tokens), bcrypt passwords |
| AI | Groq API → OpenRouter → Ollama (fallback chain) |
| File Storage | Local filesystem (`uploads/`) served via PHP |

---

## 3. User Roles

The system has four distinct roles, each with a separate portal:

| Role | Description | Default Route |
|---|---|---|
| `student` | BiT students — browse roadmaps, enroll in courses, take assessments | `/student` |
| `teacher` | Verified BiT teachers — upload resources, monitor students | `/teacher` |
| `admin` | Platform administrators — moderate resources, manage users | `/admin` |
| `bit` | BiT Academic Coordinators — create roadmaps, courses, careers | `/bit` |

**Account Status Flow:**
- New teacher registrations start as `pending` and require admin approval
- Students and BiT accounts are `active` immediately
- Pending accounts see a "Pending Approval" screen and cannot access their portal

---

## 4. Backend API

**Base URL:** `http://localhost/careerguide/backend/api`

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT token |
| POST | `/auth/logout` | Invalidate token |
| POST | `/auth/refresh-token` | Refresh JWT |

### User

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/profile` | Get authenticated user profile |
| PUT | `/users/profile` | Update name, academic year |
| GET | `/users/stats` | Get courses enrolled, lessons completed |
| GET | `/users/activity` | Get recent activity feed |
| GET | `/users/courses` | Get enrolled courses with progress |
| GET | `/users/roadmaps` | Get saved AI roadmaps |

### Courses

| Method | Endpoint | Description |
|---|---|---|
| GET | `/courses` | List all courses |
| GET | `/courses/:id` | Get course with full modules |
| POST | `/courses/generate` | AI-generate a course |
| POST | `/courses/:id/enroll` | Enroll in a course |
| DELETE | `/courses/:id/unenroll` | Unenroll from a course |
| PUT | `/courses/:id/progress` | Update lesson progress |

### Curated Roadmaps (Public)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/curated-roadmaps` | Browse roadmaps (filter by category/difficulty) |
| GET | `/curated-roadmaps/:id` | Get roadmap detail |
| POST | `/curated-roadmaps/:id/enroll` | Enroll in roadmap |
| GET | `/curated-roadmaps/:id/courses` | Get linked courses |

### AI Services

| Method | Endpoint | Description |
|---|---|---|
| POST | `/ai/career-suggestion` | Get AI career suggestions from interests |
| POST | `/ai/career-details` | Get detailed career info |
| POST | `/ai/lesson-content` | Generate lesson content |
| POST | `/ai/generate-assessment` | Generate quiz questions |
| POST | `/roadmaps/generate` | Generate full AI roadmap |

### Careers (Public)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/careers` | List published careers (students) |
| GET | `/careers/categories` | Get distinct categories |
| GET | `/careers/:id` | Get single published career |

### BiT Admin — Careers

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/bit/careers` | List all (draft + published) |
| POST | `/bit/careers` | Create career |
| PUT | `/bit/careers/:id` | Update career |
| DELETE | `/bit/careers/:id` | Delete career |
| POST | `/bit/careers/:id/publish` | Publish career |
| POST | `/bit/careers/:id/unpublish` | Move to draft |

### BiT Admin — Roadmaps & Courses

| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/bit/roadmaps` | List / create roadmaps |
| GET/PUT/DELETE | `/bit/roadmaps/:id` | Get / update / delete |
| POST | `/bit/roadmaps/:id/publish` | Publish + auto-enroll all students |
| POST | `/bit/roadmaps/:id/course` | Add course to roadmap |
| GET/POST | `/bit/courses` | List / create standalone courses |
| DELETE | `/bit/courses/:id` | Delete course |
| GET | `/bit/analytics` | Platform analytics |

### Teacher

| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/teacher/resources` | List / upload resources |
| PUT/DELETE | `/teacher/resources/:id` | Update / delete resource |
| GET | `/teacher/students` | Get assigned students |
| GET | `/teacher/students/:id/progress` | Student progress detail |
| POST | `/teacher/feedback` | Send feedback to student |
| GET | `/teacher/analytics` | Resource analytics |
| GET/PUT | `/teacher/profile` | Teacher profile |
| GET/PUT | `/teacher/settings` | Notification settings |

### Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/users` | All users |
| PUT | `/admin/users/:id/role` | Change user role |
| GET | `/admin/approvals/pending` | Pending role requests |
| POST | `/admin/approvals/:id/approve` | Approve teacher |
| POST | `/admin/approvals/:id/reject` | Reject teacher |
| GET | `/admin/resources` | All resources |
| POST | `/admin/resources/:id/approve` | Approve resource |
| POST | `/admin/resources/:id/reject` | Reject resource |
| GET | `/admin/analytics` | Platform-wide analytics |

### Assessments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/assessments` | Student's available assessments |
| GET | `/assessments/:id` | Get assessment with questions |
| POST | `/assessments/:id/submit` | Submit answers |
| POST | `/assessments` | Create assessment (teacher/bit) |
| DELETE | `/assessments/:id` | Delete assessment |

### Notifications

| Method | Endpoint | Description |
|---|---|---|
| GET | `/notifications` | Get all notifications |
| GET | `/notifications/unread-count` | Unread count |
| PUT | `/notifications/:id/read` | Mark as read |
| PUT | `/notifications/mark-all-read` | Mark all read |

### Support Chat

| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/support/messages` | Get / send messages |
| GET | `/admin/support/conversations` | All conversations (admin) |

---

## 5. Database Schema

### Core Tables

**`users`**
```sql
id, name, email, password, role (student|teacher|admin|bit),
academic_year, xp, streak, account_status (pending|active|rejected),
profile_image, created_at, updated_at
-- Extended: institution, years_experience, expertise_areas, bio,
--           linkedin_url, qualifications, certifications
```

**`courses`**
```sql
id, title, description, category, level (Beginner|Intermediate|Advanced),
modules (JSON), duration, author, rating, enrolled_count,
created_by (FK users), created_at, updated_at
```

**`course_enrollments`**
```sql
id, user_id (FK), course_id (FK), progress (0-100),
completed_lessons (JSON), enrolled_at
```

**`roadmaps`** (AI-generated, user-specific)
```sql
id, title, role, road_data (JSON), user_id (FK), created_at
```

**`curated_roadmaps`** (BiT-created, public)
```sql
id, title, description, category, difficulty_level,
estimated_duration, phases (JSON), tags (JSON), status,
thumbnail_url, enrollments, views, created_by (FK), created_at
```

**`careers`**
```sql
id, title, description, category, required_skills (JSON),
status (draft|published), created_by (FK), created_at, updated_at
```

**`assessments`** + **`assessment_questions`** + **`assessment_attempts`**

**`notifications`**
```sql
id, user_id, type, title, message, link, is_read, created_at
```

**`support_messages`**
```sql
id, sender_id, receiver_id, message, is_read, created_at
```

---

## 6. Web Application

**URL:** `http://localhost:3000` (dev) or `http://localhost/careerguide/frontend/dist` (prod)  
**Stack:** React 18, TypeScript, Vite, Tailwind CSS  
**Auth:** JWT stored in `localStorage` as `auth_token`

### Public Pages

| Page | Route | Description |
|---|---|---|
| Home | `/` (view: home) | Landing page with hero, features, stats |
| Mission | view: mission | Platform mission statement |
| FAQ | view: faq | Frequently asked questions |
| User Guide | view: user-guide | How to use the platform |
| Privacy Policy | view: privacy | Data privacy policy |
| Terms of Service | view: terms | Terms of use |
| Public Chat | view: chat | Guest support chat |

### 6.1 Student Portal

Accessed after login with `role: student`. Tabs in the sidebar:

#### Dashboard (Overview)
- Welcome banner with courses enrolled and lessons completed
- Quick action cards: Roadmap Library, Generate Roadmap, Browse Careers, Take Assessment
- Recent activity feed
- AI-suggested roadmaps grid

#### Roadmaps
Two sub-views:
- **Curated Roadmaps** — BiT-created roadmaps with Beginner/Medium/Advanced level tabs. Each level shows numbered phases with expandable content. Phase content is parsed from HTML (list items become topic cards).
- **AI Roadmap Generator** — Enter a career goal, AI generates a full multi-phase roadmap. Saved roadmaps appear in the browse list.

#### Courses
- **My Courses** — Enrolled courses with progress bars
- **Browse All** — All available courses with enroll button

#### Assessments
- List of available assessments linked to courses
- Quiz interface with multiple-choice questions and score display

#### Careers
- Hero banner
- Search bar + category filter pills
- Responsive card grid showing published careers
- Each card: category icon (color-coded by category), title, description, required skills
- "View Career" opens a detail modal

#### Profile
- Read-only display: full name, academic year, email, user ID
- First letter of name shown as avatar (gradient based on role)

### 6.2 Teacher Portal

Accessed after login with `role: teacher` and `account_status: active`.

**Course Assignment Gate:** On first login, teachers must request a course assignment. Until approved, they see a pending banner.

**Pending Approval Gate:** If `account_status === 'pending'`, a full-screen waiting page is shown.

#### Overview
- Stats: total resources, active students, average rating, unread feedback
- Quick actions: Add Resource, Monitor Students, View Analytics
- Recent activity feed
- At-risk students panel

#### My Resources
- Upload resources (articles, videos, PDFs, links)
- Resources go through admin approval workflow (pending → approved/rejected)
- Edit and delete own resources

#### Students
- List of assigned students with engagement scores
- Per-student progress detail
- Send feedback to students

#### Analytics
- Resource performance metrics
- View/download counts per resource

#### Profile
- Edit teacher profile: bio, institution, expertise areas, qualifications, LinkedIn

### 6.3 Admin Portal

Accessed with `role: admin`.

#### Overview
- Platform-wide analytics: total users, students, teachers, roadmaps, resources

#### Users
- List all users with role and status
- Change user roles

#### Approvals
- Pending teacher role requests
- Approve or reject with notes
- Pending course assignment requests

#### Resources
- All uploaded resources across all teachers
- Approve or reject resources
- Moderation queue

### 6.4 BiT Academic Portal

Accessed with `role: bit`.

#### Overview
- Stats: roadmaps, courses, enrollments, students

#### Roadmaps
- Create roadmaps with 3-level structure (Beginner / Medium / Advanced)
- Each level has independent phases with title, description (rich text), duration
- Publish roadmap → auto-enrolls all active students + sends notifications
- Edit, delete, publish/unpublish

#### Courses
- Create standalone courses or link to roadmaps
- Rich content editor with blocks: text, links, images, videos, documents
- Edit existing courses (preserves student progress)
- Delete courses

#### Careers
- Create career listings: title, description, category, required skills, status
- Category auto-assigns an icon and gradient color
- Publish/unpublish (only published careers visible to students)
- Edit and delete

---

## 7. Mobile Application

**Platform:** Flutter 3 (Android + iOS)  
**State Management:** Riverpod  
**Navigation:** GoRouter with shell routes  
**HTTP:** Dio with JWT interceptor  
**Storage:** FlutterSecureStorage (token) + SharedPreferences (fallback)

### Connection Configuration

Edit `lib/core/constants/api_constants.dart`:

```dart
// Android Emulator (default)
const emulatorHost = '10.0.2.2';  // maps to host machine localhost

// Physical Device — change this to your PC's LAN IP
static const String _physicalDeviceIp = '10.187.1.1';
```

### Authentication Flow

```
Splash → check token
  ├── No token → Login
  ├── Token + pending → Pending Approval Screen
  ├── Token + student → /student
  ├── Token + teacher → /teacher
  ├── Token + admin → /admin
  └── Token + bit → /bit
```

### 7.1 Student Mobile

**Shell:** Bottom navigation bar (5 items) + side drawer

**Bottom Nav:** Home · Roadmaps · Courses · Careers · Assess

**Drawer:** Home, Roadmaps, Courses, Careers, Assessments, Profile, Notifications, Support, Dark Mode, Logout

#### Home (`/student`)
- Welcome card with courses enrolled and lessons completed
- Quick action cards
- Recent activity

#### Roadmaps (`/student/roadmaps`)
- Browse curated roadmaps with category/difficulty filters
- Tap to view detail with phase timeline
- AI Roadmap Generator (`/student/roadmaps/generate`)
- Roadmap detail (`/student/roadmaps/:id`) — expandable phases

#### Courses (`/student/courses`)
- **My Courses tab** — enrolled courses with progress bars
- **Browse All tab** — all courses with "Enroll Now" button
  - Enrolling shows spinner, success shows teal "✓ Enrolled" badge
  - My Courses tab auto-refreshes after enrollment
- Course detail (`/student/courses/:id`) — modules, lessons, content blocks
  - Back button (white text/border on navy background)
  - Next Lesson button

#### Careers (`/student/careers`)
- Published careers from BiT
- Category icons, search, filter

#### Assessments (`/student/assessments`)
- Available assessments list
- Quiz screen (`/student/assessments/:id`) — multiple choice, timer, score

#### Profile (`/student/profile`)
- Read-only: name, email, academic year, role
- First letter avatar

### 7.2 Teacher Mobile

**Shell:** Bottom nav (Home · Resources · Students · Profile) + drawer

#### Home (`/teacher`)
- Stats overview
- Quick actions

#### Resources (`/teacher/resources`)
- Upload and manage educational resources
- Approval status badges

#### Students (`/teacher/students`)
- Assigned students list
- Engagement scores and progress

#### Profile (`/teacher/profile`)
- View and edit teacher profile

### 7.3 Admin Mobile

**Shell:** Bottom nav (Home · Users · Approvals · Resources) + drawer

#### Home (`/admin`)
- Platform analytics dashboard

#### Users (`/admin/users`)
- All users list with role badges
- Role management

#### Approvals (`/admin/approvals`)
- Pending teacher approvals
- Pending course assignment requests
- Approve / reject actions

#### Resources (`/admin/resources`)
- Resource moderation queue
- Approve / reject resources

### 7.4 BiT Mobile

**Shell:** Bottom nav (Home · Roadmaps · Courses) + drawer

#### Home (`/bit`)
- Analytics: roadmaps, courses, enrollments, students

#### Roadmaps (`/bit/roadmaps`)
- List all roadmaps with status badges
- Publish / unpublish actions

#### Courses (`/bit/courses`)
- List all courses
- Basic course management

---

## 8. AI Features

The platform uses a cascading AI provider system:

```
Request → Groq (primary) → OpenRouter (backup) → Ollama (local fallback)
```

Configure in `backend/.env`:
```env
AI_PROVIDER_ORDER=groq,openrouter,ollama
GROQ_API_KEY=...
GROQ_MODEL=llama-3.3-70b-versatile
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=google/gemini-2.0-flash-001
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3
```

### AI Capabilities

| Feature | Endpoint | Description |
|---|---|---|
| Career Suggestion | `POST /ai/career-suggestion` | Suggests careers based on student interests |
| Career Details | `POST /ai/career-details` | Detailed career info, skills, salary |
| Roadmap Generation | `POST /roadmaps/generate` | Full multi-phase career roadmap |
| Lesson Content | `POST /ai/lesson-content` | Generate lesson content for a topic |
| Assessment Generation | `POST /ai/generate-assessment` | Generate quiz questions for a course |
| Course Generation | `POST /courses/generate` | Generate a full course with modules |

### Error Handling
If the AI service returns a 503 (capacity exhausted), the frontend shows:
> "AI service is temporarily busy. Please wait a few seconds and try again."

---

## 9. Setup & Configuration

### Prerequisites
- XAMPP (Apache + MySQL)
- PHP 8.0+
- Node.js 18+
- Flutter 3.x + Dart SDK
- Composer (PHP dependency manager)

### Backend Setup

```bash
# 1. Place project in XAMPP htdocs
# Path: C:\xampp\htdocs\careerguide\

# 2. Install PHP dependencies
cd backend
composer install

# 3. Configure environment
cp .env.example .env
# Edit .env: set DB credentials, JWT secret, AI API keys

# 4. Create database
# Open phpMyAdmin → create database 'careerguide'
# Run: backend/database/schema.sql
# Run: backend/database/run_all_migrations.sql

# 5. Run profile image migration (if needed)
# Visit: http://localhost/careerguide/backend/public/run-profile-image-migration.php

# 6. Run careers migration (auto-runs on first API call)
# Or visit: http://localhost/careerguide/backend/public/run-careers-migration.php
```

### Web Frontend Setup

```bash
cd frontend
npm install
npm run dev        # Development: http://localhost:3000
npm run build      # Production build
```

### Mobile Setup

```bash
cd mobile
flutter pub get

# For Android Emulator (default):
flutter run

# For Physical Device:
# 1. Edit lib/core/constants/api_constants.dart
# 2. Change _physicalDeviceIp to your PC's LAN IP
# 3. flutter run
```

### Default Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@bit.bdu.edu.et | admin123 |
| BiT | bit@bit.bdu.edu.et | bit123 |

---

## 10. API Reference

### Request/Response Format

All API responses are JSON. Successful responses return the data directly or with a `message` field. Errors return:
```json
{ "error": "Error description" }
```

### JWT Token

Tokens are returned on login/register:
```json
{
  "token": "eyJ...",
  "user": { "id": 1, "name": "...", "role": "student", ... }
}
```

Include in all protected requests:
```
Authorization: Bearer eyJ...
```

### Roadmap Phase Structure

BiT roadmaps use a multi-level phase structure stored in the `phases` JSON column:

```json
[
  {
    "level": "beginner",
    "label": "Beginner",
    "phases": [
      { "title": "Phase Title", "description": "<p>HTML content</p>", "duration": "2 weeks" }
    ]
  },
  { "level": "medium", "label": "Medium", "phases": [...] },
  { "level": "advanced", "label": "Advanced", "phases": [...] }
]
```

Old flat-format roadmaps (single `difficulty_level`) are still supported and displayed without the level selector.

### Career Object

```json
{
  "id": 1,
  "title": "Full Stack Developer",
  "description": "...",
  "category": "Software Engineering",
  "required_skills": ["JavaScript", "React", "Node.js"],
  "status": "published",
  "created_at": "2026-05-01T..."
}
```

### Course Module Structure

```json
{
  "modules": [
    {
      "title": "Module Title",
      "lessons": [
        {
          "title": "Lesson Title",
          "duration": "30 min",
          "content": "[{\"id\":\"...\",\"type\":\"text\",\"text\":\"<p>...</p>\"}]"
        }
      ]
    }
  ]
}
```

Lesson `content` is a JSON array of content blocks. Block types: `text`, `link`, `image`, `video`, `file`.

---

## Appendix: File Structure

```
careerguide/
├── backend/                    PHP API
│   ├── app/
│   │   ├── Controllers/        19 controllers
│   │   ├── Models/             6 models
│   │   ├── Services/           AI provider chain
│   │   └── Helpers/            JWT helper
│   ├── config/database.php
│   ├── database/               SQL migrations
│   ├── public/index.php        Entry point
│   ├── routes/api.php          All routes
│   └── uploads/                File storage
│       ├── profiles/
│       └── course-content/
│
├── frontend/                   React web app
│   ├── components/
│   │   ├── Auth/               Login, Register, Onboarding
│   │   ├── Dashboard/
│   │   │   ├── Admin/          Admin views
│   │   │   ├── BiT/            BiT views
│   │   │   ├── Teacher/        Teacher views
│   │   │   └── common/         Shared dashboard components
│   │   ├── common/             Shared UI components
│   │   └── Pages/              Public pages
│   ├── services/apiClient.ts   HTTP client
│   ├── types.ts                TypeScript interfaces
│   └── App.tsx                 Root component
│
└── mobile/                     Flutter app
    └── lib/
        ├── core/
        │   ├── constants/      API endpoints
        │   ├── models/         Data models
        │   ├── network/        Dio API client
        │   ├── providers/      Auth, theme providers
        │   ├── router/         GoRouter config
        │   └── theme/          App theme
        ├── features/
        │   ├── auth/           Login, Register, Splash
        │   ├── student/        Student screens + providers
        │   ├── teacher/        Teacher screens
        │   ├── admin/          Admin screens
        │   ├── bit/            BiT screens
        │   └── shared/         Notifications, Support
        └── shared/widgets/     Reusable widgets
```
