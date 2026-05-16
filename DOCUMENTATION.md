# BiT CareerGuide — Full Project Documentation

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Database Schema](#4-database-schema)
5. [User Roles & Permissions](#5-user-roles--permissions)
6. [Backend Architecture](#6-backend-architecture)
7. [API Reference](#7-api-reference)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Authentication System](#9-authentication-system)
10. [AI System](#10-ai-system)
11. [Feature Walkthroughs](#11-feature-walkthroughs)
12. [Environment Configuration](#12-environment-configuration)
13. [Setup & Installation](#13-setup--installation)

---

## 1. Project Overview

**BiT CareerGuide** is a full-stack career guidance web platform built exclusively for students at **Bahir Dar Institute of Technology (BiT)**, Ethiopia. It bridges the gap between academic study and professional employment by providing AI-powered career roadmaps, curated learning courses, skill assessments, teacher-uploaded resources, and real-time notifications — all in one unified platform.

### Core Purpose
- Help BiT students discover and plan their tech career paths
- Provide structured, AI-generated and BiT-curated learning roadmaps
- Allow teachers to upload and manage educational resources for their assigned courses
- Enable admins to moderate content, approve teacher accounts, and monitor platform health
- Give BiT academic staff (role: `bit`) full control over official roadmaps and courses

### Key Highlights
- 4 distinct user portals: Student, Teacher, Admin, BiT
- Multi-provider AI system with automatic fallback (Groq → OpenRouter → Ollama)
- Real-time notification system with per-user preferences
- Course assignment workflow: teachers request → admin approves → teacher uploads resources
- When BiT publishes a roadmap or course, all active students are auto-enrolled
- Support chat system for both authenticated users and anonymous guests
- Profile image upload, dark/light theme, responsive sidebar with drag-to-resize

---

## 2. Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.4 | UI framework |
| TypeScript | 5.8.2 | Type safety |
| Vite | 6.2.0 | Build tool & dev server |
| Tailwind CSS | 3.4.17 | Utility-first styling |
| Lucide React | 0.563.0 | Icon library |
| react-markdown | 10.1.0 | Render AI lesson content (Markdown) |
| date-fns | 4.1.0 | Date formatting (activity feed, notifications) |
| uuid | 14.0.0 | Guest ID generation for support chat |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| PHP | 8.0+ | Server-side language |
| MySQL / MariaDB | 5.7+ / 10.3+ | Relational database |
| PDO | built-in | Database abstraction with prepared statements |
| firebase/php-jwt | via Composer | JWT token generation and validation |
| vlucas/phpdotenv | via Composer | Environment variable loading |

### AI Providers (in fallback order)
| Provider | Model | Notes |
|---|---|---|
| Groq | llama-3.3-70b-versatile | Primary — fast, free tier available |
| OpenRouter | google/gemini-2.0-flash-001 | Backup — configurable model |
| Ollama | llama3 | Local fallback — requires local install |

### Dev Tools
- **Vite** for HMR and bundling
- **PostCSS + Autoprefixer** for CSS processing
- **PHP built-in server** (`php -S localhost:8000`) for local backend

---

## 3. Project Structure

```
/
├── frontend/                        # React + TypeScript SPA
│   ├── App.tsx                      # Root component — view state manager
│   ├── index.tsx                    # React DOM entry point
│   ├── index.css                    # Global styles + Tailwind directives
│   ├── types.ts                     # All TypeScript interfaces & type guards
│   ├── vite.config.ts               # Vite configuration
│   ├── tailwind.config.js           # Tailwind theme (colors, fonts, animations)
│   ├── components/
│   │   ├── Navbar.tsx               # Public landing navbar (scroll-aware, mobile drawer)
│   │   ├── Hero.tsx                 # Landing hero with animated counters
│   │   ├── Features.tsx             # Landing features section
│   │   ├── ProblemSolution.tsx      # Landing problem/solution section
│   │   ├── Footer.tsx               # Landing footer with navigation links
│   │   ├── CareerExplorer.tsx       # Public career exploration component
│   │   ├── Auth/
│   │   │   ├── LoginPage.tsx        # Login form with validation
│   │   │   ├── EnhancedSignUpPage.tsx  # Multi-step signup (student + teacher)
│   │   │   ├── OnboardingPage.tsx   # Post-signup career selection
│   │   │   ├── SignUpPage.tsx       # Basic signup (legacy)
│   │   │   └── TeacherSignUpPage.tsx   # Teacher-specific signup
│   │   ├── Dashboard/
│   │   │   ├── DashboardRouter.tsx  # Role-based lazy loader
│   │   │   ├── StudentDashboardLayout.tsx   # Student portal shell
│   │   │   ├── TeacherDashboardLayout.tsx   # Teacher portal shell
│   │   │   ├── AdminDashboardLayout.tsx     # Admin portal shell
│   │   │   ├── BiTDashboardLayout.tsx       # BiT portal shell
│   │   │   ├── DashboardHome.tsx    # Student overview/home tab
│   │   │   ├── CuratedRoadmapsView.tsx  # Browse & enroll in roadmaps
│   │   │   ├── RoadmapGenerator.tsx     # AI custom roadmap generator
│   │   │   ├── LibraryView.tsx          # Course library (my + browse)
│   │   │   ├── CourseView.tsx           # Course lesson viewer
│   │   │   ├── AssessmentView.tsx       # Quiz/assessment engine
│   │   │   ├── ProgressView.tsx         # Student performance analytics
│   │   │   ├── MarketInsights.tsx       # Industry market data
│   │   │   ├── ProfileSettings.tsx      # Student profile & settings
│   │   │   ├── PortfolioView.tsx        # Student portfolio
│   │   │   ├── TeacherResourcesView.tsx # Teacher resource upload/manage
│   │   │   ├── InspirationHub.tsx       # Inspiration content
│   │   │   ├── CommunityView.tsx        # Community features
│   │   │   ├── Admin/
│   │   │   │   ├── AdminOverview.tsx        # Admin dashboard home
│   │   │   │   ├── AdminUsersView.tsx       # User management table
│   │   │   │   ├── AdminApprovalsView.tsx   # Teacher approval queue
│   │   │   │   ├── AdminAnalyticsView.tsx   # Platform analytics
│   │   │   │   ├── AdminResourcesView.tsx   # Resource moderation
│   │   │   │   ├── AdminRoadmapsView.tsx    # Roadmap management
│   │   │   │   ├── AdminSettingsView.tsx    # Platform settings
│   │   │   │   ├── AdminSupportView.tsx     # Support chat admin view
│   │   │   │   ├── AdminContentModerationView.tsx
│   │   │   │   ├── CreateCourseForRoadmapModal.tsx
│   │   │   │   ├── CreateResourceModal.tsx
│   │   │   │   ├── CreateRoadmapModal.tsx
│   │   │   │   ├── EditResourceModal.tsx
│   │   │   │   └── EditRoadmapModal.tsx
│   │   │   ├── Teacher/
│   │   │   │   ├── TeacherOverview.tsx      # Teacher dashboard home
│   │   │   │   ├── TeacherStudentsView.tsx  # Student monitoring
│   │   │   │   ├── TeacherAnalyticsView.tsx # Resource analytics
│   │   │   │   ├── TeacherProfileView.tsx   # Teacher profile editor
│   │   │   │   ├── TeacherSettingsView.tsx  # Teacher notification settings
│   │   │   │   └── TeacherCourseSelection.tsx  # First-login course picker
│   │   │   ├── BiT/
│   │   │   │   ├── BiTOverview.tsx          # BiT dashboard home
│   │   │   │   ├── BiTRoadmapsView.tsx      # Roadmap CRUD
│   │   │   │   └── BiTCoursesView.tsx       # Course CRUD
│   │   │   └── common/
│   │   │       └── SupportChatView.tsx      # In-dashboard support chat
│   │   ├── common/
│   │   │   ├── NotificationBell.tsx     # Bell icon + dropdown (polls every 30s)
│   │   │   ├── Skeleton.tsx             # Loading skeleton components
│   │   │   ├── ConfirmModal.tsx         # Reusable confirm dialog
│   │   │   └── README.md
│   │   └── Pages/
│   │       ├── MissionPage.tsx
│   │       ├── FAQPage.tsx
│   │       ├── PublicChatPage.tsx       # Guest support chat
│   │       ├── UserGuidePage.tsx
│   │       ├── PrivacyPolicyPage.tsx
│   │       └── TermsOfServicePage.tsx
│   └── services/
│       ├── apiClient.ts             # All HTTP calls to backend + normalizeUser()
│       ├── courseService.ts         # Course-specific service helpers
│       └── notificationService.ts   # Notification API wrapper
│
├── backend/                         # PHP REST API
│   ├── public/
│   │   └── index.php                # Single entry point — CORS, routing bootstrap
│   ├── routes/
│   │   └── api.php                  # Router class — all 70+ route definitions
│   ├── app/
│   │   ├── Controllers/             # One controller per domain
│   │   ├── Models/                  # PDO-based data access objects
│   │   ├── Services/                # Business logic (AI)
│   │   ├── Helpers/                 # JWTHelper
│   │   └── Interfaces/              # AiProviderInterface
│   ├── config/
│   │   └── database.php             # PDO connection class
│   ├── database/
│   │   └── schema.sql               # Base schema (users, courses, roadmaps, enrollments)
│   ├── uploads/
│   │   ├── course-content/          # Uploaded course files
│   │   ├── resources/documents/     # Teacher-uploaded documents
│   │   └── resources/videos/        # Teacher-uploaded videos
│   ├── .env                         # Active environment config
│   ├── .env.example                 # Template for environment setup
│   └── composer.json                # PHP dependencies
```

---

## 4. Database Schema

### Core Tables

#### `users`
| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| name | VARCHAR(255) | Full name (validated: 5-50 chars, 2+ words) |
| email | VARCHAR(255) UNIQUE | Lowercased on save |
| password | VARCHAR(255) | bcrypt hashed |
| role | ENUM | `student`, `teacher`, `admin`, `bit` |
| academic_year | VARCHAR(50) | e.g. "3rd Year" |
| xp | INT DEFAULT 0 | Experience points (credits) |
| streak | INT DEFAULT 0 | Consistency score |
| account_status | ENUM | `active`, `pending`, `rejected` |
| role_request | ENUM | Requested role at signup |
| student_id | VARCHAR(100) | BiT student ID |
| department | VARCHAR(100) | |
| graduation_year | INT | |
| institution | VARCHAR(255) | For teachers |
| years_experience | INT | For teachers |
| expertise_areas | JSON | For teachers |
| qualifications | JSON | For teachers |
| bio | TEXT | For teachers |
| profile_image | VARCHAR(500) | URL to uploaded image |
| profile_completed | TINYINT | |
| created_at | TIMESTAMP | |

#### `courses`
| Column | Type | Notes |
|---|---|---|
| id | INT PK | |
| title | VARCHAR(255) | |
| description | TEXT | |
| category | VARCHAR(100) | Usually the career role |
| level | ENUM | `Beginner`, `Intermediate`, `Advanced` |
| modules | JSON | Array of `{title, lessons:[{title, content, duration}]}` |
| duration | VARCHAR(50) | e.g. "40 Hours" |
| author | VARCHAR(100) | `AI Architect` or teacher name |
| rating | DECIMAL(3,2) | Default 4.80 |
| enrolled_count | INT | |
| created_by | INT FK → users.id | |

#### `course_enrollments`
| Column | Type | Notes |
|---|---|---|
| id | INT PK | |
| user_id | INT FK | |
| course_id | INT FK | |
| progress | INT DEFAULT 0 | 0–100 percentage |
| completed_lessons | JSON | Array of completed lesson titles |
| enrolled_at | TIMESTAMP | |
| UNIQUE | (user_id, course_id) | Prevents duplicate enrollments |

#### `roadmaps` (user-generated AI roadmaps)
| Column | Type | Notes |
|---|---|---|
| id | INT PK | |
| title | VARCHAR(255) | |
| role | VARCHAR(100) | Career role |
| road_data | JSON | Full roadmap object with phases |
| user_id | INT FK | Owner |
| created_at | TIMESTAMP | |

#### `curated_roadmaps` (BiT/Admin official roadmaps)
| Column | Type | Notes |
|---|---|---|
| id | INT PK | |
| title | VARCHAR(255) | |
| description | TEXT | |
| category | VARCHAR(100) | |
| difficulty_level | ENUM | `beginner`, `intermediate`, `advanced` |
| estimated_duration | VARCHAR(100) | |
| created_by | INT FK | |
| status | ENUM | `draft`, `published` |
| tags | JSON | Array of tag strings |
| phases | JSON | Array of phase objects |
| thumbnail_url | VARCHAR(500) | |
| views | INT | |
| enrollments | INT | |

#### `educational_resources`
| Column | Type | Notes |
|---|---|---|
| id | INT PK | |
| title | VARCHAR(255) | |
| description | TEXT | |
| resource_type | ENUM | `article`, `video`, `course`, `documentation`, `tutorial` |
| file_path | VARCHAR(500) | Relative path in uploads/ |
| external_url | VARCHAR(500) | External link |
| category | VARCHAR(100) | |
| tags | JSON | |
| uploaded_by | INT FK | Teacher user ID |
| file_size | INT | Bytes |
| file_type | VARCHAR(100) | MIME type |
| status | ENUM | `pending`, `approved`, `rejected` |
| views | INT | |
| downloads | INT | |

#### `notifications`
| Column | Type | Notes |
|---|---|---|
| id | INT PK | |
| user_id | INT FK | |
| type | VARCHAR(50) | `new_roadmap`, `new_resource`, `assignment_approved`, etc. |
| title | VARCHAR(255) | |
| message | TEXT | |
| link | VARCHAR(500) | Optional navigation link |
| is_read | BOOLEAN DEFAULT FALSE | |
| read_at | TIMESTAMP | |
| created_at | TIMESTAMP | |

#### `assessments`
| Column | Type | Notes |
|---|---|---|
| id | INT PK | |
| course_id | INT FK | |
| title | VARCHAR(255) | |
| description | TEXT | |
| time_limit | INT DEFAULT 30 | Minutes |
| created_by | INT FK | |

#### `assessment_questions`
| Column | Type | Notes |
|---|---|---|
| id | INT PK | |
| assessment_id | INT FK | |
| question | TEXT | |
| options | JSON | Array of 4 option strings |
| correct_answer | INT | Index 0–3 |
| explanation | TEXT | Shown after submission |
| order_index | INT | Display order |

#### `assessment_attempts`
| Column | Type | Notes |
|---|---|---|
| id | INT PK | |
| assessment_id | INT FK | |
| user_id | INT FK | |
| score | INT | Correct answers count |
| total_questions | INT | |
| answers | JSON | Map of question_id → selected index |
| completed_at | TIMESTAMP | |

### Supporting Tables
- `roadmap_enrollments` — links users to curated roadmaps (`user_id`, `roadmap_id`, `status`)
- `roadmap_courses` — links curated roadmaps to courses (`roadmap_id`, `course_id`)
- `roadmap_resources` — links resources to roadmap phases (`roadmap_id`, `resource_id`, `phase_index`, `match_score`)
- `teacher_course_assignments` — teacher requests to teach a course (`teacher_id`, `course_id`, `status`)
- `student_class_enrollments` — links students to a teacher's class (`student_id`, `course_id`, `teacher_id`)
- `student_engagement_metrics` — tracks student activity per teacher (`user_id`, `teacher_id`, `engagement_score`, `risk_level`)
- `student_resource_progress` — tracks resource views/ratings per student
- `feedback_messages` — teacher-to-student feedback messages
- `support_messages` — support chat messages (authenticated + guest)
- `teacher_settings` — per-teacher notification preferences
- `notification_preferences` — per-user notification preferences

---

## 5. User Roles & Permissions

### Role: `student`
- Default role assigned at registration
- Access: Student Dashboard only
- Can: browse & enroll in curated roadmaps, generate AI roadmaps, enroll in courses, take assessments, view teacher resources, use support chat, manage profile

### Role: `teacher`
- Requested at signup via `role_preference: 'teacher'`
- Account starts as `account_status: 'pending'` — must be approved by admin
- On first login: must select a course to teach (TeacherCourseSelection gate)
- After course assignment approved: can upload resources, monitor students, view analytics
- Access: Teacher Dashboard only
- Can: upload/manage educational resources, view enrolled students, send feedback, view resource analytics, manage profile & settings

### Role: `admin`
- Created directly in database or promoted by another admin
- Access: Admin Dashboard only
- Can: approve/reject teacher accounts, approve/reject teacher course assignments, approve/reject resources, manage all users, view platform analytics, handle support chat conversations

### Role: `bit`
- BiT academic staff — highest content authority
- Access: BiT Dashboard only
- Can: create/edit/delete/publish official roadmaps, create standalone courses and courses linked to roadmaps, view platform analytics
- Publishing a roadmap or adding a course auto-enrolls ALL active students and sends notifications

### Permission Matrix
| Action | student | teacher | admin | bit |
|---|---|---|---|---|
| View curated roadmaps | ✅ | ✅ | ✅ | ✅ |
| Enroll in roadmap | ✅ | — | — | — |
| Generate AI roadmap | ✅ | — | — | — |
| Create official roadmap | — | — | — | ✅ |
| Upload resources | — | ✅ (pending) | ✅ (auto-approved) | — |
| Approve resources | — | — | ✅ | — |
| Approve teacher accounts | — | — | ✅ | — |
| View all users | — | — | ✅ | — |
| Take assessments | ✅ | — | — | — |
| Create assessments | — | ✅ | ✅ | ✅ |
| View student progress | — | ✅ | ✅ | ✅ |

---

## 6. Backend Architecture

### Entry Point: `backend/public/index.php`
Every HTTP request enters here. It:
1. Sets CORS headers (allows `http://localhost:3000`)
2. Handles OPTIONS preflight requests
3. Sets `Content-Type: application/json` (except file serve requests)
4. Loads Composer autoloader
5. Loads `.env` via `vlucas/phpdotenv`
6. Creates a global `$db` PDO connection
7. Instantiates `Router` and calls `dispatch()`

### Router: `backend/routes/api.php`
A custom `Router` class that:
- Stores routes as `$routes[METHOD][path] = 'ControllerName@method'`
- `dispatch()` extracts the URI, matches exact routes first, then tries dynamic pattern matching (`:id` → regex capture)
- `callController()` requires the controller file, checks if it needs `$db` injection (NotificationController, TeacherController, StudentMonitoringController, AnalyticsController), instantiates it, and calls the method with URL params

### Controllers
Each controller handles one domain. Pattern:
- Constructor instantiates needed Models and JWTHelper
- Auth check via `$this->jwtHelper->getUserFromToken()` or `validateToken()`
- Input from `json_decode(file_get_contents("php://input"), true)`
- Output via `echo json_encode([...])`
- HTTP status via `http_response_code()`

| Controller | Domain |
|---|---|
| AuthController | Register, login, logout, token refresh |
| UserController | Profile CRUD, stats, activity, profile image |
| CourseController | Course CRUD, enrollment, progress tracking |
| RoadmapController | AI roadmap generation, save, delete |
| CuratedRoadmapController | Browse, view, enroll in official roadmaps |
| BitController | BiT roadmap & course management |
| AdminController | Resource moderation, user management, approvals, analytics |
| TeacherController | Teacher stats, activity, profile, settings |
| ResourceController | Teacher resource upload/manage, public browse |
| AssessmentController | Create, fetch, submit assessments |
| CourseAssignmentController | Teacher course request/approval workflow |
| StudentMonitoringController | Student progress tracking, feedback |
| AnalyticsController | Teacher resource analytics |
| NotificationController | CRUD for notifications + preferences |
| SupportController | Support chat (authenticated + guest) |
| AIController | Career suggestions, lesson content, assessments |
| PublicController | Public stats for landing page |
| UploadController | File upload & serve for course content |

### Models
Pure data-access objects using PDO prepared statements:
- `User` — CRUD, stats query, recent activity
- `Course` — CRUD, enrollment, progress update, XP update
- `Roadmap` — CRUD for user-generated AI roadmaps
- `CuratedRoadmap` — CRUD for official roadmaps, popular/categories queries
- `EducationalResource` — CRUD, approve/reject, views/downloads counters
- `SupportMessage` — CRUD for support chat messages

### JWTHelper: `backend/app/Helpers/JWTHelper.php`
- `generateToken($user)` — creates HS256 JWT with `user_id`, `email`, `role`, `iat`, `exp`
- `validateToken($token)` — decodes and validates, returns decoded object or `false`
- `getUserFromToken()` — reads `Authorization` header, validates token, fetches full user from DB

### Database: `backend/config/database.php`
Simple PDO wrapper. Reads `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` from `$_ENV`. Sets `ERRMODE_EXCEPTION` and `FETCH_ASSOC` as defaults.

---

## 7. API Reference

Base URL: `http://localhost:8000/api`

All protected endpoints require: `Authorization: Bearer <JWT_TOKEN>`

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login, returns token + user |
| POST | `/auth/logout` | Yes | Client-side token removal |
| POST | `/auth/refresh-token` | Yes | Get new JWT token |

**Register body:**
```json
{
  "name": "Abebe Kebede",
  "email": "abebe@bit.bdu.edu.et",
  "password": "password123",
  "role_preference": "student",
  "student_id": "BIT/123/14",
  "department": "Software Engineering",
  "academic_year": "3rd Year"
}
```

**Login response:**
```json
{
  "message": "Login successful",
  "token": "eyJ0eXAiOiJKV1Qi...",
  "user": { "id": 1, "name": "...", "email": "...", "role": "student", ... }
}
```

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users/profile` | Yes | Get full profile |
| PUT | `/users/profile` | Yes | Update name, academic_year |
| POST | `/users/profile/image` | Yes | Upload profile photo (multipart) |
| GET | `/users/stats` | Yes | Get XP, streak, courses enrolled, lessons completed |
| GET | `/users/activity` | Yes | Get recent enrollment activity |
| GET | `/users/courses` | Yes | Get enrolled courses with progress |
| GET | `/users/roadmaps` | Yes | Get user's saved AI roadmaps |

### Courses

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/courses` | No | Get all courses |
| GET | `/courses/:id` | Optional | Get single course (with progress if authed) |
| POST | `/courses/generate` | Yes | AI-generate a course for a role |
| POST | `/courses/:id/enroll` | Yes | Enroll in a course |
| DELETE | `/courses/:id/unenroll` | Yes | Unenroll from a course |
| PUT | `/courses/:id/progress` | Yes | Update lesson progress |

**Generate course body:** `{ "role": "Frontend Developer" }`

**Update progress body:**
```json
{ "progress": 45, "completed_lessons": ["Intro to HTML", "CSS Basics"] }
```

### Roadmaps

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/roadmaps/generate` | Yes | AI-generate a roadmap |
| POST | `/roadmaps` | Yes | Save a roadmap |
| DELETE | `/roadmaps/:id` | Yes | Delete own roadmap |

### Curated Roadmaps

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/curated-roadmaps` | No | Browse published roadmaps (filterable) |
| GET | `/curated-roadmaps/:id` | No | View single roadmap detail |
| POST | `/curated-roadmaps/:id/enroll` | Yes | Enroll in roadmap |
| GET | `/curated-roadmaps/:id/courses` | No | Get courses linked to roadmap |
| GET | `/curated-roadmaps/:id/resources` | No | Get resources linked to roadmap |

Query params for browse: `?category=Frontend Development&difficulty_level=beginner&search=react&limit=20&offset=0`

### Resources (Public)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/resources` | No | Browse approved resources |
| GET | `/resources/:id` | No | View resource (increments views) |
| POST | `/resources/:id/download` | No | Track download |
| GET | `/resources/course/:id` | No | Get teacher resources for a course |

### Teacher Resources

| Method | Endpoint | Auth (teacher/admin) | Description |
|---|---|---|---|
| GET | `/teacher/resources` | Yes | Get my uploaded resources |
| POST | `/teacher/resources` | Yes | Upload resource (multipart/form-data) |
| PUT | `/teacher/resources/:id` | Yes | Update resource |
| DELETE | `/teacher/resources/:id` | Yes | Delete resource |
| GET | `/teacher/resources/stats` | Yes | Get upload statistics |

**Upload resource form fields:** `title`, `description`, `resource_type`, `category`, `tags` (comma-separated), `external_url` OR `file` (binary)

### Teacher Dashboard

| Method | Endpoint | Auth (teacher/admin) | Description |
|---|---|---|---|
| GET | `/teacher/stats` | Yes | Resource stats, student count, ratings |
| GET | `/teacher/activity` | Yes | Recent resource updates + feedback |
| GET | `/teacher/at-risk-students` | Yes | Students with low engagement |
| GET | `/teacher/profile` | Yes | Full teacher profile |
| PUT | `/teacher/profile` | Yes | Update teacher profile |
| GET | `/teacher/settings` | Yes | Notification settings |
| PUT | `/teacher/settings` | Yes | Update settings |

### Student Monitoring

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/teacher/students` | teacher | Get students in my class |
| GET | `/teacher/students/:id/progress` | teacher | Get student's detailed progress |
| POST | `/teacher/feedback` | teacher | Send feedback to student |
| GET | `/teacher/feedback/:studentId` | teacher | Get feedback history |
| GET | `/feedback/unread` | student | Get unread feedback count |
| POST | `/student/track-access` | student | Track resource access |
| POST | `/student/rate-resource` | student | Rate a resource |

### Course Assignment Workflow

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/course-assignments/request` | teacher | Request to teach a course |
| GET | `/course-assignments/my` | teacher | Get my assignment status |
| GET | `/course-assignments/available` | any | Get all courses with teacher info |
| GET | `/course-assignments/my-students` | teacher | Get students in my class |
| GET | `/course-assignments/pending` | admin | Get pending requests |
| GET | `/course-assignments/all` | admin | Get all assignments |
| POST | `/course-assignments/:id/approve` | admin | Approve assignment |
| POST | `/course-assignments/:id/reject` | admin | Reject assignment |
| POST | `/course-assignments/enroll` | student | Enroll under a teacher |

### Admin

| Method | Endpoint | Auth (admin) | Description |
|---|---|---|---|
| GET | `/admin/analytics` | Yes | Full platform stats |
| GET | `/admin/users` | Yes | All users list |
| PUT | `/admin/users/:id/role` | Yes | Change user role |
| GET | `/admin/approvals/pending` | Yes | Pending teacher accounts |
| POST | `/admin/approvals/:id/approve` | Yes | Approve teacher account |
| POST | `/admin/approvals/:id/reject` | Yes | Reject teacher account |
| GET | `/admin/resources` | Yes | All resources (filterable) |
| POST | `/admin/resources` | Yes | Create resource |
| PUT | `/admin/resources/:id` | Yes | Update resource |
| DELETE | `/admin/resources/:id` | Yes | Delete resource |
| POST | `/admin/resources/:id/approve` | Yes | Approve resource + notify students |
| POST | `/admin/resources/:id/reject` | Yes | Reject resource |
| GET | `/admin/resources/pending` | Yes | Pending resources queue |

### BiT Dashboard

| Method | Endpoint | Auth (bit) | Description |
|---|---|---|---|
| POST | `/bit/roadmaps` | Yes | Create roadmap |
| GET | `/bit/roadmaps` | Yes | Get all roadmaps |
| GET | `/bit/roadmaps/:id` | Yes | Get single roadmap |
| PUT | `/bit/roadmaps/:id` | Yes | Update roadmap |
| DELETE | `/bit/roadmaps/:id` | Yes | Delete roadmap |
| POST | `/bit/roadmaps/:id/publish` | Yes | Publish + auto-enroll all students |
| POST | `/bit/roadmaps/:id/course` | Yes | Add course to roadmap |
| GET | `/bit/courses` | Yes | Get all courses |
| POST | `/bit/courses/standalone` | Yes | Create standalone course |
| DELETE | `/bit/courses/:id` | Yes | Delete course |
| GET | `/bit/analytics` | Yes | BiT analytics |

### Assessments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/assessments` | student | Get assessments for enrolled courses |
| GET | `/assessments/:id` | Yes | Get assessment with questions (no answers) |
| GET | `/assessments/:id/questions-admin` | bit/admin/teacher | Get questions with correct answers |
| GET | `/assessments/course/:id` | bit/admin/teacher | Get assessments for a course |
| POST | `/assessments` | Yes | Create assessment with questions |
| POST | `/assessments/:id/submit` | Yes | Submit answers, get results |
| DELETE | `/assessments/:id` | bit/admin/teacher | Delete assessment |

### Notifications

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | Yes | Get notifications (supports `?unread_only=true`) |
| GET | `/notifications/unread-count` | Yes | Get unread count |
| PUT | `/notifications/:id/read` | Yes | Mark one as read |
| PUT | `/notifications/mark-all-read` | Yes | Mark all as read |
| DELETE | `/notifications/:id` | Yes | Delete notification |
| GET | `/notifications/preferences` | Yes | Get preferences |
| PUT | `/notifications/preferences` | Yes | Update preferences |

### Support Chat

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/support/messages` | Yes | Get conversation with admin |
| POST | `/support/messages` | Yes | Send message to admin |
| GET | `/admin/support/conversations` | admin | Get all user conversations |
| GET | `/admin/support/messages/:userId` | admin | Get messages with a user |
| DELETE | `/admin/support/messages/:id` | admin | Delete a message |
| GET | `/public/support/messages/:guestId` | No | Get guest conversation |
| POST | `/public/support/messages` | No | Send guest message |

### AI

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/ai/career-suggestion` | No | Get career suggestion from interests |
| POST | `/ai/career-details` | No | Get detailed career info |
| POST | `/ai/lesson-content` | No | Generate lesson markdown content |
| POST | `/ai/generate-assessment` | No | Generate quiz questions for a course |

### Public

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/stats` | No | Platform stats for landing page |
| POST | `/upload` | Yes | Upload course content file |
| GET | `/uploads/serve` | No | Serve uploaded file |

---

## 8. Frontend Architecture

### State Management
The app uses React's built-in `useState` — no Redux or Zustand. All global state lives in `App.tsx`:

| State | Type | Purpose |
|---|---|---|
| `view` | string enum | Current page/view being rendered |
| `user` | `User \| null` | Authenticated user object |
| `loading` | boolean | Initial auth check loading state |
| `theme` | `'light' \| 'dark'` | Persisted in localStorage |
| `systemStats` | object | Landing page counters from `/api/stats` |
| `initialDashboardTab` | string | Deep-link to a specific dashboard tab |

### View Routing
`App.tsx` uses a string-based view switcher (no React Router). Views:
`home`, `login`, `signup`, `onboarding`, `dashboard`, `mission`, `faq`, `chat`, `user-guide`, `privacy`, `terms`

Navigation is handled by `navigateTo(view, tab?)` which also guards the dashboard — if `user` is null and `dashboard` is requested, it redirects to `login`.

### Auth Flow on Mount
```
App mounts
  → checkAuth()
    → getToken() from localStorage
    → if token exists: apiClient.getProfile() → normalizeUser()
      → success: setUser(profile), setView('dashboard')
      → failure: clear localStorage, setUser(null)
  → setLoading(false)
  → fetch public stats from /api/stats
```

### DashboardRouter
Lazy-loads the correct dashboard layout based on `user.role` using `React.lazy` + `Suspense`. Shows a spinner fallback while the chunk loads. Falls back to StudentDashboardLayout with a warning banner for unknown roles.

### apiClient.ts — normalizeUser()
All API responses that return a user object pass through `normalizeUser()` which:
- Converts `id` to string
- Maps `academic_year` (snake_case) → `academicYear` (camelCase)
- Defaults `enrolledPaths` to `[]` (not in DB, frontend-only concept)
- Casts `xp` and `streak` to numbers
- Passes through `account_status` and `profile_image`

### Tailwind Theme
Custom colors defined in `tailwind.config.js`:
- `careermap-navy` — deep navy `#02436D` (primary brand, sidebar backgrounds)
- `careermap-teal` — teal `#0D9488` (active states, CTAs, accents)
- `portal-student` — blue `#2563EB`
- `portal-teacher` — teal `#0D9488`
- `portal-admin` — indigo `#4F46E5`
- `portal-bit` — sky `#0284C7`

Custom fonts: `Plus Jakarta Sans` (sans), `Fredoka` (display)

Custom animations: `reveal`, `float`, `pulse-slow`, `slide-up`

### Component Patterns

**Dashboard Layouts** (Student, Teacher, Admin, BiT) all share:
- Collapsible sidebar with drag-to-resize (200px–480px range)
- Sticky top header with page title + NotificationBell
- `renderContent()` switch statement for tab routing
- Dark/light theme toggle
- Logout button

**NotificationBell**
- Polls `/api/notifications/unread-count` every 30 seconds
- Opens dropdown on click, fetches latest 10 notifications
- Supports mark-as-read, mark-all-read, delete
- Closes on outside click

**Skeleton Components** (`Skeleton.tsx`)
- `AppLoadingSkeleton` — full-page loading state
- `CardGridSkeleton` — grid of placeholder cards
- Used while API data loads to prevent layout shift

### Key Frontend Services

**`apiClient.ts`** — single object with all API methods. Handles token storage (`auth_token` in localStorage), request headers, and response normalization.

**`courseService.ts`** — thin wrappers around `apiClient` for course-specific operations (`getUserCourses`, `getStudentStats`, `getRecentActivity`, `createCourseFromRoadmap`, `enrollInCourse`).

**`notificationService.ts`** — wraps notification API calls with typed `Notification` interface.

---

## 9. Authentication System

### JWT Configuration
- Algorithm: HS256
- Expiry: 86400 seconds (24 hours) — configurable via `JWT_EXPIRY` env var
- Secret: set via `JWT_SECRET` env var
- Payload: `{ iat, exp, user_id, email, role }`

### Token Storage
Tokens are stored in `localStorage` under the key `auth_token`. This is simple but means tokens are accessible to JavaScript — acceptable for a university internal tool but should be moved to `httpOnly` cookies for production.

### Registration Validation (AuthController)
The backend enforces strict name validation:
- Minimum 5 characters, maximum 50
- Must contain at least 2 words (first + father name convention)
- Only letters, spaces, hyphens, apostrophes allowed
- No repeated characters (e.g. `aaaa`)
- No double spaces
- No HTML tags or SQL injection patterns
- Email must pass `FILTER_VALIDATE_EMAIL`
- Email must be unique

### Teacher Registration Flow
1. User signs up with `role_preference: 'teacher'`
2. Backend sets `role: 'teacher'`, `account_status: 'pending'`
3. Teacher logs in → sees "Pending Approval" screen
4. Admin approves → `account_status: 'active'`
5. Teacher logs in again → sees TeacherCourseSelection gate
6. Teacher selects a course → `POST /course-assignments/request`
7. Admin approves assignment → teacher can now upload resources

### Session Persistence
On every app mount, `App.tsx` calls `apiClient.getProfile()` to verify the stored token is still valid. If the backend returns 401 (expired/invalid), localStorage is cleared and the user is sent to the home page.

---

## 10. AI System

### Architecture
The AI system uses a **provider chain with automatic fallback**. The `AiManager` class tries providers in order until one succeeds.

```
AiService (public API)
    └── AiManager (orchestrator)
            ├── GroqProvider      (primary)
            ├── OpenRouterProvider (backup)
            └── OllamaProvider    (local fallback)
```

### Provider Order
Configured via `AI_PROVIDER_ORDER` env var (default: `groq,openrouter,ollama`). Each provider is skipped if its API key is not set (`isAvailable()` returns false).

### AiProviderInterface
All providers implement:
- `generate($prompt, $options)` — returns string/array/null
- `getName()` — returns provider name string
- `isAvailable()` — returns bool (checks if API key is set)

### BaseProvider
Shared `makeRequest()` method using PHP cURL. Handles JSON encoding/decoding and error logging. `cleanJson()` strips markdown code fences from AI responses before JSON parsing.

### GroqProvider
- API: `https://api.groq.com/openai/v1/chat/completions`
- Model: `llama-3.3-70b-versatile` (configurable via `GROQ_MODEL`)
- Supports `response_format: {type: 'json_object'}` for structured JSON output
- Max tokens: 4096

### OpenRouterProvider
- API: `https://openrouter.ai/api/v1/chat/completions`
- Model: `google/gemini-2.0-flash-001` (configurable via `OPENROUTER_MODEL`)
- Requires `HTTP-Referer` and `X-Title` headers
- Max tokens: 4096

### OllamaProvider
- API: `http://localhost:11434` (configurable via `OLLAMA_HOST`)
- Model: `llama3` (configurable via `OLLAMA_MODEL`)
- Local — no API key needed, but requires Ollama installed and running

### AI Features

#### Career Suggestion
Endpoint: `POST /ai/career-suggestion`
Input: `{ "interests": "I like building websites and design" }`
Output: `{ "career": "...", "reason": "...", "topSkills": [...], "difficulty": "..." }`

#### Roadmap Generation
Endpoint: `POST /roadmaps/generate`
Generates a 4-phase roadmap with topics and resources for a given career role. Returns structured JSON with `title`, `description`, `role`, `phases[]`.

#### Course Generation
Endpoint: `POST /courses/generate`
Two-step process:
1. Generate course structure (modules + lesson titles with `[CONTENT_PENDING]`)
2. For each lesson, call `generateLessonContent()` to fill in full Markdown content
All content is generated upfront and saved to the database. The creator is auto-enrolled.

#### Lesson Content Generation
Endpoint: `POST /ai/lesson-content`
Generates 400–600 word Markdown lesson content for a specific lesson title within a module and course context. Returns raw Markdown (not JSON).

#### Assessment Generation
Endpoint: `POST /ai/generate-assessment`
Generates N multiple-choice questions with 4 options, correct answer index, and explanation for each. Returns structured JSON.

#### Career Details
Endpoint: `POST /ai/career-details`
Generates comprehensive career info: overview, market insights, salary range, required skills, learning path, job opportunities, growth potential, daily responsibilities. Falls back to mock data if AI fails.

---

## 11. Feature Walkthroughs

### Student: Enrolling in a Curated Roadmap
1. Student logs in → lands on Student Dashboard Overview
2. Clicks "Career Roadmaps" in sidebar → `CuratedRoadmapsView`
3. Browses roadmaps (filterable by category, difficulty, search)
4. Clicks a roadmap card → detail view loads with phases, linked courses, market data
5. Clicks "Start This Path" → `POST /curated-roadmaps/:id/enroll`
6. Success dialog shown → roadmap marked as active
7. Linked courses appear in the sidebar — clicking opens `LibraryView`

### Student: Taking an AI-Generated Course
1. Student clicks "Curated Learning" → `LibraryView`
2. Clicks "New Course" → `RoadmapGenerator` (AI course generator)
3. Enters a career role → `POST /courses/generate`
4. Backend generates full course with all lesson content pre-filled
5. Student is auto-enrolled → course appears in "My Courses"
6. Student opens course → `CourseView` with module/lesson tree
7. Completes lessons → `PUT /courses/:id/progress` updates progress + awards XP
8. At 100% → assessment becomes available

### Student: Taking an Assessment
1. Student clicks "Skill Verification" → `AssessmentView`
2. Sees list of assessments for enrolled courses
3. Clicks "Initiate" → loads questions (correct answers hidden)
4. Answers questions one by one with navigation
5. Submits → `POST /assessments/:id/submit`
6. Results shown: score, percentage, per-question breakdown with explanations
7. If ≥70%: XP awarded, course marked 100% complete

### Teacher: Uploading a Resource
1. Teacher logs in → if no course selected: `TeacherCourseSelection` gate
2. Selects a course → `POST /course-assignments/request`
3. Admin approves → teacher gets notification
4. Teacher goes to "My Resources" → `TeacherResourcesView`
5. Clicks upload → fills form (title, description, type, category, tags)
6. Attaches file (PDF/PPTX/video/image up to 50MB) or external URL
7. `POST /teacher/resources` (multipart/form-data)
8. Resource saved as `pending` (or `approved` if teacher has approved assignment)
9. Admin sees it in pending queue → approves → all students notified

### Admin: Approving a Teacher Account
1. Admin logs in → sees badge on "Pending Approvals" menu item
2. Clicks "Pending Approvals" → `AdminApprovalsView`
3. Sees list of pending teacher registrations with their credentials
4. Reviews institution, experience, expertise areas
5. Clicks "Approve" → `POST /admin/approvals/:id/approve`
6. Teacher's `account_status` → `active`, `role` → `teacher`
7. Teacher can now access full Teacher Dashboard

### BiT: Publishing a Roadmap
1. BiT user logs in → `BiTDashboardLayout`
2. Clicks "Roadmaps" → `BiTRoadmapsView`
3. Creates roadmap with phases and topics
4. Clicks "Publish" → `POST /bit/roadmaps/:id/publish`
5. Backend: all active students get `roadmap_enrollments` record + notification
6. BiT adds a course to the roadmap → `POST /bit/roadmaps/:id/course`
7. All active students get `course_enrollments` record + notification

### Notification Flow
Notifications are created server-side in these events:
- BiT publishes a roadmap → all students notified
- BiT/Admin adds a course → all students notified
- Admin approves a resource → all students notified
- Admin approves teacher account → teacher notified
- Admin approves/rejects course assignment → teacher notified
- Teacher requests course assignment → all admins notified

The `NotificationBell` component polls `/api/notifications/unread-count` every 30 seconds and shows a red badge with the count.

### Support Chat
- Authenticated users: `GET/POST /support/messages` — chat with admin (default admin ID: 1)
- Guest users: generate a UUID as `guest_id`, use `GET/POST /public/support/messages/:guestId`
- Admin: sees all conversations in `AdminSupportView`, can reply and delete messages
- Public chat page (`PublicChatPage`) is accessible from the landing page footer

---

## 12. Environment Configuration

### Backend: `backend/.env`

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=careerguide
DB_USER=root
DB_PASS=

# JWT
JWT_SECRET=your_very_strong_secret_key_here
JWT_EXPIRY=86400

# AI Providers (set at least one)
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile

OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=google/gemini-2.0-flash-001

OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3

# AI provider fallback order
AI_PROVIDER_ORDER=groq,openrouter,ollama

# App
APP_ENV=development
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

### Frontend: `frontend/.env`

```env
VITE_API_URL=http://localhost:8000/api
```

Note: The `API_BASE_URL` in `apiClient.ts` is currently hardcoded to `http://localhost:8000/api`. For production, update this to use `import.meta.env.VITE_API_URL`.

---

## 13. Setup & Installation

### Prerequisites
- Node.js 18+
- PHP 8.0+
- MySQL 5.7+ or MariaDB 10.3+
- Composer
- At least one AI provider API key (Groq recommended — free tier available at console.groq.com)

### Backend Setup

```bash
# 1. Install PHP dependencies
cd backend
composer install

# 2. Configure environment
cp .env.example .env
# Edit .env with your DB credentials and AI API keys

# 3. Create database and run schema
mysql -u root -p -e "CREATE DATABASE careerguide;"
mysql -u root -p careerguide < database/schema.sql

# 4. Start PHP development server
cd public
php -S localhost:8000
```

The default admin account created by the schema:
- Email: `admin@bit.bdu.edu.et`
- Password: `password`

### Frontend Setup

```bash
# 1. Install Node dependencies
cd frontend
npm install

# 2. Start development server
npm run dev
# Runs on http://localhost:3000
```

### Build for Production

```bash
# Frontend
cd frontend
npm run build
# Output in frontend/dist/

# Backend: deploy the backend/ folder to a PHP-capable server
# Point document root to backend/public/
# Ensure mod_rewrite is enabled (Apache) or configure Nginx
# Update CORS origin in backend/public/index.php to your production domain
```

### Quick Start Scripts
The root directory contains:
- `QUICK_START.ps1` — Windows PowerShell script to start both servers
- `QUICK_START.sh` — Unix/Mac bash script to start both servers

---

## Notes on Known Behaviors

- **`enrolledPaths`** — This field exists in the frontend `User` interface but has no corresponding database column. It defaults to `[]` via `normalizeUser()`. It is only populated client-side after onboarding (`handleOnboardingComplete` in `App.tsx`).

- **Assessment auto-create tables** — `AssessmentController` calls `ensureTables()` on every request to create assessment tables if they don't exist. This is a migration workaround.

- **CourseController schema check** — `CourseController` checks for `progress` and `completed_lessons` columns on every instantiation and adds them if missing. Same pattern.

- **AdminController inline migrations** — `AdminController::ensureUserColumns()` runs `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for all teacher-related user columns. Safe to run repeatedly.

- **CORS** — Currently hardcoded to `http://localhost:3000`. Update `backend/public/index.php` for production deployment.

- **File uploads** — Stored in `backend/uploads/`. Max size: 50MB. Allowed types: PDF, DOC, DOCX, PPT, PPTX, MP4, MPEG, MOV, JPG, PNG, GIF. Served via `GET /api/uploads/serve?file=filename&type=profile|resource`.
