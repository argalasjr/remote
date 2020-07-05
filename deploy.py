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
    cmd.run('ionic cordova build android --prod')

def deploy():
    version = cmd.getVersion()
    package = f'tbs-remote-{version}.apk'
    buildDir = 'platforms/android/app/build/outputs/apk/debug'
    deployDir = 'private/_beta/mobile/Android'
    cmd.publishPackage(f'{buildDir}/app-debug.apk', f'{deployDir}/{package}')

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
