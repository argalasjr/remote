# TBS Remote

## 1. Installing dependencies

### 1.1 Android SDK
1. Download SDK tools from https://developer.android.com/studio
2. Extract zip (sdk-tools-linux-4333796.zip) to `/opt/android-sdk-linux/tools`
3. Install other (needed) parts of Android SDK:

```bash
cd /opt/android-sdk-linux/tools/bin
./sdkmanager "build-tools;28.0.3"
./sdkmanager "platforms;android-27"
./sdkmanager "platform-tools"
```

### 1.2 Cordova & Ionic

```bash
npm install -g cordova ionic@4
```

### 1.3 Gradle

Download gradle from https://downloads.gradle.org/distributions/gradle-5.4.1-bin.zip and extract it to `/opt/gradle/gradle-5.4.1`

## 2. CI integration and releasing

If you wish to make a new release, run `release.py`. It will:
* ask you for a release version and changelog
* modify package(-lock).json and config.xml json files
* create GIT commit and tag

See `deploy.sh` script for specic commands needed to build and deploy TBS Remote app on Buildbot.
