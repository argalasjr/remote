#! /usr/bin/env python3
# Contains subprocess helper functions

import os
import subprocess
from pathlib import Path
from webdav3.client import Client 

def run(command, cwd='.', checkErrors=True):
    cmdCall = subprocess.run(command, shell=True, cwd=cwd)
    print(cmdCall)
    if checkErrors and cmdCall.returncode != 0:
        raise Exception(f'{cmdCall} has failed')

def getOutput(command, cwd='.', checkErrors=True):
    cmdCall = subprocess.run(command, shell=True, cwd=cwd, stdout=subprocess.PIPE)
    if checkErrors and cmdCall.returncode != 0:
        raise Exception(f'{cmdCall} has failed')
    return cmdCall.stdout.decode().strip()

def getVersion():
    return getOutput('node -p "require(\'./package.json\').version"')

def getChangelog():
    return getOutput('git log --format=%b -n 1 HEAD')

def prepareEnvironment():
    os.environ['ANDROID_SDK_ROOT'] = '/opt/android-sdk-linux'
    os.environ['PATH'] += os.pathsep + '/opt/gradle/gradle-6.5/bin'

def publishPackage(localPath, remotePath):
    # ownCloudWebDav file should be in buildbot worker directory
    # it contains hostname, login, password to TBS Owncloud 
    # in the form of Python dict:
    # {
    #     'webdav_hostname': 'https://cloud1.tbs-biometrics.com/remote.php/webdav/',
    #     'webdav_login': 'username',
    #     'webdav_password': 'password'
    # }
    webDavOptions = '../../ownCloudWebDav'
    with open(webDavOptions, 'r') as wf:
        options = eval(wf.read())
    client = Client(options)
    localPath = Path(localPath)
    print('Starting upload to TBS Cloud')
    client.upload_sync(remotePath, localPath)
    print('Successfully uploaded to TBS Cloud')

def runStages(argv, stages):
    """
    Script with one argument in <argv>: run stage <argv[1]>\n
    Script without arguments: run all stages defined in <stages>
    """

    if len(argv) == 1:
        runAllStages(stages)
    elif len(argv) == 2:
        if runStage(argv[1], stages) == 'Invalid':
            raise ValueError('Invalid stage name. usage: python3 build-*.py [stage-name]')
    else:
        raise ValueError('Wrong number of arguments. usage: python3 build-*.py [stage-name]')

def runAllStages(stages):
    for stage in stages:
        runStage(stage, stages)

def runStage(arg, stages):
    func = stages.get(arg, lambda : 'Invalid')
    return func()

