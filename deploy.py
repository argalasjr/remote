#! /usr/bin/env python3
# usage: python3 deploy.py [stage-name]

import os
import sys
import deploy_helper as cmd

def main():
    stages = {
        'npmInstall': npmInstall,
        'ionicAddAndroid': ionicAddAndroid,
        'ionicBuildAndroid': ionicBuildAndroid,
        'deploy': deploy,
        'prepareMessage': prepareMessage,
        'cleanUp': cleanUp
    }
    cmd.runStages(sys.argv, stages)

def npmInstall():
    cmd.run('rm -rf node_modules platforms plugins www')
    cmd.run('npm ci')

def ionicAddAndroid():
    cmd.prepareEnvironment()
    cmd.run('ionic cordova platform add android')

def ionicBuildAndroid():
    cmd.prepareEnvironment()
    cmd.run('ionic cordova build android --prod --release')
    # optimize apk
    cmd.run('zipalign -v 4 app-release-unsigned.apk app-release.apk', 'platforms/android/app/build/outputs/apk/release')
    # sign the application
    cmd.run('apksigner sign --ks release-key.keystore --ks-pass file:keypwd -v ../platforms/android/app/build/outputs/apk/release/app-release.apk', 'android-release-sign')

    # build android app bundle
    cmd.run('./gradlew bundle', 'platforms/android')
    # sign the AAB release file
    cmd.run('jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore release-key.keystore\
        -storepass rd7542TBS -keypass rd7542TBS ../platforms/android/app/build/outputs/bundle/release/app-release.aab TBS', 'android-release-sign')

def deploy():
    version = cmd.getVersion()
    package = f'tbs-remote-{version}.apk'
    buildDir = 'platforms/android/app/build/outputs/apk/release'
    deployDir = 'private/_beta/mobile/Android'
    cmd.publishPackage(f'{buildDir}/app-release.apk', f'{deployDir}/{package}')
    bundleDir = 'platforms/android/app/build/outputs/bundle/release'
    cmd.publishPackage(f'{bundleDir}/app-release.aab', f'{deployDir}/bundles/tbs-remote-{version}.aab')

def cleanUp():
    cmd.run('git diff')
    cmd.run('git reset --hard HEAD')

def prepareMessage():
    version = cmd.getVersion()
    changelog = cmd.getChangelog()
    message = f'Hi! New version of <b>TBS Remote</b> {version} has been uploaded to '
    message += '<a href=\"http://cloud1.tbs-biometrics.com/index.php/apps/files/?dir=/private/_beta/mobile/Android\">OwnCloud</a>.\n'
    if len(changelog) > 0:
        message += "<b>What's new:</b>\n"
        message += changelog + '\n'

    with open('chat-message.txt', 'w') as f:
        f.write(message)

if __name__ == '__main__':
    main()
