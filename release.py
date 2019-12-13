#! /usr/bin/env python3

import json
import os
import sys
import xml.etree.ElementTree as ElementTree
from dialog import Dialog


def get_version():
    with open('package.json', 'r') as f:
        return json.load(f)['version']


def prompt_release_info():
    dlg = Dialog(autowidgetsize=True)
    background_title = "TBS Remote release"
    dlg.set_background_title(background_title)

    response, version = dlg.inputbox('version', init=get_version())

    if response != 'ok' or not version:
        return None, None

    response, changelog = dlg.editbox_str('', title='Enter changelog')

    if response != 'ok' or not changelog:
        return None, None

    return version, changelog


def set_version_npm(version):
    result = os.system('npm version %s --no-git-tag' % version)
    return result == 0


def set_version_config_xml(version):
    tree = ElementTree.parse('config.xml')
    root = tree.getroot()
    root.set('version', version)
    tree.write('config.xml', encoding='utf-8', xml_declaration=True)


def git_commit(version, changelog):
    os.system('git add --all .')
    os.system('git commit -m "%s\n\n%s"' % (version, changelog))


def git_tag(version):
    os.system('git tag -a v%s -m "version %s"' % (version, version))


if __name__ == "__main__":
    if '-h' in sys.argv or '--help' in sys.argv:
        print('Interactive TUI for dummies')
        exit()

    version, changelog = prompt_release_info()
    if not version or not changelog:
        exit()

    if not set_version_npm(version):
        exit()

    set_version_config_xml(version)
    git_commit(version, changelog)
    git_tag(version)
    print('ready to push. Please execute "git push && git push --tags"')
