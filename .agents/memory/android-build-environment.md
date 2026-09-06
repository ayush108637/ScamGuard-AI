---
name: Android build environment
description: Native Android project setup and local build prerequisites for ScamGuard AI.
---

The Expo project includes a generated Android/Gradle project, but this Replit
workspace does not provide Java or an Android SDK. Native APK compilation must
run on a machine with JDK and Android SDK tooling.

**Why:** The Gradle wrapper cannot start without a `java` executable, and
Android Studio/SDK tooling is not present in the workspace.

**How to apply:** Use the build steps in `artifacts/scamguard-ai/ANDROID_BUILD.md`
and expect the APK at the documented Gradle output path.