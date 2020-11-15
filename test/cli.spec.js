const describe = require('mocha').describe
const it = require('mocha').it
const expect = require('chai').expect
const pkg = require('../package.json')
const { createTestFile, getRandomFilename, fileExists, execMacTrashCli } = require('./helpers.js')

describe('cli', function () {
  this.timeout(30 * 1000)
  it('moves specified files to the Trash and shows stats', async () => {
    const { desktopPath: desktopPath1, trashPath: trashPath1 } = await createTestFile()
    const { desktopPath: desktopPath2, trashPath: trashPath2 } = await createTestFile()
    const { stdout, stderr } = await execMacTrashCli(`${desktopPath1} ${desktopPath2}`)
    expect(await fileExists(desktopPath1)).to.equal(false)
    expect(await fileExists(desktopPath2)).to.equal(false)
    expect(await fileExists(trashPath1)).to.equal(true)
    expect(await fileExists(trashPath2)).to.equal(true)
    expect(stdout).to.contain('2 files')
    expect(stdout).to.not.contain('Running /usr/bin/osascript')
    expect(stderr).to.equal('')
  })

  it('fails gracefully if the file cannot be moved to the Trash', async () => {
    const nonExistingFile = getRandomFilename()
    const { stdout, stderr } = await execMacTrashCli(nonExistingFile)
    expect(stdout).to.contain('Could not trash')
    expect(stdout).to.contain(nonExistingFile)
    expect(stderr).to.equal('')
  })

  it('outputs debug info with the --verbose flag', async () => {
    const { desktopPath } = await createTestFile()
    const { stdout, stderr } = await execMacTrashCli(`${desktopPath} --verbose`)
    expect(stdout).to.contain('Running /usr/bin/osascript')
    expect(stdout).to.contain('Error: none')
    expect(stdout).to.contain('Stdout:')
    expect(stdout).to.contain('Stderr:')
    expect(stdout).to.contain('of folder .Trash')
    expect(stdout).to.contain(desktopPath)
    expect(stderr).to.equal('')
  })

  it('outputs help with the --help flag', async () => {
    const { stdout, stderr } = await execMacTrashCli('someFile.txt --help')
    expect(stdout).to.contain(pkg.description)
    expect(stderr).to.equal('')
  })

  it('outputs version number with the --version flag', async () => {
    const { stdout, stderr } = await execMacTrashCli('someFile.txt --version')
    expect(stdout).to.contain(pkg.name)
    expect(stdout).to.contain(pkg.version)
    expect(stderr).to.equal('')
  })
})
