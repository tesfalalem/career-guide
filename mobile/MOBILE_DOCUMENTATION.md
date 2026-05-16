# BiT CareerGuide — Mobile App Documentation

## Overview

The BiT CareerGuide mobile app is a **Flutter-based student portal** for Bahir Dar Institute of Technology (BiT) students. It is a companion to the web platform, sharing the same PHP backend and MySQL database. The mobile app is **student-only** — all roles (student, teacher, admin, BiT) are redirected to the student portal when they log in on mobile.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Flutter | 3.x | Cross-platform mobile framework |
| Dart | 3.x | Programming language |
| flutter_riverpod | 2.6.1 | State management |
| go_router | 13.2.5 | Navigation & routing |
| Dio | 5.4.3 | HTTP client |
| flutter_secure_storage | 9.2.4 | Secure JWT token storage (mobile) |
| shared_preferences | 2.5.3 | Token storage fallback (web) |
| flutter_markdown | 0.6.23 | Render lesson content (Markdown) |
| timeago | 3.6.1 | Relative timestamps in notifications |
| intl | 0.19.0 | Date formatting |

**Platforms:** Android, iOS

---

## Project Structure

```
mobile/
├── lib/
│   ├── main.dart                          # App entry point
│   ├── core/
│   │   ├── constants/
│   │   │   └── api_constants.dart         # All API endpoint paths + base URL
│   │   ├── models/
│   │   │   ├── user_model.dart            # UserModel with fromJson, helpers
│   │   │   ├── course_model.dart          # CourseModel, CourseModuleModel, LessonModel
│   │   │   ├── roadmap_model.dart         # CuratedRoadmapModel, RoadmapPhaseModel
│   │   │   └── notification_model.dart    # NotificationModel
│   │   ├── network/
│   │   │   └── api_client.dart            # Dio HTTP client + token management
│   │   ├── providers/
│   │   │   ├── auth_provider.dart         # Auth state (login/logout/session)
│   │   │   └── theme_provider.dart        # Dark/light theme toggle
│   │   ├── router/
│   │   │   └── app_router.dart            # go_router with auth redirect
│   │   └── theme/
│   │       └── app_theme.dart             # AppColors, light/dark ThemeData
│   ├── features/
│   │   ├── auth/
│   │   │   └── screens/
│   │   │       ├── splash_screen.dart     # Loading screen on app start
│   │   │       ├── login_screen.dart      # Email/password login
│   │   │       ├── register_screen.dart   # 2-step student registration
│   │   │       └── onboarding_screen.dart # Skips directly to dashboard
│   │   ├── student/
│   │   │   ├── providers/
│   │   │   │   └── student_providers.dart # Riverpod FutureProviders for student data
│   │   │   └── screens/
│   │   │       ├── student_shell.dart     # Bottom nav + drawer scaffold
│   │   │       ├── student_home_screen.dart
│   │   │       ├── roadmaps_screen.dart
│   │   │       ├── roadmap_detail_screen.dart
│   │   │       ├── courses_screen.dart
│   │   │       ├── course_detail_screen.dart
│   │   │       ├── assessments_screen.dart
│   │   │       ├── assessment_quiz_screen.dart
│   │   │       ├── progress_screen.dart
│   │   │       └── student_profile_screen.dart
│   │   └── shared/
│   │       └── screens/
│   │           ├── notifications_screen.dart
│   │           └── support_chat_screen.dart
│   └── shared/
│       └── widgets/
│           ├── app_drawer.dart            # Slide-in navigation drawer
│           ├── app_header.dart            # Reusable top AppBar
│           ├── gradient_card.dart         # GradientCard, InfoCard, QuickActionTile
│           ├── app_button.dart            # AppButton, AppTealButton
│           ├── app_text_field.dart        # Styled text input
│           ├── stat_card.dart             # Stats display card
│           └── section_header.dart        # Section title with optional action
├── android/                               # Android native project
├── ios/                                   # iOS native project
├── pubspec.yaml                           # Dependencies
├── analysis_options.yaml                  # Linting config
└── MOBILE_DOCUMENTATION.md               # This file
```

---

## Architecture

### State Management — Riverpod

The app uses **Riverpod** for all state. Key providers:

| Provider | Type | Purpose |
|---|---|---|
| `authProvider` | `StateNotifierProvider` | Auth state — `AsyncValue<UserModel?>` |
| `currentUserProvider` | `Provider` | Convenience — current user or null |
| `themeModeProvider` | `StateNotifierProvider` | Dark/light theme |
| `studentStatsProvider` | `FutureProvider` | XP, courses, streak, lessons |
| `enrolledCoursesProvider` | `FutureProvider` | Student's enrolled courses |
| `allCoursesProvider` | `FutureProvider` | All available courses (browse) |
| `curatedRoadmapsProvider` | `FutureProvider.family` | Roadmaps with optional filters |
| `roadmapDetailProvider` | `FutureProvider.family` | Single roadmap by ID |
| `studentAssessmentsProvider` | `FutureProvider` | Assessments for enrolled courses |
| `recentActivityProvider` | `FutureProvider` | Recent enrollment activity |

### Navigation — go_router

All routes are defined in `app_router.dart`. The router uses a `redirect` function to handle auth:

```
App starts → /splash
  → No token → /login
  → Token exists → /student (all roles)
```

**Route tree:**
```
/splash
/login
/register
/onboarding
/student                    (StudentShell — bottom nav + drawer)
  /student/roadmaps
    /student/roadmaps/:id
  /student/courses
    /student/courses/:id
  /student/assessments
    /student/assessments/:id
  /student/progress
  /student/profile
/notifications              (pushed, not in shell)
/support                    (pushed, not in shell)
```

### API Client

`ApiClient` uses **Dio** with a request interceptor that automatically attaches the JWT token to every request:

```dart
// Token storage — platform-aware
// Mobile: FlutterSecureStorage (encrypted)
// Web:    SharedPreferences (fallback)
ApiClient.getToken()
ApiClient.saveToken(token)
ApiClient.removeToken()
```

**Base URL logic** (auto-detected by platform):
- Chrome/Web: `http://localhost:8000/api`
- Android emulator: `http://10.0.2.2:8000/api`
- Physical device: update `api_constants.dart` with your PC's local IP

---

## Screens

### Splash Screen
Shown on app start while `_checkAuth()` runs. Displays the CareerGuide logo and spinner. Resolves in milliseconds (no network call on startup).

### Login Screen
- Email + password fields with validation
- Shows error banner on failed login
- "Continue" submit button
- Link to Register

### Register Screen
Two-step form:
1. Full name, email, password, role selection (student/teacher)
2. Student ID, academic year dropdown

### Student Home Screen
- Gradient welcome card with user initials avatar
- 2×2 stats grid: XP, Courses, Streak, Lessons Done
- Quick action tiles: Roadmaps, Courses, Assess, Progress
- Explore cards linking to main sections
- Support chat shortcut

### Roadmaps Screen
- Search bar with clear button
- Animated filter chips: All / Beginner / Intermediate / Advanced
- List of `CuratedRoadmapModel` cards showing category, difficulty, duration, enrollment count

### Roadmap Detail Screen
- Hero `SliverAppBar` with gradient background
- Meta row: duration, phases count, enrolled count
- Description text
- Enroll button (disabled after enrollment, shows success/error feedback)
- Expandable phase accordion with topics list

### Courses Screen
- Tabbed: **My Courses** | **Browse All**
- Search via `SearchDelegate` (magnifier icon in header)
- Course cards with level badge, rating, progress bar (enrolled courses), duration, module count

### Course Detail Screen
- Hero `SliverAppBar` with gradient
- Progress bar (if enrolled)
- Expandable module/lesson curriculum tree
- Tap any lesson → opens **Lesson Viewer**

### Lesson Viewer (inside Course Detail)
- Full-screen lesson content
- Progress bar in AppBar showing lesson N of total
- Renders: Markdown, HTML (stripped tags), JSON block arrays (text, links)
- Previous / Next Lesson navigation
- "Complete" button on last lesson

### Assessments Screen
- Cards per assessment: title, course name, time limit, question count, attempt count
- Score badge (green ≥70%, red <70%)
- "Start Assessment" / "Retake Assessment" button

### Assessment Quiz Screen
- Progress bar in AppBar (question N of total)
- Question text + 4 option buttons with animated selection highlight
- Previous / Next navigation
- Submit button (enabled only when all answered)
- Result screen: score %, pass/fail icon, per-question breakdown with explanations

### Progress Screen
- 2×2 stats grid: XP, Courses, Lessons, Streak
- XP progress bar showing progress to next level
- Recent activity feed (course enrollments)

### Student Profile Screen
- Gradient circle avatar with initials
- Info tiles: Academic Year, Student ID, Department, Email
- Theme toggle switch
- Notifications settings tile
- Logout button

### Notifications Screen
- List of notifications with type icons and relative timestamps
- Swipe-to-delete
- "Mark all read" action in header

### Support Chat Screen
- Chat UI with message bubbles (sent/received)
- Text input with send button
- Connects to admin support via `/api/support/messages`

---

## Shared Widgets

### `AppDrawer`
Slide-in navigation drawer used by `StudentShell`. Contains:
- Header with gradient background, user initials, name, role badge
- Navigation items with active highlight
- Notifications and Support shortcuts
- Theme toggle
- Logout button

**Usage:**
```dart
Scaffold(
  drawer: AppDrawer(
    items: _drawerItems,
    currentPath: location,
    accentColor: AppColors.teal,
  ),
  body: child,
)
```

### `AppHeader`
Consistent top AppBar across all screens.
```dart
AppHeader(
  title: 'Career Roadmaps',
  showLogo: false,          // show CareerGuide logo instead of title
  showDrawerButton: true,   // show hamburger menu (default true)
  actions: [...],           // optional action buttons
)
```

### `GradientCard`
Hero card with gradient background, badge, title, subtitle.
```dart
GradientCard(
  badge: 'STUDENT PORTAL',
  title: 'Hello, Abebe 👋',
  subtitle: 'Ready to level up today?',
  colors: [AppColors.navy, Color(0xFF0369A1)],
  trailing: CircleAvatar(...),
)
```

### `InfoCard`
Stat card with icon, value, label.
```dart
InfoCard(
  label: 'Credits (XP)',
  value: '250',
  icon: Icons.bolt_rounded,
  color: AppColors.warning,
  onTap: () {},
)
```

### `QuickActionTile`
Compact action button used in home screen quick actions row.
```dart
QuickActionTile(
  icon: Icons.map_rounded,
  label: 'Roadmaps',
  color: AppColors.navy,
  onTap: () => context.go('/student/roadmaps'),
)
```

---

## Color System

Defined in `AppColors` (matches web platform exactly):

| Name | Hex | Usage |
|---|---|---|
| `navy` | `#02436D` | Primary brand, headers, buttons |
| `teal` | `#0D9488` | Active states, CTAs, accents |
| `tealLight` | `#14B8A6` | Progress bars, highlights |
| `studentBlue` | `#2563EB` | Student role badge |
| `success` | `#10B981` | Pass states, enrolled |
| `warning` | `#F59E0B` | XP, streak, pending |
| `error` | `#EF4444` | Fail states, logout |
| `slate50–950` | — | Neutral grays for backgrounds, borders, text |

---

## Setup & Running

### Prerequisites
- Flutter SDK 3.x (`flutter --version`)
- Android Studio with Android emulator **or** physical Android/iOS device
- PHP backend running (`cd backend/public && php -S 0.0.0.0:8000`)

### Install dependencies
```bash
cd mobile
flutter pub get
```

### Configure API URL
Edit `mobile/lib/core/constants/api_constants.dart`:

```dart
static String get baseUrl {
  if (kIsWeb) return 'http://localhost:8000/api';
  return 'http://10.0.2.2:8000/api';  // Android emulator
  // Physical device: use your PC's local IP, e.g. http://192.168.1.x:8000/api
}
```

### Run on Android emulator
```bash
flutter run
```

### Run on physical device
1. Enable Developer Options on phone → USB Debugging
2. Connect via USB
3. Update `baseUrl` to your PC's local IP (run `ipconfig` to find it)
4. Ensure backend runs with `php -S 0.0.0.0:8000`
5. Open Windows Firewall for port 8000:
   ```powershell
   netsh advfirewall firewall add rule name="PHP Dev" dir=in action=allow protocol=TCP localport=8000
   ```
6. `flutter run -d android`

### Build APK
```bash
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

---

## Authentication Flow

```
App launch
  └── _checkAuth() [instant, no network]
        ├── No token → /login
        └── Token exists → /student

Login
  └── POST /api/auth/login
        ├── Save JWT to FlutterSecureStorage (mobile) / SharedPreferences (web)
        └── Set user state → router redirects to /student

Logout
  └── POST /api/auth/logout (fire-and-forget)
  └── Remove token from storage
  └── Clear user state → router redirects to /login
```

**Token storage:**
- Mobile: `FlutterSecureStorage` (encrypted, hardware-backed on Android)
- Web: `SharedPreferences` (fallback, since SecureStorage doesn't work in browser)
- Both storages are written simultaneously on save for reliability

---

## Data Flow Example — Loading Roadmaps

```
RoadmapsScreen mounts
  └── ref.watch(curatedRoadmapsProvider(filters))
        └── FutureProvider calls ApiClient.get('/curated-roadmaps?...')
              └── Dio adds Authorization header from token
                    └── PHP backend returns JSON array
                          └── List<CuratedRoadmapModel>.fromJson(...)
                                └── UI renders ListView of _RoadmapCard widgets
```

---

## Known Behaviors

- **All roles use student portal on mobile** — teachers, admins, and BiT users who log in on mobile see the student dashboard. The web platform handles role-specific portals.
- **Token refresh** — there is no automatic token refresh. If the token expires (24h), the user is silently logged out on the next API call that returns 401.
- **Offline** — the app has no offline mode. All data requires an active connection to the backend.
- **IP changes** — if your PC's IP changes (e.g. reconnecting to WiFi), update `baseUrl` in `api_constants.dart` and hot-restart.
