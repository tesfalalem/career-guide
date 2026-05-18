# BiT CareerGuide — Flutter Mobile Application Documentation

Welcome to the official developer documentation for the **BiT CareerGuide Flutter Mobile Application** (`careerguide_mobile`). This document outlines the application's design system, structural architecture, state management architecture, API synchronization pipeline, core features, and setup guides.

---

## 📱 1. Architecture Overview & Technology Stack

The `careerguide_mobile` client is built as a cross-platform Flutter application supporting iOS, Android, and Web, with a custom, highly decoupled folder structure. It leverages a modern reactive programming paradigm to deliver high performance, instant database synchronization, and premium visual aesthetics.

### Key Technology Stack:
- **Core Framework**: Flutter SDK (`>=3.0.0 <4.0.0`) using Dart 3.
- **State Management**: **Flutter Riverpod** (`^2.5.1`) with `riverpod_generator` and `riverpod_annotation`. It employs a unidirectional data-flow, ensuring widget rendering is perfectly separated from service/business logic.
- **Declarative Navigation**: **GoRouter** (`^13.2.0`) for deep-linkable, compile-safe, and parameter-aware route declarations.
- **HTTP Client / Networking**: **Dio** (`^5.4.3`) configured with global interceptors for JWT token propagation, custom request timeouts, and console debugging using `pretty_dio_logger`.
- **Session & Secure Storage**: **Flutter Secure Storage** (`^9.0.0`) for keychain/keystore secured encryption of the JWT authorization tokens.
- **UI & Markdown Engine**: `flutter_markdown` for rendering complex, interactive lesson modules and course syllabi containing headers, links, and syntax-highlighted blocks.
- **Asset/Media Pipeline**: `image_picker` and `file_picker` for capturing student profile photos, coordinator course files, or teacher course slides and transferring them as multi-part payloads to the backend.

---

## 📂 2. Project Directory Structure

The project conforms to a highly structured modular layout, grouping codes by **Core Infrastructure** (global settings) and **Feature Boundaries** (role-specific features).

```
mobile/
├── android/                  # Android-native configuration and resources
├── ios/                      # iOS-native configuration and runner profiles
├── lib/
│   ├── core/                 # Global, cross-cutting concerns & infrastructure
│   │   ├── constants/        # API route constants and platform configurations
│   │   ├── models/           # Shared models (User, Course, Module, Lesson)
│   │   ├── network/          # Http client services and interceptor systems
│   │   ├── providers/        # Global states (Auth provider, theme states)
│   │   ├── router/           # Declarative navigation tree (GoRouter mappings)
│   │   └── theme/            # HSL-based palettes and active style sheets
│   │
│   ├── features/             # Role-specific vertical modules
│   │   ├── auth/             # Login, signup, pending approval, onboarding, splash
│   │   ├── student/          # Student dashboard, roadmaps, quizzes, progress tracking
│   │   ├── teacher/          # Teacher dashboard, student analytics, file uploads
│   │   ├── bit/              # Coordinator roadmap & stage publishers, course managers
│   │   ├── admin/            # Platform coordinator and teacher approvals screen
│   │   └── shared/           # Role-specific shared widgets (e.g. navigation shells)
│   │
│   ├── shared/               # Global components shared across ALL features
│   │   └── widgets/          # AppDrawer, AppButton, GradientCard, StatCard
│   │
│   └── main.dart             # Application initialization and Riverpod setup
│
├── assets/                   # Raw icons, illustrations, and local fonts
└── pubspec.yaml              # Global Flutter dependencies configuration
```

---

## 🛠️ 3. Global Core Infrastructure

### A. HTTP Service & Authorization Layer (`lib/core/network/`)
Network communication is encapsulated in a central `Dio` client. It registers a custom Request Interceptor that automatically reads the saved JWT token from `FlutterSecureStorage` and appends it to the HTTP `Authorization` headers:

```dart
options.headers['Authorization'] = 'Bearer $token';
```

If the API returns an `HTTP 401 Unauthorized` status (e.g., token expired), the interceptor catches the response, purges the invalid credentials, and redirects the routing controller back to the `/login` route automatically.

### B. Global App Theme (`lib/core/theme/app_theme.dart`)
The app utilizes a premium design system tailored around high-contrast HSL color palettes:
- **Brand Colors**:
  - `AppColors.navy` (`0xFF0A2540`): Primary color used for headers and branding.
  - `AppColors.teal` (`0xFF635BFF` or HSL Teal `0xFF0EA5E9`): Active highlighting and accent markers.
  - `AppColors.slate` series: Sleek neutral gradients for container borders and backgrounds.
- **Dynamic Theming**: Both Light and Dark theme definitions are supported. Global app bars automatically respect role context, adjusting text contrasts, elevation values, and circular borders.

---

## 👥 4. Role-Specific Feature Modules

The mobile app includes fully functional, high-fidelity user portals for four distinct roles:

### 🎓 A. Student Portal (`lib/features/student/`)
Enables Bahir Dar Institute of Technology (BiT) students to plan, train, and test their skills.
- **Student Dashboard (`screens/student_home_screen.dart`)**: Displays a premium welcome banner, daily streak counters, dynamic XP stats, and immediate access to enrolled roadmaps.
- **Roadmap Navigator (`screens/roadmaps_screen.dart`)**: Dynamic layout to browse official roadmaps, explore structured milestones, and immediately trigger enrollments.
- **Course Detail Studio (`screens/course_detail_screen.dart`)**:
  - Implements the complete lesson progression tree.
  - Features dynamic lesson expansion tiles and green checkmarks indicating completed lessons.
  - Interactive **Lesson Viewer** with an icon-only back arrow, markdown formatting, and clean action buttons.
  - Real-time API synchronization: Completing a lesson triggers a request to `/api/courses/:id/progress` and dynamically invalidates Riverpod state, updating global progress history and student XP immediately.
- **Interactive Exam / Quizzes (`screens/assessment_quiz_screen.dart`)**: Implements an interactive multi-question exam module. Includes stopwatch timers, active card transitions, real-time grading, and DB record logging.
- **Student Profile (`screens/student_profile_screen.dart`)**: Renders user info, dynamic character initials, and uses `image_picker` to upload custom user profile photos.
- **Careers Catalog (`screens/careers_screen.dart`)**: Lists all available published careers, supports instant text search, provides dynamic category tabs filtering, renders wrapped skill chips, and expands a rich Markdown bottom sheet with related roadmap CTAs.

### 👩‍🏫 B. Teacher Portal (`lib/features/teacher/`)
Gives educators analytical tools to oversee student groups and enrich curricula.
- **Teacher Dashboard (`screens/teacher_home_screen.dart`)**: Displays overall student count, average score metrics, and shortcut cards to courses.
- **Student Performance Matrix (`screens/teacher_students_screen.dart`)**: Allows teachers to select a student, inspect their overall progress levels, check milestones, and track assessment histories.
- **Curriculum Manager (`screens/teacher_resources_screen.dart`)**: Supports mobile uploads of lecture notes, PDF slides, and markdown files, immediately propagating them to the students' course feeds.

### 🏛️ C. BiT Coordinator Portal (`lib/features/bit/`)
The academic core for publishing official institutional training schedules.
- **Curated Roadmap Publisher (`screens/bit_roadmaps_screen.dart`)**: Allows coordinators to build, publish, and order institutional roadmaps, categorizing learning tracks by department.
- **Studio Curriculum Composing (`screens/bit_courses_screen.dart`)**: Coordinators can draft new standalone courses, set difficulty tiers, write lesson markdown blocks, and organize modules directly from their mobile devices.

### 👑 D. Administrator Portal (`lib/features/admin/`)
The platform gatekeeper responsible for security and institutional verification.
- **Account Approvals Console (`screens/admin_approvals_screen.dart`)**: Fetches a live list of registration requests from newly registered Teacher and Coordinator accounts. Allows the admin to inspect university details, reject, or approve access, which immediately activates the user's login rights across the DB.

---

## 🛠️ 5. Key State Providers (Riverpod)

The app's reactive pipeline is bound by Riverpod providers defined inside `providers/`:

1. **Authentication Provider (`lib/core/providers/auth_provider.dart`)**:
   - Manages global user sessions.
   - Triggers logins, register actions, and handles secure storing of the JWT token.
   - Watches `AuthState` to dynamically rebuild the routing tree when a user registers or logs out.

2. **Student Progress Provider (`student_providers.dart`)**:
   - **`studentStatsProvider`**: Fetches active streaks, XP level thresholds, and progress histories from the backend endpoints.
   - **`enrolledRoadmapsProvider`**: Dynamically returns the curated learning roadmaps enrolled by the student.
   - **`courseDetailProvider(id)`**: Fetches real-time module details, lesson lists, and course progression states. Automatically updates UI components upon completion.

3. **Careers Provider (`lib/features/student/providers/careers_provider.dart`)**:
   - **`careersProvider(filters)`**: Dynamically loads published careers from the database, automatically updating the feed on active search keyword changes or category filter chip select events.
   - **`careerCategoriesProvider`**: Performs a database distinct fetch, extracting all categories currently in use for clean tab rendering.
   - **`careerDetailsProvider(id)`**: Safely pulls specific career profiles by ID.

---

## ✨ 6. Premium Polish & Solved Architectural Issues

We recently implemented several high-impact refinements to secure premium usability:

### 1. Reverse-Index Bottom Navigation Highlight Fix
- **The Issue**: Shell layouts loaded matches sequentially (index `0` upwards). Since the base path `/student` is a prefix of `/student/roadmaps`, `/student/courses`, etc., checking `location.startsWith('/student')` always returned true for the Home tab first, leaving the Home tab highlighted in teal no matter which tab was selected.
- **The Solution**: Modified shell index algorithms in `StudentShell`, `TeacherShell`, `BitShell`, and `AdminShell` to traverse path lists in **reverse order** (from index length-1 down to 0). This ensures longer, highly specific child sub-paths (like `/student/roadmaps`) match first and receive the active highlighting, while `/student` acts as the graceful fallback.
- **The Drawer Enhancement**: Updated the sliding drawers to use an exact match check for root nodes and a prefix match for leaf nodes, preventing double-highlighting.

### 2. Symmetrical Icon-Only Back Buttons
- **The Issue**: The lesson viewer displayed a bulky, repetitive, text-labeled button `[ <- Back ]` which cluttered the responsive bottom action row.
- **The Solution**:
  - **Mobile**: Replaced the Flutter `OutlinedButton.icon` in the `_LessonViewer` with a textless `OutlinedButton` rendering only a clean arrow icon. The shape, padding (`vertical: 13`), and border widths were kept identical to maintain perfect alignment with the other action cards.
  - **Web Client Symmetrical Upgrade**: Similarly refactored the sidebar header back button in the React client's `CourseView.tsx`. The raw text label was replaced with a responsive, symmetrical icon button mirroring the adjacent collapse chevron button.

### 3. Crisp Back Button Contrast over Banners
- **The Issue**: Default Flutter app bars read global themes, rendering the back arrow in dark navy (`AppColors.navy`). Since header banners utilize rich dark blue-to-teal linear gradients, the back button was virtually invisible.
- **The Solution**: Overrode the `iconTheme` explicitly on detail SliverAppBars to `Colors.white`, guaranteeing a highly readable and clean navigation arrow over any dark backdrop.

---

## 🚀 7. Step-by-Step Run & Build Guide

### A. Prerequisites
1. Install the **Flutter SDK** (Version `>=3.10.0` recommended, Dart `3.x`).
2. Set up the Android SDK (via Android Studio) or Xcode (for macOS users building iOS).
3. Connect an emulator, simulator, or physical test device.

### B. Setup & Run
1. Open your terminal in the `mobile` project directory:
   ```bash
   cd mobile
   ```
2. Pull the official package dependencies:
   ```bash
   flutter pub get
   ```
3. Run the code generation engine (for Riverpod annotations):
   ```bash
   dart run build_runner build --delete-conflicting-outputs
   ```
4. Start the application on your target device in Debug mode:
   ```bash
   flutter run
   ```

### C. Compile & Build for Production
To bundle the application for production distribution, run the appropriate target command:

- **Android (APK bundle)**:
  ```bash
  flutter build apk --release
  ```
- **Android (Google Play AAB)**:
  ```bash
  flutter build appbundle --release
  ```
- **iOS (Xcode Archive)**:
  ```bash
  flutter build ipa --release
  ```

---

## 🔮 8. Recommended Future Work

1. **Local Offline Synchronization Cache**: Integrate a local SQLite / Hive box repository. This allows students to download and progress through lesson modules offline, syncing XP and lesson states back to the database as soon as a connection is restored.
2. **Push Notification Infrastructure**: Connect Firebase Cloud Messaging (FCM) to deliver coordinator updates, assessment reviews, and teacher material notifications directly to the mobile device tray.
3. **Biometric Session Validation**: Integrate `local_auth` to support swift biometric lock checks (FaceID / Fingerprint) before entering sensitive coordinator portals or admin approval logs.
