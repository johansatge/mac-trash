const fsp = require('fs').promises
const homedir = require('os').homedir()
const path = require('path')
const crypto = require('crypto')
const { execFile } = require('child_process')

module.exports = {
  createTestFile,
  getRandomFilename,
  fileExists,
  execMacTrashCli,
}

async function createTestFile(filename = getRandomFilename()) {
  const desktopPath = path.join(homedir, 'Desktop', filename)
  const trashPath = path.join(homedir, '.Trash', filename)
  await fsp.writeFile(desktopPath, 'Test content', 'utf8')
  const alreadyInTrash = await fileExists(trashPath)
  if (alreadyInTrash) {
    throw new Error(`Test file ${filename} already exists in Trash`)
  }
  return { desktopPath, trashPath }
}

function getRandomFilename() {
  return `mac-"trash"-${crypto.randomBytes(12).toString('hex')}.txt`
}

async function fileExists(filePath) {
  try {
    const stat = await fsp.stat(filePath)
    return stat.isFile()
  } catch {
    return false
  }
}

async function execMacTrashCli(...args) {
  return new Promise((resolve, reject) => {
    execFile('node', ['cli.js', ...args], { cwd: path.join(__dirname, '..', 'src') }, (error, stdout, stderr) => {
      if (error && typeof error.code !== 'number') {
        reject(error)
      } else {
        resolve({ stdout, stderr, exitCode: error ? error.code : 0 })
      }
    })
  })
}
