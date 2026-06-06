const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const fsp = require('fs').promises
const pkg = require('../package.json')
const { createTestFile, getRandomFilename, fileExists, execMacTrashCli } = require('./helpers.js')

describe('cli', function () {
  this.timeout(30 * 1000)

  it('moves specified files to the Trash and shows stats', async () => {
    const { desktopPath: desktopPath1, trashPath: trashPath1 } = await createTestFile()
    const { desktopPath: desktopPath2, trashPath: trashPath2 } = await createTestFile()
    const { stdout, stderr, exitCode } = await execMacTrashCli(desktopPath1, desktopPath2)
    expect(await fileExists(desktopPath1)).to.equal(false)
    expect(await fileExists(desktopPath2)).to.equal(false)
    expect(await fileExists(trashPath1)).to.equal(true)
    expect(await fileExists(trashPath2)).to.equal(true)
    expect(stdout).to.contain('2 files')
    expect(stdout).to.not.contain('Running /usr/bin/osascript')
    expect(stderr).to.equal('')
    expect(exitCode).to.equal(0)
  })

  it('fails gracefully if the file does not exist', async () => {
    const nonExistingFile = getRandomFilename()
    const { stdout, stderr, exitCode } = await execMacTrashCli(nonExistingFile)
    expect(stdout).to.contain('Will not trash')
    expect(stdout).to.contain(nonExistingFile)
    expect(stdout).to.contain('File not found')
    expect(stdout).to.not.contain('File not writable')
    expect(stdout).to.not.contain('Moved')
    expect(stderr).to.equal('')
    expect(exitCode).to.equal(1)
  })

  it('fails gracefully if the file is not writable', async () => {
    const { desktopPath } = await createTestFile()
    await fsp.chmod(desktopPath, 0o444)
    try {
      const { stdout, stderr, exitCode } = await execMacTrashCli(desktopPath)
      expect(stdout).to.contain('Will not trash')
      expect(stdout).to.contain('File not writable')
      expect(stdout).to.not.contain('File not found')
      expect(stdout).to.not.contain('Moved')
      expect(stderr).to.equal('')
      expect(exitCode).to.equal(1)
    } finally {
      await fsp.chmod(desktopPath, 0o644)
      await fsp.unlink(desktopPath)
    }
  })

  it('exits with code 0 when at least one file is trashed despite other failures', async () => {
    const { desktopPath, trashPath } = await createTestFile()
    const nonExistingFile = getRandomFilename()
    const { stdout, stderr, exitCode } = await execMacTrashCli(desktopPath, nonExistingFile)
    expect(await fileExists(desktopPath)).to.equal(false)
    expect(await fileExists(trashPath)).to.equal(true)
    expect(stdout).to.contain('Will not trash')
    expect(stdout).to.contain('1 file')
    expect(stderr).to.equal('')
    expect(exitCode).to.equal(0)
  })

  it('moves files with special characters in their name', async () => {
    const specialName = `mac-trash-\`backtick$()-${Date.now()}.txt`
    const { desktopPath, trashPath } = await createTestFile(specialName)
    const { stdout, stderr } = await execMacTrashCli(desktopPath)
    expect(await fileExists(desktopPath)).to.equal(false)
    expect(await fileExists(trashPath)).to.equal(true)
    expect(stdout).to.contain('1 file')
    expect(stderr).to.equal('')
  })

  it('outputs debug info with the --verbose flag', async () => {
    const { desktopPath } = await createTestFile()
    const { stdout, stderr } = await execMacTrashCli(desktopPath, '--verbose')
    expect(stdout).to.contain('Running osascript')
    expect(stdout).to.contain('stdout:')
    expect(stdout).to.contain('stderr:')
    expect(stdout).to.contain('.Trash')
    expect(stdout).to.contain(desktopPath)
    expect(stderr).to.equal('')
  })

  it('outputs help with the --help flag', async () => {
    const { stdout, stderr } = await execMacTrashCli('someFile.txt', '--help')
    expect(stdout).to.contain(pkg.description)
    expect(stderr).to.equal('')
  })

  it('outputs version number with the --version flag', async () => {
    const { stdout, stderr } = await execMacTrashCli('someFile.txt', '--version')
    expect(stdout).to.contain(pkg.name)
    expect(stdout).to.contain(pkg.version)
    expect(stderr).to.equal('')
  })
})
