const pkg = require('../package.json')
const { style } = require('./style.js')

module.exports = {
  showVersionAndExit,
  showHelpAndExit,
}

function showVersionAndExit() {
  console.log(`${pkg.name} ${pkg.version}`)
  process.exit(0)
}

function showHelpAndExit() {
  const help = [
    '',
    pkg.description,
    '',
    style.underline('Usage'),
    'trash <someRelativePath> <someAbsolutePath>',
    '',
    style.underline('Options'),
    '--verbose    Show debug information',
    '--version    Output current version',
    '--help       Output help',
    '',
  ]
  console.log(help.join('\n'))
  process.exit(0)
}
