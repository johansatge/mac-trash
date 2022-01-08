#!/usr/bin/env node

const exec = require('child_process').exec
const path = require('path')
const fs = require('fs')
const os = require('os')
const fsp = require('fs').promises
const { style } = require('./style.js')
const pkg = require('../package.json')
const { showVersionAndExit, showHelpAndExit } = require('./help.js')

const cliFlags = ['--verbose', '--help', '--version']
const isVerbose = process.argv.includes('--verbose')
const filesList = process.argv.slice(2).filter((arg) => !cliFlags.includes(arg))

if (process.argv.includes('--version')) {
  showVersionAndExit()
}
if (process.argv.includes('--help') || filesList.length === 0) {
  showHelpAndExit()
}

run()

async function run() {
  // Create a list of hfs paths ("Macintosh HD:someDir:someFile")
  // from the user input (POSIX paths "/someDir/someFile")
  const hfsFiles = []
  for (const file of filesList) {
    try {
      const absPosixPath = path.resolve(process.cwd(), file)
      await checkFileIsWritable(absPosixPath)
      hfsFiles.push(await getHfsPath(absPosixPath))
    } catch (error) {
      console.log(`Will not trash ${style.red(file)} (${error.message})`)
    }
  }
  // Generate a temporary JS script and run it with osascript
  // (Running osascript -e [expression] could cause buffer overflow if too many files)
  try {
    const scriptPath = await generateTrashScript(hfsFiles)
    await executeTrashScript(scriptPath)
    await deleteTrashScript(scriptPath)
  } catch (error) {
    console.log(`Trash error (${style.red(error.message)})`)
  }
  const trashedFilesCount = `${hfsFiles.length} ${hfsFiles.length === 1 ? 'file' : 'files'}`
  console.log(`Moved ${style.cyan(trashedFilesCount)} to the Trash. 🗑️`)
}

async function generateTrashScript(hfsFiles) {
  verbose(`Generating trash script from ${hfsFiles.length} items`)
  const scriptPath = path.join(os.tmpdir(), `${pkg.name}.${Date.now()}.${Math.random()}.js`)
  // Running a JS script instead of AppleScript to be able to pass a JSON array with files
  // Note finder.delete() seems to only accept HFS paths, not POSIX paths, hence the conversion above
  const script = `const finder = Application('Finder')\nfinder.delete(${JSON.stringify(hfsFiles)})`
  verbose(script)
  await fsp.writeFile(scriptPath, script, 'utf8')
  return scriptPath
}

async function executeTrashScript(scriptPath) {
  const shellCommand = `/usr/bin/osascript -l JavaScript ${scriptPath}`
  verbose(`Executing trash script (${shellCommand})`)
  const { stdout, stderr } = await executeCommand(shellCommand)
  verbose(`Stdout: ${stdout.trim()}`)
  verbose(`Stderr: ${stderr.trim()}`)
}

async function deleteTrashScript(scriptPath) {
  verbose(`Deleting trash script (${scriptPath})`)
  await fsp.unlink(scriptPath)
}

async function checkFileIsWritable(filePath) {
  verbose(`Checking if "${filePath}" is writable`)
  try {
    await fsp.stat(filePath, fs.constants.W_OK)
  } catch (error) {
    throw new Error('File not writable')
  }
}

async function getHfsPath(posixPath) {
  const escapedPath = posixPath.replace(/"/g, '\\\\\\"')
  const osascript = `tell application \\"Finder\\" to return posix file \\"${escapedPath}\\"`
  const { stdout } = await executeCommand(`/usr/bin/osascript -e "${osascript}"`)
  const hfsPath = stdout.match(/^file (.*)/)
  if (!hfsPath) {
    throw new Error('Could not find HFS path')
  }
  return hfsPath[1].trim()
}

function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      error ? reject(error) : resolve({ stdout, stderr })
    })
  })
}

function verbose() {
  if (isVerbose) {
    console.log(...arguments)
  }
}
