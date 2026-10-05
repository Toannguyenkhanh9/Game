# Core Ball Android haptic setup

The game only requests native haptic feedback for important events (failure and level-clear), not for every normal shot.

The included `ReactNative/index.js` handles `CORE_BALL_HAPTIC` messages safely and checks the Android vibration permission before calling `Vibration.vibrate()`.

## Required Android permission

Open:

`android/app/src/main/AndroidManifest.xml`

Add this line directly under the opening `<manifest ...>` tag and BEFORE `<application ...>`:

```xml
<uses-permission android:name="android.permission.VIBRATE" />
```

Example:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        ...>
        ...
    </application>
</manifest>
```

This is a normal Android permission; no runtime permission dialog is required.

If the permission is missing, the included React Native code now skips vibration instead of calling the native vibration API, so the app should not crash.
