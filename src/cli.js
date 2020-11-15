#!/usr/bin/env node

const exec = require('child_process').exec
const path = require('path')
const fsp = require('fs').promises
const { style } = require('./style.js')
const { showVersionAndExit, showHelpAndExit } = require('./help.js')

const cliFlags = ['--verbose', '--help', '--version']
const isVerbose = process.argv.includes('--verbose')
const filesList = process.argv.slice(2).filter((arg) => !cliFlags.includes(arg))

if (process.argv.includes('--version')) {
  showVersionAndExit()
} else if (process.argv.includes('--help') || filesList.length === 0) {
  showHelpAndExit()
}

run()

async function run() {
  let trashedFiles = 0
  for (const file of filesList) {
    const absPath = path.resolve(process.cwd(), file)
    try {
      await checkFileExists(absPath)
      await trashFile(absPath)
      trashedFiles += 1
    } catch (error) {
      console.log(`Could not trash ${style.red(file)} (${error.message})`)
    }
  }
  const trashedFilesCount = `${trashedFiles} ${trashedFiles === 1 ? 'file' : 'files'}`
  console.log(`Moved ${style.cyan(trashedFilesCount)} to the Trash. 🗑️`)
}

async function trashFile(filePath) {
  return new Promise((resolve, reject) => {
    const osascript = `tell application \\"Finder\\" to delete POSIX file \\"${filePath}\\"`
    const shellCommand = `/usr/bin/osascript -e "${osascript}"`
    if (isVerbose) {
      console.log(`Running ${shellCommand}`)
    }
    exec(shellCommand, (error, stdout, stderr) => {
      if (isVerbose) {
        console.log(`Error: ${error ? error.message : 'none'}`)
        console.log(`Stdout: ${stdout.trim()}`)
        console.log(`Stderr: ${stderr.trim()}`)
      }
      error ? reject(error) : resolve()
    })
  })
}

async function checkFileExists(filePath) {
  try {
    if (isVerbose) {
      console.log(`Checking if "${filePath}" exists`)
    }
    await fsp.stat(filePath)
  } catch (error) {
    throw new Error('File not found')
  }
}
