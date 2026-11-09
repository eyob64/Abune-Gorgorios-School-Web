# Abune Gorgorios School - Native Android Application (Kotlin & Jetpack Compose)

This is the official native Android application for **Abune Gorgorios School**, built with Kotlin, Jetpack Compose (Material 3), and Android SDK 35.

## Architecture
- **Language**: Kotlin 2.0+
- **UI Toolkit**: Jetpack Compose with Material 3 Design
- **Minimum SDK**: 24 (Android 7.0 Nougat)
- **Target SDK**: 35 (Android 15)
- **State Management**: Kotlin StateFlow & Coroutines
- **Data Layer**: Clean Architecture Repository with offline caching and Firestore synchronization

## Key Features
1. **Curriculum Subject Dropdown Filter**:
   - Filter student performance records by individual subjects:
     - Mathematics
     - Physics
     - Chemistry
     - Biology
     - English
     - Amharic
     - History
     - Geography
     - Economics
     - Information Technology (IT)
     - Health & Physical Education (HPE)
     - Afan Oromo
     - Civics & Ethics
     - General Science
2. **Subject Performance Metrics**:
   - Class subject average percentage
   - Pass rate (grades >= C)
   - Evaluated students counter
3. **Student Grade Cards**:
   - Letter grades (A, A-, B+, B, C, etc.)
   - Numerical scores & attendance percentages
   - Real-time student search

## How to Build & Run in Android Studio
1. Launch **Android Studio** (Ladybug or newer recommended).
2. Choose **Open an Existing Project** and select this `/android` folder.
3. Allow Gradle to sync dependencies.
4. Select your connected Android device or Emulator.
5. Click **Run (Shift + F10)** or build an APK via terminal:
   ```bash
   ./gradlew assembleDebug
   ```
   The APK will be generated at `app/build/outputs/apk/debug/app-debug.apk`.
