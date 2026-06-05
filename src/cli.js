#!/usr/bin/env node

const { execFile } = require('child_process')
const path = require('path')
const { constants } = require('fs')
const fsp = require('fs').promises
const crypto = require('crypto')
const os = require('os')
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
  const results = await Promise.allSettled(
    filesList.map(async (file) => {
      const absPosixPath = path.resolve(process.cwd(), file)
      await checkFileIsWritable(absPosixPath)
      return getHfsPath(absPosixPath)
    })
  )
  const hfsFiles = []
  for (let i = 0; i < results.length; i++) {
    if (results[i].status === 'fulfilled') {
      hfsFiles.push(results[i].value)
    } else {
      console.log(`Will not trash ${style.red(filesList[i])} (${results[i].reason.message})`)
    }
  }
  if (hfsFiles.length === 0) {
    process.exit(1)
  }
  // Generate a temporary JS script and run it with osascript
  // (Running osascript -e [expression] could cause buffer overflow if too many files)
  const scriptPath = await generateTrashScript(hfsFiles)
  try {
    await executeTrashScript(scriptPath)
  } catch (error) {
    console.log(`Trash error (${style.red(error.message)})`)
    await deleteTrashScript(scriptPath)
    process.exit(1)
  }
  await deleteTrashScript(scriptPath)
  const trashedFilesCount = `${hfsFiles.length} ${hfsFiles.length === 1 ? 'file' : 'files'}`
  console.log(`Moved ${style.cyan(trashedFilesCount)} to the Trash. 🗑️`)
}

async function generateTrashScript(hfsFiles) {
  const scriptPath = path.join(os.tmpdir(), `${pkg.name}-${crypto.randomBytes(8).toString('hex')}.js`)
  // Running a JS script instead of AppleScript to be able to pass a JSON array with files
  // Note finder.delete() seems to only accept HFS paths, not POSIX paths, hence the conversion above
  const script = `const finder = Application('Finder')\nfinder.delete(${JSON.stringify(hfsFiles)})`
  verbose(`📝 Generating script ${scriptPath}`)
  verbose(
    script
      .split('\n')
      .map((line) => `   ${line}`)
      .join('\n')
  )
  await fsp.writeFile(scriptPath, script, 'utf8')
  return scriptPath
}

async function executeTrashScript(scriptPath) {
  verbose(`▶️  Running osascript -l JavaScript ${scriptPath}`)
  const { stdout, stderr } = await new Promise((resolve, reject) => {
    execFile('/usr/bin/osascript', ['-l', 'JavaScript', scriptPath], (error, stdout, stderr) => {
      error ? reject(error) : resolve({ stdout, stderr })
    })
  })
  verbose(`   stdout: ${stdout.trim() || '(empty)'}`)
  verbose(`   stderr: ${stderr.trim() || '(empty)'}`)
}

async function deleteTrashScript(scriptPath) {
  verbose(`🗑️  Deleting ${scriptPath}`)
  await fsp.unlink(scriptPath)
}

async function checkFileIsWritable(filePath) {
  verbose(`🔍 Checking "${filePath}"`)
  try {
    await fsp.access(filePath, constants.F_OK)
  } catch {
    throw new Error('File not found')
  }
  try {
    await fsp.access(filePath, constants.W_OK)
  } catch {
    throw new Error('File not writable')
  }
}

async function getHfsPath(posixPath) {
  const escapedPath = posixPath.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r')
  const expression = `tell application "Finder" to return posix file "${escapedPath}"`
  const { stdout } = await new Promise((resolve, reject) => {
    execFile('/usr/bin/osascript', ['-e', expression], (error, stdout, stderr) => {
      error ? reject(error) : resolve({ stdout, stderr })
    })
  })
  const hfsPath = stdout.match(/^file (.*)/)
  if (!hfsPath) {
    throw new Error('Could not find HFS path')
  }
  return hfsPath[1].trim()
}

function verbose(line) {
  if (isVerbose) {
    console.log(style.dim(line))
  }
}
