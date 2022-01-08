const fsp = require('fs').promises
const homedir = require('os').homedir()
const path = require('path')
const crypto = require('crypto')
const exec = require('child_process').exec

module.exports = {
  createTestFile,
  getRandomFilename,
  fileExists,
  execMacTrashCli,
}

async function createTestFile() {
  const testFile = getRandomFilename()
  const desktopPath = path.join(homedir, 'Desktop', testFile)
  const trashPath = path.join(homedir, '.Trash', testFile)
  await fsp.writeFile(desktopPath, 'Test content', 'utf8')
  const alreadyInTrash = await fileExists(trashPath)
  if (alreadyInTrash) {
    throw new Error(`Test file ${testFile} already exists in Trash`)
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
  } catch (error) {
    return false
  }
}

async function execMacTrashCli(args) {
  args = args.replace(/"/g, '\\"')
  return new Promise((resolve, reject) => {
    const command = `node cli.js ${args}`
    exec(command, { cwd: path.join(__dirname, '..', 'src') }, (error, stdout, stderr) => {
      error ? reject(error) : resolve({ stdout, stderr })
    })
  })
}
