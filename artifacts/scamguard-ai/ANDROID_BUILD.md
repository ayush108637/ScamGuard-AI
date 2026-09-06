# Building the ScamGuard AI Android APK

The Expo app now includes a native Android project under `android/`.
The Android application ID is `com.scamguardai.app`, and the current version is
`1.0.0` / version code `1`.

## Local APK build

Install these prerequisites on the computer that will build the app:

- Node.js 20 or newer
- pnpm
- Java JDK 17 or newer
- Android Studio with an Android SDK platform and build-tools installation
- Android SDK environment variables configured (`ANDROID_HOME` or
  `ANDROID_SDK_ROOT`)

From the repository root:

```bash
pnpm install
pnpm --filter @workspace/scamguard-ai run android:prebuild
pnpm --filter @workspace/scamguard-ai run android:apk
```

The generated installable APK will be at:

```text
artifacts/scamguard-ai/android/app/build/outputs/apk/release/app-release.apk
```

The current native project uses the generated Android debug keystore for the
local `release` variant so the APK can be installed directly on a test phone.
Install it over USB with:

```bash
adb install -r artifacts/scamguard-ai/android/app/build/outputs/apk/release/app-release.apk
```

Or copy the APK to the phone and open it there. Android may require enabling
installation from that file manager or browser.

## Production signing

For Google Play or a public release, replace the debug signing configuration in
`android/app/build.gradle` with a private release keystore. Do not commit the
keystore or its passwords. The APK output path remains the same.

## Useful scripts

```bash
pnpm --filter @workspace/scamguard-ai run android:prebuild
pnpm --filter @workspace/scamguard-ai run android:apk
pnpm --filter @workspace/scamguard-ai run android:apk:debug
```

`android:prebuild` is only needed after changing Expo native configuration or
adding native modules. The existing UI and app features do not require it for
normal JavaScript changes.