# TBS Remote

Mobile app based on Angular and Ionic. Documentation can be found here: 
https://dev.azure.com/TBS-Biometrics/Client%20Software/_wiki/wikis/Client-Software.wiki/33/TBS-Remote

## 1. Adding translations
1. Add translations on this page: https://tbs-translator.web.app/project/dev/remote
2. Run script `update_translations.sh` to add them to the app. Script is in the root folder of Remote git.

## 2. Deploy new version with Buildbot

1. Make commit with version number (for example 2.0.22):  
    - In `package.json` and `config.xml` update version to new number
    - Name the commit: `version 2.0.22` 
    - Write changes in commit description (for BuildBot to show what's new).
2. Create annotated tag on this commit named: `v2.0.22`
3. Push the commit and then push the tag to origin.

See `deploy.py` script for specific commands needed to build and deploy TBS Remote app on Buildbot.

## 3. Installing dependencies on Linux

### 3.1 Android SDK
1. Install Android SDK
```sh
mkdir -p /opt/android-sdk-linux
cd /opt/android-sdk-linux
# see https://developer.android.com/studio/index.html
wget --output-document=android-sdk.zip https://dl.google.com/android/repository/commandlinetools-linux-6514223_latest.zip
unzip android-sdk.zip
rm -f android-sdk.zip
```

2. Install other (needed) parts of Android SDK
```bash
cd /opt/android-sdk-linux/tools/bin
yes | ./sdkmanager --licences
yes | ./sdkmanager "platform-tools" "tools"
./sdkmanager "build-tools;29.0.3"
./sdkmanager "platforms;android-29" # android 10
./sdkmanager "platforms;android-28" # android 9
```

### 3.2 Cordova & Ionic

```bash
npm install -g cordova ionic
```

### 3.3 Gradle

Download Gradle and extract it to `/opt/gradle`
```sh
wget https://services.gradle.org/distributions/gradle-6.5-bin.zip
sudo unzip -d /opt/gradle gradle-6.5-bin.zip
ls /opt/gradle/gradle-* # verify installation
```
