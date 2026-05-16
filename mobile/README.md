# BiT CareerGuide — Flutter Mobile App

Cross-platform mobile app (Android + iOS) sharing the same backend and database as the web app.

## Stack
- Flutter 3.x
- Riverpod (state management)
- go_router (navigation)
- Dio (HTTP)
- flutter_secure_storage (JWT token)

## Project Structure

```
lib/
├── main.dart                    # Entry point
├── core/
│   ├── constants/api_constants.dart   # All API endpoint paths
│   ├── models/                        # Dart data models
│   ├── network/api_client.dart        # Dio HTTP client + token management
│   ├── providers/
│   │   ├── auth_provider.dart         # Auth state (login/logout/session)
│   │   └── theme_provider.dart        # Dark/light theme
│   ├── router/app_router.dart         # go_router with role-based redirects
│   └── theme/app_theme.dart           # Colors, typography, component themes
├── features/
│   ├── auth/screens/                  # Login, Register, Onboarding, Pending
│   ├── student/                       # Student portal (5-tab bottom nav)
│   ├── teacher/                       # Teacher portal (4-tab bottom nav)
│   ├── admin/                         # Admin portal (4-tab bottom nav)
│   ├── bit/                           # BiT portal (3-tab bottom nav)
│   └── shared/screens/                # Notifications, Support Chat
└── shared/widgets/                    # Reusable UI components
```

## Setup

### 1. Install Flutter
https://docs.flutter.dev/get-started/install

### 2. Install dependencies
```bash
cd mobile
flutter pub get
```

### 3. Add fonts
Download PlusJakartaSans from Google Fonts and place in:
```
mobile/assets/fonts/
  PlusJakartaSans-Regular.ttf
  PlusJakartaSans-Medium.ttf
  PlusJakartaSans-SemiBold.ttf
  PlusJakartaSans-Bold.ttf
  PlusJakartaSans-ExtraBold.ttf
```

### 4. Create asset folders
```bash
mkdir -p mobile/assets/images mobile/assets/icons mobile/assets/fonts
```

### 5. API URL
- Android emulator: uses `10.0.2.2:8000` (maps to host localhost)
- iOS simulator: uses `localhost:8000`
- Physical device: use your machine's local IP e.g. `192.168.x.x:8000`

Edit `lib/core/constants/api_constants.dart` to change the base URL.

### 6. Run
```bash
# Android emulator
flutter run

# iOS simulator
flutter run -d ios

# Specific device
flutter devices
flutter run -d <device_id>
```

## Role Routing
After login, the router automatically redirects to the correct portal:
- `student` → `/student` (Student Portal)
- `teacher` → `/teacher` (Teacher Portal) or `/pending` if account not approved
- `admin` → `/admin` (Admin Portal)
- `bit` → `/bit` (BiT Academic Portal)

## Shared Backend
This app connects to the same PHP backend as the web app.
All data (users, courses, roadmaps, progress, notifications) is shared.
A student can log in on web and mobile and see the same data.
