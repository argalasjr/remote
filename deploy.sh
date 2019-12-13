#! /usr/bin/env bash
# usage: ./deploy_dulik.sh

set -e
set -u
set -x

export ANDROID_HOME=/opt/android-sdk-linux/
export PATH=$PATH:/opt/node-v10.13.0-linux-x64/bin/:/opt/gradle/gradle-5.4.1/bin/

MESSAGE_CONTENT="$(git log --format=%b -n 1 HEAD)"
VERSION=$(node -p "require('./package.json').version")

function npmInstall() {
	rm -rf node_modules platforms plugins www
	npm ci
}

function ionicAddAndroid() {
	ionic cordova platform add android
}

function ionicBuildAndroid() {
	ionic cordova build android --prod
}

function deploy() {
	PACKAGE="tbs-remote-${VERSION}.apk"
	BUILD_DIR="platforms/android/app/build/outputs/apk/debug"
	DEPLOY_DIR="private/_beta/mobile/Android"
	echo "put ${BUILD_DIR}/app-debug.apk ${DEPLOY_DIR}/${PACKAGE}" | cadaver "https://cloud1.tbs-biometrics.com/remote.php/webdav/"
}

function prepareMessage {
	echo "Hi All! The new version $VERSION of <b>TBS Remote</b> mobile app has been uploaded to <a href=\"http://cloud1.tbs-biometrics.com/index.php/apps/files/?dir=/private/_beta/mobile/Android\">OwnCloud</a>." > chat-message.txt
	echo "<b>What's new:</b>" >> chat-message.txt
	echo "$MESSAGE_CONTENT" >> chat-message.txt
}

function cleanUp() {
	git diff
	git reset --hard HEAD
}

$1
